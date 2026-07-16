use regex::{Captures, Regex};
use serde_json::Value;
use std::sync::OnceLock;

fn email_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"(?i)\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b")
            .expect("email regex should compile")
    })
}

fn jwt_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b")
            .expect("jwt regex should compile")
    })
}

fn bearer_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"(?i)\b(Authorization\s*:\s*)Bearer\s+[A-Za-z0-9._~+/=-]+")
            .expect("bearer regex should compile")
    })
}

fn bare_bearer_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]+").expect("bare bearer regex should compile")
    })
}

fn api_key_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"\bsk-[A-Za-z0-9_\-]{6,}\b").expect("api key regex should compile")
    })
}

fn sensitive_pair_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(
            r#"(?ix)
            (?P<prefix>\b(?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)\b\s*[:=]\s*)
            (?P<value>[^"',\s&}\]]+)
        "#,
        )
        .expect("sensitive pair regex should compile")
    })
}

fn quoted_sensitive_pair_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(
            r#"(?ix)
            (?P<prefix>"(?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)"\s*:\s*")
            (?P<value>[^"]+)
            (?P<suffix>")
        "#,
        )
        .expect("quoted sensitive pair regex should compile")
    })
}

fn sensitive_query_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(
            r#"(?i)([?&](?:api[_-]?key|token|secret|password|access[_-]?token|refresh[_-]?token)=)([^&#\s"']+)"#,
        )
        .expect("query regex should compile")
    })
}

fn unix_path_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r#"(?x)(?:~|/Users/[^\s"',)\]}]+|/home/[^\s"',)\]}]+)"#)
            .expect("unix path regex should compile")
    })
}

fn windows_path_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r#"(?i)\b[A-Z]:\\{1,2}Users\\{1,2}[^\s"',)\]}]+"#)
            .expect("windows path regex should compile")
    })
}

fn placeholder_for_key(key: &str) -> &'static str {
    if key.to_ascii_lowercase().contains("api") {
        "<API_KEY>"
    } else {
        "<TOKEN>"
    }
}

pub fn redact_text(input: &str) -> String {
    let mut output = input.to_string();

    output = sensitive_query_regex()
        .replace_all(&output, |caps: &Captures| {
            format!("{}{}", &caps[1], placeholder_for_key(&caps[1]))
        })
        .to_string();
    output = quoted_sensitive_pair_regex()
        .replace_all(&output, |caps: &Captures| {
            format!(
                "{}{}{}",
                &caps["prefix"],
                placeholder_for_key(&caps["prefix"]),
                &caps["suffix"]
            )
        })
        .to_string();
    output = sensitive_pair_regex()
        .replace_all(&output, |caps: &Captures| {
            format!(
                "{}{}",
                &caps["prefix"],
                placeholder_for_key(&caps["prefix"])
            )
        })
        .to_string();
    output = bearer_regex()
        .replace_all(&output, "${1}<TOKEN>")
        .to_string();
    output = bare_bearer_regex()
        .replace_all(&output, "<TOKEN>")
        .to_string();
    output = jwt_regex().replace_all(&output, "<TOKEN>").to_string();
    output = api_key_regex()
        .replace_all(&output, "<API_KEY>")
        .to_string();
    output = unix_path_regex().replace_all(&output, "<PATH>").to_string();
    output = windows_path_regex()
        .replace_all(&output, "<PATH>")
        .to_string();
    email_regex().replace_all(&output, "<EMAIL>").to_string()
}

pub fn redact_json_value(value: &Value) -> Value {
    match value {
        Value::String(text) => Value::String(redact_text(text)),
        Value::Array(items) => Value::Array(items.iter().map(redact_json_value).collect()),
        Value::Object(map) => {
            let mut redacted = serde_json::Map::new();
            for (key, item) in map {
                if matches!(
                    key.to_ascii_lowercase().as_str(),
                    "api_key" | "apikey" | "api-key" | "token" | "secret" | "password"
                ) {
                    redacted.insert(
                        key.clone(),
                        Value::String(placeholder_for_key(key).to_string()),
                    );
                } else {
                    redacted.insert(key.clone(), redact_json_value(item));
                }
            }
            Value::Object(redacted)
        }
        _ => value.clone(),
    }
}

pub fn preview_text(input: &str) -> String {
    const LIMIT: usize = 1200;
    input.chars().take(LIMIT).collect()
}
