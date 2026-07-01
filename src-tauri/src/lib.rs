pub mod commands;
pub mod models;
pub mod settings_store;
pub mod skill_scanner;
pub mod skill_store;

use commands::{
    app_version, create_skill, default_scan_path_groups, delete_skill, load_app_settings,
    open_skill_folder, read_skill, save_app_settings, scan_skills, update_skill,
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
            load_app_settings,
            save_app_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running Skill Panel");
}
