use serde::{Deserialize, Serialize};
use serde_json::Map;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Language {
    #[serde(rename = "system")]
    System,
    #[serde(rename = "zh-CN")]
    ZhCn,
    #[serde(rename = "en-US")]
    EnUs,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SkillSource {
    CodexUser,
    AgentsUser,
    System,
    PluginCache,
    Custom,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WritableSkillSource {
    CodexUser,
    AgentsUser,
    Custom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ParseStatus {
    Parsed,
    MissingSkillFile,
    InvalidFrontmatter,
    ReadError,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillSummary {
    pub path: String,
    pub name: String,
    pub description: String,
    pub source: SkillSource,
    pub parse_status: ParseStatus,
    pub modified_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillDetail {
    #[serde(flatten)]
    pub summary: SkillSummary,
    pub markdown: String,
    pub body_markdown: String,
    pub raw_content: String,
    pub frontmatter: Map<String, serde_json::Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomSkillTagSetting {
    pub color: String,
    pub label: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomCategorySetting {
    pub color: String,
    pub icon: String,
    pub label: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub language: Language,
    pub custom_scan_directories: Vec<String>,
    pub show_default_scan_directories: bool,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub custom_categories: HashMap<String, CustomCategorySetting>,
    #[serde(default)]
    pub category_colors: HashMap<String, String>,
    #[serde(default)]
    pub category_labels: HashMap<String, String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub category_icons: HashMap<String, String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub category_skill_order: HashMap<String, Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub detail_panel_width: Option<u16>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub skill_view_mode: Option<String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_card_colors: HashMap<String, String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_category_overrides: HashMap<String, String>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_category_assignments: HashMap<String, Vec<String>>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_archives: HashMap<String, bool>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_favorites: HashMap<String, bool>,
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    pub skill_locks: HashMap<String, bool>,
    #[serde(default)]
    pub skill_tags: HashMap<String, Vec<CustomSkillTagSetting>>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: Language::System,
            custom_scan_directories: Vec::new(),
            show_default_scan_directories: true,
            custom_categories: HashMap::new(),
            category_colors: HashMap::new(),
            category_labels: HashMap::new(),
            category_icons: HashMap::new(),
            category_skill_order: HashMap::new(),
            detail_panel_width: None,
            skill_view_mode: None,
            skill_card_colors: HashMap::new(),
            skill_category_overrides: HashMap::new(),
            skill_category_assignments: HashMap::new(),
            skill_archives: HashMap::new(),
            skill_favorites: HashMap::new(),
            skill_locks: HashMap::new(),
            skill_tags: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSkillInput {
    pub name: String,
    pub description: String,
    pub source: WritableSkillSource,
    pub target_directory: String,
    pub markdown: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSkillInput {
    pub path: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub markdown: Option<String>,
}
