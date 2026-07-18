---
title: Skill Panel PRD
date: 2026-07-10
updated: 2026-07-18
tags: [SkillPanel, PRD, 产品需求]
status: active
version: 3.8.3
---

# Skill Panel PRD

## 1. 产品定位

Skill Panel 是面向本地 AI 工具使用者的跨平台桌面工作台，帮助用户集中查找、查看、编辑、分类、维护和验证散落在多个目录中的 Skill。

核心价值：让已有 Skill 更容易找到、更安全地修改、更清楚地维护。

## 2. 目标用户

首要用户是已经安装多个 Codex、Agents 或插件 Skill，需要频繁查找、编辑和整理本地 Skill 的个人用户。

用户通常会使用桌面应用和文件夹，对 Git、终端和代码的熟悉程度可能有限。主要担忧包括误删、覆盖、升级后数据丢失、API Key 泄露和插件缓存被改坏。

## 3. 核心场景

### 3.1 查找与查看

用户通过搜索、来源、分类、标签和健康状态快速定位 Skill，打开详情查看来源、路径、修改时间、Markdown 正文、依赖和状态。

### 3.2 编辑与验证

P0 流程中，用户在 Editor 修改 Frontmatter 和 Markdown，查看实时预览和校验结果，确认后保存；系统在写入前自动创建安全备份或内部快照。P1 维护流程提供面向用户的差异查看、版本历史和手动恢复。AI 辅助启用时，候选内容必须先经过 diff 确认。

### 3.3 整理与维护

用户根据 Dashboard 建议和 Library 筛选处理重复、低频、缺少描述、解析异常或未分类 Skill，批量操作前看到影响清单。

## 4. 产品原则

1. Library 是默认主入口，也是 Detail、Editor、Create 和 AI Assistant 任务链路的导航归属。
2. 新建 Skill 是低频辅助入口。
3. 编辑器围绕已有 Skill 维护展开。
4. AI 只辅助当前任务，写回前必须展示 diff。
5. 本地数据安全优先于功能数量。
6. 删除、覆盖、批量操作和恢复必须清楚说明影响。
7. 所有失败状态都要给出下一步。

## 5. 信息架构与导航层级

> [!info] 当前导航口径
> 顶部主导航固定为 Dashboard、Library、Logs、Dependencies、Settings。Detail、Editor、Create、AI Assistant 和 Preview 属于带任务上下文的页面，不占用顶部导航位置。

### 5.1 顶部主导航

| 导航项 | 主要职责 | 默认进入结果 |
|---|---|---|
| Dashboard | 状态概览、扫描指标和治理建议 | 查看全局概览，点击指标后进入带筛选条件的 Library |
| Library | 查找、筛选、查看和管理 Skill | 显示 Skill 列表，是应用默认入口 |
| Logs | 调用、错误、token、成本和诊断 | 查看真实日志及筛选结果 |
| Dependencies | Skill 依赖关系和风险分析 | 查看真实依赖分析、缺失依赖和解析状态 |
| Settings | 扫描目录、语言、AI、Keychain 和界面偏好 | 查看并维护应用级设置 |

顶部主导航的新增、删除或职责变化属于产品信息架构变化，需要用户确认，并同步 `AGENTS.md` 与 `docs/product/UI-SPECIFICATION.md`。

导航位置表达稳定入口和可发现性，不代表功能优先级或当前完成度。Dependencies 保持顶部入口，其真实分析能力继续按 P1 范围交付。

### 5.2 上下文任务页面

| 页面 | 必需上下文 | 主要入口 | 顶部导航归属 |
|---|---|---|---|
| Skill Detail | 已选中的 Skill | Library 卡片、Dashboard 指标或搜索结果 | Library 保持高亮 |
| Skill Editor | 已选中的可编辑 Skill | Detail 的“编辑”、Create 成功后的继续编辑 | Library 保持高亮 |
| Create | 用户明确触发新建 | Dashboard 或 Library 的 New Skill | Library 保持高亮 |
| AI Assistant | 当前 Editor 草稿 | Editor 内的 AI 辅助入口 | Library 保持高亮 |
| Preview | 当前 Skill 或创建草稿 | Detail、Editor 或 Create 流程 | Library 保持高亮 |

Editor 需要明确的 Skill 名称、来源和路径。缺少选中 Skill 时显示空状态与返回 Library 的操作，不加载样例内容，也不提供直接写入。

### 5.3 核心进入路径

1. P0 已有 Skill：`Library → Skill Detail → Skill Editor → 校验 → 保存`。
2. 新建 Skill：`Dashboard/Library → Create → Skill Detail 或 Skill Editor`。
3. P1 AI 辅助：`Skill Editor → AI Assistant/AI Rail → diff 草稿 → 返回 Editor → 用户保存`。
4. Dashboard、Logs 和 Dependencies 中指向具体 Skill 的结果，先进入 Skill Detail，再由用户决定是否编辑。

### 5.4 页面职责

#### Dashboard

- 全部 Skill、近期使用、收藏、需处理数量。
- 调用趋势、常用 Skill、来源分布。
- 低频、异常、缺少描述等整理建议。
- 点击指标或建议后进入带筛选条件的 Library。

#### Skill Library

- 搜索、来源、分类、标签、健康状态和排序。
- 卡片网格与紧凑视图。
- 收藏、锁定、标签、分页和批量选择。
- 单击卡片只选中并刷新右侧 DetailPanel。
- 双击卡片或按 Enter 进入完整 Skill Detail，不直接进入 Editor。
- 右侧 DetailPanel 提供“查看完整详情”按钮，作为可发现的完整详情入口。
- 以上 Library → Detail → Editor 流程已在 2026-07-16 SEC-FILE-01D 人工验收确认。
- 返回 Library 后保留搜索、分类筛选和当前选中状态。
- 正常、扫描中、部分成功、空白和失败状态。

#### Skill Detail

- 名称、描述、来源、路径、修改时间和解析状态。
- Markdown 渲染正文。
- 标签、依赖、质量检查和版本历史。
- 可编辑 Skill 显示“编辑”，点击后进入正常 Editor。
- 受保护来源显示明确限制、“只读查看”和“复制到可编辑目录”；只读查看进入只读 Editor。
- 打开目录、归档、删除等操作保留既有安全限制。
- Detail 提供“返回 Library”，返回后保留搜索、分类筛选和当前选中状态。
- 独立备份按钮只有在存在后端命令契约、成功反馈和失败保护时才可点击；缺少契约时必须禁用并标注待实现。

#### Skill Editor

- Frontmatter 表单与 Markdown 双向同步。
- Markdown 编辑和实时预览。
- 自动草稿、手动保存、校验与保存状态。
- 外部修改冲突处理。
- AI 润色、结构优化、安全检查和 diff 采纳。
- Editor 从 Detail 进入，返回原 Skill Detail；有未保存内容时继续显示离开确认。
- 受保护只读 Editor 允许查看 Frontmatter 和 Markdown，禁用保存、撤销、恢复版本和 AI 写回，并提供复制到可编辑目录。

#### Create

- 选择可写来源和目标目录。
- 输入名称、描述、标签和正文。
- 创建前校验路径、重名和 Frontmatter。
- 创建成功后进入详情或 Editor。

#### Settings

- 中文与英文、主题和界面偏好。
- 默认扫描目录与自定义目录。
- AI 厂商、模型、预算和 API Key 状态。
- API Key 通过系统 Keychain 保存。

#### Logs

- 调用、错误、token、成本和依赖诊断。
- 支持时间、状态和类型筛选。
- 路径、密钥、邮箱等敏感信息脱敏。

#### Dependencies

- 展示 Skill 之间的真实依赖关系、缺失依赖和解析失败。
- 支持从风险结果进入对应 Skill Detail。
- 路径读取遵守允许根目录和受保护来源规则。
- 无依赖、分析中、部分成功和分析失败均提供明确状态。

## 6. P0 功能

- 扫描 Codex、Agents、系统、插件缓存和自定义目录。
- 搜索、筛选、排序、分页和详情。
- 新建、编辑、校验、保存、删除、打开目录。
- 中文和英文。
- 设置读取与保存。
- Windows 和 macOS 桌面打包。
- 空白、加载、成功、部分成功、失败和权限拒绝状态。
- 编辑保存前校验并自动创建安全备份或内部快照，写入失败时保持原文件安全。

## 7. P1 功能

- 面向用户的版本历史、差异查看、手动恢复和备份管理。
- 依赖分析与质量检查。
- 收藏、标签、分类、锁定、归档和批量操作。
- Dashboard 使用数据和整理建议。
- AI 编辑辅助与受控写回。
- 更完整的调用日志和成本展示。

## 8. 当前排除范围

- 账号、登录和团队权限。
- 云同步、多设备同步和远程备份。
- 在线 Skill 市场、分享和社区分发。
- 遥测、广告、订阅和支付。
- 后台静默修改用户文件。
- 扫描用户全盘或系统敏感目录。
- AI 批量生成完整 Skill 作为核心流程。

## 9. 数据与安全要求

- 扫描阶段只读取允许目录。
- 写回 `SKILL.md` 前创建备份或版本快照。
- 删除和批量操作二次确认，并提供恢复方案。
- 插件缓存和系统来源显示高风险或只读提示。
- AI 输出先成为候选版本，用户确认 diff 后写回。
- API Key 只保存在系统 Keychain。
- 前端状态、日志、截图和文档禁止保存完整 API Key。
- 文件操作限制在用户选择或设置允许的根目录。
- 外部修改冲突时暂停覆盖并展示差异。

## 10. 视觉与交互要求

- 桌面生产力工具风格，信息密度高、层级清楚、装饰克制。
- 颜色、间距、圆角和阴影使用统一 token。
- 图标按钮具备可访问名称和焦点状态。
- 1440×960、1280×800、1024×768 均可完成核心流程。
- Tauri 最小窗口 900×600 下关键操作仍可访问。
- 页面禁止出现整体水平溢出。
- 错误提示说明发生的事情、数据状态、恢复动作和日志入口。

详细基准见 `docs/product/UI-SPECIFICATION.md`。

## 11. 验收标准

### P0 核心流程

1. 启动并扫描允许目录。
2. 在 Library 搜索并找到一个 Skill。
3. 打开详情并核对来源、路径和正文。
4. 进入 Editor 修改内容。
5. 完成校验并保存；系统在写入前自动创建安全备份或内部快照。
6. 重启应用后内容仍存在。

### P1 维护流程

1. 查看保存前后的差异和版本历史。
2. 选择旧版本，阅读覆盖影响并完成恢复演练。
3. 使用 AI 辅助时查看并确认 diff，再由用户保存草稿。
4. 从 Dependencies 查看真实依赖结果，并进入对应 Skill Detail。

### 质量门槛

- 所有 P0 功能有自动或人工验证证据。
- 当前发布范围包含的 P1 功能也需要对应验证证据；顶部导航位置不作为完成证明。
- 前端测试、类型检查、构建、打包配置和 Rust 测试通过。
- 三个目标视口的视觉 QA 通过。
- 中文和英文主流程通过。
- S0/S1 问题为 0。
- 工作区干净，发布 commit、tag 和安装包可追溯。

## 12. 成功指标

- 用户可在 30 秒内找到一个已知 Skill。
- 核心管理流程成功率达到 95% 以上。
- 编辑保存失败时原文件保持完整。
- 危险操作均有确认、结果反馈和恢复路径。
- 每个正式版本都有 commit、测试证据、安装包校验和回退点。

## 13. 当前里程碑

v3.8.3 candidate-2 已通过 macOS 8A 与 8B，包含真实 Skill、分页、安装升级、回退和数据保留验证，作为当前内部开发基线。v3.8.2 仍为最新正式版本。macOS 正式发布继续等待 Developer ID 签名、公证和 Gatekeeper 验证，Windows 候选继续延期。进度见 `CURRENT-PLAN.md` 与 `RELEASE-READINESS.md`。
