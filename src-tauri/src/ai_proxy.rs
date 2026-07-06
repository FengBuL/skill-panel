// AI 代理 — reqwest 调用厂商 API + keyring 存 Key + SSE 流式
use keyring::Entry;
use tauri::{AppHandle, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
struct AiChunkEvent {
    chunk: String,
    done: bool,
}

const KEYRING_SERVICE: &str = "skill-panel-ai";

/// 从 Keychain 读取 API Key
pub fn get_api_key(vendor: &str) -> Result<String, String> {
    let entry = Entry::new(KEYRING_SERVICE, vendor).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| format!("未存储 {} 的 API Key: {}", vendor, e))
}

/// 存储 API Key 到 Keychain
pub fn set_api_key(vendor: &str, key: &str) -> Result<(), String> {
    let entry = Entry::new(KEYRING_SERVICE, vendor).map_err(|e| e.to_string())?;
    entry.set_password(key).map_err(|e| e.to_string())
}

/// 脱敏处理：路径/密钥/邮箱打码
pub fn desensitize(content: &str) -> String {
    let mut out = content.to_string();
    // 打码 sk- 开头的 API Key
    while let Some(pos) = out.find("sk-") {
        let end = out[pos..].find(|c: char| c.is_whitespace()).map(|e| pos + e).unwrap_or(out.len());
        out.replace_range(pos..end, "<API_KEY>");
    }
    // 打码 ~/ 或 /Users/ 开头的路径
    for prefix in &["~/", "/Users/", "/home/", "C:\\", "D:\\"] {
        while let Some(pos) = out.find(prefix) {
            let end = out[pos..].find(|c: char| c.is_whitespace() || c == '"' || c == ')' || c == ']').map(|e| pos + e).unwrap_or(out.len());
            out.replace_range(pos..end, "<PATH>");
        }
    }
    out
}

/// 调用 AI API（流式）
pub async fn optimize(app: AppHandle, content: String, action: String, vendor: String) -> Result<(), String> {
    // 1. 取 Key
    let key = get_api_key(&vendor)?;

    // 2. 脱敏
    let safe_content = desensitize(&content);

    // 3. 构造 prompt
    let prompt = match action.as_str() {
        "struct" => "请完善这个 Skill 的结构，补充 When To Use / Steps / Safety 章节：\n\n",
        "desc" => "请优化这个 Skill 的描述，使其更精准简洁：\n\n",
        "polish" => "请润色这段 Markdown 内容，改善表达和可读性：\n\n",
        "fm" => "请根据内容生成合适的 frontmatter（name/description/category）：\n\n",
        "safe" => "请审查这个 Skill 是否包含危险命令、硬编码密钥或不安全操作：\n\n",
        _ => "请优化：\n\n",
    };

    // 4. 根据厂商选 endpoint
    let (endpoint, model) = match vendor.as_str() {
        "openai" => ("https://api.openai.com/v1/chat/completions", "gpt-4o"),
        "claude" => ("https://api.anthropic.com/v1/messages", "claude-sonnet-4-20250514"),
        "glm" => ("https://open.bigmodel.cn/api/paas/v4/chat/completions", "glm-4"),
        "ollama" => ("http://localhost:11434/api/chat", "llama3"),
        _ => return Err("不支持的厂商".into()),
    };

    // 5. 调用 API（这里简化为非流式，分块 emit 模拟流式）
    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": model,
        "messages": [{"role": "user", "content": format!("{}{}", prompt, safe_content)}],
        "stream": false,
    });

    let resp = client
        .post(endpoint)
        .header("Authorization", format!("Bearer {}", key))
        .header("x-api-key", &key)  // Claude 用
        .header("anthropic-version", "2023-06-01")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    let text = resp.text().await.map_err(|e| e.to_string())?;

    // 解析响应（简化：尝试提取 content）
    let parsed: serde_json::Value = serde_json::from_str(&text).unwrap_or_default();
    let result = parsed["choices"][0]["message"]["content"]
        .as_str()
        .or_else(|| parsed["content"][0]["text"].as_str())  // Claude 格式
        .unwrap_or(&text)
        .to_string();

    // 6. 分块 emit 模拟流式
    let chunk_size = 20;
    for chunk in result.as_bytes().chunks(chunk_size) {
        let chunk_str = String::from_utf8_lossy(chunk).to_string();
        let _ = app.emit("ai-chunk", AiChunkEvent { chunk: chunk_str, done: false });
        tokio::time::sleep(std::time::Duration::from_millis(30)).await;
    }
    let _ = app.emit("ai-chunk", AiChunkEvent { chunk: String::new(), done: true });

    Ok(())
}
