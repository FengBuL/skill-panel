use crate::models::{
    CreateSkillInput, ParseStatus, SkillDetail, SkillSource, SkillSummary, UpdateSkillInput,
};
use crate::settings_store;
use crate::skill_scanner::{self, ScanRoot};

use fs2::FileExt;
use serde_json::{Map, Number, Value};
use std::{
    env, fs,
    io::{Seek, SeekFrom, Write},
    path::{Component, Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

const SKILL_FILE_NAME: &str = "SKILL.md";

#[derive(Debug, Clone, PartialEq)]
struct ParsedSkillMarkdown {
    frontmatter: Map<String, Value>,
    body_markdown: String,
}

pub fn read_skill(path: String) -> Result<SkillDetail, String> {
    read_skill_in_roots(path, &configured_allowed_roots()?)
}

pub fn create_skill(input: CreateSkillInput) -> Result<SkillDetail, String> {
    create_skill_in_roots(input, &configured_allowed_roots()?)
}

pub fn update_skill(input: UpdateSkillInput) -> Result<SkillDetail, String> {
    let roots = configured_allowed_roots()?;
    let skill_file = skill_file_from_input(&input.path)?;
    ensure_existing_path_allowed(&skill_file, &roots)?;
    crate::version_store::create_snapshot(&skill_file.to_string_lossy(), "Before save", "manual")?;
    update_skill_in_roots(input, &roots)
}

pub fn delete_skill(path: String) -> Result<(), String> {
    delete_skill_in_roots(path, &configured_allowed_roots()?)
}

pub fn open_skill_folder(path: String) -> Result<(), String> {
    spawn_skill_folder(resolve_skill_folder_to_open(path)?)
}

pub fn read_skill_in_roots(path: String, roots: &[ScanRoot]) -> Result<SkillDetail, String> {
    let skill_file = skill_file_from_input(&path)?;
    ensure_existing_path_allowed(&skill_file, roots)?;
    read_skill_file(&skill_file, source_for_path(&skill_file, roots))
}

pub fn create_skill_in_roots(
    input: CreateSkillInput,
    roots: &[ScanRoot],
) -> Result<SkillDetail, String> {
    let name = require_non_empty("name", &input.name)?;
    let description = require_non_empty("description", &input.description)?;
    let target_root = PathBuf::from(require_non_empty(
        "targetDirectory",
        &input.target_directory,
    )?);
    ensure_target_directory_allowed(&target_root, roots)?;
    fs::create_dir_all(&target_root)
        .map_err(|error| format!("Unable to create target directory: {error}"))?;

    let skill_dir = target_root.join(skill_directory_name(name));
    if skill_dir.exists() {
        return Err(format!(
            "Skill directory already exists: {}",
            skill_dir.display()
        ));
    }
    fs::create_dir_all(&skill_dir)
        .map_err(|error| format!("Unable to create skill directory: {error}"))?;

    let mut frontmatter = Map::new();
    frontmatter.insert("name".to_string(), Value::String(name.to_string()));
    frontmatter.insert(
        "description".to_string(),
        Value::String(description.to_string()),
    );

    let skill_file = skill_dir.join(SKILL_FILE_NAME);
    write_skill_file(&skill_file, &frontmatter, &input.markdown)?;
    read_skill_file(&skill_file, source_for_path(&skill_file, roots))
}

pub fn update_skill_in_roots(
    input: UpdateSkillInput,
    roots: &[ScanRoot],
) -> Result<SkillDetail, String> {
    let skill_file = skill_file_from_input(&input.path)?;
    ensure_existing_path_allowed(&skill_file, roots)?;
    let existing = read_raw_skill(&skill_file)?;
    let parsed = parse_skill_markdown(&existing)?;
    let mut frontmatter = parsed.frontmatter;

    if let Some(name) = input.name {
        frontmatter.insert(
            "name".to_string(),
            Value::String(require_non_empty("name", &name)?.to_string()),
        );
    }
    if let Some(description) = input.description {
        frontmatter.insert(
            "description".to_string(),
            Value::String(require_non_empty("description", &description)?.to_string()),
        );
    }

    ensure_required_frontmatter(&frontmatter)?;
    let body_markdown = input.markdown.unwrap_or(parsed.body_markdown);
    let skill_dir = skill_file
        .parent()
        .ok_or_else(|| "Skill file must have a parent directory".to_string())?;
    backup_skill_directory(skill_dir, roots)?;
    write_skill_file(&skill_file, &frontmatter, &body_markdown)?;
    read_skill_file(&skill_file, source_for_path(&skill_file, roots))
}

pub fn delete_skill_in_roots(path: String, roots: &[ScanRoot]) -> Result<(), String> {
    let skill_file = skill_file_from_input(&path)?;
    ensure_existing_path_allowed(&skill_file, roots)?;
    ensure_skill_file_path(&skill_file)?;
    if !skill_file.exists() {
        return Err(format!(
            "Skill file does not exist: {}",
            skill_file.display()
        ));
    }

    let skill_dir = skill_file
        .parent()
        .ok_or_else(|| "Skill file must have a parent directory".to_string())?;
    let canonical_dir = skill_dir
        .canonicalize()
        .map_err(|error| format!("Unable to resolve skill directory: {error}"))?;
    let canonical_skill_file = skill_file
        .canonicalize()
        .map_err(|error| format!("Unable to resolve skill file: {error}"))?;
    let canonical_expected_skill_file = canonical_dir.join(SKILL_FILE_NAME);

    if canonical_skill_file != canonical_expected_skill_file {
        return Err("Skill path must point to the SKILL.md inside its own folder".to_string());
    }
    if canonical_dir.parent().is_none() {
        return Err("Refusing to delete a filesystem root".to_string());
    }
    if roots.iter().any(|root| {
        root.path
            .canonicalize()
            .map(|root_path| root_path == canonical_dir)
            .unwrap_or(false)
    }) {
        return Err("Refusing to delete an allowed skill root".to_string());
    }

    backup_skill_directory(&canonical_dir, roots)?;
    fs::remove_dir_all(&canonical_dir)
        .map_err(|error| format!("Unable to delete skill directory: {error}"))
}

pub fn open_skill_folder_in_roots(path: String, roots: &[ScanRoot]) -> Result<(), String> {
    spawn_skill_folder(resolve_skill_folder_to_open_in_roots(path, roots)?)
}

fn resolve_skill_folder_to_open(path: String) -> Result<PathBuf, String> {
    resolve_skill_folder_to_open_in_roots(path, &configured_allowed_roots()?)
}

fn resolve_skill_folder_to_open_in_roots(
    path: String,
    roots: &[ScanRoot],
) -> Result<PathBuf, String> {
    let folder = skill_folder_from_input(&path)?;
    ensure_existing_path_allowed(&folder.join(SKILL_FILE_NAME), roots)?;
    if !folder.exists() {
        return Err(format!("Skill folder does not exist: {}", folder.display()));
    }

    Ok(folder)
}

fn spawn_skill_folder(folder: PathBuf) -> Result<(), String> {
    let mut command = if cfg!(windows) {
        let mut command = Command::new("cmd");
        command.args(["/C", "start", ""]).arg(&folder);
        command
    } else if cfg!(target_os = "macos") {
        let mut command = Command::new("open");
        command.arg(&folder);
        command
    } else {
        let mut command = Command::new("xdg-open");
        command.arg(&folder);
        command
    };

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("Unable to open skill folder: {error}"))
}

fn read_skill_file(skill_file: &Path, source: SkillSource) -> Result<SkillDetail, String> {
    let raw_content = read_raw_skill(skill_file)?;
    let parsed = parse_skill_markdown(&raw_content)?;
    ensure_required_frontmatter(&parsed.frontmatter)?;

    let summary = summary_from_parsed(skill_file, &parsed.frontmatter, source)?;
    Ok(SkillDetail {
        summary,
        markdown: parsed.body_markdown.clone(),
        body_markdown: parsed.body_markdown,
        raw_content,
        frontmatter: parsed.frontmatter,
    })
}

fn read_raw_skill(skill_file: &Path) -> Result<String, String> {
    ensure_skill_file_path(skill_file)?;
    if !skill_file.exists() {
        return Err(format!(
            "Skill file does not exist: {}",
            skill_file.display()
        ));
    }
    fs::read_to_string(skill_file).map_err(|error| format!("Unable to read skill file: {error}"))
}

fn write_skill_file(
    skill_file: &Path,
    frontmatter: &Map<String, Value>,
    body_markdown: &str,
) -> Result<(), String> {
    ensure_required_frontmatter(frontmatter)?;
    let raw_content = format_frontmatter(frontmatter) + body_markdown;
    write_locked(skill_file, raw_content.as_bytes())
        .map_err(|error| format!("Unable to write skill file: {error}"))
}

fn write_locked(path: &Path, contents: &[u8]) -> std::io::Result<()> {
    let mut file = fs::OpenOptions::new()
        .create(true)
        .read(true)
        .write(true)
        .open(path)?;
    file.lock_exclusive()?;
    let result = file
        .set_len(0)
        .and_then(|_| file.seek(SeekFrom::Start(0)).map(|_| ()))
        .and_then(|_| file.write_all(contents))
        .and_then(|_| file.sync_all());
    let unlock_result = file.unlock();
    result.and(unlock_result)
}

fn parse_skill_markdown(raw_content: &str) -> Result<ParsedSkillMarkdown, String> {
    let without_bom = raw_content.strip_prefix('\u{feff}').unwrap_or(raw_content);
    let body_start = if without_bom.starts_with("---\r\n") {
        5
    } else if without_bom.starts_with("---\n") {
        4
    } else {
        return Err("Skill file must start with frontmatter".to_string());
    };

    let after_open = &without_bom[body_start..];
    let (frontmatter_text, body_markdown) = split_frontmatter_and_body(after_open)
        .ok_or_else(|| "Skill file frontmatter must end with a closing marker".to_string())?;

    Ok(ParsedSkillMarkdown {
        frontmatter: parse_frontmatter_map(frontmatter_text)?,
        body_markdown: body_markdown.to_string(),
    })
}

fn split_frontmatter_and_body(markdown_after_open: &str) -> Option<(&str, &str)> {
    if let Some(index) = markdown_after_open.find("\n---\r\n") {
        return Some((
            &markdown_after_open[..index],
            &markdown_after_open[index + 6..],
        ));
    }
    if let Some(index) = markdown_after_open.find("\n---\n") {
        return Some((
            &markdown_after_open[..index],
            &markdown_after_open[index + 5..],
        ));
    }
    if let Some(frontmatter_text) = markdown_after_open.strip_suffix("\n---") {
        return Some((frontmatter_text, ""));
    }
    None
}

fn parse_frontmatter_map(frontmatter_text: &str) -> Result<Map<String, Value>, String> {
    let mut map = Map::new();
    let lines = frontmatter_text.lines().collect::<Vec<_>>();
    let mut index = 0usize;

    while index < lines.len() {
        let line = lines[index];
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            index += 1;
            continue;
        }
        if line.starts_with(' ') || line.starts_with('\t') || trimmed.starts_with('-') {
            return Err(format!("Invalid top-level frontmatter line: {trimmed}"));
        }

        let (key, raw_value) = trimmed
            .split_once(':')
            .ok_or_else(|| format!("Invalid frontmatter line: {trimmed}"))?;
        let key = key.trim();
        if key.is_empty() {
            return Err("Frontmatter key cannot be empty".to_string());
        }

        let value = raw_value.trim();
        if value.is_empty() {
            let mut items = Vec::new();
            let mut object = Map::new();
            index += 1;
            while index < lines.len() {
                let child = lines[index];
                let child_trimmed = child.trim();
                if child_trimmed.is_empty() || child_trimmed.starts_with('#') {
                    index += 1;
                    continue;
                }
                if !(child.starts_with(' ') || child.starts_with('\t')) {
                    break;
                }

                if let Some(item) = child_trimmed.strip_prefix("- ") {
                    items.push(parse_scalar_value(item));
                    index += 1;
                    continue;
                }

                if let Some((nested_key, nested_raw_value)) = child_trimmed.split_once(':') {
                    let nested_key = nested_key.trim();
                    if nested_key.is_empty() {
                        index += 1;
                        continue;
                    }

                    let nested_value = nested_raw_value.trim();
                    if !nested_value.is_empty() {
                        object.insert(nested_key.to_string(), parse_scalar_value(nested_value));
                        index += 1;
                        continue;
                    }

                    let mut nested_items = Vec::new();
                    index += 1;
                    while index < lines.len() {
                        let grandchild = lines[index];
                        let grandchild_trimmed = grandchild.trim();
                        if grandchild_trimmed.is_empty() || grandchild_trimmed.starts_with('#') {
                            index += 1;
                            continue;
                        }
                        if !(grandchild.starts_with("    ")
                            || grandchild.starts_with("\t\t")
                            || grandchild.starts_with("  -")
                            || grandchild.starts_with('\t'))
                        {
                            break;
                        }
                        if let Some(item) = grandchild_trimmed.strip_prefix("- ") {
                            nested_items.push(parse_scalar_value(item));
                        }
                        index += 1;
                    }
                    object.insert(nested_key.to_string(), Value::Array(nested_items));
                    continue;
                }

                index += 1;
            }
            if !object.is_empty() {
                if !items.is_empty() {
                    object.insert("items".to_string(), Value::Array(items));
                }
                map.insert(key.to_string(), Value::Object(object));
            } else {
                map.insert(key.to_string(), Value::Array(items));
            }
            continue;
        }

        map.insert(key.to_string(), parse_scalar_value(value));
        index += 1;
    }

    Ok(map)
}

fn parse_scalar_value(value: &str) -> Value {
    let trimmed = value.trim();
    if let Some(unquoted) = unquote_frontmatter_value(trimmed) {
        return Value::String(unquoted.to_string());
    }
    match trimmed {
        "true" => return Value::Bool(true),
        "false" => return Value::Bool(false),
        "null" | "~" => return Value::Null,
        _ => {}
    }
    if let Ok(integer) = trimmed.parse::<i64>() {
        return Value::Number(Number::from(integer));
    }
    if let Ok(float) = trimmed.parse::<f64>() {
        if let Some(number) = Number::from_f64(float) {
            return Value::Number(number);
        }
    }
    Value::String(trimmed.to_string())
}

fn unquote_frontmatter_value(value: &str) -> Option<&str> {
    if value.len() < 2 {
        return None;
    }

    let bytes = value.as_bytes();
    let double_quoted = bytes.first() == Some(&b'"') && bytes.last() == Some(&b'"');
    let single_quoted = bytes.first() == Some(&b'\'') && bytes.last() == Some(&b'\'');
    if double_quoted || single_quoted {
        Some(&value[1..value.len() - 1])
    } else {
        None
    }
}

fn format_frontmatter(frontmatter: &Map<String, Value>) -> String {
    let mut output = String::from("---\n");
    append_frontmatter_value(&mut output, "name", &frontmatter["name"]);
    append_frontmatter_value(&mut output, "description", &frontmatter["description"]);

    for (key, value) in frontmatter {
        if key == "name" || key == "description" {
            continue;
        }
        append_frontmatter_value(&mut output, key, value);
    }

    output.push_str("---\n");
    output
}

fn append_frontmatter_value(output: &mut String, key: &str, value: &Value) {
    match value {
        Value::Array(items) => {
            output.push_str(key);
            output.push_str(":\n");
            for item in items {
                output.push_str("  - ");
                output.push_str(&format_scalar_value(item));
                output.push('\n');
            }
        }
        _ => {
            output.push_str(key);
            output.push_str(": ");
            output.push_str(&format_scalar_value(value));
            output.push('\n');
        }
    }
}

fn format_scalar_value(value: &Value) -> String {
    match value {
        Value::String(text) => {
            if is_plain_yaml_scalar(text) {
                text.to_string()
            } else {
                serde_json::to_string(text).unwrap_or_else(|_| "\"\"".to_string())
            }
        }
        Value::Number(number) => number.to_string(),
        Value::Bool(boolean) => boolean.to_string(),
        Value::Null => "null".to_string(),
        Value::Array(_) | Value::Object(_) => {
            serde_json::to_string(value).unwrap_or_else(|_| "null".to_string())
        }
    }
}

fn is_plain_yaml_scalar(text: &str) -> bool {
    !text.is_empty()
        && !text
            .chars()
            .any(|ch| matches!(ch, ':' | '\n' | '\r' | '"' | '\'' | '[' | ']' | '{' | '}'))
        && text.trim() == text
        && !matches!(text, "true" | "false" | "null" | "~")
}

fn summary_from_parsed(
    skill_file: &Path,
    frontmatter: &Map<String, Value>,
    source: SkillSource,
) -> Result<SkillSummary, String> {
    let summary = skill_scanner::summarize_skill_file(skill_file, source);
    Ok(SkillSummary {
        path: skill_file.to_string_lossy().to_string(),
        name: required_string(frontmatter, "name")?.to_string(),
        description: required_string(frontmatter, "description")?.to_string(),
        source: summary.source,
        parse_status: ParseStatus::Parsed,
        modified_at: summary.modified_at,
    })
}

fn ensure_required_frontmatter(frontmatter: &Map<String, Value>) -> Result<(), String> {
    required_string(frontmatter, "name")?;
    required_string(frontmatter, "description")?;
    Ok(())
}

fn required_string<'a>(frontmatter: &'a Map<String, Value>, key: &str) -> Result<&'a str, String> {
    frontmatter
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| format!("Frontmatter must include a non-empty {key}"))
}

fn require_non_empty<'a>(field: &str, value: &'a str) -> Result<&'a str, String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(format!("{field} cannot be empty"))
    } else {
        Ok(trimmed)
    }
}

fn skill_file_from_input(path: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(require_non_empty("path", path)?);
    if path.file_name().and_then(|name| name.to_str()) == Some(SKILL_FILE_NAME) {
        Ok(path)
    } else if path.is_dir() {
        Ok(path.join(SKILL_FILE_NAME))
    } else {
        Err("Path must point to SKILL.md or a skill folder".to_string())
    }
}

fn skill_folder_from_input(path: &str) -> Result<PathBuf, String> {
    let skill_file = skill_file_from_input(path)?;
    ensure_skill_file_path(&skill_file)?;
    skill_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Skill file must have a parent directory".to_string())
}

fn ensure_skill_file_path(path: &Path) -> Result<(), String> {
    if path.file_name().and_then(|name| name.to_str()) == Some(SKILL_FILE_NAME) {
        Ok(())
    } else {
        Err("Path must point to SKILL.md or a skill folder".to_string())
    }
}

fn skill_directory_name(name: &str) -> String {
    let mut directory = String::new();
    let mut last_was_separator = false;

    for character in name.trim().chars() {
        if character.is_ascii_alphanumeric() || character == '_' || character == '-' {
            directory.push(character);
            last_was_separator = false;
        } else if character.is_whitespace() {
            if !last_was_separator && !directory.is_empty() {
                directory.push('-');
                last_was_separator = true;
            }
        }
    }

    let directory = directory.trim_matches('-');
    if directory.is_empty() {
        "skill".to_string()
    } else {
        directory.to_string()
    }
}

fn default_allowed_roots() -> Result<Vec<ScanRoot>, String> {
    let home = home_dir().ok_or_else(|| "Unable to resolve user home directory".to_string())?;
    Ok(skill_scanner::default_scan_roots_for_home(&home))
}

fn configured_allowed_roots() -> Result<Vec<ScanRoot>, String> {
    let mut roots = default_allowed_roots()?;
    let settings = settings_store::load_app_settings()?;
    roots.extend(
        settings
            .custom_scan_directories
            .iter()
            .filter(|path| !path.trim().is_empty())
            .map(|path| ScanRoot::new(path, SkillSource::Custom)),
    );
    Ok(roots)
}

fn home_dir() -> Option<PathBuf> {
    if cfg!(windows) {
        env::var_os("USERPROFILE")
            .map(PathBuf::from)
            .or_else(|| env::var_os("HOME").map(PathBuf::from))
    } else {
        env::var_os("HOME")
            .map(PathBuf::from)
            .or_else(|| env::var_os("USERPROFILE").map(PathBuf::from))
    }
}

fn ensure_existing_path_allowed(path: &Path, roots: &[ScanRoot]) -> Result<(), String> {
    let canonical_path = path
        .canonicalize()
        .map_err(|error| format!("Unable to resolve skill path: {error}"))?;

    if roots.iter().any(|root| {
        root.path
            .canonicalize()
            .map(|root_path| canonical_path.starts_with(root_path))
            .unwrap_or(false)
    }) {
        Ok(())
    } else {
        Err(format!(
            "Path is outside the allowed skill roots: {}",
            path.display()
        ))
    }
}

fn ensure_target_directory_allowed(path: &Path, roots: &[ScanRoot]) -> Result<(), String> {
    let normalized_target = normalize_target_directory(path);
    if roots.iter().any(|root| {
        let root_path = root
            .path
            .canonicalize()
            .unwrap_or_else(|_| normalize_absolute(&root.path));
        normalized_target.starts_with(root_path)
    }) {
        Ok(())
    } else {
        Err(format!(
            "Target directory is outside the allowed skill roots: {}",
            path.display()
        ))
    }
}

fn normalize_target_directory(path: &Path) -> PathBuf {
    if path.exists() {
        return path
            .canonicalize()
            .unwrap_or_else(|_| normalize_absolute(path));
    }

    let absolute = normalize_absolute(path);
    let mut existing_parent = absolute.as_path();
    let mut missing_components = Vec::new();

    while !existing_parent.exists() {
        if let Some(name) = existing_parent.file_name() {
            missing_components.push(name.to_os_string());
        }
        let Some(parent) = existing_parent.parent() else {
            return absolute;
        };
        existing_parent = parent;
    }

    let mut normalized = existing_parent
        .canonicalize()
        .unwrap_or_else(|_| normalize_absolute(existing_parent));
    for component in missing_components.iter().rev() {
        normalized.push(component);
    }
    normalized
}

fn normalize_absolute(path: &Path) -> PathBuf {
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(path)
    };
    let mut normalized = PathBuf::new();

    for component in absolute.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                normalized.pop();
            }
            _ => normalized.push(component.as_os_str()),
        }
    }

    normalized
}

fn source_for_path(path: &Path, roots: &[ScanRoot]) -> SkillSource {
    roots
        .iter()
        .find_map(|root| {
            let root_path = root.path.canonicalize().ok()?;
            let skill_path = path.canonicalize().ok()?;
            skill_path.starts_with(root_path).then_some(root.source)
        })
        .unwrap_or(SkillSource::Unknown)
}

fn backup_skill_directory(skill_dir: &Path, roots: &[ScanRoot]) -> Result<PathBuf, String> {
    let canonical_skill_dir = skill_dir
        .canonicalize()
        .map_err(|error| format!("Unable to resolve skill directory for backup: {error}"))?;
    let backup_parent =
        containing_scan_root(&canonical_skill_dir, roots)?.join(".skill-panel-backups");
    fs::create_dir_all(&backup_parent)
        .map_err(|error| format!("Unable to create backup directory: {error}"))?;

    let skill_name = canonical_skill_dir
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("skill");
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("Unable to timestamp backup: {error}"))?
        .as_millis();
    let backup_dir = backup_parent.join(format!(
        "{}-{}",
        skill_directory_name(skill_name),
        timestamp
    ));
    copy_directory_recursive(&canonical_skill_dir, &backup_dir)?;
    Ok(backup_dir)
}

fn containing_scan_root(skill_dir: &Path, roots: &[ScanRoot]) -> Result<PathBuf, String> {
    for root in roots {
        if let Ok(root_path) = root.path.canonicalize() {
            if skill_dir.starts_with(&root_path) {
                return Ok(root_path);
            }
        }
    }

    Err(format!(
        "Unable to find allowed root for backup: {}",
        skill_dir.display()
    ))
}

fn copy_directory_recursive(source: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination)
        .map_err(|error| format!("Unable to create backup skill directory: {error}"))?;
    let entries = fs::read_dir(source)
        .map_err(|error| format!("Unable to read skill directory for backup: {error}"))?;

    for entry in entries {
        let entry = entry.map_err(|error| format!("Unable to read backup entry: {error}"))?;
        let source_path = entry.path();
        let destination_path = destination.join(entry.file_name());
        let metadata = entry
            .metadata()
            .map_err(|error| format!("Unable to read backup metadata: {error}"))?;

        if metadata.is_dir() {
            copy_directory_recursive(&source_path, &destination_path)?;
        } else if metadata.is_file() {
            fs::copy(&source_path, &destination_path)
                .map_err(|error| format!("Unable to copy backup file: {error}"))?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{
        create_skill, create_skill_in_roots, delete_skill, delete_skill_in_roots,
        format_frontmatter, parse_skill_markdown, read_skill, read_skill_in_roots,
        resolve_skill_folder_to_open, skill_directory_name, update_skill, update_skill_in_roots,
        write_locked,
    };
    use crate::models::{
        AppSettings, CreateSkillInput, Language, SkillSource, UpdateSkillInput, WritableSkillSource,
    };
    use crate::settings_store::save_app_settings_to_path;
    use crate::skill_scanner::ScanRoot;
    use serde_json::json;
    use std::{
        env,
        ffi::OsString,
        fs,
        path::{Path, PathBuf},
        sync::Mutex,
        time::{SystemTime, UNIX_EPOCH},
    };

    struct HomeEnvGuard {
        userprofile: Option<OsString>,
        home: Option<OsString>,
    }

    impl HomeEnvGuard {
        fn set(home: &Path) -> Self {
            let guard = Self {
                userprofile: env::var_os("USERPROFILE"),
                home: env::var_os("HOME"),
            };
            env::set_var("USERPROFILE", home);
            env::set_var("HOME", home);
            guard
        }
    }

    impl Drop for HomeEnvGuard {
        fn drop(&mut self) {
            restore_env_var("USERPROFILE", &self.userprofile);
            restore_env_var("HOME", &self.home);
        }
    }

    fn restore_env_var(name: &str, value: &Option<OsString>) {
        if let Some(value) = value {
            env::set_var(name, value);
        } else {
            env::remove_var(name);
        }
    }

    fn home_env_lock() -> &'static Mutex<()> {
        crate::version_store::version_test_lock()
    }

    fn temp_root(test_name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after unix epoch")
            .as_nanos();
        let path = std::env::temp_dir().join(format!("skill-store-{test_name}-{suffix}"));
        fs::create_dir_all(&path).expect("temp root should be created");
        path
    }

    fn roots(root: &Path) -> Vec<ScanRoot> {
        vec![ScanRoot::new(root, SkillSource::Custom)]
    }

    #[test]
    fn parser_reads_scalar_and_array_frontmatter() {
        let parsed = parse_skill_markdown(
            "---\nname: Demo\ndescription: Demo skill\ntools:\n  - shell\nrank: 4\n---\n# Body\n",
        )
        .expect("frontmatter should parse");

        assert_eq!(parsed.frontmatter["name"], "Demo");
        assert_eq!(parsed.frontmatter["description"], "Demo skill");
        assert_eq!(parsed.frontmatter["tools"][0], "shell");
        assert_eq!(parsed.frontmatter["rank"], 4);
        assert_eq!(parsed.body_markdown, "# Body\n");
    }

    #[test]
    fn parser_tolerates_nested_frontmatter_for_lark_skills() {
        let parsed = parse_skill_markdown(
            "---\nname: lark-demo\ndescription: Lark demo skill\nrequires:\n  auth: true\n  scopes:\n    - im:message\n---\n# Body\n",
        )
        .expect("nested frontmatter should parse");

        assert_eq!(parsed.frontmatter["name"], "lark-demo");
        assert_eq!(parsed.frontmatter["description"], "Lark demo skill");
        assert_eq!(parsed.frontmatter["requires"]["auth"], true);
        assert_eq!(parsed.frontmatter["requires"]["scopes"][0], "im:message");
        assert_eq!(parsed.body_markdown, "# Body\n");
    }

    #[test]
    fn formatter_writes_required_fields_first_and_preserves_arrays() {
        let mut frontmatter = serde_json::Map::new();
        frontmatter.insert("tools".to_string(), json!(["shell"]));
        frontmatter.insert("description".to_string(), json!("Demo skill"));
        frontmatter.insert("name".to_string(), json!("Demo"));

        assert_eq!(
            format_frontmatter(&frontmatter),
            "---\nname: Demo\ndescription: Demo skill\ntools:\n  - shell\n---\n"
        );
    }

    #[test]
    fn directory_name_is_filesystem_safe() {
        assert_eq!(skill_directory_name("Demo Skill"), "Demo-Skill");
        assert_eq!(skill_directory_name("CON:fig / Skill"), "CONfig-Skill");
        assert_eq!(skill_directory_name("  "), "skill");
    }

    #[test]
    fn create_read_update_and_delete_skill_inside_allowed_root() {
        let root = temp_root("crud");

        let created = create_skill_in_roots(
            CreateSkillInput {
                name: "Demo Skill".to_string(),
                description: "Skill created from tests".to_string(),
                source: WritableSkillSource::Custom,
                target_directory: root.to_string_lossy().to_string(),
                markdown: "# Demo\n\nCreated body.\n".to_string(),
            },
            &roots(&root),
        )
        .expect("skill should be created");

        assert_eq!(created.summary.name, "Demo Skill");
        assert_eq!(created.summary.description, "Skill created from tests");
        assert_eq!(created.markdown, "# Demo\n\nCreated body.\n");
        assert_eq!(created.body_markdown, "# Demo\n\nCreated body.\n");
        assert_eq!(created.frontmatter["name"], "Demo Skill");

        let read = read_skill_in_roots(created.summary.path.clone(), &roots(&root))
            .expect("skill should read");
        assert_eq!(read.raw_content, created.raw_content);

        let updated = update_skill_in_roots(
            UpdateSkillInput {
                path: created.summary.path.clone(),
                name: Some("Updated Skill".to_string()),
                description: Some("Updated description".to_string()),
                markdown: Some("## Updated\n\nEdited body.\n".to_string()),
            },
            &roots(&root),
        )
        .expect("skill should update");

        assert_eq!(updated.summary.name, "Updated Skill");
        assert_eq!(updated.summary.description, "Updated description");
        assert!(updated.raw_content.contains("name: Updated Skill\n"));
        assert_eq!(updated.body_markdown, "## Updated\n\nEdited body.\n");
        let disk_content = fs::read_to_string(&updated.summary.path)
            .expect("updated SKILL.md should exist on disk");
        assert!(disk_content.contains("name: Updated Skill\n"));
        assert!(disk_content.contains("description: Updated description\n"));
        assert!(disk_content.contains("## Updated\n\nEdited body.\n"));

        let skill_dir = PathBuf::from(&updated.summary.path)
            .parent()
            .expect("skill path should have parent")
            .to_path_buf();
        delete_skill_in_roots(updated.summary.path, &roots(&root)).expect("skill should delete");
        assert!(!skill_dir.exists());
        assert!(root.exists());

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn locked_skill_write_truncates_and_replaces_file_contents() {
        let root = temp_root("locked-write");
        let skill_path = root.join("SKILL.md");
        fs::write(&skill_path, "older content that should be removed")
            .expect("seed skill should be written");

        write_locked(&skill_path, b"new").expect("locked write should complete");

        assert_eq!(
            fs::read_to_string(&skill_path).expect("skill should read"),
            "new"
        );

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn create_skill_accepts_new_nested_target_directory_inside_allowed_root() {
        let root = temp_root("nested-target");
        let target = root.join("team").join("skills");

        let created = create_skill_in_roots(
            CreateSkillInput {
                name: "Nested Skill".to_string(),
                description: "Created in a nested target".to_string(),
                source: WritableSkillSource::Custom,
                target_directory: target.to_string_lossy().to_string(),
                markdown: "# Nested\n".to_string(),
            },
            &roots(&root),
        )
        .expect("skill should be created in nested target");

        assert!(PathBuf::from(&created.summary.path).starts_with(&target));
        assert_eq!(created.summary.source, SkillSource::Custom);
        assert!(target.join("Nested-Skill").join("SKILL.md").exists());

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn app_settings_custom_directories_allow_management_commands() {
        let _home_env_lock = home_env_lock()
            .lock()
            .expect("home env lock should be available");
        let home = temp_root("settings-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let custom_root = temp_root("settings-custom");
        let outside_root = temp_root("settings-outside");
        let settings_path = home
            .join(".codex")
            .join("skill-panel")
            .join("settings.json");
        save_app_settings_to_path(
            &settings_path,
            AppSettings {
                language: Language::System,
                custom_scan_directories: vec![custom_root.to_string_lossy().to_string()],
                show_default_scan_directories: true,
                ..AppSettings::default()
            },
        )
        .expect("settings should save");

        let skill_dir = custom_root.join("managed");
        fs::create_dir_all(&skill_dir).expect("custom skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Managed\ndescription: Custom root skill\n---\n# Managed\n",
        )
        .expect("custom skill should be written");

        let read = read_skill(skill_path.to_string_lossy().to_string())
            .expect("custom settings skill should read");
        assert_eq!(read.summary.source, SkillSource::Custom);

        let updated = update_skill(UpdateSkillInput {
            path: skill_path.to_string_lossy().to_string(),
            name: Some("Managed Updated".to_string()),
            description: Some("Updated from settings root".to_string()),
            markdown: Some("# Updated\n".to_string()),
        })
        .expect("custom settings skill should update");
        assert_eq!(updated.summary.name, "Managed Updated");

        let created = create_skill(CreateSkillInput {
            name: "Created Managed".to_string(),
            description: "Created inside a custom settings root".to_string(),
            source: WritableSkillSource::Custom,
            target_directory: custom_root.join("new-skills").to_string_lossy().to_string(),
            markdown: "# Created\n".to_string(),
        })
        .expect("custom settings target should create");
        assert_eq!(created.summary.source, SkillSource::Custom);

        let outside_dir = outside_root.join("outside");
        fs::create_dir_all(&outside_dir).expect("outside skill dir should be created");
        let outside_skill = outside_dir.join("SKILL.md");
        fs::write(
            &outside_skill,
            "---\nname: Outside\ndescription: Outside root\n---\n# Outside\n",
        )
        .expect("outside skill should be written");
        let outside_error = read_skill(outside_skill.to_string_lossy().to_string())
            .expect_err("outside skill should still be rejected");
        assert!(outside_error.contains("outside the allowed skill roots"));

        delete_skill(updated.summary.path).expect("custom settings skill should delete");
        assert!(!skill_dir.exists());

        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
        fs::remove_dir_all(outside_root).ok();
    }

    #[test]
    fn update_skill_records_version_snapshot_before_saving() {
        let _home_env_lock = home_env_lock()
            .lock()
            .expect("home env lock should be available");
        let home = temp_root("version-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let custom_root = temp_root("version-custom");
        let settings_path = home
            .join(".codex")
            .join("skill-panel")
            .join("settings.json");
        save_app_settings_to_path(
            &settings_path,
            AppSettings {
                language: Language::System,
                custom_scan_directories: vec![custom_root.to_string_lossy().to_string()],
                show_default_scan_directories: false,
                ..AppSettings::default()
            },
        )
        .expect("settings should save");

        let skill_dir = custom_root.join("versioned");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Versioned\ndescription: Original\n---\n# Original\n",
        )
        .expect("skill should be written");

        update_skill(UpdateSkillInput {
            path: skill_path.to_string_lossy().to_string(),
            name: None,
            description: Some("Updated".to_string()),
            markdown: Some("# Updated\n".to_string()),
        })
        .expect("skill should update");

        let versions = crate::version_store::list_versions(&skill_path.to_string_lossy())
            .expect("version history should load");
        assert!(!versions.is_empty());
        assert_eq!(versions[0].note, "Before save");
        let snapshot = find_version_snapshot_contents(&home.join(".codex").join("skill-panel").join("versions"), &versions[0].id)
            .expect("snapshot should read");
        assert!(snapshot.contains("description: Original\n"));

        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
    }

    #[test]
    fn read_skill_accepts_agents_user_skill_from_default_allowed_roots() {
        let _home_env_lock = home_env_lock()
            .lock()
            .expect("home env lock should be available");
        let home = temp_root("agents-default-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let skill_dir = home.join(".agents").join("skills").join("daily-agent");
        fs::create_dir_all(&skill_dir).expect("agents skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Daily Agent\ndescription: Agents user skill\nversion: 1.0.0\n---\n# Agent body\n",
        )
        .expect("agents skill should be written");

        let detail = read_skill(skill_path.to_string_lossy().to_string())
            .expect("agents user skill should read from default allowed roots");

        assert_eq!(detail.summary.path, skill_path.to_string_lossy());
        assert_eq!(detail.summary.name, "Daily Agent");
        assert_eq!(detail.summary.description, "Agents user skill");
        assert_eq!(detail.summary.source, SkillSource::AgentsUser);
        assert!(detail.summary.modified_at.is_some());
        assert_eq!(detail.frontmatter["version"], "1.0.0");
        assert_eq!(detail.body_markdown, "# Agent body\n");

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn app_settings_custom_directories_allow_open_folder_validation() {
        let _home_env_lock = home_env_lock()
            .lock()
            .expect("home env lock should be available");
        let home = temp_root("open-settings-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let custom_root = temp_root("open-settings-custom");
        let outside_root = temp_root("open-settings-outside");
        let settings_path = home
            .join(".codex")
            .join("skill-panel")
            .join("settings.json");
        save_app_settings_to_path(
            &settings_path,
            AppSettings {
                language: Language::System,
                custom_scan_directories: vec![custom_root.to_string_lossy().to_string()],
                show_default_scan_directories: true,
                ..AppSettings::default()
            },
        )
        .expect("settings should save");

        let skill_dir = custom_root.join("openable");
        fs::create_dir_all(&skill_dir).expect("custom skill dir should be created");
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: Openable\ndescription: Custom root skill\n---\n# Openable\n",
        )
        .expect("custom skill should be written");

        let folder = resolve_skill_folder_to_open(skill_dir.to_string_lossy().to_string())
            .expect("custom settings skill folder should validate for opening");
        assert_eq!(folder, skill_dir);

        let outside_dir = outside_root.join("outside-open");
        fs::create_dir_all(&outside_dir).expect("outside skill dir should be created");
        fs::write(
            outside_dir.join("SKILL.md"),
            "---\nname: Outside\ndescription: Outside root\n---\n# Outside\n",
        )
        .expect("outside skill should be written");

        let error = resolve_skill_folder_to_open(outside_dir.to_string_lossy().to_string())
            .expect_err("outside skill folder should still be rejected");
        assert!(error.contains("outside the allowed skill roots"));

        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
        fs::remove_dir_all(outside_root).ok();
    }

    #[test]
    fn read_skill_accepts_a_skill_folder_path() {
        let root = temp_root("read-folder");
        let skill_dir = root.join("folder-input");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: Folder Input\ndescription: Read by directory\n---\n# Body\n",
        )
        .expect("skill file should be written");

        let detail = read_skill_in_roots(skill_dir.to_string_lossy().to_string(), &roots(&root))
            .expect("skill folder should read");

        assert_eq!(detail.summary.name, "Folder Input");
        assert_eq!(detail.body_markdown, "# Body\n");

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn update_roundtrips_common_frontmatter_fields() {
        let root = temp_root("roundtrip");
        let skill_dir = root.join("rich");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Rich\ndescription: Old\nversion: 1.2.3\nplatforms:\n  - windows\n  - macos\ntags:\n  - files\nenabled: true\ndisabled: false\n---\n# Old\n",
        )
        .expect("skill should be written");

        let updated = update_skill_in_roots(
            UpdateSkillInput {
                path: skill_path.to_string_lossy().to_string(),
                name: None,
                description: Some("New".to_string()),
                markdown: Some("# New\n".to_string()),
            },
            &roots(&root),
        )
        .expect("skill should update");

        assert_eq!(updated.frontmatter["version"], "1.2.3");
        assert_eq!(
            updated.frontmatter["platforms"],
            json!(["windows", "macos"])
        );
        assert_eq!(updated.frontmatter["tags"], json!(["files"]));
        assert_eq!(updated.frontmatter["enabled"], true);
        assert_eq!(updated.frontmatter["disabled"], false);
        assert_eq!(updated.body_markdown, "# New\n");

        let raw = fs::read_to_string(skill_path).expect("updated skill should exist");
        assert!(raw.contains("platforms:\n  - windows\n  - macos\n"));
        assert!(raw.contains("enabled: true\n"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn update_skill_creates_a_recoverable_backup_before_writing() {
        let root = temp_root("update-backup");
        let skill_dir = root.join("backup-target");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Backup Target\ndescription: Original description\n---\n# Original\n",
        )
        .expect("skill should be written");

        update_skill_in_roots(
            UpdateSkillInput {
                path: skill_path.to_string_lossy().to_string(),
                name: Some("Backup Target Updated".to_string()),
                description: Some("Updated description".to_string()),
                markdown: Some("# Updated\n".to_string()),
            },
            &roots(&root),
        )
        .expect("skill should update");

        let backup_root = root.join(".skill-panel-backups");
        let backup_files = find_backup_skill_files(&backup_root);
        assert_eq!(backup_files.len(), 1);
        let backup = fs::read_to_string(&backup_files[0]).expect("backup should read");
        assert!(backup.contains("name: Backup Target\n"));
        assert!(backup.contains("# Original\n"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn delete_skill_creates_a_recoverable_backup_before_removing_directory() {
        let root = temp_root("delete-backup");
        let skill_dir = root.join("delete-target");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        let skill_path = skill_dir.join("SKILL.md");
        fs::write(
            &skill_path,
            "---\nname: Delete Target\ndescription: Original description\n---\n# Delete me\n",
        )
        .expect("skill should be written");

        delete_skill_in_roots(skill_path.to_string_lossy().to_string(), &roots(&root))
            .expect("skill should delete");

        assert!(!skill_dir.exists());
        let backup_files = find_backup_skill_files(&root.join(".skill-panel-backups"));
        assert_eq!(backup_files.len(), 1);
        let backup = fs::read_to_string(&backup_files[0]).expect("backup should read");
        assert!(backup.contains("name: Delete Target\n"));
        assert!(backup.contains("# Delete me\n"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn rejects_read_create_update_and_delete_outside_allowed_roots() {
        let root = temp_root("allowed");
        let outside = temp_root("outside");
        let outside_skill_dir = outside.join("escape");
        fs::create_dir_all(&outside_skill_dir).expect("outside skill dir should be created");
        let outside_skill = outside_skill_dir.join("SKILL.md");
        fs::write(
            &outside_skill,
            "---\nname: Escape\ndescription: Outside root\n---\n# Escape\n",
        )
        .expect("outside skill should be written");

        let read_error =
            read_skill_in_roots(outside_skill.to_string_lossy().to_string(), &roots(&root))
                .expect_err("outside read should fail");
        assert!(read_error.contains("outside the allowed skill roots"));

        let update_error = update_skill_in_roots(
            UpdateSkillInput {
                path: outside_skill.to_string_lossy().to_string(),
                name: Some("Nope".to_string()),
                description: None,
                markdown: None,
            },
            &roots(&root),
        )
        .expect_err("outside update should fail");
        assert!(update_error.contains("outside the allowed skill roots"));

        let delete_error =
            delete_skill_in_roots(outside_skill.to_string_lossy().to_string(), &roots(&root))
                .expect_err("outside delete should fail");
        assert!(delete_error.contains("outside the allowed skill roots"));

        let create_error = create_skill_in_roots(
            CreateSkillInput {
                name: "Escape".to_string(),
                description: "Outside root".to_string(),
                source: WritableSkillSource::Custom,
                target_directory: outside.to_string_lossy().to_string(),
                markdown: "# Escape\n".to_string(),
            },
            &roots(&root),
        )
        .expect_err("outside create should fail");
        assert!(create_error.contains("outside the allowed skill roots"));

        fs::remove_dir_all(root).ok();
        fs::remove_dir_all(outside).ok();
    }

    fn find_backup_skill_files(root: &Path) -> Vec<PathBuf> {
        let mut files = Vec::new();
        let Ok(entries) = fs::read_dir(root) else {
            return files;
        };
        for entry in entries.flatten() {
            let path = entry.path().join("SKILL.md");
            if path.exists() {
                files.push(path);
            }
        }
        files.sort();
        files
    }

    fn find_version_snapshot_contents(root: &Path, version_id: &str) -> Option<String> {
        let entries = fs::read_dir(root).ok()?;
        for entry in entries.flatten() {
            let snapshot_path = entry.path().join(version_id).join("SKILL.md");
            if snapshot_path.exists() {
                return fs::read_to_string(snapshot_path).ok();
            }
        }
        None
    }

    #[test]
    fn delete_refuses_to_remove_the_allowed_root_itself() {
        let root = temp_root("delete-root");
        let root_skill = root.join("SKILL.md");
        fs::write(
            &root_skill,
            "---\nname: Root Skill\ndescription: Root level skill\n---\n# Root\n",
        )
        .expect("root skill should be written");

        let error = delete_skill_in_roots(root.to_string_lossy().to_string(), &roots(&root))
            .expect_err("allowed root should not be deleted");

        assert!(error.contains("Refusing to delete an allowed skill root"));
        assert!(root.exists());
        assert!(root_skill.exists());

        fs::remove_dir_all(root).ok();
    }
}
