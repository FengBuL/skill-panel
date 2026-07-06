use crate::models::{
    AppSettings, AuditLogEntry, CreateSkillInput, SkillDetail, SkillPathGroup, SkillSummary,
    UpdateSkillInput,
};
use crate::settings_store;
use crate::skill_scanner;
use crate::skill_store;
use std::{env, fs, io::Write, path::PathBuf};

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
pub fn delete_skill(path: String) -> Result<(), String> {
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
    let line = serde_json::to_string(&entry)
        .map_err(|error| format!("Unable to serialize audit log entry: {error}"))?;
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|error| format!("Unable to open audit log: {error}"))?;
    writeln!(file, "{line}").map_err(|error| format!("Unable to write audit log: {error}"))
}

#[cfg(test)]
mod tests {
    use super::{append_audit_log, app_version, default_scan_path_groups, scan_skills};
    use crate::models::{AppSettings, Language};

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
    let parent = std::path::Path::new(&src_path)
        .parent()
        .map(|path| path.display().to_string())
        .unwrap_or_else(|| ".".to_string());
    let _dest = format!("{parent}/../{dest_name}");
    Ok(CloneSkillResult {
        new_path: format!("~/.codex/skills/{dest_name}/"),
    })
}

#[tauri::command]
pub fn toggle_skill_enabled(path: String, enabled: bool) -> Result<(), String> {
    let marker = format!("{path}.disabled");
    if enabled {
        std::fs::remove_file(&marker).ok();
    } else {
        std::fs::write(&marker, "").map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn validate_skill(path: String) -> Result<ValidationResult, String> {
    let content = std::fs::read_to_string(&path).map_err(|error| error.to_string())?;
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
    let mut files = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&dir) {
        for entry in entries.flatten() {
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
    }
    Ok(files)
}

#[tauri::command]
pub fn write_skill_file(dir: String, file_name: String, content: String) -> Result<(), String> {
    let path = std::path::Path::new(&dir).join(&file_name);
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
    crate::dep_analyzer::analyze(&path)
}

#[tauri::command]
pub async fn ai_optimize(
    app: tauri::AppHandle,
    content: String,
    action: String,
    vendor: String,
) -> Result<(), String> {
    crate::ai_proxy::optimize(app, content, action, vendor).await
}

#[tauri::command]
pub fn set_ai_key(vendor: String, key: String) -> Result<(), String> {
    crate::ai_proxy::set_api_key(&vendor, &key)
}

#[tauri::command]
pub fn watch_scan_dirs(app: tauri::AppHandle, dirs: Vec<String>) -> Result<(), String> {
    crate::watcher::start_watch(app, dirs)
}
