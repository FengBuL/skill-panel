# 编辑器工作区 v3.8.1

## 模块简介

负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。

## 检索关键词

`Editor`、`Markdown`、`Frontmatter`、`校验`、`保存`、`预览`

## 代码规模

- 源码文件数：8
- 代码总行数：608

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Editor/index.tsx` | 5 | 负责 Editor 页面入口并挂载 EditorView。 |
| `src/pages/Editor/Editor.css` | 207 | 负责 Editor 原型三栏、Frontmatter、Markdown、Preview、校验和 AI 入口样式。 |
| `src/editor/EditorView.tsx` | 236 | 负责 Editor 原型 DOM 编排、草稿状态、读取、校验、AI diff 入口和保存提示。 |
| `src/editor/FrontmatterForm.tsx` | 40 | 提供 Frontmatter 表单结构。 |
| `src/editor/MarkdownEditor.tsx` | 18 | 提供 Markdown textarea 编辑区。 |
| `src/editor/PreviewPane.tsx` | 47 | 提供 Markdown 预览区。 |
| `src/editor/EditorWorkspace.tsx` | 14 | 提供 Editor 工作区外壳。 |
| `src/components/ValidationResult.tsx` | 41 | 提供 Editor 校验结果列表。 |

## 对外契约

- readSkill 读取 Markdown 和 frontmatter
- validateSkill 返回质量检查结果
- 编辑内容变更标记 dirty

## 修改规则

- 编辑器三列布局保持稳定
- 保存逻辑和后端 update_skill 对齐
- AI 写回通过 diff 确认后更新 Markdown

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
