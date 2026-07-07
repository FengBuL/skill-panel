# 编辑器工作区 v3.8.1

## 模块简介

负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。

## 检索关键词

`Editor`、`Markdown`、`Frontmatter`、`校验`、`保存`、`预览`

## 代码规模

- 源码文件数：4
- 代码总行数：242

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Editor/index.tsx` | 148 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/pages/Editor/Editor.css` | 49 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/editor/EditorWorkspace.tsx` | 15 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/detail/DetailDrawer.tsx` | 30 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |

## 对外契约

- readSkill 读取 Markdown 和 frontmatter
- validateSkill 返回质量检查结果
- 编辑内容变更标记 dirty

## 修改规则

- 编辑器三列布局保持稳定
- 保存逻辑和后端 update_skill 对齐
- AI 写回通过 diff 后更新 md

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
