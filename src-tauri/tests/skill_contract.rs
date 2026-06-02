use serde_json::json;
use skill_panel_lib::models::{
    AppSettings, CreateSkillInput, Language, ParseStatus, SkillDetail, SkillSource, SkillSummary,
    UpdateSkillInput, WritableSkillSource,
};

#[test]
fn skill_summary_uses_frontend_friendly_camel_case_json() {
    let summary = SkillSummary {
        path: "C:/skills/example/SKILL.md".to_string(),
        name: "Example".to_string(),
        description: "Example skill".to_string(),
        source: SkillSource::CodexUser,
        parse_status: ParseStatus::Parsed,
        modified_at: None,
    };

    assert_eq!(
        serde_json::to_value(summary).unwrap(),
        json!({
            "path": "C:/skills/example/SKILL.md",
            "name": "Example",
            "description": "Example skill",
            "source": "codex-user",
            "parseStatus": "parsed",
            "modifiedAt": null
        })
    );
}

#[test]
fn skill_detail_and_inputs_round_trip_through_json() {
    let detail = SkillDetail {
        summary: SkillSummary {
            path: "D:/demo/SKILL.md".to_string(),
            name: "Demo".to_string(),
            description: "Demo skill".to_string(),
            source: SkillSource::Custom,
            parse_status: ParseStatus::ReadError,
            modified_at: None,
        },
        markdown: "# Demo".to_string(),
        body_markdown: "# Demo".to_string(),
        raw_content: "---\nname: Demo\ndescription: Demo skill\n---\n# Demo".to_string(),
        frontmatter: serde_json::Map::new(),
    };

    let value = serde_json::to_value(&detail).unwrap();
    assert_eq!(value["parseStatus"], "read-error");
    assert_eq!(value["modifiedAt"], serde_json::Value::Null);
    assert_eq!(value["bodyMarkdown"], "# Demo");
    assert_eq!(
        value["rawContent"],
        "---\nname: Demo\ndescription: Demo skill\n---\n# Demo"
    );

    let create: CreateSkillInput = serde_json::from_value(json!({
        "name": "Demo",
        "description": "Demo skill",
        "source": "custom",
        "targetDirectory": "D:/demo",
        "markdown": "# Demo"
    }))
    .unwrap();
    assert_eq!(create.source, WritableSkillSource::Custom);

    let update: UpdateSkillInput = serde_json::from_value(json!({
        "path": "D:/demo/SKILL.md",
        "markdown": "# Updated"
    }))
    .unwrap();
    assert_eq!(update.path, "D:/demo/SKILL.md");
}

#[test]
fn app_settings_serializes_skill_roots_and_default_source() {
    let settings = AppSettings {
        language: Language::System,
        custom_scan_directories: vec!["C:/Users/example/skills".to_string()],
        show_default_scan_directories: true,
    };

    assert_eq!(
        serde_json::to_value(settings).unwrap(),
        json!({
            "language": "system",
            "customScanDirectories": ["C:/Users/example/skills"],
            "showDefaultScanDirectories": true
        })
    );
}
