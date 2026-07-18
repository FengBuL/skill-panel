# Skill Panel Agent 规则

本文件是 Skill Panel 仓库的 agent 执行规则。所有 agent 进入本仓库前都要先读取并遵守。

## 产品定位与功能优先级

Skill Panel 的核心价值是管理已有 Skill。所有设计、代码和交互都要围绕“找到、查看、编辑、分类、维护、验证已有 Skill”展开。

功能优先级：

1. 已有 Skill 管理：扫描、搜索、筛选、详情、编辑、归档、分类、标签。
2. Skill 维护：备份、恢复、质量校验、依赖分析、调用日志。已有实现优先维护，新增能力需要单独确认。
3. 编辑辅助：AI 润色、结构优化、安全审查、diff 写回确认。
4. 新建 Skill：低频辅助入口，不能占据主导航和首屏主视觉。
5. 模板创建、AI 生成 Skill、批量生成 Skill：仅作为次级辅助能力，需要明确用户触发和确认。

产品红线：

- Library 是主入口，不能把 New Skill、AI 生成、模板创建做成首屏核心入口。
- 顶部主导航固定为 Dashboard、Library、Logs、Dependencies、Settings。
- Detail、Editor、Create、AI Assistant、Preview 是带上下文的任务页面，统一归属 Library 导航。
- Editor 需要已选中的 Skill，只从 Detail 或 Create 完成流程进入；缺少上下文时显示安全空状态。
- 进入 Detail、Editor、Create、AI Assistant 或 Preview 时，Library 保持高亮。
- 编辑器服务于已有 Skill 维护，AI 功能服务于当前编辑内容。
- 新功能必须能解释它如何提升已有 Skill 的管理效率。
- 不符合“管理已有 Skill”主线的能力，进入讨论阶段，禁止直接开发。

## 语言规则

所有项目说明、交付说明、规范文件、交互文案默认使用中文。

中文表达要直接、清晰、可执行。避免使用二元否定转折句式，优先写成正向规则和明确动作。

## 权威来源与启动基线

新会话按以下顺序确认上下文：

1. 数据安全和发布规则。
2. 用户已经确认的验收结论。
3. 当前仓库的 `AGENTS.md`、PRD、UI 规范和任务卡。
4. 已验收的原型交接材料。
5. 当前实现和自动化测试。
6. 历史计划、复盘和归档文档。

仓库基线：

- 规范仓库目录：`/Users/shovy/Documents/skill-panel`
- 默认分支：`main`
- 当前开发基线：v3.8.3 candidate-2 内部候选
- 最新正式版本：v3.8.2
- 应用入口：`src/main.tsx` → `src/layout/AppShell.tsx`
- 当前架构说明：`docs/architecture/current.md`

每次新会话先运行 `npm run repo:doctor`。检查失败时先修复上下文或基线问题。

## 任务启动模板

每次开工前，agent 必须先执行：

```bash
pwd
git status --short --branch
npm run repo:doctor
```

随后在开工说明中写清楚：

```text
当前目录：
当前分支：
当前工作区状态：
任务线：Codex 稳定线 / WorkBuddy 原型线
任务目标：
涉及模块：
计划修改文件：
计划新增文件：
不会修改的范围：
主要风险：
验证方式：
是否涉及模块文档更新：
是否涉及数据安全：
```

没有完成目录校验和启动说明，禁止开始编辑文件。

## 工作目录隔离

规范仓库位于 `/Users/shovy/Documents/skill-panel`。Codex 和 WorkBuddy 使用从 `main` 派生的独立分支或 worktree。

硬规则：

- Codex 从最新 `origin/main` 创建稳定实现分支。
- WorkBuddy 从任务卡固定的 `main` 提交创建临时原型分支或 worktree。
- 原型目录名称包含任务编号，验收和交接完成后归档或清理。
- 历史 WorkBuddy 3.9 基座只可作为归档参考。
- 每次运行命令前先确认 `pwd` 输出。
- 发现当前目录不匹配时，立即停止并切换目录。
- 禁止两个 agent 同时编辑同一个文件夹。

## 当前稳定线

- 稳定产品线：v3.8.x
- 当前开发基线：v3.8.3 candidate-2
- 最新正式版本：v3.8.2
- 稳定分支：`main`
- 规范仓库目录：`/Users/shovy/Documents/skill-panel`

Codex 负责稳定集成和发布质量。

## 禁止擅自新增的大功能

以下能力会扩大产品边界，未经明确批准禁止开发：

- 登录、账号体系、云端账号
- 云同步、多设备同步、远程备份
- 插件市场、在线 Skill 商店
- 在线分享、公开发布、社区分发
- AI 自动生成完整 Skill 作为主流程
- AI 批量生成 Skill
- 复杂权限系统、团队协作权限
- 远程执行 Skill
- 自动修改用户本地文件的后台任务
- 扫描用户全盘或系统敏感目录
- 遥测、埋点、用户行为上传
- 内置计费、订阅、支付

如确需讨论以上能力，先写产品说明、风险清单、数据安全方案和回滚方案。

## 数据安全规则

Skill Panel 管理用户本地文件，所有读写操作遵守以下规则：

- 扫描只读取文件信息，禁止修改用户文件。
- 删除本地文件必须二次确认。
- 批量删除、批量归档、批量禁用必须确认影响范围。
- 归档默认只改应用状态，禁止直接删除文件。
- 写回 `SKILL.md` 前必须有备份或版本快照。
- AI 写回必须经过 diff 确认。
- 恢复历史版本前必须提示将覆盖当前内容。
- 打开目录、扫描目录、写入目录必须限制在允许根目录内。
- API Key 只通过系统 Keychain 保存。
- 前端 store、日志、截图、文档不得保存原始 API Key。
- 日志中需要脱敏路径、密钥、邮箱等敏感信息。
- 任何后台任务不得静默修改用户文件。

允许根目录指用户在设置中选择的 Skill 根目录，以及用户明确手动选择的单个 Skill 目录。

## 模块情况

模块文档库位于 `docs/modules/`。

核心索引：

- `docs/modules/README.md`：模块文档库入口。
- `docs/modules/module-index-v3.8.1.md`：按模块检索代码文档。
- `docs/modules/source-file-index-v3.8.1.md`：按源码文件检索模块归属、模块文档和行数。

当前稳定线模块：

- 应用壳与导航：入口、顶栏、视图切换、全局监听。
- 共享 UI 与通用组件：按钮、Toggle、Toast、错误边界、空状态。
- Skill Library：列表、筛选、分页、批量、详情抽屉。
- Dashboard 仪表盘：扫描概览和指标。
- 编辑器工作区：Frontmatter、Markdown、预览、校验。
- AI 助手与 Diff 写回：AI Rail、Key 检查、流式生成、diff 采纳。
- 设置与偏好：主题、扫描、AI 厂商、预算、脱敏。
- 新建与预览流程：创建 Skill 和只读预览。
- 日志与依赖分析：调用日志、token、依赖关系。
- 前端状态与 Hooks：zustand 状态、键盘、拖拽、查询。
- 类型契约与命令边界：前后端数据形状、命令清单、契约测试。
- 国际化与旧版工作区兼容：i18n、旧版工作区、兼容测试。
- Tauri 命令层：命令注册、模型、应用版本。
- Skill 数据、扫描和版本历史：扫描、读写、备份、快照。
- 后端设置与文件监听：设置文件、默认目录、文件监听。
- 测试与视觉 QA：Vitest、Playwright、打包配置测试。
- 打包、迁移和本地更新：npm、Tauri、迁移包、本地更新脚本。
- 样式系统与视觉规范：token、全局样式、UI 规范。

## 代码文档情况

每个模块都有独立代码文档，命名格式为：

```text
<模块英文 id>-v3.8.1.md
```

改代码前执行：

1. 在 `docs/modules/source-file-index-v3.8.1.md` 搜索源码文件或关键词。
2. 打开对应模块文档。
3. 确认模块边界、源码路径、对外契约和修改规则。
4. 修改源码。

模块文档更新规则：

- 新增源码文件：必须更新源码文件索引和对应模块文档。
- 移动源码文件：必须更新源码文件索引和对应模块文档。
- 删除源码文件：必须更新源码文件索引和对应模块文档。
- 修改模块边界：必须更新模块文档。
- 修改对外契约：必须更新模块文档。
- 修改核心职责：必须更新模块文档。
- 普通源码内容修改导致行数变化时，不强制更新行数索引。
- 普通文案、小样式、测试修复、小 bug 修复：可在交付说明中写“本次不涉及模块文档更新”。

## Agent 分工

Codex 负责：

- 从 `main` 建立稳定实现分支
- 稳定代码集成
- 版本号升级和发布提交
- Tauri 后端命令
- 文件系统、Keychain、设置、扫描器、日志、版本历史
- `src/types/**` 类型契约
- 测试、构建、回归修复
- 按已验收的行为、视觉和状态契约完成稳定实现

WorkBuddy 负责：

- 高不确定性的 UI 探索
- 高不确定性的交互流程
- 动效方案和可验收原型
- 视觉 QA 截图
- 用户可见文案
- 体验评审记录

以下共享区域需要 Codex 评审后进入稳定线：

- `src/components/**`
- `src/hooks/**`
- `src/pages/**`
- `src/styles/**`

## WorkBuddy 到 Codex 的迁移标准

WorkBuddy 原型满足以下条件后，Codex 才能迁移：

- 有清晰功能名称。
- 有用户流程说明。
- 有修改文件清单。
- 有至少一张关键界面截图。
- 有已知缺口和风险说明。
- 有建议进入的稳定版本。
- 说明是否涉及数据写入、文件删除、批量操作、AI 写回。
- 说明需要迁移的代码片段或文件。
- 记录原型基线提交、原型提交和验收结论。
- 使用 `docs/templates/prototype-handoff.md`。

缺少以上信息时，Codex 先要求补齐交接材料。未经补齐，禁止迁移到 v3.8 稳定线。

“1:1 迁移”指行为、视觉、状态和验收结果一致。Codex 按当前稳定架构重新实现，原型文件结构不构成迁移约束。

## 原型查看规则

WorkBuddy 开发任何可见 UI 或交互原型后，必须提供可查看结果。

交付时必须包含：

```text
预览方式：
启动命令：
本地预览地址：
影响页面：
截图路径：
手动验收步骤：
已知问题：
是否建议进入 Codex 稳定线：
```

预览方式包括：

- 浏览器预览
- Tauri 桌面窗口预览
- Playwright 截图
- 手动截图

WorkBuddy 不能只交付代码说明。

涉及可见 UI 时，至少提供一张关键界面截图。

涉及交互流程时，必须写清楚从哪个页面开始、点击哪里、预期看到什么结果。

如果无法启动预览，必须说明：

```text
尝试运行的命令：
失败原因：
终端错误摘要：
当前阻塞点：
下一步建议：
```

用户不需要读代码。WorkBuddy 的原型必须能通过页面、截图或操作步骤验收。

## 开发流程

1. 每个任务只处理一个功能或一个修复。
2. 任务归类为产品澄清、探索原型、稳定实现、发布验收、仓库维护之一。
3. 使用 `docs/templates/task-card.md` 固定基线、范围、验收和风险。
4. 低不确定性任务由 Codex 直接实现。
5. 高不确定性 UI 或交互任务先由 WorkBuddy 制作原型。
6. Codex 检查交接材料并完成稳定实现。
7. 每个批次交付一个可验收结果，安排一个主要人工等待点。
8. 架构迁移需要先批准。
9. 每次稳定交付需要测试和提交。

## UI 标准

所有 UI 和交互工作遵守 `ui-style-guide.md`。

默认原则：

- 桌面生产力工具质感
- 控件紧凑
- 颜色使用 token
- 图标使用 Material Symbols
- 尺寸稳定
- 避免装饰性背景
- AI 写回前需要 diff 确认
- 图标控件需要可访问标签
- New Skill 保持次级入口
- Library 保持主入口

## 代码规则

- 优先沿用项目已有模式。
- 修改范围贴合当前任务。
- TypeScript 类型使用 `src/types/**`。
- Tauri 命令名需要记录在 `src/types/skill.ts`。
- 新增 Skill 字段、设置字段、Tauri 命令字段前，必须先说明字段名称、用途、默认值、迁移影响和兼容方案。
- API Key 通过后端 Keychain 命令存储。
- 前端状态库不得保存原始 API Key。
- 保留 Tauri API 的浏览器预览降级路径。
- 功能迁移期间避免大范围重构。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层负责组合交互，通用逻辑沉淀到模块内。

## 测试要求

WorkBuddy 原型验证：

- 至少运行 `npm run typecheck`，或说明无法运行的原因。
- 涉及可见 UI 时必须提供截图。
- 涉及交互流程时写清手动验收步骤。
- 原型阶段可以暂不跑完整测试，但交接材料要写明验证范围。

Codex 稳定验证：

前端稳定改动必须运行：

```bash
npm run typecheck
npm test
npm run build
```

涉及 Tauri、设置、文件系统、Keychain、扫描器、日志或版本时，追加运行：

```bash
npm run cargo:test
```

涉及可见 UI 时：

- 截取受影响路由或工作流的 Playwright 截图。
- 布局变化较大时检查 1024x768、1280x800、1440x960。

无法运行某项验证时，必须在交付说明中写明命令、失败原因和剩余风险。

## Git 规则

- 编辑前确认当前文件夹正确。
- 修改前运行 `pwd` 和 `git status --short --branch`。
- 未经明确批准，不得丢弃用户或其他 agent 的工作。
- Codex 稳定交付需要在验证后提交。
- 提交信息要具体，例如 `feat: release v3.8.2 ai settings`。

未经明确批准，禁止执行：

- `git reset --hard`
- `git clean -fd`
- `rm -rf`
- 强制覆盖未提交文件
- 删除未跟踪文件

## 发布规则

v3.8.x 发布需要更新：

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `src/packaging.config.test.ts`

随后运行：

```bash
npm test
npm run typecheck
npm run build
npm run cargo:test
```

## 交接格式

WorkBuddy 交给 Codex 时，需要包含：

- 功能名称
- 用户流程
- 修改文件
- 截图
- 已知缺口
- 建议进入的稳定版本
- 数据安全影响
- 验证范围

Codex 完成稳定集成时，需要包含：

- 版本号
- 提交哈希
- 已迁移功能概要
- 涉及模块
- 模块文档更新情况
- 验证命令和结果
- 可见 UI 变更的截图路径

## 每次交付说明格式

每次任务完成后必须包含：

```text
完成内容：
修改文件：
未修改范围：
验证结果：
截图路径：
模块文档更新：
已知问题：
下一步建议：
```

没有的项目写“无”。禁止只回复“已完成”。

## 文档追溯规则

Skill Panel 的开发文档总库位于：

```text
/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel
```

Git 仓库保存可执行事实、架构、任务、验证和发布证据。Obsidian 保存阅读入口、周度复盘和决策摘要。同步方向固定为 Git → Obsidian。

每次开发开始前读取：

- `PROJECT_STATE.md`
- `CURRENT-PLAN.md`
- 本文件
- 对应模块文档

每次开发结束后更新仓库：

- `PROJECT_STATE.md`：版本、分支、HEAD、工作区、完成内容和风险。
- `CURRENT-PLAN.md`：批次状态、commit、验证和已知问题。
- `delivery.md`：修改范围、测试、截图、数据安全和回退。
- `DEVELOPMENT-LOG.md`：完成批次、commit、验证、证据和回退点。

产品需求变化时更新 `PRD.md`，UI 决策变化时更新 `UI-SPECIFICATION.md`，发布状态变化时更新 `RELEASE-READINESS.md`。截图、测试报告和安装包保存在代码项目中，Obsidian 摘要只记录路径与 commit。Obsidian 内容不自动回写仓库。
