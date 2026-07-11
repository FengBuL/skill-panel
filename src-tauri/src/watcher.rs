// 文件监听 — notify crate 监听扫描目录变化
use notify::{EventKind, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};

static WATCHER: Mutex<Option<notify::RecommendedWatcher>> = Mutex::new(None);

/// 启动文件监听
pub fn start_watch(app: AppHandle, dirs: Vec<String>) -> Result<(), String> {
    let mut guard = WATCHER.lock().map_err(|e| e.to_string())?;
    // 停止旧 watcher
    *guard = None;

    let app_clone = app.clone();
    let mut watcher = notify::recommended_watcher(move |res: Result<notify::Event, _>| {
        if let Ok(event) = res {
            match event.kind {
                EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_) => {
                    // 文件变化 → 通知前端重新扫描
                    let _ = app_clone.emit("scan-changed", &event.paths);
                }
                _ => {}
            }
        }
    })
    .map_err(|e| e.to_string())?;

    for dir in &dirs {
        let p = Path::new(dir);
        if p.exists() {
            watcher
                .watch(p, RecursiveMode::Recursive)
                .map_err(|e| format!("监听 {} 失败: {}", dir, e))?;
        }
    }

    *guard = Some(watcher);
    Ok(())
}

/// 停止监听
pub fn stop_watch() -> Result<(), String> {
    let mut guard = WATCHER.lock().map_err(|e| e.to_string())?;
    *guard = None;
    Ok(())
}
