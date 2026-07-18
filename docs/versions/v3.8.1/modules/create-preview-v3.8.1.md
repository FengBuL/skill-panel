# 新建与预览流程 v3.8.1

## 模块简介

负责创建 Skill 的入口、预览页面和次级视图流程。

## 检索关键词

`Create`、`Preview`、`新建`、`预览`

## 代码规模

- 源码文件数：7
- 代码总行数：365

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/SkillForm.tsx` | 41 | 提供 New Skill 表单结构。 |
| `src/components/TemplateSelector.tsx` | 52 | 提供 New Skill 模板选择卡片。 |
| `src/pages/Create/index.tsx` | 96 | 负责 New Skill 次级弹窗流程、模板选择、AI 辅助入口和创建提交。 |
| `src/pages/Create/Create.css` | 28 | 负责 New Skill 弹窗页面辅助样式。 |
| `src/pages/EmptyStates/index.tsx` | 64 | 提供 Empty/Error 状态验收页。 |
| `src/pages/EmptyStates/EmptyStates.css` | 29 | 负责 Empty/Error 状态验收页网格样式。 |
| `src/pages/Preview/index.tsx` | 55 | 负责创建 Skill 的入口、预览页面和次级视图流程。 |

## 对外契约

- create_skill 负责新建
- Preview 读取当前上下文或示例内容

## 修改规则

- 新建流程需要校验名称、描述、目标目录
- 预览页面保持只读
- 完成后返回 Library 或 Editor

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
