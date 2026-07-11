# 设置与偏好 v3.8.1

## 模块简介

负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。

## 检索关键词

`Settings`、`设置`、`AI Key`、`预算`、`脱敏`、`扫描目录`

## 代码规模

- 源码文件数：6
- 代码总行数：447

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/SettingCard.tsx` | 14 | 提供 Settings 分组卡片结构。 |
| `src/components/SettingsNav.tsx` | 13 | 提供 Settings 左侧分组导航。 |
| `src/pages/Settings/index.tsx` | 170 | 负责主题、扫描、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/pages/Settings/Settings.css` | 155 | 负责 Settings 左侧导航、设置表单、卡片和安全说明样式。 |
| `src/settings/Settings.tsx` | 15 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/store/settingsStore.ts` | 80 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |

## 对外契约

- 前端设置状态由 useSettingsStore 管理
- 后端 AppSettings 负责持久化
- Key 保存走 set_ai_key 命令

## 修改规则

- 新增设置字段需要同步前端类型、Rust 模型、契约测试
- 敏感值只存 Keychain
- 设置项保持短标签和帮助文案

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
