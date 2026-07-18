---
title: Skill Panel UI Specification
date: 2026-07-10
updated: 2026-07-18
tags: [SkillPanel, UI, 视觉规范]
status: active
source_commit: 15a67962e4bf6f65c74720af794c3e2fb9a7d9d6
---

# Skill Panel UI Specification

## 产品视觉方向

Skill Panel 采用轻量桌面工作台风格：信息密度高、层级清楚、装饰克制、反馈明确。Library 是主要入口，编辑器服务已有 Skill 的维护，AI 能力位于当前任务上下文中。

设计实现参考 `ui-style-guide.md`、`src/styles/tokens.css`、`docs/architecture/current.md` 和已验收的原型交接材料。

## 设计 Token

| 类型 | 名称 | 值 | 用途 |
|---|---|---|---|
| 背景 | `--bg` | `#EEF2F7` | 应用整体底色 |
| 表面 | `--surface` | `#FFFFFF` | 卡片、面板、弹层 |
| 次表面 | `--surface-2` | `#F7FAFE` | 次级区域 |
| 主文字 | `--text` | `#111827` | 标题与正文 |
| 次文字 | `--text-2` | `#334155` | 次级正文 |
| 弱文字 | `--text-muted` | `#64748B` | 辅助信息 |
| 品牌色 | `--accent` | `#0A84FF` | 主操作、选中、焦点 |
| 成功 | `--success` | `#16A34A` | 成功状态 |
| 警告 | `--warning` | `#B54708` | 风险提示 |
| 危险 | `--danger` | `#DC2626` | 删除、失败、阻塞 |
| 边框 | `--border` | `#D7DEE8` | 面板和控件边界 |
| 小圆角 | `--radius-sm` | `8px` | 输入、按钮 |
| 大圆角 | `--radius-lg` | `12px` | 卡片和面板 |
| 顶栏 | `--topbar-global-height` | `64px` | 当前全局顶部导航高度，与 `--topbar-height` 一致 |
| 顶栏导航项 | `.nav-link` | `34px` 最小高度 | 五个主导航项的点击区域 |

字体栈：`Inter, -apple-system, SF Pro Display, PingFang SC, system-ui, sans-serif`。代码与路径使用等宽字体。

## 信息架构与导航

### 顶部主导航

顶部只展示五个稳定入口，并保持以下顺序：

1. Dashboard
2. Library
3. Logs
4. Dependencies
5. Settings

Library 是默认主入口。顶部导航保持 64px 单层结构，不增加 Editor、Detail、Create、AI Assistant 或 Preview。

### 上下文任务页面

- Skill Detail：从 Library 选中项、搜索结果或 Dashboard 指标进入。
- Skill Editor：从已选中 Skill 的 Detail 或 Create 完成流程进入。
- Create：由用户点击 New Skill 后进入。
- AI Assistant：围绕当前 Editor 草稿展开。
- Preview：围绕当前 Skill 或创建草稿展开。

打开 Detail、Editor、Create、AI Assistant 或 Preview 时，Library 导航项保持高亮。Editor 页面必须显示当前 Skill 名称、来源或路径，并提供返回 Detail 或 Library 的明确动作。

### 导航交互规则

- Editor 缺少选中 Skill 时显示空状态，禁止载入会被误认为真实文件的样例内容。
- Dashboard、Logs 和 Dependencies 指向具体 Skill 时，优先进入 Detail。
- Library 卡片单击只选中并刷新右侧详情；双击或 Enter 打开完整 Detail；右侧 DetailPanel 显示“查看完整详情”按钮。
- 可编辑 Skill 在完整 Detail 中通过“编辑”进入正常 Editor；受保护 Skill 通过“只读查看”进入只读 Editor，显示“这是受保护的 Skill。当前页面仅供查看，原文件不会被修改。如需编辑，请复制到可编辑目录。”
- Detail 页显示“返回 Library”，返回后保留搜索、分类筛选和选中状态。
- Editor 页头右侧操作区从左到右为“AI 辅助”“返回”；返回使用左箭头和“返回”，回到原 Skill Detail。
- 该操作顺序和页头排版已在 2026-07-16 SEC-FILE-01D 人工验收确认。
- Dependencies 保持顶部入口；真实依赖分析仍按 P1 交付，未接真实数据时显示明确的未开放或示例状态。
- New Skill 保持页面内次级按钮，不进入顶部导航。
- AI 辅助保持在 Editor 任务上下文内，独立页面与侧栏使用同一份草稿和 diff 状态。
- 顶部导航变化需要同步 `docs/product/PRD.md`、`AGENTS.md`、应用壳模块文档和视觉 QA 基准。

### Library

- 顶部：搜索、筛选、视图与排序。
- 左侧：来源、分类、标签或健康状态导航。
- 主区：默认三列卡片，紧凑宽度切换为两列。
- 详情：抽屉或详情面板，展示元数据、Markdown、依赖、版本与操作。
- 卡片选中态与右侧详情同步；单击不得离开 Library。
- 右侧详情面板提供“查看完整详情”按钮；卡片双击和 Enter 与该按钮进入同一完整 Detail。
- 分页：固定可见，筛选变化时回到第一页。

### Editor

- 导航归属为 Library，不提供顶部直接入口。
- 文件或草稿上下文。
- Frontmatter 表单。
- Markdown 编辑区与实时预览。
- 校验结果、版本状态和保存反馈。
- AI Rail 只处理当前编辑内容，写回前展示 diff。
- 只读 Editor 中 Frontmatter 和 Markdown 输入区域保持只读，保存、撤销、恢复版本和 AI 写回入口禁用。
- 1024×768、1280×800、1440×960 下右侧操作组均保持可见；窄屏时操作组可整体换到标题下方，长路径不得挤压按钮文本。

## 组件规范

### 按钮

- 主按钮仅用于当前页面唯一主动作。
- 次按钮使用白色或次表面底色与边框。
- 危险按钮使用危险色，并配合确认流程。
- 图标按钮必须有可访问名称和悬停说明。
- 异步操作期间显示进行中状态并阻止重复提交。

### 输入

- 标签、占位提示、错误信息保持对应关系。
- 聚焦使用双层 accent focus ring。
- 校验错误在字段附近说明恢复动作。
- API Key 默认遮罩，禁止回显完整值。

### 卡片与列表

- 卡片圆角 12px，边框 `--border`，悬停提升到轻阴影。
- 选中态使用 accent 软底色和明确边界。
- 长描述最多显示两至三行，完整内容在详情区阅读。
- 路径支持复制或打开目录，显示时允许中间省略。

### 状态反馈

必须覆盖：初始、扫描中、成功、部分成功、空白、失败、权限拒绝、保存中、保存成功、保存失败。

每个失败状态包含：发生了什么、数据是否安全、用户下一步、重试入口、日志入口。

## 响应式基准

| 视口 | 目标 |
|---|---|
| 1440×960 | 完整桌面布局、三列卡片、编辑器多栏 |
| 1280×800 | 主验收尺寸，保持核心导航和详情可用 |
| 1024×768 | 紧凑布局，内部区域可滚动，页面无水平溢出 |
| 900×600 | Tauri 最小窗口，仅保留关键操作且内容可访问 |

## 禁止样式

- 大面积装饰渐变、玻璃拟态或与生产力工具无关的动态背景。
- 仅靠颜色传达状态。
- 同页出现多个同权重主按钮。
- 删除、覆盖、AI 写回缺少确认和结果反馈。
- New Skill 占据首屏主视觉。
- 组件中直接写散落颜色值；新增颜色先进入 token。

## 视觉验收证据

当前 `npm run visual:qa` 覆盖 Library、详情抽屉、Dashboard、Editor、Create、Settings、Logs、空白和失败状态。清单位于代码项目 `docs/visual-qa-checklist.md`。

2026-07-18 报告覆盖 17 个场景，包含 Dependencies 独立页面与主要响应式尺寸，17/17 通过。

导航验收同时确认：顶部只有五个主导航项；进入 Detail、Editor、Create、AI Assistant 或 Preview 后 Library 保持高亮；Editor 缺少 Skill 上下文时显示安全空状态。

验收时固定同一 commit、URL、端口、视口、数据 fixture 和语言。截图保存到项目 `output/playwright/` 或批次 `output/migrations/<批次>/`。

### 当前视觉基线

- 当前开发版本：v3.8.3 candidate-2。
- main 基线：`15a67962e4bf6f65c74720af794c3e2fb9a7d9d6`。
- 视觉报告：`output/playwright/visual-qa-report.json`。
- 2026-07-18 复跑结果：17/17 场景通过。
- 迁移归档：`docs/design-migration-results/skill-panel-redesign-notion/`。
