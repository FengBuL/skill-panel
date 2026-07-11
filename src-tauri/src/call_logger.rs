// 调用日志 — 从日志文件读取
// 日志存于 ~/.codex/skill-panel/call_logs.jsonl (每行一条 JSON)
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone)]
pub struct CallLog {
    pub time: String,
    pub skill_name: String,
    pub prompt: String,
    pub status: String,
    pub duration_ms: u64,
    pub tokens: u64,
    #[serde(default)]
    pub cost: f64,
}

fn log_path() -> PathBuf {
    let home = std::env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."));
    home.join(".codex/skill-panel/call_logs.jsonl")
}

/// 读取调用日志
pub fn get_logs(range: &str) -> Result<Vec<CallLog>, String> {
    let path = log_path();
    if !path.exists() {
        return Ok(vec![]);
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut logs: Vec<CallLog> = content
        .lines()
        .filter_map(|l| serde_json::from_str::<CallLog>(l).ok())
        .collect();
    // range 简单处理：7d/30d/all
    logs.reverse(); // 最新在前
    if range == "7d" {
        logs.truncate(50);
    } else if range == "30d" {
        logs.truncate(200);
    }
    Ok(logs)
}

/// 追加调用日志（agent 调用时写入）
pub fn append_log(log: &CallLog) -> Result<(), String> {
    let path = log_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let line = serde_json::to_string(log).map_err(|e| e.to_string())? + "\n";
    // 追加模式
    use std::io::Write;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    file.write_all(line.as_bytes()).map_err(|e| e.to_string())
}
