# Skill Panel Notion UI 迁移结果

本目录归档 WorkBuddy 原型到 Codex 稳定线的视觉迁移结果，供后续验收、回归测试和继续迁移使用。

## 目录结构

- `prototype/`：WorkBuddy 原型 PNG，来源于 `skill-panel-workbuddy-v3.8.1-prototype/docs/design-prototypes/skill-panel-redesign-notion/`。
- `codex/`：Codex 稳定线迁移后的 1440x960 截图。
- `comparison/`：原型与 Codex 截图的并排对照图，左侧为原型，右侧为 Codex。

## 页面清单

| 页面 | 原型截图 | Codex 截图 | 对照图 |
| --- | --- | --- | --- |
| Library | `prototype/library.png` | `codex/library.png` | `comparison/library-comparison.png` |
| Dashboard | `prototype/dashboard.png` | `codex/dashboard.png` | `comparison/dashboard-comparison.png` |
| Skill Detail | `prototype/detail.png` | `codex/detail.png` | `comparison/detail-comparison.png` |
| Editor | `prototype/editor.png` | `codex/editor.png` | `comparison/editor-comparison.png` |
| AI Assistant / Diff | `prototype/ai-assistant.png` | `codex/ai-assistant.png` | `comparison/ai-assistant-comparison.png` |
| Logs | `prototype/logs.png` | `codex/logs.png` | `comparison/logs-comparison.png` |
| Dependencies | `prototype/dependencies.png` | `codex/dependencies.png` | `comparison/dependencies-comparison.png` |
| Settings | `prototype/settings.png` | `codex/settings.png` | `comparison/settings-comparison.png` |
| New Skill | `prototype/new-skill.png` | `codex/new-skill.png` | `comparison/new-skill-comparison.png` |
| Empty / Error | `prototype/empty.png` | `codex/empty.png` | `comparison/empty-comparison.png` |

## 当前基准

- 截图视口：1440x960。
- 顶部导航基准：Dashboard、Library、Logs、Dependencies、Settings。
- AI Assistant 顶栏右侧基准：仅显示 `返回编辑器`。
- New Skill 保持次级入口，不进入主导航。
- 全局视觉基准：无阴影、无渐变、无玻璃拟态。

## 后续使用

1. 修改对应页面后，重新生成 `codex/<page>.png`。
2. 重新生成 `comparison/<page>-comparison.png`。
3. 对照 `prototype/<page>.png` 做视觉回归。
4. 若原型更新，同步替换 `prototype/` 下对应 PNG，并记录来源。
