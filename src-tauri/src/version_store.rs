// 版本历史 — 本地快照实现
// 保存时复制到 ~/.codex/skill-panel/versions/{normalized_path_sha256}/{timestamp}/
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
#[cfg(test)]
use std::sync::{Mutex, OnceLock};

const MAX_SNAPSHOTS_PER_SKILL: usize = 20;
const MAX_SNAPSHOT_AGE_DAYS: i64 = 30;

#[derive(Serialize, Deserialize, Clone)]
pub struct VersionEntry {
    pub id: String,
    pub time: String,
    pub note: String,
    pub diff_lines: i64,
    pub source: String,
}

fn versions_base() -> PathBuf {
    #[cfg(test)]
    if let Some(base) = test_versions_base() {
        return base;
    }
    let home = dirs_home();
    home.join(".codex/skill-panel/versions")
}

#[cfg(test)]
fn test_versions_base() -> Option<PathBuf> {
    TEST_VERSIONS_BASE
        .get_or_init(|| Mutex::new(None))
        .lock()
        .ok()
        .and_then(|base| base.clone())
}

#[cfg(test)]
static TEST_VERSIONS_BASE: OnceLock<Mutex<Option<PathBuf>>> = OnceLock::new();

#[cfg(test)]
pub(crate) fn version_test_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}

fn dirs_home() -> PathBuf {
    std::env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn canonical_skill_path(path: &str) -> Result<PathBuf, String> {
    Path::new(path)
        .canonicalize()
        .map_err(|error| format!("Unable to resolve skill path for version history: {error}"))
}

fn path_identity(path: &str) -> Result<(String, String), String> {
    let canonical = canonical_skill_path(path)?;
    let normalized = canonical.to_string_lossy().to_string();
    let mut hasher = Sha256::new();
    hasher.update(normalized.as_bytes());
    Ok((hex::encode(hasher.finalize()), normalized))
}

fn unique_snapshot_dir(skill_dir: &Path, timestamp: &str) -> PathBuf {
    let mut dir = skill_dir.join(timestamp);
    let mut suffix = 1usize;
    while dir.exists() {
        dir = skill_dir.join(format!("{timestamp}-{suffix}"));
        suffix += 1;
    }
    dir
}

/// 创建快照（保存时调用）
pub fn create_snapshot(path: &str, note: &str, source: &str) -> Result<VersionEntry, String> {
    let (path_id, normalized_path) = path_identity(path)?;
    let now = Utc::now();
    let ts = now.format("%Y%m%d_%H%M%S_%6f").to_string();
    let skill_dir = versions_base().join(&path_id);
    let dir = unique_snapshot_dir(&skill_dir, &ts);
    let id = dir
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(&ts)
        .to_string();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    fs::write(dir.join("SKILL.md"), &content).map_err(|e| e.to_string())?;
    fs::write(
        dir.join("meta.json"),
        serde_json::json!({
            "note": note,
            "source": source,
            "time": now.format("%Y-%m-%d %H:%M").to_string(),
            "createdAt": now.to_rfc3339(),
            "normalizedPath": normalized_path,
            "pathId": path_id,
        })
        .to_string(),
    )
    .map_err(|e| e.to_string())?;
    prune_snapshots(&skill_dir)?;
    Ok(VersionEntry {
        id,
        time: now.format("%Y-%m-%d %H:%M").to_string(),
        note: note.into(),
        diff_lines: 0,
        source: source.into(),
    })
}

/// 列出版本历史
pub fn list_versions(path: &str) -> Result<Vec<VersionEntry>, String> {
    let (path_id, _) = path_identity(path)?;
    let dir = versions_base().join(&path_id);
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut entries = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let id = entry.file_name().to_string_lossy().to_string();
        let meta_path = entry.path().join("meta.json");
        let (note, source, time) = if let Ok(meta) = fs::read_to_string(&meta_path) {
            let v: serde_json::Value = serde_json::from_str(&meta).unwrap_or_default();
            (
                v["note"].as_str().unwrap_or("").to_string(),
                v["source"].as_str().unwrap_or("manual").to_string(),
                v["time"].as_str().unwrap_or(&id.replace('_', " ")).to_string(),
            )
        } else {
            (String::new(), "manual".into(), id.replace('_', " "))
        };
        entries.push(VersionEntry {
            time,
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
    let (path_id, _) = path_identity(path)?;
    let snapshot = versions_base()
        .join(&path_id)
        .join(version_id)
        .join("SKILL.md");
    let content = fs::read_to_string(&snapshot).map_err(|e| format!("快照不存在: {}", e))?;
    create_snapshot(path, "Before restore", "restore")?;
    write_restored_file(Path::new(path), content.as_bytes())
}

fn write_restored_file(path: &Path, content: &[u8]) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "Skill file must have a parent directory".to_string())?;
    let temp = parent.join(format!(
        ".skillpanel-restore-{}.tmp",
        Utc::now().format("%Y%m%d_%H%M%S_%6f")
    ));
    fs::write(&temp, content).map_err(|error| format!("Unable to write restore temp file: {error}"))?;
    fs::rename(&temp, path).map_err(|error| {
        let _ = fs::remove_file(&temp);
        format!("Unable to replace skill file from restore: {error}")
    })
}

fn prune_snapshots(skill_dir: &Path) -> Result<(), String> {
    if !skill_dir.exists() {
        return Ok(());
    }
    let cutoff = Utc::now() - Duration::days(MAX_SNAPSHOT_AGE_DAYS);
    let mut entries = fs::read_dir(skill_dir)
        .map_err(|error| format!("Unable to read version directory: {error}"))?
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_dir())
        .map(|entry| {
            let id = entry.file_name().to_string_lossy().to_string();
            let created_at = read_created_at(&entry.path()).or_else(|| id_timestamp(&id));
            (entry.path(), id, created_at)
        })
        .collect::<Vec<_>>();

    entries.sort_by(|a, b| b.1.cmp(&a.1));

    for (index, (path, _, created_at)) in entries.into_iter().enumerate() {
        let too_many = index >= MAX_SNAPSHOTS_PER_SKILL;
        let too_old = created_at.map(|time| time < cutoff).unwrap_or(false);
        if too_many || too_old {
            fs::remove_dir_all(&path)
                .map_err(|error| format!("Unable to prune old version snapshot: {error}"))?;
        }
    }
    Ok(())
}

fn read_created_at(path: &Path) -> Option<DateTime<Utc>> {
    let meta = fs::read_to_string(path.join("meta.json")).ok()?;
    let value: serde_json::Value = serde_json::from_str(&meta).ok()?;
    DateTime::parse_from_rfc3339(value["createdAt"].as_str()?)
        .ok()
        .map(|time| time.with_timezone(&Utc))
}

fn id_timestamp(id: &str) -> Option<DateTime<Utc>> {
    NaiveDateTime::parse_from_str(id, "%Y%m%d_%H%M%S_%6f")
        .ok()
        .map(|time| time.and_utc())
}

#[cfg(test)]
mod tests {
    use super::{create_snapshot, list_versions, restore, TEST_VERSIONS_BASE};
    use std::{
        env, fs,
        path::{Path, PathBuf},
        sync::{Mutex, MutexGuard},
        time::{SystemTime, UNIX_EPOCH},
    };

    struct VersionBaseGuard {
        _lock: MutexGuard<'static, ()>,
        base: PathBuf,
    }

    impl VersionBaseGuard {
        fn set(test_name: &str) -> Self {
            let lock = super::version_test_lock()
                .lock()
                .expect("version base lock should be available");
            let base = temp_root(test_name).join("versions");
            *TEST_VERSIONS_BASE
                .get_or_init(|| Mutex::new(None))
                .lock()
                .expect("test version base should be available") = Some(base.clone());
            Self { _lock: lock, base }
        }
    }

    impl Drop for VersionBaseGuard {
        fn drop(&mut self) {
            *TEST_VERSIONS_BASE
                .get_or_init(|| Mutex::new(None))
                .lock()
                .expect("test version base should be available") = None;
            fs::remove_dir_all(
                self.base
                    .parent()
                    .expect("test version base should have parent"),
            )
            .ok();
        }
    }

    fn temp_root(test_name: &str) -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock should be available")
            .as_nanos();
        let path = env::temp_dir().join(format!("skill-panel-version-{test_name}-{suffix}"));
        fs::create_dir_all(&path).expect("temp root should be created");
        path
    }

    fn write_skill(path: &Path, name: &str, body: &str) {
        fs::create_dir_all(path.parent().expect("skill path should have parent"))
            .expect("skill dir should be created");
        fs::write(
            path,
            format!("---\nname: {name}\ndescription: Test skill\n---\n{body}\n"),
        )
        .expect("skill should be written");
    }

    #[test]
    fn version_history_is_isolated_by_canonical_full_path() {
        let _version_base = VersionBaseGuard::set("isolated-home");
        let root = temp_root("isolated-root");
        let first = root.join("one").join("same").join("SKILL.md");
        let second = root.join("two").join("same").join("SKILL.md");
        write_skill(&first, "Same", "# First");
        write_skill(&second, "Same", "# Second");

        create_snapshot(&first.to_string_lossy(), "First path", "manual")
            .expect("first snapshot should be created");
        create_snapshot(&second.to_string_lossy(), "Second path", "manual")
            .expect("second snapshot should be created");

        let first_versions =
            list_versions(&first.to_string_lossy()).expect("first versions should load");
        let second_versions =
            list_versions(&second.to_string_lossy()).expect("second versions should load");

        assert_eq!(first_versions.len(), 1);
        assert_eq!(first_versions[0].note, "First path");
        assert_eq!(second_versions.len(), 1);
        assert_eq!(second_versions[0].note, "Second path");

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn snapshot_retention_keeps_only_twenty_newest_versions() {
        let _version_base = VersionBaseGuard::set("retention-home");
        let root = temp_root("retention-root");
        let skill = root.join("retained").join("SKILL.md");
        write_skill(&skill, "Retained", "# Initial");

        for index in 0..21 {
            fs::write(
                &skill,
                format!("---\nname: Retained\ndescription: Test skill\n---\n# Version {index}\n"),
            )
            .expect("skill version should be written");
            create_snapshot(&skill.to_string_lossy(), &format!("snapshot {index}"), "manual")
                .expect("snapshot should be created");
        }

        let versions = list_versions(&skill.to_string_lossy()).expect("versions should load");
        assert_eq!(versions.len(), 20);
        assert_eq!(versions[0].note, "snapshot 20");
        assert!(!versions.iter().any(|version| version.note == "snapshot 0"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn restore_creates_current_snapshot_before_overwriting() {
        let _version_base = VersionBaseGuard::set("restore-home");
        let root = temp_root("restore-root");
        let skill = root.join("restore").join("SKILL.md");
        write_skill(&skill, "Restore", "# Original");
        let target = create_snapshot(&skill.to_string_lossy(), "Original snapshot", "manual")
            .expect("target snapshot should be created");
        fs::write(
            &skill,
            "---\nname: Restore\ndescription: Test skill\n---\n# Current\n",
        )
        .expect("current skill should be written");

        restore(&skill.to_string_lossy(), &target.id).expect("restore should complete");

        let restored = fs::read_to_string(&skill).expect("restored skill should read");
        assert!(restored.contains("# Original"));
        let versions = list_versions(&skill.to_string_lossy()).expect("versions should load");
        assert!(versions
            .iter()
            .any(|version| version.note == "Before restore" && version.source == "restore"));

        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn failed_restore_keeps_the_current_file_unchanged() {
        let _version_base = VersionBaseGuard::set("restore-fail-home");
        let root = temp_root("restore-fail-root");
        let skill = root.join("restore-fail").join("SKILL.md");
        write_skill(&skill, "Restore Fail", "# Current");

        let error = restore(&skill.to_string_lossy(), "missing-version")
            .expect_err("missing snapshot should fail");

        assert!(error.contains("快照不存在") || error.contains("snapshot"));
        let current = fs::read_to_string(&skill).expect("current skill should read");
        assert!(current.contains("# Current"));

        fs::remove_dir_all(root).ok();
    }
}
