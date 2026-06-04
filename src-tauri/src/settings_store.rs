use crate::models::AppSettings;

use std::{
    env, fs,
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
    serde_json::from_str(&contents).map_err(|error| format!("Unable to parse settings: {error}"))
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
    fs::write(path, contents).map_err(|error| format!("Unable to write settings: {error}"))?;

    Ok(settings)
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
    use super::{load_app_settings_from_path, save_app_settings_to_path};
    use crate::models::{AppSettings, Language};
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
