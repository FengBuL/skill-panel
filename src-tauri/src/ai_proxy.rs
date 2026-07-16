// AI 代理 — reqwest 调用厂商 API + keyring 存 Key + 流式 emit + usage/cost 解析
#[cfg(not(test))]
use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Deserialize, Clone)]
struct AiChunkEvent {
    chunk: String,
    done: bool,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct AiUsage {
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
}

#[derive(Serialize, Deserialize, Clone)]
struct AiDoneEvent {
    content: String,
    usage: AiUsage,
    cost_cny: f64,
}

#[derive(Serialize, Deserialize, Clone)]
struct AiErrorEvent {
    message: String,
}

#[cfg(not(test))]
const KEYRING_SERVICE: &str = "skill-panel-ai";

static CANCEL_FLAG: AtomicBool = AtomicBool::new(false);

#[cfg(test)]
fn mock_keyring() -> &'static std::sync::Mutex<std::collections::HashMap<String, String>> {
    static MOCK: std::sync::OnceLock<std::sync::Mutex<std::collections::HashMap<String, String>>> =
        std::sync::OnceLock::new();
    MOCK.get_or_init(|| std::sync::Mutex::new(std::collections::HashMap::new()))
}

fn is_allowed_vendor(vendor: &str) -> bool {
    matches!(vendor, "openai" | "claude" | "glm" | "ollama")
}

fn validate_vendor(vendor: &str) -> Result<(), String> {
    if is_allowed_vendor(vendor) {
        Ok(())
    } else {
        Err("不支持的厂商".to_string())
    }
}

/// 取消正在进行的 AI 调用
pub fn cancel() {
    CANCEL_FLAG.store(true, Ordering::SeqCst);
}

/// 从 Keychain 读取 API Key
pub fn get_api_key(vendor: &str) -> Result<String, String> {
    validate_vendor(vendor)?;
    #[cfg(test)]
    {
        if let Some(key) = mock_keyring()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .get(vendor)
            .cloned()
        {
            return Ok(key);
        }
        return Err(format!("未配置 {} 的 API Key", vendor));
    }
    #[cfg(not(test))]
    let entry = Entry::new(KEYRING_SERVICE, vendor)
        .map_err(|_| format!("无法访问 {} 的 Keychain 项", vendor))?;
    #[cfg(not(test))]
    entry
        .get_password()
        .map_err(|_| format!("未配置 {} 的 API Key", vendor))
}

/// 检查是否已存储 API Key（不返回 Key 本身）
pub fn has_api_key(vendor: &str) -> bool {
    if validate_vendor(vendor).is_err() {
        return false;
    }
    if vendor == "ollama" {
        return true;
    }
    #[cfg(test)]
    {
        return mock_keyring()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .contains_key(vendor);
    }
    #[cfg(not(test))]
    Entry::new(KEYRING_SERVICE, vendor)
        .and_then(|entry| entry.get_password())
        .is_ok()
}

/// 存储 API Key 到 Keychain
pub fn set_api_key(vendor: &str, key: &str) -> Result<(), String> {
    validate_vendor(vendor)?;
    if vendor == "ollama" {
        return Ok(());
    }
    #[cfg(test)]
    {
        mock_keyring()
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .insert(vendor.to_string(), key.to_string());
        return Ok(());
    }
    #[cfg(not(test))]
    let entry = Entry::new(KEYRING_SERVICE, vendor)
        .map_err(|_| format!("无法访问 {} 的 Keychain 项", vendor))?;
    #[cfg(not(test))]
    entry
        .set_password(key)
        .map_err(|_| format!("无法保存 {} 的 API Key", vendor))
}

/// 脱敏处理：路径/密钥/邮箱打码
pub fn desensitize(content: &str) -> String {
    crate::redaction::redact_text(content)
}

/// 按 model 单价表计算费用（CNY per 1M tokens）
/// 返回 (input_price, output_price) per 1M tokens
fn model_pricing(vendor: &str) -> (f64, f64) {
    match vendor {
        "openai" => (18.0, 72.0),
        "claude" => (22.0, 108.0),
        "glm" => (0.1, 0.1),
        "ollama" => (0.0, 0.0),
        _ => (0.0, 0.0),
    }
}

/// 计算费用（CNY）
fn calculate_cost(vendor: &str, usage: &AiUsage) -> f64 {
    let (in_price, out_price) = model_pricing(vendor);
    (usage.prompt_tokens as f64 * in_price + usage.completion_tokens as f64 * out_price)
        / 1_000_000.0
}

/// 从各厂商响应中解析 usage
fn parse_usage(vendor: &str, parsed: &serde_json::Value) -> AiUsage {
    match vendor {
        "openai" | "glm" => {
            let prompt = parsed["usage"]["prompt_tokens"].as_u64().unwrap_or(0);
            let completion = parsed["usage"]["completion_tokens"].as_u64().unwrap_or(0);
            AiUsage {
                prompt_tokens: prompt,
                completion_tokens: completion,
            }
        }
        "claude" => {
            let prompt = parsed["usage"]["input_tokens"].as_u64().unwrap_or(0);
            let completion = parsed["usage"]["output_tokens"].as_u64().unwrap_or(0);
            AiUsage {
                prompt_tokens: prompt,
                completion_tokens: completion,
            }
        }
        "ollama" => {
            let prompt = parsed["prompt_eval_count"].as_u64().unwrap_or(0);
            let completion = parsed["eval_count"].as_u64().unwrap_or(0);
            AiUsage {
                prompt_tokens: prompt,
                completion_tokens: completion,
            }
        }
        _ => AiUsage::default(),
    }
}

/// 从各厂商响应中提取 content
fn extract_content(vendor: &str, parsed: &serde_json::Value, raw: &str) -> String {
    match vendor {
        "openai" | "glm" => parsed["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string(),
        "claude" => parsed["content"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string(),
        "ollama" => parsed["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string(),
        _ => raw.to_string(),
    }
}

/// 调用 AI API（流式 emit + usage/cost 解析）
pub async fn optimize(
    app: AppHandle,
    content: String,
    action: String,
    vendor: String,
    desensitize_flag: bool,
    send_confirmed: bool,
    raw_content_confirmed: bool,
    preview: String,
) -> Result<(), String> {
    CANCEL_FLAG.store(false, Ordering::SeqCst);

    validate_vendor(&vendor)?;
    if !send_confirmed {
        let msg = "AI 发送前需要确认".to_string();
        let _ = app.emit(
            "ai-error",
            AiErrorEvent {
                message: msg.clone(),
            },
        );
        return Err(msg);
    }
    if !desensitize_flag && !raw_content_confirmed {
        let msg = "关闭脱敏需要本次风险确认".to_string();
        let _ = app.emit(
            "ai-error",
            AiErrorEvent {
                message: msg.clone(),
            },
        );
        return Err(msg);
    }

    let safe_content = if desensitize_flag {
        desensitize(&content)
    } else {
        content.clone()
    };
    let expected_preview = crate::redaction::preview_text(&safe_content);
    if preview != expected_preview {
        let msg = "AI 发送预览与后端计算内容不一致".to_string();
        let _ = app.emit(
            "ai-error",
            AiErrorEvent {
                message: msg.clone(),
            },
        );
        return Err(msg);
    }

    let key = if vendor == "ollama" {
        String::new()
    } else {
        get_api_key(&vendor)?
    };

    let prompt = match action.as_str() {
        "struct" => "请完善这个 Skill 的结构，补充 When To Use / Steps / Safety 章节：\n\n",
        "desc" => "请优化这个 Skill 的描述，使其更精准简洁：\n\n",
        "polish" => "请润色这段 Markdown 内容，改善表达和可读性：\n\n",
        "fm" => "请根据内容生成合适的 frontmatter（name/description/category）：\n\n",
        "safe" => "请审查这个 Skill 是否包含危险命令、硬编码密钥或不安全操作：\n\n",
        _ => "请优化：\n\n",
    };

    let (endpoint, model) = match vendor.as_str() {
        "openai" => ("https://api.openai.com/v1/chat/completions", "gpt-4o"),
        "claude" => (
            "https://api.anthropic.com/v1/messages",
            "claude-sonnet-4-20250514",
        ),
        "glm" => (
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            "glm-4",
        ),
        "ollama" => ("http://localhost:11434/api/chat", "llama3"),
        _ => return Err("不支持的厂商".into()),
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {}", e))?;

    let body = if vendor == "claude" {
        serde_json::json!({
            "model": model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": format!("{}{}", prompt, safe_content)}],
            "stream": false,
        })
    } else {
        serde_json::json!({
            "model": model,
            "messages": [{"role": "user", "content": format!("{}{}", prompt, safe_content)}],
            "stream": false,
        })
    };

    let mut req = client
        .post(endpoint)
        .header("Content-Type", "application/json");

    if vendor == "claude" {
        req = req
            .header("x-api-key", &key)
            .header("anthropic-version", "2023-06-01");
    } else if vendor == "ollama" {
        // Ollama 不需要 Authorization header
    } else {
        req = req.header("Authorization", format!("Bearer {}", key));
    }

    let resp = match req.json(&body).send().await {
        Ok(r) => r,
        Err(e) => {
            let msg = desensitize(&format!("请求失败: {}", e));
            let _ = app.emit(
                "ai-error",
                AiErrorEvent {
                    message: msg.clone(),
                },
            );
            return Err(msg);
        }
    };

    let status = resp.status();
    let text = resp
        .text()
        .await
        .map_err(|e| desensitize(&format!("读取响应失败: {}", e)))?;

    if !status.is_success() {
        let snippet: String = text.chars().take(200).collect();
        let msg = desensitize(&format!("API 返回错误 {}: {}", status, snippet));
        let _ = app.emit(
            "ai-error",
            AiErrorEvent {
                message: msg.clone(),
            },
        );
        return Err(msg);
    }

    let parsed: serde_json::Value = serde_json::from_str(&text).unwrap_or_default();

    let result = extract_content(&vendor, &parsed, &text);
    let usage = parse_usage(&vendor, &parsed);
    let cost_cny = calculate_cost(&vendor, &usage);

    if result.is_empty() {
        let msg = "AI 返回空内容".to_string();
        let _ = app.emit(
            "ai-error",
            AiErrorEvent {
                message: msg.clone(),
            },
        );
        return Err(msg);
    }

    // 分块 emit 模拟流式（按 char 边界切分，避免 UTF-8 乱码）
    let chars: Vec<char> = result.chars().collect();
    let chunk_size = 20;
    for chunk in chars.chunks(chunk_size) {
        if CANCEL_FLAG.load(Ordering::SeqCst) {
            let _ = app.emit(
                "ai-error",
                AiErrorEvent {
                    message: "已取消".into(),
                },
            );
            return Ok(());
        }
        let chunk_str: String = chunk.iter().collect();
        let _ = app.emit(
            "ai-chunk",
            AiChunkEvent {
                chunk: chunk_str,
                done: false,
            },
        );
        tokio::time::sleep(std::time::Duration::from_millis(30)).await;
    }

    // 最终 ai-done 事件携带完整内容 + usage + cost
    let _ = app.emit(
        "ai-done",
        AiDoneEvent {
            content: result.clone(),
            usage: usage.clone(),
            cost_cny,
        },
    );

    // 兼容旧 ai-chunk done:true
    let _ = app.emit(
        "ai-chunk",
        AiChunkEvent {
            chunk: String::new(),
            done: true,
        },
    );

    // 写调用日志
    let log = crate::call_logger::CallLog {
        time: chrono::Utc::now().to_rfc3339(),
        skill_name: action.clone(),
        prompt: format!(
            "{} ({} tokens)",
            vendor,
            usage.prompt_tokens + usage.completion_tokens
        ),
        status: "ok".to_string(),
        duration_ms: 0,
        tokens: usage.prompt_tokens + usage.completion_tokens,
        cost: cost_cny,
    };
    let _ = crate::call_logger::append_log(&log);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{desensitize, has_api_key, set_api_key};

    #[test]
    fn desensitize_covers_keys_tokens_paths_emails_urls_and_json_strings() {
        let fake_api_key = format!("sk-{}-secret", "test");
        let fake_jwt = format!(
            "{}.{}.{}",
            "eyJhbGciOiJIUzI1NiJ9", "eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0", "signature"
        );
        let input = [
            r#"{"api_key": ""#,
            &fake_api_key,
            r#"", "Authorization": "Bearer "#,
            &fake_jwt,
            r#"", "nested": {"secret": "plain-secret-token", "path": "/Users/alice/.codex/skills/demo/SKILL.md", "url": "https://api.example.com/run?token=abcd1234&safe=1&password=secret"}, "email": "owner@example.com", "windows": "C:\\Users\\Alice\\Documents\\secret.txt"}"#,
        ]
        .join("");

        let output = desensitize(&input);

        assert!(output.contains("<API_KEY>"));
        assert!(output.contains("<TOKEN>"));
        assert!(output.contains("<PATH>"));
        assert!(output.contains("<EMAIL>"));
        assert!(output.contains("safe=1"));
        assert!(!output.contains(&fake_api_key));
        assert!(!output.contains("eyJhbGci"));
        assert!(!output.contains("plain-secret-token"));
        assert!(!output.contains("/Users/alice"));
        assert!(!output.contains("owner@example.com"));
        assert!(!output.contains("password=secret"));
        assert!(!output.contains("C:\\Users\\Alice"));
    }

    #[test]
    fn api_key_commands_reject_unknown_vendors_before_keychain_access() {
        let vendor = "https://evil.example.com";
        let key = "sk-test-secret";

        let error = set_api_key(vendor, key).expect_err("unknown vendor should be rejected");

        assert!(error.contains("不支持的厂商"));
        assert!(!error.contains(key));
        assert!(!has_api_key(vendor));
    }
}
