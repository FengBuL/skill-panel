use crate::models::{
    AppSettings, CreateSkillInput, SkillDetail, SkillPathGroup, SkillSummary, UpdateSkillInput,
};
use crate::settings_store;
use crate::skill_scanner;
use crate::skill_store;

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

#[cfg(test)]
mod tests {
    use super::{app_version, default_scan_path_groups, scan_skills};
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
}
