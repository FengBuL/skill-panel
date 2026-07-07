# 国际化与旧版工作区兼容 v3.8.1

## 模块简介

负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。

## 检索关键词

`i18n`、`resources`、`SkillPanelWorkspace`、`runtime`、`legacy`

## 代码规模

- 源码文件数：9
- 代码总行数：10599

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/i18n/core.ts` | 120 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/index.ts` | 21 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/resources.ts` | 764 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/runtime.tsx` | 321 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n.test.ts` | 101 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/useI18n.test.tsx` | 212 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/SkillPanelWorkspace.tsx` | 5933 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.test.tsx` | 2009 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.editor.test.tsx` | 1118 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |

## 对外契约

- i18n resources 提供 zh 和 en 文案
- 旧版工作区保留测试覆盖
- 当前稳定入口仍为 AppShell

## 修改规则

- 新增可见文案优先进入资源文件
- 旧版兼容代码改动需要跑相关测试
- 稳定入口变更需要单独计划

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
