use crate::models::{AppSettings, CreateSkillInput, SkillDetail, SkillSummary, UpdateSkillInput};
use crate::skill_scanner;
use crate::skill_store;

#[tauri::command]
pub fn app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[tauri::command]
pub fn scan_skills() -> Result<Vec<SkillSummary>, String> {
    skill_scanner::scan_default_skill_roots()
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
    Ok(AppSettings::default())
}

#[tauri::command]
pub fn save_app_settings(settings: AppSettings) -> Result<AppSettings, String> {
    Ok(settings)
}

#[cfg(test)]
mod tests {
    use super::{app_version, load_app_settings, scan_skills, save_app_settings};
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
    fn settings_commands_define_the_settings_boundary() {
        let default_settings = load_app_settings().expect("settings placeholder returns defaults");
        assert_eq!(default_settings.language, Language::ZhCn);

        let saved = save_app_settings(AppSettings {
            language: Language::EnUs,
            custom_scan_directories: vec!["/tmp/skills".to_string()],
            show_default_scan_directories: false,
        })
        .expect("settings placeholder returns saved settings");

        assert_eq!(saved.language, Language::EnUs);
        assert_eq!(saved.custom_scan_directories, vec!["/tmp/skills"]);
        assert!(!saved.show_default_scan_directories);
    }
}
