# Skill Detail v3.8.1

## 模块简介

负责 Skill 独立详情页、基础信息、文件结构、质量检查、依赖关系、来源权限提示、应用内归档、复制到可编辑目录和本地文件删除确认。

## 检索关键词

`Detail`、`Skill Detail`、`DetailView`、`FileTree`、`QualityCheck`、`DependencyList`、`DangerZone`、`详情`

## 代码规模

- 源码文件数：7
- 代码总行数：1026

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/detail/DetailView.tsx` | 464 | 负责 Skill Detail 数据选择、返回 Library、进入 Editor、归档持久化、打开目录、复制确认、删除确认、待实现备份状态和操作反馈。 |
| `src/detail/detail.css` | 399 | 负责 Skill Detail 网格、页头长路径响应式布局、基础信息、质量检查、依赖表格、危险区和模态框样式。 |
| `src/detail/DetailDrawer.tsx` | 29 | 提供详情抽屉外壳，保留给兼容代码和后续扩展。 |
| `src/components/FileTree.tsx` | 31 | 提供文件结构展示组件。 |
| `src/components/QualityCheck.tsx` | 28 | 提供质量检查结果组件。 |
| `src/components/DependencyList.tsx` | 43 | 提供依赖关系列表组件。 |
| `src/components/DangerZone.tsx` | 32 | 提供危险操作区、应用内归档和本地文件删除入口。 |

## 对外契约

- 详情数据来自 useSkillStore 当前扫描结果和 useUIStore.subParam
- Library 卡片双击、Enter 或右侧 DetailPanel 的“查看完整详情”进入 `subView: detail`
- Detail 页提供“返回 Library”，返回后保留 Library 搜索、筛选和选中状态
- 可编辑来源显示“编辑”，点击后进入正常 Editor，并将返回目标设为当前 Detail
- 受保护来源显示只读提示、“只读查看”和“复制到可编辑目录”；只读查看进入只读 Editor，删除本地文件禁用
- 打开目录调用 `open_skill_folder` 并显示成功或失败反馈
- 复制先确认目标名称，再调用 `clone_skill`，成功后进入新 Skill Detail 并显示新路径与 User 来源
- 应用内归档读写 `AppSettings.skillArchives`，通过 `save_app_settings` 持久化，保留本地文件
- 删除本地文件必须二次确认，调用 `delete_skill`，成功后从 Library store 移除该 Skill
- 页头标题和路径允许收缩，操作区不压缩按钮文本；1200px 以下操作区整体换到标题下方
- 独立备份按钮在后端未提供明确命令契约前保持禁用并显示“备份待实现”

## 修改规则

- 详情页视觉对齐 `detail.html` 原型
- 文件、质量、依赖、危险区保持只读展示
- 删除、归档、复制等操作必须保留确认弹窗、取消反馈和失败反馈
- 删除弹窗必须展示名称、来源、完整路径、影响目录、废纸篓与应用内备份说明、恢复方式和确认勾选框
- 不允许保留可点击但无响应的 Detail 操作按钮

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
