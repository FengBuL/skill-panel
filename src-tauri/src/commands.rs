use crate::models::{
    AppSettings, AuditLogEntry, CreateSkillInput, DeleteSkillResult, SkillDetail, SkillPathGroup,
    SkillSummary, UpdateSkillInput,
};
use crate::settings_store;
use crate::skill_path_guard;
use crate::skill_scanner;
use crate::skill_store;
use std::{
    env, fs,
    io::Write,
    path::{Path, PathBuf},
};

#[tauri::command]
pub fn app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[tauri::command]
pub fn scan_skills() -> Result<Vec<SkillSummary>, String> {
    let settings = settings_store::load_app_settings()?;
    skill_scanner::scan_configured_skill_roots(&settings)
}

#[tauri::command]
pub fn default_scan_path_groups() -> Result<Vec<SkillPathGroup>, String> {
    skill_scanner::default_scan_path_groups()
}

#[tauri::command]
pub fn read_skill(path: String) -> Result<SkillDetail, String> {
    skill_store::read_skill(path)
}

#[tauri::command]
pub fn create_skill(input: CreateSkillInput) -> Result<SkillDetail, String> {
    skill_store::create_skill(input)
}

#[tauri::command]
pub fn update_skill(input: UpdateSkillInput) -> Result<SkillDetail, String> {
    skill_store::update_skill(input)
}

#[tauri::command]
pub fn delete_skill(path: String) -> Result<DeleteSkillResult, String> {
    skill_store::delete_skill(path)
}

#[tauri::command]
pub fn open_skill_folder(path: String) -> Result<(), String> {
    skill_store::open_skill_folder(path)
}

#[tauri::command]
pub fn load_app_settings() -> Result<AppSettings, String> {
    settings_store::load_app_settings()
}

#[tauri::command]
pub fn save_app_settings(settings: AppSettings) -> Result<AppSettings, String> {
    settings_store::save_app_settings(settings)
}

#[tauri::command]
pub fn append_audit_log(entry: AuditLogEntry) -> Result<(), String> {
    let home = if cfg!(windows) {
        env::var_os("USERPROFILE")
            .map(PathBuf::from)
            .or_else(|| env::var_os("HOME").map(PathBuf::from))
    } else {
        env::var_os("HOME")
            .map(PathBuf::from)
            .or_else(|| env::var_os("USERPROFILE").map(PathBuf::from))
    }
    .ok_or_else(|| "Unable to resolve user home directory".to_string())?;
    let log_path = home.join(".codex").join("skill-panel").join("audit.log");
    if let Some(parent) = log_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Unable to create audit log directory: {error}"))?;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(parent_or_self(&log_path), fs::Permissions::from_mode(0o700)).ok();
    }
    let safe_entry = AuditLogEntry {
        action: crate::redaction::redact_text(&entry.action),
        timestamp: entry.timestamp,
        detail: crate::redaction::redact_json_value(&entry.detail),
    };
    let line = serde_json::to_string(&safe_entry)
        .map_err(|error| format!("Unable to serialize audit log entry: {error}"))?;
    let mut options = fs::OpenOptions::new();
    options.create(true).append(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(&log_path).map_err(|error| {
        format!(
            "Unable to open audit log: {}",
            crate::redaction::redact_text(&error.to_string())
        )
    })?;
    writeln!(file, "{line}").map_err(|error| format!("Unable to write audit log: {error}"))
}

#[cfg(unix)]
fn parent_or_self(path: &Path) -> &Path {
    path.parent().unwrap_or(path)
}

#[cfg(test)]
mod tests {
    use super::{
        analyze_deps, app_version, append_audit_log, clone_skill, default_scan_path_groups,
        delete_skill, read_skill_files, scan_skills, toggle_skill_enabled, validate_skill,
        write_skill_file,
    };
    use crate::models::{AppSettings, Language};
    use crate::settings_store::save_app_settings_to_path;
    use std::{
        env,
        ffi::OsString,
        fs,
        path::{Path, PathBuf},
        sync::{Mutex, MutexGuard},
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

    fn lock_home_env() -> MutexGuard<'static, ()> {
        home_env_lock()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn temp_root(test_name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after unix epoch")
            .as_nanos();
        let path = std::env::temp_dir().join(format!("skill-command-{test_name}-{suffix}"));
        fs::create_dir_all(&path).expect("temp root should be created");
        path
    }

    fn write_skill(dir: &Path, name: &str) -> PathBuf {
        fs::create_dir_all(dir).expect("skill dir should be created");
        let skill_path = dir.join("SKILL.md");
        fs::write(
            &skill_path,
            format!(
                "---\nname: {name}\ndescription: {name} description\n---\n## When To Use\nUse it.\n## Safety\nSafe.\n@skill/base\n"
            ),
        )
        .expect("skill should be written");
        skill_path
    }

    fn write_settings(home: &Path, custom_root: &Path) {
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
    }

    fn plugin_skill_root(home: &Path) -> PathBuf {
        home.join(".codex")
            .join("plugins")
            .join("cache")
            .join("publisher")
            .join("plugin")
            .join("skills")
    }

    fn expect_command_error<T>(result: Result<T, String>, message: &str) -> String {
        match result {
            Ok(_) => panic!("{message}"),
            Err(error) => error,
        }
    }

    #[test]
    fn app_version_matches_package_version() {
        assert_eq!(app_version(), env!("CARGO_PKG_VERSION"));
    }

    #[test]
    fn scan_skills_returns_a_real_scan_result() {
        assert!(scan_skills().is_ok());
    }

    #[test]
    fn default_scan_path_groups_returns_user_roots() {
        let groups = default_scan_path_groups().expect("default scan path groups should load");

        assert!(!groups.is_empty());
        assert!(groups.iter().any(|group| group
            .paths
            .iter()
            .any(|path| path.contains(".codex") && path.contains("skills"))));
    }

    #[test]
    fn settings_commands_define_the_settings_boundary() {
        let settings = AppSettings {
            language: Language::System,
            custom_scan_directories: vec!["/tmp/skills".to_string()],
            show_default_scan_directories: false,
            ..AppSettings::default()
        };

        assert_eq!(settings.language, Language::System);
        assert_eq!(settings.custom_scan_directories, vec!["/tmp/skills"]);
        assert!(!settings.show_default_scan_directories);
    }

    #[test]
    fn append_audit_log_accepts_json_detail() {
        let entry = crate::models::AuditLogEntry {
            action: "test.audit".to_string(),
            timestamp: "2026-07-05T00:00:00Z".to_string(),
            detail: serde_json::json!({ "count": 1 }),
        };

        assert!(append_audit_log(entry).is_ok());
    }

    #[test]
    fn append_audit_log_recursively_redacts_nested_detail_strings() {
        let _home_env_lock = lock_home_env();
        let home = temp_root("audit-redact-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let entry = crate::models::AuditLogEntry {
            action: "test.audit".to_string(),
            timestamp: "2026-07-16T00:00:00Z".to_string(),
            detail: serde_json::json!({
                "api_key": "sk-test-secret",
                "nested": {
                    "path": "/Users/alice/.codex/skills/demo/SKILL.md",
                    "email": "owner@example.com"
                },
                "items": ["Bearer raw-token-value"]
            }),
        };

        append_audit_log(entry).expect("audit log should append");
        let audit_path = home.join(".codex").join("skill-panel").join("audit.log");
        let raw = fs::read_to_string(audit_path).expect("audit log should exist");

        assert!(raw.contains("<API_KEY>"));
        assert!(raw.contains("<PATH>"));
        assert!(raw.contains("<EMAIL>"));
        assert!(raw.contains("<TOKEN>"));
        assert!(!raw.contains("sk-test-secret"));
        assert!(!raw.contains("/Users/alice"));
        assert!(!raw.contains("owner@example.com"));
        assert!(!raw.contains("raw-token-value"));

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn file_commands_reject_paths_outside_configured_roots_without_leaking_input_path() {
        let _home_env_lock = lock_home_env();
        let home = temp_root("outside-home");
        let custom_root = temp_root("outside-custom");
        let outside_root = temp_root("outside-root");
        let _home_env_guard = HomeEnvGuard::set(&home);
        write_settings(&home, &custom_root);
        let outside_skill = write_skill(&outside_root.join("escape"), "Escape");

        for error in [
            expect_command_error(
                validate_skill(outside_skill.to_string_lossy().to_string()),
                "validate should reject outside root",
            ),
            expect_command_error(
                analyze_deps(outside_skill.to_string_lossy().to_string()),
                "deps should reject outside root",
            ),
        ] {
            assert!(error.contains("Path is not allowed"));
            assert!(!error.contains(&outside_root.to_string_lossy().to_string()));
        }

        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
        fs::remove_dir_all(outside_root).ok();
    }

    #[cfg(unix)]
    #[test]
    fn file_commands_reject_symlinked_skill_directories_that_escape_allowed_roots() {
        let _home_env_lock = lock_home_env();
        let home = temp_root("symlink-home");
        let custom_root = temp_root("symlink-custom");
        let outside_root = temp_root("symlink-outside");
        let _home_env_guard = HomeEnvGuard::set(&home);
        write_settings(&home, &custom_root);
        let outside_skill_dir = outside_root.join("real-skill");
        write_skill(&outside_skill_dir, "Linked Escape");
        let symlink_dir = custom_root.join("linked-skill");
        std::os::unix::fs::symlink(&outside_skill_dir, &symlink_dir)
            .expect("symlink should be created");

        let error = expect_command_error(
            read_skill_files(symlink_dir.to_string_lossy().to_string()),
            "symlink escape should be rejected",
        );

        assert!(error.contains("Path is not allowed"));
        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
        fs::remove_dir_all(outside_root).ok();
    }

    #[test]
    fn file_commands_allow_custom_roots_and_reject_root_or_traversal_targets() {
        let _home_env_lock = lock_home_env();
        let home = temp_root("custom-home");
        let custom_root = temp_root("custom-root");
        let _home_env_guard = HomeEnvGuard::set(&home);
        write_settings(&home, &custom_root);
        let skill_dir = custom_root.join("managed");
        write_skill(&skill_dir, "Managed");

        let files = read_skill_files(skill_dir.to_string_lossy().to_string())
            .expect("custom root skill files should read");
        assert!(files.iter().any(|file| file.name == "SKILL.md"));

        write_skill_file(
            skill_dir.to_string_lossy().to_string(),
            "notes.md".to_string(),
            "safe note".to_string(),
        )
        .expect("custom root skill file should write");
        assert_eq!(
            fs::read_to_string(skill_dir.join("notes.md")).expect("note should read"),
            "safe note"
        );

        let root_error = expect_command_error(
            read_skill_files(custom_root.to_string_lossy().to_string()),
            "scan root itself should be rejected",
        );
        assert!(root_error.contains("Skill directory is required"));

        let traversal_error = expect_command_error(
            write_skill_file(
                skill_dir.to_string_lossy().to_string(),
                "../escape.md".to_string(),
                "escape".to_string(),
            ),
            "file traversal should be rejected",
        );
        assert!(traversal_error.contains("File name is not allowed"));
        assert!(!custom_root.join("escape.md").exists());

        fs::remove_dir_all(home).ok();
        fs::remove_dir_all(custom_root).ok();
    }

    #[test]
    fn protected_plugin_cache_sources_are_read_only_but_can_copy_to_codex_user_root() {
        let _home_env_lock = lock_home_env();
        let home = temp_root("plugin-home");
        let _home_env_guard = HomeEnvGuard::set(&home);
        let plugin_root = plugin_skill_root(&home);
        let plugin_skill_dir = plugin_root.join("protected-skill");
        let plugin_skill = write_skill(&plugin_skill_dir, "Protected");
        let codex_skill_root = home.join(".codex").join("skills");
        fs::create_dir_all(&codex_skill_root).expect("codex user root should be created");

        let write_error = expect_command_error(
            write_skill_file(
                plugin_skill_dir.to_string_lossy().to_string(),
                "notes.md".to_string(),
                "blocked".to_string(),
            ),
            "protected source write should be rejected",
        );
        assert!(write_error.contains("read-only source"));
        assert!(!plugin_skill_dir.join("notes.md").exists());

        let toggle_error = expect_command_error(
            toggle_skill_enabled(plugin_skill.to_string_lossy().to_string(), false),
            "protected source toggle should be rejected",
        );
        assert!(toggle_error.contains("read-only source"));
        assert!(!plugin_skill.with_extension("md.disabled").exists());

        let delete_error = expect_command_error(
            delete_skill(plugin_skill.to_string_lossy().to_string()),
            "protected source delete should be rejected",
        );
        assert!(delete_error.contains("read-only source"));
        assert!(plugin_skill_dir.exists());

        let cloned = clone_skill(
            plugin_skill.to_string_lossy().to_string(),
            "editable-copy".to_string(),
        )
        .expect("protected source should copy to an editable root");
        let cloned_path = PathBuf::from(cloned.new_path);
        assert_eq!(
            cloned_path,
            codex_skill_root.join("editable-copy").join("SKILL.md")
        );
        assert!(cloned_path.exists());

        let conflict = expect_command_error(
            clone_skill(
                plugin_skill.to_string_lossy().to_string(),
                "editable-copy".to_string(),
            ),
            "same destination skill should be rejected",
        );
        assert!(conflict.contains("already exists"));

        fs::remove_dir_all(home).ok();
    }
}

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloneSkillResult {
    pub new_path: String,
}

#[derive(Serialize, Deserialize)]
pub struct ValidationResult {
    pub score: u32,
    pub checks: Vec<ValidationCheck>,
}

#[derive(Serialize, Deserialize)]
pub struct ValidationCheck {
    pub id: String,
    pub label: String,
    pub status: String,
    pub detail: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillFile {
    pub name: String,
    pub content: String,
    pub size: u64,
    pub is_main: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionEntry {
    pub id: String,
    pub time: String,
    pub note: String,
    pub diff_lines: i64,
    pub source: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CallLog {
    pub time: String,
    pub skill_name: String,
    pub prompt: String,
    pub status: String,
    pub duration_ms: u64,
    pub tokens: u64,
}

#[tauri::command]
pub fn clone_skill(src_path: String, dest_name: String) -> Result<CloneSkillResult, String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let source = skill_path_guard::resolve_skill_path(&src_path, &roots)?;
    let editable_root = skill_path_guard::resolve_default_editable_root(&roots)?;
    fs::create_dir_all(&editable_root)
        .map_err(|error| format!("Unable to create editable skill root: {error}"))?;
    let target_dir = editable_root.join(skill_directory_name(&dest_name));
    if target_dir.exists() {
        return Err("Skill directory already exists".to_string());
    }
    copy_skill_directory(&source.skill_dir, &target_dir)?;
    Ok(CloneSkillResult {
        new_path: target_dir.join("SKILL.md").to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn toggle_skill_enabled(path: String, enabled: bool) -> Result<(), String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let resolved = skill_path_guard::resolve_writable_skill_path(&path, &roots)?;
    let marker = format!("{}.disabled", resolved.skill_file.to_string_lossy());
    if enabled {
        std::fs::remove_file(&marker).ok();
    } else {
        std::fs::write(&marker, "").map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn validate_skill(path: String) -> Result<ValidationResult, String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let resolved = skill_path_guard::resolve_skill_path(&path, &roots)?;
    let content = std::fs::read_to_string(&resolved.skill_file)
        .map_err(|_| "Unable to read skill file".to_string())?;
    let mut checks = Vec::new();
    let mut score = 100;

    if content.contains("## When To Use") {
        checks.push(ValidationCheck {
            id: "when".into(),
            label: "When To Use".into(),
            status: "ok".into(),
            detail: None,
        });
    } else {
        checks.push(ValidationCheck {
            id: "when".into(),
            label: "When To Use".into(),
            status: "fail".into(),
            detail: Some("缺少章节".into()),
        });
        score -= 20;
    }

    if content.contains("## Safety") {
        checks.push(ValidationCheck {
            id: "safety".into(),
            label: "Safety".into(),
            status: "ok".into(),
            detail: None,
        });
    } else {
        checks.push(ValidationCheck {
            id: "safety".into(),
            label: "Safety".into(),
            status: "warn".into(),
            detail: Some("建议补充".into()),
        });
        score -= 10;
    }

    if content.lines().count() > 20 {
        checks.push(ValidationCheck {
            id: "length".into(),
            label: "内容长度".into(),
            status: "ok".into(),
            detail: None,
        });
    } else {
        checks.push(ValidationCheck {
            id: "length".into(),
            label: "内容长度".into(),
            status: "warn".into(),
            detail: Some("偏短".into()),
        });
        score -= 5;
    }

    Ok(ValidationResult { score, checks })
}

#[tauri::command]
pub fn read_skill_files(dir: String) -> Result<Vec<SkillFile>, String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let resolved = skill_path_guard::resolve_skill_directory(&dir, &roots)?;
    let mut files = Vec::new();
    let entries = std::fs::read_dir(&resolved.skill_dir)
        .map_err(|_| "Unable to read skill directory".to_string())?;
    for entry in entries.flatten() {
        let file_type = match entry.file_type() {
            Ok(file_type) => file_type,
            Err(_) => continue,
        };
        if !file_type.is_file() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if let Ok(content) = std::fs::read_to_string(entry.path()) {
            let size = entry.metadata().map(|metadata| metadata.len()).unwrap_or(0);
            let is_main = name == "SKILL.md";
            files.push(SkillFile {
                name,
                content,
                size,
                is_main,
            });
        }
    }
    Ok(files)
}

#[tauri::command]
pub fn write_skill_file(dir: String, file_name: String, content: String) -> Result<(), String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let (_resolved, path) =
        skill_path_guard::resolve_file_in_skill_directory(&dir, &file_name, &roots, true)?;
    std::fs::write(&path, &content).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_version_history(path: String) -> Result<Vec<VersionEntry>, String> {
    let entries = crate::version_store::list_versions(&path)?;
    Ok(entries
        .into_iter()
        .map(|entry| VersionEntry {
            id: entry.id,
            time: entry.time,
            note: entry.note,
            diff_lines: entry.diff_lines,
            source: entry.source,
        })
        .collect())
}

#[tauri::command]
pub fn restore_version(path: String, version_id: String) -> Result<(), String> {
    crate::version_store::restore(&path, &version_id)
}

#[tauri::command]
pub fn get_call_logs(range: String) -> Result<Vec<CallLog>, String> {
    let logs = crate::call_logger::get_logs(&range)?;
    Ok(logs
        .into_iter()
        .map(|log| CallLog {
            time: log.time,
            skill_name: log.skill_name,
            prompt: log.prompt,
            status: log.status,
            duration_ms: log.duration_ms,
            tokens: log.tokens,
        })
        .collect())
}

#[tauri::command]
pub fn analyze_deps(path: String) -> Result<serde_json::Value, String> {
    let roots = skill_path_guard::configured_allowed_roots()?;
    let resolved = skill_path_guard::resolve_skill_path(&path, &roots)?;
    crate::dep_analyzer::analyze(&resolved.skill_file.to_string_lossy())
}

#[tauri::command]
pub async fn ai_optimize(
    app: tauri::AppHandle,
    content: String,
    action: String,
    vendor: String,
    desensitize: bool,
    send_confirmed: bool,
    raw_content_confirmed: bool,
    preview: String,
) -> Result<(), String> {
    crate::ai_proxy::optimize(
        app,
        content,
        action,
        vendor,
        desensitize,
        send_confirmed,
        raw_content_confirmed,
        preview,
    )
    .await
}

#[tauri::command]
pub fn set_ai_key(vendor: String, key: String) -> Result<(), String> {
    crate::ai_proxy::set_api_key(&vendor, &key)
}

#[tauri::command]
pub fn ai_cancel() -> Result<(), String> {
    crate::ai_proxy::cancel();
    Ok(())
}

#[tauri::command]
pub fn get_ai_key(vendor: String) -> bool {
    crate::ai_proxy::has_api_key(&vendor)
}

#[tauri::command]
pub fn watch_scan_dirs(app: tauri::AppHandle, dirs: Vec<String>) -> Result<(), String> {
    crate::watcher::start_watch(app, dirs)
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

fn copy_skill_directory(source: &Path, destination: &Path) -> Result<(), String> {
    fs::create_dir_all(destination)
        .map_err(|error| format!("Unable to create copied skill directory: {error}"))?;
    let entries = fs::read_dir(source).map_err(|_| "Unable to read skill directory".to_string())?;

    for entry in entries {
        let entry = entry.map_err(|_| "Unable to read skill directory".to_string())?;
        let source_path = entry.path();
        let destination_path = destination.join(entry.file_name());
        let metadata = fs::symlink_metadata(entry.path())
            .map_err(|_| "Unable to read skill file metadata".to_string())?;

        if metadata.file_type().is_symlink() {
            continue;
        }
        if metadata.is_dir() {
            copy_skill_directory(&source_path, &destination_path)?;
        } else if metadata.is_file() {
            fs::copy(&source_path, &destination_path)
                .map_err(|error| format!("Unable to copy skill file: {error}"))?;
        }
    }

    Ok(())
}
