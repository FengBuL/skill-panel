# 编辑器工作区 v3.8.1

## 模块简介

负责 Frontmatter 表单、Markdown 编辑、只读查看、预览、质量校验、保存状态和来源感知返回。

## 检索关键词

`Editor`、`Markdown`、`Frontmatter`、`校验`、`保存`、`预览`

## 代码规模

- 源码文件数：8
- 代码总行数：1049

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Editor/index.tsx` | 5 | 负责 Editor 页面入口并挂载 EditorView。 |
| `src/pages/Editor/Editor.css` | 399 | 负责 Editor 原型三栏、来源返回页头、Frontmatter、Markdown、Preview、校验和 AI 入口样式。 |
| `src/editor/EditorView.tsx` | 696 | 负责 Editor 原型 DOM 编排、来源返回、只读保护、草稿状态、读取、校验、AI diff 入口和保存提示。 |
| `src/editor/FrontmatterForm.tsx` | 42 | 提供 Frontmatter 表单结构，支持只读输入状态。 |
| `src/editor/MarkdownEditor.tsx` | 20 | 提供 Markdown textarea 编辑区，支持只读输入状态。 |
| `src/editor/PreviewPane.tsx` | 47 | 提供 Markdown 预览区。 |
| `src/editor/EditorWorkspace.tsx` | 14 | 提供 Editor 工作区外壳。 |
| `src/components/ValidationResult.tsx` | 41 | 提供 Editor 校验结果列表。 |

## 对外契约

- readSkill 读取 Markdown 和 frontmatter
- validateSkill 返回质量检查结果
- 编辑内容变更标记 dirty
- Editor 接收已选中的 Skill 上下文，入口包括 Detail 编辑操作、Library 双击/Enter、受保护只读查看或 Create 完成流程
- Editor 打开期间 Library 保持顶部导航高亮
- 从 Library 进入 Editor 时返回 Library，从 Detail 进入 Editor 时返回原 Detail；未保存内容触发离开确认
- 受保护 Skill 进入只读 Editor，显示安全提示，Frontmatter 和 Markdown 可查看且不可编辑
- 只读 Editor 禁用保存、撤销、恢复版本和 AI 写回，提供“复制到可编辑目录”按钮
- 只读 Editor 复制成功后打开新副本的正常 Editor，复制失败时停留在只读页面

## 修改规则

- 编辑器三列布局保持稳定
- Editor 不增加顶部导航入口；缺少 Skill 上下文时显示安全空状态和返回 Library 的操作
- 保存逻辑和后端 update_skill 对齐
- AI 写回通过 diff 确认后更新 Markdown
- 返回按钮固定在 Editor 页头左上方，不能放入右侧操作区
- 受保护来源的只读状态必须由前端权限 helper 与后端路径权限共同校验

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
