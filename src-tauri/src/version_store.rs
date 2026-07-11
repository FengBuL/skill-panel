// 版本历史 — 本地快照实现
// 保存时复制到 ~/.codex/skill-panel/versions/{skill_name}/{timestamp}/
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Clone)]
pub struct VersionEntry {
    pub id: String,
    pub time: String,
    pub note: String,
    pub diff_lines: i64,
    pub source: String,
}

fn versions_base() -> PathBuf {
    let home = dirs_home();
    home.join(".codex/skill-panel/versions")
}

fn dirs_home() -> PathBuf {
    std::env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn skill_name_from_path(path: &str) -> String {
    Path::new(path)
        .parent()
        .and_then(|p| p.file_name())
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".into())
}

/// 创建快照（保存时调用）
pub fn create_snapshot(path: &str, note: &str, source: &str) -> Result<VersionEntry, String> {
    let name = skill_name_from_path(path);
    let ts = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let dir = versions_base().join(&name).join(&ts);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    fs::write(dir.join("SKILL.md"), &content).map_err(|e| e.to_string())?;
    fs::write(
        dir.join("meta.json"),
        serde_json::json!({"note": note, "source": source, "time": ts}).to_string(),
    )
    .map_err(|e| e.to_string())?;
    Ok(VersionEntry {
        id: ts,
        time: Utc::now().format("%Y-%m-%d %H:%M").to_string(),
        note: note.into(),
        diff_lines: 0,
        source: source.into(),
    })
}

/// 列出版本历史
pub fn list_versions(path: &str) -> Result<Vec<VersionEntry>, String> {
    let name = skill_name_from_path(path);
    let dir = versions_base().join(&name);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut entries = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let id = entry.file_name().to_string_lossy().to_string();
        let meta_path = entry.path().join("meta.json");
        let (note, source) = if let Ok(meta) = fs::read_to_string(&meta_path) {
            let v: serde_json::Value = serde_json::from_str(&meta).unwrap_or_default();
            (
                v["note"].as_str().unwrap_or("").to_string(),
                v["source"].as_str().unwrap_or("manual").to_string(),
            )
        } else {
            (String::new(), "manual".into())
        };
        entries.push(VersionEntry {
            time: id.replace('_', " "),
            id,
            note,
            diff_lines: 0,
            source,
        });
    }
    entries.sort_by(|a, b| b.id.cmp(&a.id));
    Ok(entries)
}

/// 从快照恢复
pub fn restore(path: &str, version_id: &str) -> Result<(), String> {
    let name = skill_name_from_path(path);
    let snapshot = versions_base()
        .join(&name)
        .join(version_id)
        .join("SKILL.md");
    let content = fs::read_to_string(&snapshot).map_err(|e| format!("快照不存在: {}", e))?;
    fs::write(path, content).map_err(|e| e.to_string())
}
