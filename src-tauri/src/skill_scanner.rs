use crate::models::{ParseStatus, SkillSource, SkillSummary};

use std::{
    collections::HashSet,
    env, fs,
    path::{Path, PathBuf},
    time::UNIX_EPOCH,
};

const MAX_PLUGIN_CACHE_DEPTH: usize = 64;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScanRoot {
    pub path: PathBuf,
    pub source: SkillSource,
}

impl ScanRoot {
    pub fn new<P: AsRef<Path>>(path: P, source: SkillSource) -> Self {
        Self {
            path: path.as_ref().to_path_buf(),
            source,
        }
    }
}

pub fn scan_default_skill_roots() -> Result<Vec<SkillSummary>, String> {
    let home = home_dir().ok_or_else(|| "Unable to resolve user home directory".to_string())?;
    Ok(scan_skill_roots(&default_scan_roots_for_home(&home)))
}

pub fn default_scan_roots_for_home(home: &Path) -> Vec<ScanRoot> {
    let mut roots = vec![
        ScanRoot::new(home.join(".codex").join("skills"), SkillSource::CodexUser),
        ScanRoot::new(home.join(".agents").join("skills"), SkillSource::AgentsUser),
    ];

    roots.extend(
        discover_plugin_skill_roots(&home.join(".codex").join("plugins").join("cache"))
            .into_iter()
            .map(|path| ScanRoot::new(path, SkillSource::PluginCache)),
    );

    roots
}

pub fn discover_plugin_skill_roots(cache_dir: &Path) -> Vec<PathBuf> {
    let mut skill_roots = Vec::new();
    let mut pending = vec![(cache_dir.to_path_buf(), 0usize)];
    let mut visited = HashSet::new();

    while let Some((path, depth)) = pending.pop() {
        if depth > MAX_PLUGIN_CACHE_DEPTH {
            continue;
        }

        if !visited.insert(canonical_key(&path)) {
            continue;
        }

        let Ok(entries) = fs::read_dir(&path) else {
            continue;
        };

        for entry in entries.flatten() {
            let entry_path = entry.path();
            let Ok(metadata) = fs::symlink_metadata(&entry_path) else {
                continue;
            };
            let file_type = metadata.file_type();

            if file_type.is_symlink() || !metadata.is_dir() {
                continue;
            }

            if entry_path.file_name().and_then(|name| name.to_str()) == Some("skills") {
                skill_roots.push(entry_path.clone());
            }

            pending.push((entry_path, depth + 1));
        }
    }

    skill_roots.sort();
    skill_roots
}

pub fn scan_skill_roots(roots: &[ScanRoot]) -> Vec<SkillSummary> {
    let mut summaries = Vec::new();
    let mut seen_paths = HashSet::new();

    for root in roots {
        for skill_file in discover_skill_files(&root.path) {
            if seen_paths.insert(canonical_key(&skill_file)) {
                summaries.push(summarize_skill_file(&skill_file, root.source));
            }
        }
    }

    summaries
}

pub fn summarize_skill_file(skill_file: &Path, source: SkillSource) -> SkillSummary {
    let fallback_name = fallback_skill_name(skill_file);
    let modified_at = modified_at(skill_file);
    let path = skill_file.to_string_lossy().to_string();

    match fs::read_to_string(skill_file) {
        Ok(markdown) => match parse_skill_frontmatter(&markdown) {
            Ok((name, description)) => SkillSummary {
                path,
                name,
                description,
                source,
                parse_status: ParseStatus::Parsed,
                modified_at,
            },
            Err(()) => SkillSummary {
                path,
                name: fallback_name,
                description: String::new(),
                source,
                parse_status: ParseStatus::InvalidFrontmatter,
                modified_at,
            },
        },
        Err(_) => SkillSummary {
            path,
            name: fallback_name,
            description: String::new(),
            source,
            parse_status: ParseStatus::ReadError,
            modified_at,
        },
    }
}

fn discover_skill_files(root: &Path) -> Vec<PathBuf> {
    let mut skill_files = Vec::new();
    let direct_skill = root.join("SKILL.md");

    if direct_skill.exists() {
        skill_files.push(direct_skill);
    }

    let Ok(entries) = fs::read_dir(root) else {
        return skill_files;
    };

    let mut entries = entries.flatten().map(|entry| entry.path()).collect::<Vec<_>>();
    entries.sort();

    for entry_path in entries {
        if entry_path.is_dir() {
            let skill_file = entry_path.join("SKILL.md");
            if skill_file.exists() {
                skill_files.push(skill_file);
            }
        }
    }

    skill_files
}

fn parse_skill_frontmatter(markdown: &str) -> Result<(String, String), ()> {
    let mut lines = markdown.lines();
    let Some(first_line) = lines.next() else {
        return Err(());
    };

    if first_line.trim() != "---" {
        return Err(());
    }

    let mut name = None;
    let mut description = None;
    let mut found_closing_marker = false;

    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            found_closing_marker = true;
            break;
        }

        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if line.starts_with(' ') || line.starts_with('\t') || trimmed.starts_with('-') {
            continue;
        }

        let (key, value) = trimmed.split_once(':').ok_or(())?;
        let key = key.trim();
        if key.is_empty() {
            return Err(());
        }

        let value = unquote_frontmatter_value(value.trim()).to_string();
        match key {
            "name" => name = Some(value),
            "description" => description = Some(value),
            _ => {}
        }
    }

    if !found_closing_marker {
        return Err(());
    }

    let name = name.filter(|value| !value.trim().is_empty()).ok_or(())?;
    let description = description
        .filter(|value| !value.trim().is_empty())
        .ok_or(())?;

    Ok((name, description))
}

fn unquote_frontmatter_value(value: &str) -> &str {
    if value.len() < 2 {
        return value;
    }

    let bytes = value.as_bytes();
    let starts_and_ends_with_double_quote =
        bytes.first() == Some(&b'"') && bytes.last() == Some(&b'"');
    let starts_and_ends_with_single_quote =
        bytes.first() == Some(&b'\'') && bytes.last() == Some(&b'\'');

    if starts_and_ends_with_double_quote || starts_and_ends_with_single_quote {
        &value[1..value.len() - 1]
    } else {
        value
    }
}

fn fallback_skill_name(skill_file: &Path) -> String {
    skill_file
        .parent()
        .and_then(|path| path.file_name())
        .and_then(|name| name.to_str())
        .unwrap_or("SKILL.md")
        .to_string()
}

fn modified_at(path: &Path) -> Option<String> {
    fs::metadata(path)
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs().to_string())
}

fn canonical_key(path: &Path) -> PathBuf {
    path.canonicalize().unwrap_or_else(|_| path.to_path_buf())
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

#[cfg(test)]
mod tests {
    use crate::models::{ParseStatus, SkillSource};

    use super::{
        default_scan_roots_for_home, scan_skill_roots, summarize_skill_file, ScanRoot,
    };

    use std::{
        fs,
        path::{Path, PathBuf},
        time::{SystemTime, UNIX_EPOCH},
    };

    fn temp_home(test_name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after unix epoch")
            .as_nanos();
        let path = std::env::temp_dir().join(format!("skill-panel-{test_name}-{suffix}"));
        fs::create_dir_all(&path).expect("temp home should be created");
        path
    }

    fn write_skill(dir: &Path, name: &str, description: &str) {
        fs::create_dir_all(dir).expect("skill dir should be created");
        fs::write(
            dir.join("SKILL.md"),
            format!("---\nname: {name}\ndescription: {description}\n---\n# Body\n"),
        )
        .expect("skill file should be written");
    }

    #[test]
    fn default_roots_include_user_skill_directories_and_recursive_plugin_cache_skills() {
        let home = temp_home("default-roots");
        let plugin_skills = home
            .join(".codex")
            .join("plugins")
            .join("cache")
            .join("publisher")
            .join("plugin")
            .join("skills");
        fs::create_dir_all(&plugin_skills).expect("plugin skills dir should be created");

        let roots = default_scan_roots_for_home(&home);

        assert!(roots.contains(&ScanRoot::new(
            home.join(".codex").join("skills"),
            SkillSource::CodexUser
        )));
        assert!(roots.contains(&ScanRoot::new(
            home.join(".agents").join("skills"),
            SkillSource::AgentsUser
        )));
        assert!(roots.contains(&ScanRoot::new(plugin_skills, SkillSource::PluginCache)));

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn scan_roots_discovers_direct_root_skill_and_one_level_child_skills() {
        let home = temp_home("discover");
        let direct = home.join("direct");
        let child = home.join("children").join("nested");
        write_skill(&direct, "Direct", "Direct root skill");
        write_skill(&child, "Nested", "Nested child skill");

        let skills = scan_skill_roots(&[
            ScanRoot::new(&direct, SkillSource::Custom),
            ScanRoot::new(home.join("children"), SkillSource::Custom),
        ]);

        let names = skills
            .iter()
            .map(|skill| skill.name.as_str())
            .collect::<Vec<_>>();
        assert_eq!(names, vec!["Direct", "Nested"]);
        assert!(skills
            .iter()
            .all(|skill| skill.parse_status == ParseStatus::Parsed));

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn scanned_skills_keep_the_source_from_the_root_that_found_them() {
        let home = temp_home("sources");
        let codex = home.join(".codex").join("skills").join("local");
        let agents = home.join(".agents").join("skills").join("agent");
        let plugin = home
            .join(".codex")
            .join("plugins")
            .join("cache")
            .join("vendor")
            .join("bundle")
            .join("skills")
            .join("cached");
        write_skill(&codex, "Codex", "Codex user skill");
        write_skill(&agents, "Agents", "Agents user skill");
        write_skill(&plugin, "Plugin", "Plugin cache skill");

        let skills = scan_skill_roots(&default_scan_roots_for_home(&home));

        assert_eq!(
            skills
                .iter()
                .find(|skill| skill.name == "Codex")
                .map(|skill| skill.source),
            Some(SkillSource::CodexUser)
        );
        assert_eq!(
            skills
                .iter()
                .find(|skill| skill.name == "Agents")
                .map(|skill| skill.source),
            Some(SkillSource::AgentsUser)
        );
        assert_eq!(
            skills
                .iter()
                .find(|skill| skill.name == "Plugin")
                .map(|skill| skill.source),
            Some(SkillSource::PluginCache)
        );

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn scan_roots_deduplicate_the_same_skill_file_across_roots() {
        let home = temp_home("dedupe");
        let skill_dir = home.join("shared");
        write_skill(&skill_dir, "Shared", "Shared skill");

        let skills = scan_skill_roots(&[
            ScanRoot::new(&skill_dir, SkillSource::CodexUser),
            ScanRoot::new(&skill_dir, SkillSource::PluginCache),
        ]);

        assert_eq!(skills.len(), 1);
        assert_eq!(skills[0].name, "Shared");
        assert_eq!(skills[0].source, SkillSource::CodexUser);

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn frontmatter_parser_sets_parsed_and_invalid_statuses() {
        let home = temp_home("frontmatter");
        let valid = home.join("valid");
        let invalid = home.join("invalid");
        write_skill(&valid, "Valid", "Valid description");
        fs::create_dir_all(&invalid).expect("invalid skill dir should be created");
        fs::write(
            invalid.join("SKILL.md"),
            "---\nname without colon\n---\n# Broken\n",
        )
        .expect("invalid skill file should be written");

        let valid_summary =
            summarize_skill_file(&valid.join("SKILL.md"), SkillSource::Custom);
        let invalid_summary =
            summarize_skill_file(&invalid.join("SKILL.md"), SkillSource::Custom);

        assert_eq!(valid_summary.name, "Valid");
        assert_eq!(valid_summary.description, "Valid description");
        assert_eq!(valid_summary.parse_status, ParseStatus::Parsed);
        assert_eq!(invalid_summary.name, "invalid");
        assert_eq!(
            invalid_summary.parse_status,
            ParseStatus::InvalidFrontmatter
        );

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn frontmatter_parser_ignores_extra_yaml_sections_while_reading_name_and_description() {
        let home = temp_home("frontmatter-extra-yaml");
        let skill_dir = home.join("extra");
        fs::create_dir_all(&skill_dir).expect("skill dir should be created");
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: Extra\ndescription: Extra metadata skill\ntools:\n  - shell\n---\n# Body\n",
        )
        .expect("skill file should be written");

        let summary = summarize_skill_file(&skill_dir.join("SKILL.md"), SkillSource::Custom);

        assert_eq!(summary.name, "Extra");
        assert_eq!(summary.description, "Extra metadata skill");
        assert_eq!(summary.parse_status, ParseStatus::Parsed);

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn summarize_skill_file_reports_read_error_when_skill_path_cannot_be_read() {
        let home = temp_home("read-error");
        let skill_dir = home.join("unreadable");
        let skill_path = skill_dir.join("SKILL.md");
        fs::create_dir_all(&skill_path).expect("directory at skill path should be created");

        let summary = summarize_skill_file(&skill_path, SkillSource::Custom);

        assert_eq!(summary.name, "unreadable");
        assert_eq!(summary.parse_status, ParseStatus::ReadError);

        fs::remove_dir_all(home).ok();
    }
}
