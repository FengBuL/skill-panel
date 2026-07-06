// 依赖解析 — 扫描 Skill 内容中的引用
// 简单策略：匹配 "depends on X" / "requires X" / "@skill/X" 等模式
use serde_json::json;
use std::fs;

/// 分析单个 Skill 的依赖
pub fn analyze(path: &str) -> Result<serde_json::Value, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut depends_on: Vec<String> = Vec::new();

    // 匹配 "depends on X" / "requires X" / "@skill/X"
    for line in content.lines() {
        let l = line.to_lowercase();
        if l.contains("depends on") || l.contains("requires") {
            // 提取后面的 skill 名（简单：取该行剩余部分清理）
            let parts: Vec<&str> = line.splitn(2, |c: char| {
                c == ':' || c == '-' || c == '—'
            }).collect();
            if parts.len() > 1 {
                let name = parts[1].trim().trim_matches(|c: char| !c.is_alphanumeric() && c != '-' && c != '_');
                if !name.is_empty() && name.len() < 60 {
                    depends_on.push(name.to_string());
                }
            }
        }
        // @skill/ 引用
        if line.contains("@skill/") {
            if let Some(name) = line.split("@skill/").nth(1).and_then(|s| s.split(|c: char| c.is_whitespace() || c == ')').next()) {
                depends_on.push(name.trim().to_string());
            }
        }
    }
    depends_on.dedup();

    Ok(json!({ "dependsOn": depends_on, "dependedBy": [] }))
}

/// 扫描全部 Skill，反向构建 dependedBy
pub fn analyze_all(skills: &[(String, String)]) -> Result<serde_json::Value, String> {
    // skills: Vec<(name, content)>
    let mut deps: std::collections::HashMap<String, Vec<String>> = std::collections::HashMap::new();
    let mut reverse: std::collections::HashMap<String, Vec<String>> = std::collections::HashMap::new();

    for (name, content) in skills {
        let mut found = Vec::new();
        for line in content.lines() {
            if line.to_lowercase().contains("depends on") || line.contains("@skill/") {
                if let Some(dep) = line.split("@skill/").nth(1).and_then(|s| s.split_whitespace().next()) {
                    found.push(dep.trim().to_string());
                }
            }
        }
        for d in &found {
            reverse.entry(d.clone()).or_default().push(name.clone());
        }
        deps.insert(name.clone(), found);
    }

    let deps_json: serde_json::Map<String, serde_json::Value> = deps.into_iter()
        .map(|(k, v)| (k, json!(v))).collect();
    let reverse_json: serde_json::Map<String, serde_json::Value> = reverse.into_iter()
        .map(|(k, v)| (k, json!(v))).collect();

    Ok(json!({ "deps": deps_json, "reverse": reverse_json }))
}
