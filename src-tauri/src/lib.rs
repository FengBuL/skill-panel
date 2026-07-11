pub mod ai_proxy;
pub mod call_logger;
pub mod commands;
pub mod dep_analyzer;
pub mod models;
pub mod settings_store;
pub mod skill_scanner;
pub mod skill_store;
pub mod version_store;
pub mod watcher;

use commands::{
    ai_cancel, ai_optimize, analyze_deps, app_version, append_audit_log, clone_skill, create_skill,
    default_scan_path_groups, delete_skill, get_ai_key, get_call_logs, get_version_history,
    load_app_settings, open_skill_folder, read_skill, read_skill_files, restore_version,
    save_app_settings, scan_skills, set_ai_key, toggle_skill_enabled, update_skill, validate_skill,
    watch_scan_dirs, write_skill_file,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            app_version,
            scan_skills,
            default_scan_path_groups,
            read_skill,
            create_skill,
            update_skill,
            delete_skill,
            open_skill_folder,
            append_audit_log,
            load_app_settings,
            save_app_settings,
            clone_skill,
            toggle_skill_enabled,
            validate_skill,
            read_skill_files,
            write_skill_file,
            get_version_history,
            restore_version,
            get_call_logs,
            analyze_deps,
            ai_optimize,
            watch_scan_dirs,
            set_ai_key,
            ai_cancel,
            get_ai_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running Skill Panel");
}
