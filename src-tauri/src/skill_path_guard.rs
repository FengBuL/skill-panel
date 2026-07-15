use crate::models::SkillSource;
use crate::settings_store;
use crate::skill_scanner::{self, ScanRoot};
use std::{
    env, fs,
    path::{Component, Path, PathBuf},
};

pub(crate) const SKILL_FILE_NAME: &str = "SKILL.md";
const PATH_NOT_ALLOWED: &str = "Path is not allowed for this operation: outside the allowed skill roots";
const READ_ONLY_SOURCE: &str = "Operation is not allowed for this read-only source";

#[derive(Debug, Clone)]
pub(crate) struct ResolvedSkillPath {
    pub skill_file: PathBuf,
    pub skill_dir: PathBuf,
    pub root: PathBuf,
    pub source: SkillSource,
}

#[derive(Debug, Clone)]
pub(crate) struct ResolvedTargetDirectory {
    pub path: PathBuf,
    pub source: SkillSource,
}

pub(crate) fn configured_allowed_roots() -> Result<Vec<ScanRoot>, String> {
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

pub(crate) fn default_allowed_roots() -> Result<Vec<ScanRoot>, String> {
    let home = home_dir().ok_or_else(|| "Unable to resolve user home directory".to_string())?;
    Ok(skill_scanner::default_scan_roots_for_home(&home))
}

pub(crate) fn is_writable_source(source: SkillSource) -> bool {
    matches!(
        source,
        SkillSource::CodexUser | SkillSource::AgentsUser | SkillSource::Custom
    )
}

pub(crate) fn resolve_skill_path(
    path: &str,
    roots: &[ScanRoot],
) -> Result<ResolvedSkillPath, String> {
    let input = non_empty_path(path, "path")?;
    reject_parent_components(&input)?;

    let existing_path = input
        .canonicalize()
        .map_err(|_| "Skill path does not exist".to_string())?;
    let metadata =
        fs::metadata(&existing_path).map_err(|_| "Skill path does not exist".to_string())?;
    let skill_file = if metadata.is_dir() {
        existing_path.join(SKILL_FILE_NAME)
    } else if existing_path.file_name().and_then(|name| name.to_str()) == Some(SKILL_FILE_NAME) {
        existing_path
    } else {
        return Err("Path must point to SKILL.md or a skill folder".to_string());
    };

    let skill_file = skill_file
        .canonicalize()
        .map_err(|_| "Skill file does not exist".to_string())?;
    if skill_file.file_name().and_then(|name| name.to_str()) != Some(SKILL_FILE_NAME) {
        return Err("Path must point to SKILL.md or a skill folder".to_string());
    }
    let skill_dir = skill_file
        .parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "Skill file must have a parent directory".to_string())?;
    let expected_file = skill_dir.join(SKILL_FILE_NAME);
    if skill_file != expected_file {
        return Err("Path must point to SKILL.md inside its skill folder".to_string());
    }

    let (root, source) = containing_root(&skill_file, roots)?;
    Ok(ResolvedSkillPath {
        skill_file,
        skill_dir,
        root,
        source,
    })
}

pub(crate) fn resolve_writable_skill_path(
    path: &str,
    roots: &[ScanRoot],
) -> Result<ResolvedSkillPath, String> {
    let resolved = resolve_skill_path(path, roots)?;
    ensure_writable_source(resolved.source)?;
    Ok(resolved)
}

pub(crate) fn resolve_skill_directory(
    dir: &str,
    roots: &[ScanRoot],
) -> Result<ResolvedSkillPath, String> {
    let input = non_empty_path(dir, "dir")?;
    reject_parent_components(&input)?;
    if let Ok(canonical_input) = input.canonicalize() {
        for root in roots {
            if root
                .path
                .canonicalize()
                .map(|root_path| root_path == canonical_input)
                .unwrap_or(false)
            {
                return Err("Skill directory is required inside an allowed root".to_string());
            }
        }
    }
    let resolved = resolve_skill_path(dir, roots)?;
    if resolved.skill_dir == resolved.root {
        return Err("Skill directory is required inside an allowed root".to_string());
    }
    Ok(resolved)
}

pub(crate) fn resolve_writable_skill_directory(
    dir: &str,
    roots: &[ScanRoot],
) -> Result<ResolvedSkillPath, String> {
    let resolved = resolve_skill_directory(dir, roots)?;
    ensure_writable_source(resolved.source)?;
    Ok(resolved)
}

pub(crate) fn resolve_file_in_skill_directory(
    dir: &str,
    file_name: &str,
    roots: &[ScanRoot],
    require_writable: bool,
) -> Result<(ResolvedSkillPath, PathBuf), String> {
    validate_plain_file_name(file_name)?;
    let resolved = if require_writable {
        resolve_writable_skill_directory(dir, roots)?
    } else {
        resolve_skill_directory(dir, roots)?
    };
    let file_path = resolved.skill_dir.join(file_name);
    Ok((resolved, file_path))
}

pub(crate) fn resolve_target_directory(
    path: &str,
    roots: &[ScanRoot],
) -> Result<ResolvedTargetDirectory, String> {
    let input = non_empty_path(path, "targetDirectory")?;
    reject_parent_components(&input)?;
    let normalized_target = normalize_target_directory(&input)?;
    let (root, source) = containing_root(&normalized_target, roots)?;
    ensure_writable_source(source)?;
    let _ = root;
    let target_path = normalize_absolute_without_canonicalizing(&input)?;
    Ok(ResolvedTargetDirectory {
        path: target_path,
        source,
    })
}

pub(crate) fn resolve_default_editable_root(roots: &[ScanRoot]) -> Result<PathBuf, String> {
    for root in roots {
        if root.source == SkillSource::CodexUser {
            return Ok(root.path.clone());
        }
    }
    Err("Editable skill root is not configured".to_string())
}

pub(crate) fn containing_root(
    path: &Path,
    roots: &[ScanRoot],
) -> Result<(PathBuf, SkillSource), String> {
    let canonical_path = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    for root in roots {
        let Ok(root_path) = root.path.canonicalize() else {
            continue;
        };
        if canonical_path.starts_with(&root_path) {
            return Ok((root_path, root.source));
        }
    }
    Err(PATH_NOT_ALLOWED.to_string())
}

pub(crate) fn ensure_writable_source(source: SkillSource) -> Result<(), String> {
    if is_writable_source(source) {
        Ok(())
    } else {
        Err(READ_ONLY_SOURCE.to_string())
    }
}

pub(crate) fn validate_plain_file_name(file_name: &str) -> Result<(), String> {
    let trimmed = file_name.trim();
    if trimmed.is_empty() || trimmed == "." || trimmed == ".." {
        return Err("File name is not allowed".to_string());
    }
    let path = Path::new(trimmed);
    if path.components().count() != 1 {
        return Err("File name is not allowed".to_string());
    }
    match path.components().next() {
        Some(Component::Normal(_)) => Ok(()),
        _ => Err("File name is not allowed".to_string()),
    }
}

fn non_empty_path(path: &str, field: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        Err(format!("{field} cannot be empty"))
    } else {
        Ok(PathBuf::from(trimmed))
    }
}

fn reject_parent_components(path: &Path) -> Result<(), String> {
    if path
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        Err(PATH_NOT_ALLOWED.to_string())
    } else {
        Ok(())
    }
}

fn normalize_target_directory(path: &Path) -> Result<PathBuf, String> {
    if path.exists() {
        return path.canonicalize().map_err(|_| PATH_NOT_ALLOWED.to_string());
    }

    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        env::current_dir()
            .map_err(|_| PATH_NOT_ALLOWED.to_string())?
            .join(path)
    };
    let mut existing_parent = absolute.as_path();
    let mut missing_components = Vec::new();

    while !existing_parent.exists() {
        if let Some(name) = existing_parent.file_name() {
            missing_components.push(name.to_os_string());
        }
        let Some(parent) = existing_parent.parent() else {
            return Err(PATH_NOT_ALLOWED.to_string());
        };
        existing_parent = parent;
    }

    let mut normalized = existing_parent
        .canonicalize()
        .map_err(|_| PATH_NOT_ALLOWED.to_string())?;
    for component in missing_components.iter().rev() {
        normalized.push(component);
    }
    Ok(normalized)
}

fn normalize_absolute_without_canonicalizing(path: &Path) -> Result<PathBuf, String> {
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        env::current_dir()
            .map_err(|_| PATH_NOT_ALLOWED.to_string())?
            .join(path)
    };
    let mut normalized = PathBuf::new();
    for component in absolute.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => return Err(PATH_NOT_ALLOWED.to_string()),
            _ => normalized.push(component.as_os_str()),
        }
    }
    Ok(normalized)
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
