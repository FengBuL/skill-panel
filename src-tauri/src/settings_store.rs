use crate::models::AppSettings;

use fs2::FileExt;
use std::{
    env, fs,
    io::{Seek, SeekFrom, Write},
    path::{Path, PathBuf},
};

const SETTINGS_FILE_NAME: &str = "settings.json";

pub fn load_app_settings() -> Result<AppSettings, String> {
    load_app_settings_from_path(&default_settings_path()?)
}

pub fn save_app_settings(settings: AppSettings) -> Result<AppSettings, String> {
    save_app_settings_to_path(&default_settings_path()?, settings)
}

pub fn load_app_settings_from_path(path: &Path) -> Result<AppSettings, String> {
    if !path.exists() {
        return Ok(AppSettings::default());
    }

    let contents =
        fs::read_to_string(path).map_err(|error| format!("Unable to read settings: {error}"))?;
    serde_json::from_str(contents.trim_start_matches('\u{feff}'))
        .map_err(|error| format!("Unable to parse settings: {error}"))
}

pub fn save_app_settings_to_path(
    path: &Path,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Unable to create settings directory: {error}"))?;
    }

    let contents = serde_json::to_string_pretty(&settings)
        .map_err(|error| format!("Unable to serialize settings: {error}"))?;
    write_locked(path, contents.as_bytes())
        .map_err(|error| format!("Unable to write settings: {error}"))?;

    Ok(settings)
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

fn default_settings_path() -> Result<PathBuf, String> {
    let home = home_dir().ok_or_else(|| "Unable to resolve user home directory".to_string())?;
    Ok(home.join(".codex").join("skill-panel").join(SETTINGS_FILE_NAME))
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
    use super::{load_app_settings_from_path, save_app_settings_to_path, write_locked};
    use crate::models::{AppSettings, CustomCategorySetting, Language};
    use std::{
        fs,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

    fn temp_settings_path(test_name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be after unix epoch")
            .as_nanos();
        std::env::temp_dir()
            .join(format!("skill-panel-settings-{test_name}-{suffix}"))
            .join("settings.json")
    }

    #[test]
    fn missing_settings_file_loads_defaults() {
        let path = temp_settings_path("missing");

        let settings = load_app_settings_from_path(&path).expect("missing file should default");

        assert_eq!(settings, AppSettings::default());
    }

    #[test]
    fn settings_roundtrip_to_disk() {
        let path = temp_settings_path("roundtrip");
        let settings = AppSettings {
            language: Language::EnUs,
            custom_scan_directories: vec!["D:\\Team\\skills".to_string()],
            show_default_scan_directories: false,
            custom_categories: std::collections::HashMap::from([(
                "custom-lark".to_string(),
                CustomCategorySetting {
                    color: "#e0f2fe".to_string(),
                    icon: "chat_bubble".to_string(),
                    label: "飞书".to_string(),
                },
            )]),
            category_skill_order: std::collections::HashMap::from([(
                "data".to_string(),
                vec!["D:\\Team\\skills\\sheet-flow\\SKILL.md".to_string()],
            )]),
            category_icons: std::collections::HashMap::from([(
                "finance".to_string(),
                "star".to_string(),
            )]),
            detail_panel_width: Some(520),
            skill_view_mode: Some("list".to_string()),
            skill_card_colors: std::collections::HashMap::from([(
                "D:\\Team\\skills\\sheet-flow\\SKILL.md".to_string(),
                "#fee2e2".to_string(),
            )]),
            skill_category_overrides: std::collections::HashMap::from([(
                "D:\\Team\\skills\\sheet-flow\\SKILL.md".to_string(),
                "finance".to_string(),
            )]),
            skill_category_assignments: std::collections::HashMap::from([(
                "D:\\Team\\skills\\sheet-flow\\SKILL.md".to_string(),
                vec!["custom-lark".to_string(), "finance".to_string()],
            )]),
            skill_locks: std::collections::HashMap::from([(
                "D:\\Team\\skills\\sheet-flow\\SKILL.md".to_string(),
                true,
            )]),
            ..AppSettings::default()
        };

        let saved =
            save_app_settings_to_path(&path, settings.clone()).expect("settings should save");
        let loaded = load_app_settings_from_path(&path).expect("settings should load");

        assert_eq!(saved, settings);
        assert_eq!(loaded, settings);

        let root = path.parent().and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }

    #[test]
    fn settings_file_accepts_utf8_bom() {
        let path = temp_settings_path("utf8-bom");
        fs::create_dir_all(path.parent().expect("path should have parent"))
            .expect("settings directory should be created");
        fs::write(
            &path,
            "\u{feff}{\"language\":\"zh-CN\",\"customScanDirectories\":[],\"showDefaultScanDirectories\":true}",
        )
        .expect("settings should be written");

        let settings = load_app_settings_from_path(&path).expect("bom settings should load");

        assert_eq!(settings.language, Language::ZhCn);

        let root = path.parent().and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }

    #[test]
    fn legacy_settings_file_loads_v3_foundation_defaults() {
        let path = temp_settings_path("legacy-v3-defaults");
        fs::create_dir_all(path.parent().expect("path should have parent"))
            .expect("settings directory should be created");
        fs::write(
            &path,
            "{\"language\":\"en-US\",\"customScanDirectories\":[\"D:/Team/skills\"],\"showDefaultScanDirectories\":false,\"categoryColors\":{},\"categoryLabels\":{},\"skillTags\":{}}",
        )
        .expect("legacy settings should be written");

        let settings = load_app_settings_from_path(&path).expect("legacy settings should load");

        assert_eq!(settings.language, Language::EnUs);
        assert_eq!(settings.custom_scan_directories, vec!["D:/Team/skills"]);
        assert!(settings.skill_favorites.is_empty());
        assert!(settings.skill_usage.is_empty());
        assert!(settings.skill_organization_suggestions.is_empty());
        assert!(settings.skill_health.is_empty());
        assert!(settings.skill_drafts.is_empty());

        let root = path.parent().and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }

    #[test]
    fn saving_settings_creates_parent_directories() {
        let path = temp_settings_path("creates-parent").join("nested").join("settings.json");
        let settings = AppSettings {
            language: Language::ZhCn,
            custom_scan_directories: vec!["/team/skills".to_string()],
            show_default_scan_directories: true,
            ..AppSettings::default()
        };

        save_app_settings_to_path(&path, settings.clone()).expect("settings should save");

        assert!(path.exists());
        assert_eq!(
            load_app_settings_from_path(&path).expect("settings should load"),
            settings
        );

        let root = path
            .parent()
            .and_then(|parent| parent.parent())
            .and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }

    #[test]
    fn locked_settings_write_replaces_file_contents() {
        let path = temp_settings_path("locked-write");
        fs::create_dir_all(path.parent().expect("path should have parent"))
            .expect("settings directory should be created");
        fs::write(&path, "older and longer settings").expect("seed settings should be written");

        write_locked(&path, br#"{"language":"system"}"#).expect("locked write should complete");

        assert_eq!(
            fs::read_to_string(&path).expect("settings should read"),
            r#"{"language":"system"}"#
        );

        let root = path.parent().and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }

    #[test]
    fn invalid_settings_file_reports_parse_error() {
        let path = temp_settings_path("invalid");
        fs::create_dir_all(path.parent().expect("path should have parent"))
            .expect("settings directory should be created");
        fs::write(&path, "{not valid json").expect("invalid settings should be written");

        let error = load_app_settings_from_path(&path).expect_err("invalid json should fail");

        assert!(error.contains("Unable to parse settings"));

        let root = path.parent().and_then(|parent| parent.parent());
        if let Some(root) = root {
            fs::remove_dir_all(root).ok();
        }
    }
}
