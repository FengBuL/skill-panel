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

impl CallLog {
    fn redacted(&self) -> Self {
        Self {
            time: crate::redaction::redact_text(&self.time),
            skill_name: crate::redaction::redact_text(&self.skill_name),
            prompt: crate::redaction::preview_text(&crate::redaction::redact_text(&self.prompt)),
            status: crate::redaction::redact_text(&self.status),
            duration_ms: self.duration_ms,
            tokens: self.tokens,
            cost: self.cost,
        }
    }
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
        .map(|log| log.redacted())
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
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(parent, fs::Permissions::from_mode(0o700)).ok();
        }
    }
    let safe_log = log.redacted();
    let line = serde_json::to_string(&safe_log).map_err(|e| e.to_string())? + "\n";
    // 追加模式
    use std::io::Write;
    let mut options = std::fs::OpenOptions::new();
    options.create(true).append(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options
        .open(&path)
        .map_err(|e| crate::redaction::redact_text(&e.to_string()))?;
    file.write_all(line.as_bytes()).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::{append_log, get_logs, log_path, CallLog};
    use std::{
        env, fs,
        path::{Path, PathBuf},
        sync::{Mutex, MutexGuard},
        time::{SystemTime, UNIX_EPOCH},
    };

    fn home_env_lock() -> &'static Mutex<()> {
        crate::version_store::version_test_lock()
    }

    fn lock_home_env() -> MutexGuard<'static, ()> {
        home_env_lock()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    struct HomeGuard {
        old_home: Option<String>,
    }

    impl HomeGuard {
        fn set(path: &Path) -> Self {
            let old_home = env::var("HOME").ok();
            env::set_var("HOME", path);
            Self { old_home }
        }
    }

    impl Drop for HomeGuard {
        fn drop(&mut self) {
            if let Some(home) = &self.old_home {
                env::set_var("HOME", home);
            } else {
                env::remove_var("HOME");
            }
        }
    }

    fn temp_home(name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should work")
            .as_nanos();
        let path = env::temp_dir().join(format!("skill-call-log-{name}-{suffix}"));
        fs::create_dir_all(&path).expect("temp home should be created");
        path
    }

    #[test]
    fn append_and_read_logs_redact_sensitive_fields_without_touching_real_home() {
        let _lock = lock_home_env();
        let home = temp_home("redact");
        let _guard = HomeGuard::set(&home);
        let log = CallLog {
            time: "2026-07-16T00:00:00Z".to_string(),
            skill_name: "/Users/alice/.codex/skills/demo".to_string(),
            prompt: "Authorization: Bearer secret-token for owner@example.com using sk-test-secret"
                .to_string(),
            status: "ok".to_string(),
            duration_ms: 10,
            tokens: 3,
            cost: 0.1,
        };

        append_log(&log).expect("log should append");
        let raw = fs::read_to_string(log_path()).expect("log file should exist");
        let logs = get_logs("all").expect("logs should load");

        assert!(raw.contains("<API_KEY>"));
        assert!(raw.contains("<TOKEN>"));
        assert!(raw.contains("<EMAIL>"));
        assert!(raw.contains("<PATH>"));
        assert!(!raw.contains("sk-test-secret"));
        assert!(!raw.contains("secret-token"));
        assert!(!raw.contains("owner@example.com"));
        assert!(!raw.contains("/Users/alice"));
        assert_eq!(
            logs[0].prompt,
            "Authorization: <TOKEN> for <EMAIL> using <API_KEY>"
        );

        fs::remove_dir_all(home).ok();
    }

    #[test]
    fn get_logs_redacts_legacy_lines_and_ignores_broken_lines_without_leaking_them() {
        let _lock = lock_home_env();
        let home = temp_home("legacy");
        let _guard = HomeGuard::set(&home);
        let path = log_path();
        fs::create_dir_all(path.parent().expect("log parent should exist")).unwrap();
        fs::write(
            &path,
            concat!(
                "{\"time\":\"now\",\"skill_name\":\"/home/alice/demo\",\"prompt\":\"email owner@example.com token=secret-value\",\"status\":\"ok\",\"duration_ms\":1,\"tokens\":2}\n",
                "broken line with sk-test-secret and /Users/alice/private\n"
            ),
        )
        .expect("legacy log should be written");

        let logs = get_logs("all").expect("legacy logs should load");

        assert_eq!(logs.len(), 1);
        assert_eq!(logs[0].skill_name, "<PATH>");
        assert_eq!(logs[0].prompt, "email <EMAIL> token=<TOKEN>");

        fs::remove_dir_all(home).ok();
    }
}
