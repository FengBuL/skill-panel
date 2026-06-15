# Skill 面板项目计划

## 1. 项目目标

构建一个跨平台桌面应用 **Skill 面板**，用于统一查看、搜索、增加、编辑、删除本机已安装的 AI skills。

首版支持：

- Windows 和 macOS
- 中文 / 英文切换
- 手动扫描
- Skill 列表、详情、编辑、删除
- `.codex`、`.agents`、插件缓存目录的统一管理
- 每个开发板块独立会话、独立 worktree、独立审查记录

## 2. 技术方案

- 桌面框架：Tauri
- 前端：React + TypeScript
- 后端：Rust
- 国际化：`zh-CN` / `en-US`
- 测试：Rust 单元测试、React 组件测试、i18n key 完整性测试
- 打包：Windows 安装包、macOS 应用包

## 3. 核心功能

- 手动扫描 Skill
- 按来源筛选：Codex 用户目录、Agents 目录、系统 Skill、插件缓存、解析异常
- 搜索：名称、描述、路径
- 查看：名称、描述、来源、路径、修改时间、解析状态、Markdown 正文
- 管理：新建、编辑、保存、删除、打开目录
- 设置：语言切换、自定义扫描目录、平台默认路径展示

## 4. 跨平台路径

Windows 默认扫描：

- `%USERPROFILE%\.codex\skills`
- `%USERPROFILE%\.agents\skills`
- `%USERPROFILE%\.codex\plugins\cache\**\skills`

macOS 默认扫描：

- `~/.codex/skills`
- `~/.agents/skills`
- `~/.codex/plugins/cache/**/skills`

## 5. UI 结构

主界面采用三栏控制台：

- 左侧：来源筛选、状态筛选、设置入口、语言入口
- 中间：搜索框、筛选标签、Skill 列表
- 右侧：详情、元数据表单、Markdown 编辑区、操作按钮

中文按钮：

- `手动扫描`
- `新建 Skill`
- `保存修改`
- `删除 Skill`
- `打开目录`

英文按钮：

- `Scan`
- `New Skill`
- `Save Changes`
- `Delete Skill`
- `Open Folder`

## 6. 开发组织方式

当前会话作为主控会话，负责计划、追踪、汇总和审核。

每个板块单独开 Codex 会话：

- 板块会话内部使用 `superpowers:using-git-worktrees`
- 板块会话内部使用 `superpowers:subagent-driven-development`
- 每个板块会话内部创建 implementer、spec reviewer、code quality reviewer
- 主控会话不直接创建实现 subagent
- 每个板块完成后输出 commit、测试、审查结论，等待用户审核

## 7. Worktree 策略

集成分支：

- `codex/skill-panel-app`

板块分支：

- `codex/skill-panel-01-setup`
- `codex/skill-panel-02-architecture`
- `codex/skill-panel-03-backend-scan`
- `codex/skill-panel-04-backend-mutation`
- `codex/skill-panel-05-i18n`
- `codex/skill-panel-06-ui-shell`
- `codex/skill-panel-07-skill-list`
- `codex/skill-panel-08-skill-editor`
- `codex/skill-panel-09-settings`
- `codex/skill-panel-10-tests`
- `codex/skill-panel-11-packaging`

每个板块从最新的 `codex/skill-panel-app` 拉出。审核通过后，再合并回集成分支。

## 8. 会话拆分

总共 13 个会话：

- 1 个主控会话
- 11 个板块实现会话
- 1 个最终审查会话

板块会话：

1. 脚手架
2. 架构类型
3. 扫描后端
4. 文件操作
5. 国际化
6. UI 外壳
7. Skill 列表
8. 详情编辑
9. 设置页
10. 测试补强
11. 双平台打包

最终审查会话：

- 审查集成分支
- 检查需求覆盖
- 检查跨平台风险
- 检查 i18n 覆盖
- 检查测试缺口
- 输出发布建议

## 9. 每个板块完成标准

每个板块会话必须输出：

- worktree 路径
- 分支名
- commit hash
- 修改文件列表
- 测试命令
- 测试结果
- spec review 结论
- code quality review 结论
- 遗留风险

用户审核通过后，进入下一个板块。

## 10. 测试计划

Rust 测试：

- Skill 扫描
- 路径分类
- frontmatter 解析
- Skill 创建、读取、更新、删除
- 临时目录隔离测试

React 测试：

- 列表渲染
- 搜索
- 筛选
- 详情加载
- 编辑保存
- 删除确认
- 语言切换

i18n 测试：

- `zh-CN` 和 `en-US` key 完整
- 缺失 key 直接失败

打包检查：

- Windows Tauri build 配置
- macOS Tauri build 配置

## 11. 风险与约束

- 插件缓存 Skill 默认允许直接操作，存在改坏插件缓存的风险。
- 首版删除操作只做一次确认，不创建备份。
- macOS 发布给他人使用时需要考虑签名和 notarization。
- 当前仓库为空，需要先建立初始化提交。
- 所有开发必须发生在 worktree 中，避免污染主目录。

## 12. 里程碑

- M1：项目脚手架可启动
- M2：后端扫描和文件操作可用
- M3：中英文 UI 和三栏控制台完成
- M4：编辑、删除、设置页完成
- M5：测试补强完成
- M6：Windows/macOS 打包配置完成
- M7：最终审查通过，进入发布准备

## 13. 默认假设

- 使用同一套代码支持 Windows 和 macOS。
- 首版只做手动扫描。
- 首版支持中文和英文。
- 所有来源都可直接增删改。
- 主控会话只负责协调和审核。
- 每个开发板块都使用独立会话和独立 worktree。

## 14. 板块会话通用执行指令

每个新会话开头先粘贴本节，再补对应板块指令。

```text
你是 Skill 面板项目的独立板块开发会话。

必须遵守：
1. 使用 superpowers:using-git-worktrees，确认当前工作发生在独立 worktree。
2. 本会话内部使用 superpowers:subagent-driven-development。
3. 本会话内部可以创建 implementer、spec reviewer、code quality reviewer subagent。
4. 主控会话只做审核和追踪，本会话负责本板块实现、测试、提交和审查。
5. 完成后停止，输出 worktree 路径、分支名、commit hash、修改文件列表、测试命令与结果、spec review 结论、code quality review 结论、遗留风险。
6. 不要合并回集成分支，合并由主控会话和用户审核后处理。

开发约束：
- 应用使用 Tauri + React + TypeScript + Rust。
- 支持 Windows 和 macOS。
- 支持中文和英文切换。
- 所有 UI 文案必须走 i18n。
- 所有开发都基于最新的 codex/skill-panel-app。
```

## 15. 板块会话执行指令

### 01 脚手架

会话标题：`Skill 面板 - 01 脚手架`

```text
板块：项目脚手架
分支：codex/skill-panel-01-setup
目标：创建 Tauri + React + TypeScript + Rust 基础工程。

产出：
- 可启动的桌面应用空壳
- React 前端目录
- Tauri Rust 后端目录
- 基础 npm/cargo scripts
- 基础 README
- 基础测试命令可运行

完成后提交一个 commit。
```

### 02 架构类型

会话标题：`Skill 面板 - 02 架构类型`

```text
板块：架构与类型
分支：codex/skill-panel-02-architecture
目标：定义前后端共享的数据模型和 Tauri command 边界。

产出：
- SkillSummary
- SkillDetail
- AppSettings
- CreateSkillInput
- UpdateSkillInput
- SkillSource
- ParseStatus
- command 接口声明
- 类型测试或编译校验

完成后提交一个 commit。
```

### 03 扫描后端

会话标题：`Skill 面板 - 03 扫描后端`

```text
板块：Rust 扫描后端
分支：codex/skill-panel-03-backend-scan
目标：实现手动扫描 skill 的后端能力。

产出：
- Windows 默认扫描路径
- macOS 默认扫描路径
- 插件缓存递归扫描
- 来源分类
- SKILL.md 发现逻辑
- scan_skills command
- Rust 单元测试

完成后提交一个 commit。
```

### 04 文件操作

会话标题：`Skill 面板 - 04 文件操作`

```text
板块：Rust 文件操作
分支：codex/skill-panel-04-backend-mutation
目标：实现 skill 读取、新建、更新、删除、打开目录。

产出：
- read_skill
- create_skill
- update_skill
- delete_skill
- open_skill_folder
- frontmatter 解析与写回
- 临时目录测试覆盖增删改查

完成后提交一个 commit。
```

### 05 国际化

会话标题：`Skill 面板 - 05 国际化`

```text
板块：i18n
分支：codex/skill-panel-05-i18n
目标：实现中英文切换能力。

产出：
- zh-CN 字典
- en-US 字典
- 语言切换状态
- 跟随系统语言的默认策略
- 设置持久化接口预留
- 缺失翻译 key 测试

完成后提交一个 commit。
```

### 06 UI 外壳

会话标题：`Skill 面板 - 06 UI 外壳`

```text
板块：UI 外壳
分支：codex/skill-panel-06-ui-shell
目标：实现三栏管理控制台基础界面。

产出：
- 左侧来源导航
- 中间列表容器
- 右侧详情容器
- 顶部工具栏
- 语言切换入口
- 设置入口
- 响应式桌面窗口布局
- UI 基础测试

完成后提交一个 commit。
```

### 07 Skill 列表

会话标题：`Skill 面板 - 07 Skill 列表`

```text
板块：Skill 列表
分支：codex/skill-panel-07-skill-list
目标：实现 skill 列表、搜索和筛选。

产出：
- skill 表格或列表
- 搜索名称、描述、路径
- 来源筛选
- 状态筛选
- 空状态
- 异常状态
- 加载状态
- 列表交互测试

完成后提交一个 commit。
```

### 08 详情编辑

会话标题：`Skill 面板 - 08 详情编辑`

```text
板块：详情与编辑
分支：codex/skill-panel-08-skill-editor
目标：实现右侧详情、元数据表单和 Markdown 正文编辑。

产出：
- 名称字段
- 描述字段
- Markdown 正文编辑区
- 文件路径展示
- 解析状态展示
- 保存修改
- 删除 Skill 确认弹窗
- 打开目录按钮
- 编辑交互测试

完成后提交一个 commit。
```

### 09 设置页

会话标题：`Skill 面板 - 09 设置页`

```text
板块：设置页
分支：codex/skill-panel-09-settings
目标：实现应用设置。

产出：
- 语言设置
- 自定义扫描目录
- Windows/macOS 默认路径展示
- 设置读取与保存
- 设置页 UI 测试

完成后提交一个 commit。
```

### 10 测试补强

会话标题：`Skill 面板 - 10 测试补强`

```text
板块：测试补强
分支：codex/skill-panel-10-tests
目标：补齐核心自动化测试。

产出：
- Rust 扫描测试
- Rust 文件操作测试
- React 搜索筛选测试
- React 语言切换测试
- i18n key 完整性测试
- 测试命令文档

完成后提交一个 commit。
```

### 11 双平台打包

会话标题：`Skill 面板 - 11 双平台打包`

```text
板块：Windows/macOS 打包
分支：codex/skill-panel-11-packaging
目标：配置双平台 Tauri build。

产出：
- Windows 应用名称和打包配置
- macOS 应用名称和打包配置
- 图标占位或资源策略
- build 命令文档
- 本机可验证的打包配置检查

完成后提交一个 commit。
```

## 16. 最终审查会话执行指令

会话标题：`Skill 面板 - 12 最终审查`

```text
你是 Skill 面板项目的最终审查会话。

目标：
- 审查 codex/skill-panel-app 集成分支。
- 不实现新功能。
- 检查产品需求覆盖。
- 检查 Windows/macOS 跨平台风险。
- 检查 i18n 覆盖。
- 检查测试缺口。
- 检查文件操作危险点。
- 输出最终审查报告。

必须输出：
- 通过项
- 阻塞问题
- 非阻塞改进
- 建议发布前测试命令
- 是否建议进入打包发布
```

## 17. 体验修复变更计划

状态：已完成

提出日期：2026-06-12

变更来源：Windows 本机安装后人工验收反馈。

### 17.1 问题清单

1. Skill 列表中的描述字段过长时占用多行，影响扫描和选择效率。
2. 详情栏 Markdown 正文显示区域过小，长文档阅读困难。
3. Skill 列表缺少分页，数量较多时浏览压力过大。
4. Skill 列表路径和详情路径缺少点击跳转到文档目录的能力。
5. 上次扫描只显示占位状态，缺少具体日期时间；扫描状态缺少成功、失败、部分成功区分。
6. 左侧筛选中存在安装类问题筛选，Skill 作为本地文档时该筛选价值较低。
7. Agents 用户 Skill 在右侧详情中加载异常，元信息展示不完整。
8. 修改时间显示乱码或原始格式，可读性不足。
9. 窗口缩放时主版面尺寸没有随窗口变化，界面全屏后内容区域仍像固定宽度面板。

### 17.2 变更目标

- 列表保持紧凑，一页展示 10 个 Skill。
- 详情阅读区充分利用窗口高度，Markdown 正文默认延伸到应用底部。
- 路径文本具备可点击打开目录能力。
- 扫描状态具备明确结果：成功、失败、部分成功，并记录具体日期时间。
- 左侧筛选回归来源导航和扫描状态展示，移除低价值筛选区。
- Agents 用户 Skill 与 Codex 用户 Skill 使用同一套详情读取和元信息展示路径。
- 修改时间按当前语言格式化为可读日期时间。
- 主布局随窗口宽高变化，列表区和详情区同步伸缩。

### 17.3 板块归属与会话安排

本轮修复拆成 4 个子会话，每个子会话从最新 `codex/skill-panel-app` 拉出独立 worktree。

1. 会话 18：列表密度、分页与左侧筛选清理
   - 分支：`codex/skill-panel-18-list-pagination`
   - 溯源板块：07 Skill 列表、06 UI 外壳
   - 覆盖问题：1、3、6

2. 会话 19：详情阅读区与路径跳转
   - 分支：`codex/skill-panel-19-detail-reading-paths`
   - 溯源板块：08 详情编辑、04 文件操作
   - 覆盖问题：2、4

3. 会话 20：扫描状态、时间格式与 Agents 详情修复
   - 分支：`codex/skill-panel-20-scan-time-agents`
   - 溯源板块：03 扫描后端、04 文件操作、08 详情编辑
   - 覆盖问题：5、7、8

4. 会话 21：响应式窗口布局验收
   - 分支：`codex/skill-panel-21-responsive-layout`
   - 溯源板块：06 UI 外壳、10 测试补强
   - 覆盖问题：9，并回归 1、2、3 的布局影响

### 17.4 预期修改文件

- `src/App.tsx`：列表分页、路径点击、扫描状态、详情加载、时间格式、布局状态。
- `src/styles.css`：两行截断、详情区高度、Markdown 编辑区高度、响应式三栏布局、分页控件样式。
- `src/i18n/resources.ts`：分页、扫描状态、日期时间、路径打开提示等中英文文案。
- `src/App.test.tsx`：列表分页、左侧筛选移除、扫描状态、路径点击、Agents 详情加载、时间格式测试。
- `src/App.editor.test.tsx`：详情描述和 Markdown 区域行为测试。
- `src-tauri/src/skill_scanner.rs`：扫描结果状态需要后端支持时更新扫描摘要模型。
- `src-tauri/src/skill_store.rs`：Agents 用户路径详情读取失败时修复路径授权或来源识别。
- `src-tauri/tests/skill_contract.rs`：若模型增加扫描摘要字段，同步合同测试。

### 17.5 验收标准

- 列表描述最多显示两行，详情描述完整展示。
- 列表每页固定 10 条，支持上一页、下一页、当前页和总页数展示；搜索或筛选变化后回到第 1 页。
- 列表路径和详情路径点击后调用 `open_skill_folder`，可打开对应 `SKILL.md` 所在目录。
- 上次扫描显示具体日期和时间，扫描状态显示成功、失败或部分成功。
- 左侧筛选区移除安装问题相关入口，保留来源导航和扫描状态。
- Agents 用户 Skill 可以加载详情、描述、Markdown、来源、修改时间和路径。
- 修改时间使用 `zh-CN` 或 `en-US` 的本地化日期时间格式。
- 窗口放大缩小时，三栏布局、列表高度和详情高度随窗口变化；主内容不保持固定小面板。

### 17.6 测试要求

每个子会话至少运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run packaging:check
git diff --check
```

涉及 Rust 后端变更的子会话还需要运行：

```powershell
npm.cmd run cargo:test
```

最终集成后需要运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

### 17.7 用户审核点

用户审核通过本计划后，主控会话再溯源对应历史会话和分支，按 18 到 21 的顺序派发子会话执行。每个子会话完成后必须推送到 GitHub，并备注本次更新内容。

### 17.8 完成留痕

完成日期：2026-06-12

已完成并推送的模块分支：

1. 会话 18：列表密度、分页与左侧筛选清理
   - 分支：`codex/skill-panel-18-list-pagination`
   - Commit：`18918d8 fix: improve skill list pagination and filters`
   - 更新：列表描述两行截断、每页 10 个 Skill、上一页/下一页分页、移除左侧低价值筛选区。

2. 会话 19：详情阅读区与路径跳转
   - 分支：`codex/skill-panel-19-detail-reading-paths`
   - Commit：`4c8df98 fix: expand details reading area and clickable paths`
   - 更新：列表路径和详情路径可点击打开目录，Markdown 正文区域随详情栏伸展。

3. 会话 20：扫描状态、时间格式与 Agents 详情修复
   - 分支：`codex/skill-panel-20-scan-time-agents`
   - Commit：`a51b042 fix: show scan status times and agents details`
   - 更新：上次扫描显示具体日期时间，扫描状态支持成功、失败、部分成功，修改时间本地化格式展示，Agents 用户 Skill 详情读取增加回归测试。

4. 会话 21：响应式窗口布局验收
   - 分支：`codex/skill-panel-21-responsive-layout`
   - Commit：`f49ecec fix: make desktop layout responsive`
   - 更新：主窗口和三栏布局去除固定宽度限制，列表区域和详情区域随窗口尺寸伸缩。

集成分支：

- `codex/skill-panel-app`
- 最新功能 Commit：`f49ecec fix: make desktop layout responsive`

本地验证：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

验证结果：

- 前端测试：6 个 test files、58 个 tests 通过。
- Rust 测试：30 个 lib/bin tests 和 3 个 contract tests 通过。
- TypeScript 类型检查通过。
- Vite 生产构建通过。
- Packaging 配置检查通过。
- Windows NSIS 安装包重新生成。
- `git diff --check` 通过。

GitHub Actions：

- Workflow：`Desktop Build`
- Run：`27422880664`
- URL：`https://github.com/FengBuL/skill-panel/actions/runs/27422880664`
- Commit：`f49ecece97150f1ec95466e342450a295788c229`
- 结论：`success`
- Artifact：`skill-panel-windows-nsis`、`skill-panel-macos`

## 18. 整体 UI 重设计变更计划

状态：待用户审核后执行

提出日期：2026-06-13

变更来源：用户人工验收反馈，当前整体 UI 观感不够好，需要重新设计软件界面。

### 18.1 设计目标

- 将 Skill 面板调整为更像桌面工作台的专业工具界面，适合长期查看、搜索、编辑本地 Skill 文档。
- 保留当前已完成的功能能力：分页、路径跳转、扫描状态、Agents 详情加载、响应式布局、中英文切换。
- 降低界面中的厚重边框和重复卡片感，使用清晰的层级、紧凑表格、柔和分隔线和稳定的状态色。
- 让 Windows 与 macOS 两个平台都保持一致的信息架构，并预留平台原生窗口尺寸差异。
- 全部 UI 文案继续走 i18n，中文与英文都必须在相同布局中可读。

### 18.2 推荐使用的 UI Skill 和工具

- `superpowers:brainstorming`：用于 UI 方向探索、设计假设、用户审核前的方案收敛。
- `imagegen`：用于生成中文 UI 草图和高保真视觉参考图。
- `superpowers:writing-plans`：用于把 UI 重设计拆成可执行、可审核、可追溯的计划。
- `superpowers:using-git-worktrees`：每个实现会话必须创建或确认独立 worktree。
- `superpowers:subagent-driven-development`：每个实现会话内部使用 implementer、spec reviewer、code quality reviewer。
- `superpowers:test-driven-development`：涉及交互、布局状态、i18n 文案时先补测试或更新快照式行为测试。
- `playwright` 或 `browser:control-in-app-browser`：用于实现后做桌面宽屏、窄屏、缩放状态的截图验收。
- `superpowers:verification-before-completion`：每个分支完成前必须运行验证命令并记录结果。

### 18.3 新 UI 信息架构

主界面采用桌面工作台结构：

```text
┌────────────────────────────────────────────────────────────────────┐
│ Skill Panel        扫描成功 · 2026-06-13 15:42    重新扫描 新建 中/EN │
├──────────────┬──────────────────────────────────────┬──────────────┤
│ 全部 Skill   │ 搜索名称、描述、路径      来源筛选      │ 详情          │
│ Codex        │                                      │ 来源/状态      │
│ Agents       │ 名称   来源   描述   修改时间   路径   │ 修改时间       │
│ 插件 Skill   │ ───────────────────────────────────  │ 路径           │
│ 自定义目录   │ 代码审查助手  Codex  两行描述...        │              │
│              │ 需求分析Agent Agents 两行描述...       │ 描述           │
│ 存储位置     │ 接口文档生成器 插件Skill 两行描述...    │ 完整描述展示    │
│              │                                      │              │
│              │              第 1 / 6 页              │ 预览 / 编辑     │
│              │                                      │ Markdown 正文  │
│              │                                      │              │
│              │                                      │ 打开目录 保存 删除│
└──────────────┴──────────────────────────────────────┴──────────────┘
```

### 18.4 视觉方向

- 背景：浅灰白应用背景，减少页面漂浮感。
- 表面：主内容使用白色和浅灰分区，卡片圆角不超过 8px。
- 分隔：优先使用细分隔线和留白，减少大面积描边。
- 选中态：列表选中行使用浅蓝底、左侧强调线或细描边。
- 状态色：成功使用绿色，失败使用红色，部分成功使用橙色，普通信息使用蓝色。
- 字体层级：顶部标题紧凑，表格和详情使用桌面工具尺寸，避免过大的营销式标题。
- 图标：按钮和导航优先使用 lucide 图标，中文标签用于关键命令和导航识别。

建议设计 token：

```css
--bg-app: #f6f7f9;
--surface: #ffffff;
--surface-muted: #f1f4f6;
--border: #d8dee4;
--text: #111827;
--muted: #64748b;
--accent: #2563eb;
--success: #067647;
--warning: #b54708;
--danger: #b42318;
```

### 18.5 模块拆分与溯源

本轮 UI 重设计拆成 6 个子会话，每个子会话从最新 `codex/skill-panel-app` 拉出独立 worktree。每个子会话完成后都需要推送到 GitHub，并备注本次更新内容。

1. 会话 23：UI 设计系统与样式 token
   - 分支：`codex/skill-panel-23-ui-design-system`
   - 溯源板块：06 UI 外壳、05 国际化
   - 目标：建立新的颜色、间距、字体层级、按钮、状态 chip、表格基础样式。
   - 预期文件：`src/styles.css`、`src/i18n/resources.ts`、`src/App.test.tsx`

2. 会话 24：顶部命令栏重设计
   - 分支：`codex/skill-panel-24-top-command-bar`
   - 溯源板块：06 UI 外壳、05 国际化
   - 目标：重构顶部区域为紧凑命令栏，包含产品名、扫描状态、重新扫描、新建 Skill、语言切换、设置入口。
   - 预期文件：`src/App.tsx`、`src/styles.css`、`src/i18n/resources.ts`、`src/App.test.tsx`

3. 会话 25：左侧来源导航重设计
   - 分支：`codex/skill-panel-25-source-rail`
   - 溯源板块：06 UI 外壳、07 Skill 列表、09 设置页
   - 目标：将左侧区域调整为来源导航栏，展示全部 Skill、Codex、Agents、插件 Skill、自定义目录和数量。
   - 预期文件：`src/App.tsx`、`src/styles.css`、`src/i18n/resources.ts`、`src/App.test.tsx`

4. 会话 26：Skill 列表视觉重设计
   - 分支：`codex/skill-panel-26-skill-list-visuals`
   - 溯源板块：07 Skill 列表
   - 目标：把中间列表调整为高密度资源表格，优化搜索栏、来源筛选、分页、选中行、两行描述和路径点击。
   - 预期文件：`src/App.tsx`、`src/styles.css`、`src/App.test.tsx`

5. 会话 27：详情 Inspector 重设计
   - 分支：`codex/skill-panel-27-detail-inspector`
   - 溯源板块：08 详情编辑、04 文件操作
   - 目标：重构右侧详情为 Inspector，包含元信息、完整描述、Markdown 预览 / 编辑区域和底部操作栏。
   - 预期文件：`src/App.tsx`、`src/styles.css`、`src/i18n/resources.ts`、`src/App.editor.test.tsx`

6. 会话 28：响应式与视觉验收
   - 分支：`codex/skill-panel-28-responsive-visual-qa`
   - 溯源板块：06 UI 外壳、10 测试补强、11 双平台打包
   - 目标：回归 Windows/macOS 窗口宽度、全屏、缩放状态，补充视觉验收记录。
   - 预期文件：`src/styles.css`、`src/App.test.tsx`、`docs/final-review.md`

### 18.6 子会话通用执行要求

每个 UI 重设计子会话开头先粘贴本节，再粘贴对应会话指令。

```text
你是 Skill 面板 UI 重设计的独立板块开发会话。

必须遵守：
1. 使用 superpowers:using-git-worktrees，确认当前工作发生在独立 worktree。
2. 本会话内部使用 superpowers:subagent-driven-development。
3. 本会话内部可以创建 implementer、spec reviewer、code quality reviewer subagent。
4. 主控会话只做审核和追踪，本会话负责本板块实现、测试、提交、推送和审查。
5. 完成后停止，输出 worktree 路径、分支名、commit hash、GitHub 推送结果、修改文件列表、测试命令与结果、spec review 结论、code quality review 结论、遗留风险。
6. 不要合并回集成分支，合并由主控会话和用户审核后处理。

开发约束：
- 应用使用 Tauri + React + TypeScript + Rust。
- 支持 Windows 和 macOS。
- 支持中文和英文切换。
- 所有 UI 文案必须走 i18n。
- 保留既有功能：分页、路径跳转、扫描状态、Agents 详情加载、响应式布局。
- 所有开发都基于最新的 codex/skill-panel-app。
- 每个分支完成后必须推送到 GitHub 仓库 skill-panel。
```

### 18.7 子会话执行指令

#### 23 UI 设计系统与样式 token

会话标题：`Skill 面板 - 23 UI 设计系统`

```text
板块：UI 设计系统与样式 token
分支：codex/skill-panel-23-ui-design-system
目标：建立 Skill 面板新版桌面工作台视觉基础。

产出：
- 新的 CSS 变量：背景、表面、边框、文本、弱文本、强调色、成功、警告、危险。
- 统一按钮、图标按钮、状态 chip、表格、路径按钮、分页控件基础视觉。
- 卡片圆角不超过 8px。
- 避免单一灰蓝观感，状态色具备清晰区分。
- 保持中英文 UI 文案可读。
- 更新或补充必要测试。

完成后提交一个 commit 并推送分支。
```

#### 24 顶部命令栏重设计

会话标题：`Skill 面板 - 24 顶部命令栏`

```text
板块：顶部命令栏重设计
分支：codex/skill-panel-24-top-command-bar
目标：把顶部区域调整为紧凑、清晰、桌面工具风格的命令栏。

产出：
- 左侧展示 Skill Panel 产品名。
- 中间或右侧展示扫描状态 chip：成功、失败、部分成功、未扫描、扫描中。
- 右侧提供重新扫描、新建 Skill、语言切换、设置入口。
- 中文和英文布局都不能挤压或换行错乱。
- 顶部命令栏随窗口宽度伸缩。
- 更新或补充必要测试。

完成后提交一个 commit 并推送分支。
```

#### 25 左侧来源导航重设计

会话标题：`Skill 面板 - 25 左侧来源导航`

```text
板块：左侧来源导航重设计
分支：codex/skill-panel-25-source-rail
目标：把左侧区域调整为来源导航栏，提升扫描来源识别和选择效率。

产出：
- 导航项：全部 Skill、Codex、Agents、插件 Skill、自定义目录。
- 每个导航项显示数量。
- 当前选中来源具备清晰选中态。
- 保留扫描摘要和存储位置入口。
- 删除无效或低价值筛选控件。
- 更新或补充必要测试。

完成后提交一个 commit 并推送分支。
```

#### 26 Skill 列表视觉重设计

会话标题：`Skill 面板 - 26 Skill 列表视觉`

```text
板块：Skill 列表视觉重设计
分支：codex/skill-panel-26-skill-list-visuals
目标：把中间列表调整为高密度、可扫描、可分页的资源表格。

产出：
- 搜索框位于列表工具栏，提示文案支持中文和英文。
- 来源筛选使用轻量 chip 或 segmented control。
- 表格列保留名称、来源、描述、修改时间、路径。
- 描述最多两行。
- 路径可点击打开目录。
- 分页控件清晰展示当前页和总页数。
- 选中行具备清晰视觉反馈。
- 更新或补充必要测试。

完成后提交一个 commit 并推送分支。
```

#### 27 详情 Inspector 重设计

会话标题：`Skill 面板 - 27 详情 Inspector`

```text
板块：详情 Inspector 重设计
分支：codex/skill-panel-27-detail-inspector
目标：把右侧详情调整为适合阅读和编辑长 Skill 文档的 Inspector。

产出：
- 顶部显示 Skill 名称和关键状态。
- 元信息区展示来源、状态、修改时间、路径。
- 路径可点击打开目录。
- 描述区完整展示，不限制两行。
- Markdown 区域支持预览 / 编辑切换或保留编辑区并优化阅读高度。
- 正文区域默认延伸到详情栏底部。
- 底部操作区包含打开目录、保存更改、删除。
- 更新或补充必要测试。

完成后提交一个 commit 并推送分支。
```

#### 28 响应式与视觉验收

会话标题：`Skill 面板 - 28 响应式视觉验收`

```text
板块：响应式与视觉验收
分支：codex/skill-panel-28-responsive-visual-qa
目标：验证新版 UI 在 Windows/macOS 目标窗口尺寸下可用、稳定、好看。

产出：
- 验收 1440x960、1280x800、1024x768 三种窗口尺寸。
- 验收中文和英文两种语言。
- 验收扫描成功、失败、部分成功、空列表、选中详情、长 Markdown 文档。
- 使用 Playwright 或 Browser 生成截图记录，记录到最终审查文档。
- 修复发现的布局溢出、文字挤压、按钮换行、详情区高度不足。
- 更新最终视觉验收结论。

完成后提交一个 commit 并推送分支。
```

### 18.8 验收标准

- 新版 UI 看起来是专业桌面工具，信息密度高但不拥挤。
- 顶部命令栏、左侧来源导航、中间列表、右侧详情层级清晰。
- 列表仍然一页 10 个 Skill，描述最多两行，路径可点击。
- 详情描述完整展示，Markdown 正文区域可阅读长文档。
- 扫描状态显示具体时间和成功、失败、部分成功。
- Agents 用户 Skill 详情正常加载。
- 修改时间保持本地化可读格式。
- 窗口缩放时三栏布局随尺寸变化，内容不固定在小面板中。
- 中文和英文切换后没有明显溢出、遮挡、错位。
- Windows 本机可运行，macOS GitHub Actions 打包继续通过。

### 18.9 测试要求

每个子会话至少运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run packaging:check
git diff --check
```

最终集成后需要运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

### 18.10 用户审核点

1. 用户审核本 UI 重设计计划和草图方向。
2. 主控会话创建并展示 23 到 28 的子会话。
3. 每个子会话独立使用 worktree 和内部 subagent。
4. 每个子会话完成后推送到 GitHub，并在主控会话中记录更新内容。
5. 用户审核每个子会话输出后，主控会话再合并回 `codex/skill-panel-app`。
6. 全部合并后运行最终验证并更新完成留痕。

### 18.11 实施留痕

状态：当前 UI 重设计批次已完成

实施日期：2026-06-13

子会话状态：

- 23 到 28 子会话已创建并展示；线程运行器返回 `systemError`，主控会话保留这些会话作为溯源入口，并在对应 worktree 中继续推进代码。

已完成并推送的模块分支：

1. 会话 23：UI 设计系统与工作台基础
   - Worktree：`C:\Users\12925\.codex\worktrees\2eae\skill面板`
   - 分支：`codex/skill-panel-23-ui-design-system`
   - Commit：`e45ca73 style: redesign ui workbench foundation`
   - 更新：新增工作台视觉 token、顶部扫描状态 chip、左侧自定义来源入口、列表选中态、状态色、路径按钮视觉、响应式三栏布局基础。
   - 推送：已推送到 GitHub。

2. 会话 27：详情 Inspector 重设计
   - Worktree：`C:\Users\12925\.codex\worktrees\4fc9\skill面板`
   - 分支：`codex/skill-panel-27-detail-inspector`
   - Commit：`89f4bed feat: redesign detail inspector`
   - 更新：详情描述改为完整多行编辑区，Markdown 正文增加预览 / 编辑切换，正文区域继续延伸到详情栏底部。
   - 推送：已推送到 GitHub。

3. 会话 28：响应式与打开验收
   - 分支：集成分支 `codex/skill-panel-app`
   - 更新：完成 Windows 本机运行验证，确认新版 UI 可正常打开、扫描成功并显示真实 Skill 列表。
   - 说明：会话 28 的独立线程同样返回 `systemError`，验收由主控会话在集成分支完成。

集成分支：

- `codex/skill-panel-app`
- UI 工作台基础合并 Commit：`4d72c16 merge: ui workbench foundation`
- 详情 Inspector 合并 Commit：`2f1476d merge: detail inspector redesign`
- 推送：已推送到 GitHub。

本地验证：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

验证结果：

- 前端测试：6 个 test files、58 个 tests 通过。
- TypeScript 类型检查通过。
- Vite 生产构建通过。
- Packaging 配置检查通过。
- Rust 测试：30 个 lib/bin tests 和 3 个 contract tests 通过。
- Windows NSIS 安装包重新生成。
- 本地浏览器渲染检查：`http://127.0.0.1:1420/` 返回 200，并生成截图 `ui-redesign-actual.png`。
- Tauri Windows 可执行文件已构建：`src-tauri\target\release\skill-panel.exe`。
- 用户级安装路径已更新：`C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
- 开始菜单快捷方式已更新：`C:\Users\12925\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Skill Panel.lnk`。
- 软件已正常启动，进程路径：`C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
- 软件窗口标题：`Skill Panel`。
- 桌面截图确认：新版 UI 已显示真实 Skill 列表、扫描成功状态、顶部命令栏、左侧来源导航、中间列表和右侧详情区。

覆盖说明：

- 会话 24 顶部命令栏、会话 25 左侧来源导航、会话 26 Skill 列表视觉的主要目标已合并到会话 23 的工作台基础实现中完成。
- 会话 27 详情 Inspector 作为独立分支完成。
- 会话 28 Windows 本机打开验收由主控会话完成。
## 19. UI 1:1 对齐纠偏计划

日期：2026-06-13

背景：用户审核新版 UI 后指出，已安装版本没有按第 18 节设计方案 1:1 落地。主控会话复盘确认，上一轮 24、25、26 的独立 UI 子会话没有正常完成，相关目标被压缩进 23 的工作台基础实现，导致顶部命令栏、左侧导航、列表表格、详情 Inspector 与视觉验收都缺少逐项可追溯验收。

### 19.1 根因记录

1. 上一轮 23-28 子会话多数进入 `systemError` 或 `notLoaded`，没有形成可审查的子会话输出。
2. 24 顶部命令栏、25 左侧来源导航、26 列表视觉被主控会话合并执行，缺少独立板块验收。
3. `src/App.tsx` 仍偏单体实现，UI 组件边界和验收点不够清晰。
4. 没有建立“设计方案逐条对照”的截图和 checklist。
5. 本地安装曾指向旧版 Program Files 路径，造成用户打开后仍看到旧版 UI；该安装路径问题已单独修复。

### 19.2 子会话健康检查

已执行两次健康检查：

1. 试运行线程 `019ebf4b-fed6-7363-ad0c-51b29f45aa46`
   - worktree：`C:\Users\12925\.codex\worktrees\8e95\skill面板`
   - 结果：`systemError`
   - 结论：指定模型和较复杂启动参数时存在失败风险。

2. 试运行线程 `019ebf4d-b7ca-73e0-928d-8199e00c8c44`
   - worktree：`C:\Users\12925\.codex\worktrees\b72a\skill面板`
   - 结果：线程正常运行并输出 `STATUS BLOCKED`
   - 阻塞原因：worktree 中缺少 `node_modules`，`tsc` / `vitest` 不可用。
   - 结论：子会话执行器正常；正式 UI 子会话需要先执行 `npm.cmd install` 或 `npm.cmd ci`。

3. local 健康检查线程 `019ebf4e-27b3-76e1-beba-da2c9a9829f2`
   - cwd：`C:\Users\12925\Documents\skill面板`
   - 结果：`STATUS READY`
   - 结论：项目线程本身可正常执行。

### 19.3 新的 1:1 对齐子会话

本轮拆分为 5 个子会话。每个子会话都使用独立 worktree，从 `codex/skill-panel-app` 当前 HEAD 开始，完成后必须提交、推送到 GitHub 仓库 `skill-panel`，并在报告中注明本次更新内容。

1. 会话 29：顶部命令栏 1:1 对齐
   - 分支：`codex/skill-panel-29-top-command-bar-alignment`
   - 目标：左侧产品名、中央扫描状态、右侧重新扫描 / 新建 Skill / 语言切换 / 设置，整体紧凑且随窗口伸缩。
   - 验收：中英文都不挤压，扫描状态包含成功、失败、部分成功、未扫描、扫描中。

2. 会话 30：左侧来源导航 1:1 对齐
   - 分支：`codex/skill-panel-30-source-rail-icons-storage`
   - 目标：使用图标、名称、数量展示全部 Skill、Codex、Agents、插件 Skill、自定义目录，底部展示当前存储位置。
   - 验收：删除低价值筛选控件，保留来源选择、数量和存储位置入口。

3. 会话 31：资源表格列表 1:1 对齐
   - 分支：`codex/skill-panel-31-resource-table-alignment`
   - 目标：中间列表是资源表格，一页 10 个，描述最多两行，路径可点击，选中行淡蓝底和细描边。
   - 验收：分页、搜索、路径跳转、修改时间本地化格式全部可用。

4. 会话 32：详情 Inspector 1:1 对齐
   - 分支：`codex/skill-panel-32-detail-inspector-alignment`
   - 目标：顶部元信息、完整描述、Markdown 预览 / 编辑区域，正文区域默认撑到底部，底部操作区清晰。
   - 验收：长 Skill 文档可读，Agents 用户 Skill 能正常展示元信息和正文。

5. 会话 33：视觉 QA 与截图验收
   - 分支：`codex/skill-panel-33-visual-qa-screenshots`
   - 目标：按第 18 节和第 19 节逐项截图验收，覆盖中文、英文、常见窗口尺寸、长文档、空列表、扫描状态。
   - 验收：生成截图和 checklist，修复发现的布局溢出、按钮换行、详情区高度不足。

### 19.4 正式子会话通用指令补充

每个正式 UI 子会话启动后先执行：

```powershell
git status --short --branch
npm.cmd install
```

随后执行实现、测试、提交和推送。完成前至少运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run packaging:check
git diff --check
```

会话 33 还需要运行浏览器或 Tauri 视觉验收，并保存截图记录。

### 19.5 执行结果与留痕

日期：2026-06-13

1. 会话 29 顶部命令栏
   - 原会话：`019ebf54-1054-7651-aeed-403ac2631d66`
   - 收尾重试：`019ebf5e-7deb-7063-a903-c0624d369592`、`019ebf62-6b3e-7cf3-bda7-afcbe27eaa12`、`019ebf64-28db-7303-94a8-8ee974727fd1`
   - 结果：原会话留下实现改动，多个收尾线程在调度层进入 `systemError` 或长时间无正文输出；主控会话接管验证、提交和推送。
   - commit：`41d713a Align top command bar`
   - 推送：`origin/codex/skill-panel-29-top-command-bar-alignment` 成功。
   - 验证：`npm.cmd test` 60 tests passed，`npm.cmd run typecheck` passed，`npm.cmd run packaging:check` 4 tests passed，`git diff --check` exit 0。

2. 会话 30 左侧来源导航
   - 线程：`019ebf54-105d-73d3-9673-a71c7122c906`
   - commit：`a6822ce Align source rail navigation`
   - 推送：`origin/codex/skill-panel-30-source-rail-icons-storage` 成功。
   - 内容：来源导航图标、名称、数量、存储位置入口；删除列表筛选控件。

3. 会话 31 资源表格
   - 线程：`019ebf54-103a-7041-b0bb-f3fb694449bd`
   - commit：`6dd15c7 Align resource table layout`
   - 推送：`origin/codex/skill-panel-31-resource-table-alignment` 成功。
   - 内容：资源表格列、描述两行截断、选中行淡蓝底和细描边、测试辅助声明。

4. 会话 32 详情 Inspector
   - 线程：`019ebf54-103a-7041-b0bb-f4093f56d65a`
   - commit：`fce2162 Align detail inspector layout`
   - 推送：`origin/codex/skill-panel-32-detail-inspector-alignment` 成功。
   - 内容：详情元信息、完整描述、Markdown 区域撑到底部、Agents 用户 Skill 详情测试。

5. 会话 33 视觉 QA
   - 线程：`019ebf54-8436-78a0-b7a6-075d8e9fb50f`
   - commit：`458c7a1 test: add visual qa screenshots`
   - 推送：GitHub HTTPS 443 连接超时 / reset，三次子会话 push 和一次主控 push 均失败；本地分支和提交已保留。
   - 内容：`npm.cmd run visual:qa`、`scripts/visual-qa.mjs`、`docs/visual-qa-checklist.md`、`output/playwright/visual-qa-report.json`、6 张截图。

6. 主控集成结果
   - 集成分支：`codex/skill-panel-app`
   - 合并顺序：29、30、31、32、33。
   - 冲突处理：30 合并时 `src/App.test.tsx` 测试冲突，保留 29 顶部栏测试和 30 来源导航测试；集成测试中将旧状态列断言更新为顶部部分成功状态断言。
   - 集成 UI 修复：1024 宽度下顶部扫描状态 chip 改为提前两行布局，避免英文日期被截断。
   - 最终视觉 QA：`npm.cmd run visual:qa` passed，报告时间 `2026-06-13T05:23:56.243Z`，6 个场景全部 passed。

### 19.6 子会话续作审计

日期：2026-06-13

用户要求：各 UI 子会话继续完成自己的任务，主控会话负责调度、轮询、记录和最终集成验证。

续作结果：

1. 会话 29 顶部命令栏
   - 审计线程：`019ec046-2974-7b81-a7b5-5158f0390b0d`
   - worktree：`C:\Users\12925\.codex\worktrees\4b1d\skill面板`
   - 分支：`codex/skill-panel-29-top-command-bar-alignment`
   - commit：`41d713abde8612620801c57f95d7f11a919d881f`
   - 推送：远端 `origin/codex/skill-panel-29-top-command-bar-alignment` 已指向同一 commit，`git remote show origin` 显示 push 状态为 up to date。
   - 验证：`npm.cmd test` 6 files / 60 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run packaging:check` 1 file / 4 tests passed；`git diff --check` passed。
   - 结论：子会话审计 DONE，仍由主控集成到 `codex/skill-panel-app`。

2. 会话 30 左侧来源导航
   - 续作线程：`019ebf54-105d-73d3-9673-a71c7122c906`
   - worktree：`C:\Users\12925\.codex\worktrees\3ea4\skill面板`
   - 分支：`codex/skill-panel-30-source-rail-icons-storage`
   - commit：`a6822cebb9ccbc0bc7ae0324387630c7a405c373`
   - 推送：HTTPS origin 返回 `Everything up-to-date`。
   - 验证：`npm.cmd test` 6 files / 58 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run packaging:check` 1 file / 4 tests passed；`git diff --check` passed。
   - 结论：子会话续作 DONE。

3. 会话 31 资源表格列表
   - 续作线程：`019ebf54-103a-7041-b0bb-f3fb694449bd`
   - worktree：`C:\Users\12925\.codex\worktrees\7061\skill面板`
   - 分支：`codex/skill-panel-31-resource-table-alignment`
   - commit：`6dd15c7db88ad5fbc624e1aa9e168eb4b7299274`
   - 推送：远端分支已存在并指向同一 commit。
   - 验证：`npm.cmd test` 6 files / 60 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run packaging:check` 1 file / 4 tests passed；`git diff --check` passed。
   - 结论：子会话续作 DONE。

4. 会话 32 详情 Inspector
   - 续作线程：`019ebf54-103a-7041-b0bb-f4093f56d65a`
   - worktree：`C:\Users\12925\.codex\worktrees\3a9f\skill面板`
   - 分支：`codex/skill-panel-32-detail-inspector-alignment`
   - commit：`fce21626217c77531b50e5307ff59ec69f659402`
   - 推送：远端分支已存在并指向同一 commit。
   - 验证：`npm.cmd test` 6 files / 59 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run packaging:check` 1 file / 4 tests passed；`git diff --check` passed。
   - 结论：子会话续作 DONE。

5. 会话 33 视觉 QA 与截图验收
   - 原续作线程：`019ebf54-8436-78a0-b7a6-075d8e9fb50f`
   - 收尾审计线程：`019ec04a-9062-7490-8a32-d11c52b74c12`
   - worktree：`C:\Users\12925\.codex\worktrees\b0ec\skill面板`
   - 分支：`codex/skill-panel-33-visual-qa-screenshots`
   - commit：`458c7a19d7abb564308ac0e05ddae9c487ea5c16`
   - 推送：原续作线程复查时 HTTPS 推送已成功；主控只读检查显示本地分支正在跟踪 `origin/codex/skill-panel-33-visual-qa-screenshots`。
   - 验证：原续作线程复跑 `npm.cmd run visual:qa` passed；`npm.cmd test` 6 files / 58 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run build` passed；`npm.cmd run packaging:check` passed；`git diff --check` exit 0。
   - 收尾审计：线程 `019ec04a-9062-7490-8a32-d11c52b74c12` 确认复跑 `visual:qa` 只刷新 `generatedAt` 和 PNG byte sizes，已恢复 `output/playwright` 到 `HEAD`。
   - 收尾验证：`npm.cmd run visual:qa` exit 0；`git diff --check` exit 0；`git status --short --branch` clean；分支继续跟踪远端同名分支。
   - 结论：子会话 33 收尾 DONE。最终实时远端复查遇到 GitHub 443 连接超时，但线程开头已确认远端 ref 指向 `458c7a19d7abb564308ac0e05ddae9c487ea5c16`。

主控处理原则：

- 主控不直接改写 29-33 worktree 的实现内容，只做读取、记录、集成分支验证和项目计划留痕。
- 每个子会话的分支推送结果需要在报告中写清楚；网络异常或线程无响应需保留为可追溯记录。
- 集成分支 `codex/skill-panel-app` 每次完成阶段性记录后继续运行本地验证，并尝试推送到 GitHub 仓库 `skill-panel`。

### 19.7 主控集成分支推送记录

日期：2026-06-13

本次主控提交：

- 分支：`codex/skill-panel-app`
- commit：`15f0482 docs: record ui subthread continuation audit`
- 内容：记录 29-33 子会话续作审计、推送状态、验证结果和 33 视觉 QA 收尾风险。
- 本地验证：`git diff --check` exit 0；提交后 `git status --short --branch` 显示工作区干净、分支 ahead 12。

追加提交：

- commit：`bd6a2c6 docs: record integration push blocker`
- 内容：记录主控集成分支推送失败、HTTPS 443 网络错误、SSH publickey 错误和连通性检查结果。

推送尝试：

1. `git push origin codex/skill-panel-app`
   - 结果：失败。
   - 错误：`Failed to connect to github.com port 443 after 21114 ms: Could not connect to server`。

2. `git push git@github.com:FengBuL/skill-panel.git codex/skill-panel-app`
   - 结果：失败。
   - 错误：`Permission denied (publickey)`。

3. `Test-NetConnection github.com -Port 443`
   - 结果：`PingSucceeded: True`，`TcpTestSucceeded: False`。

4. `git ls-remote origin -h refs/heads/codex/skill-panel-app`
   - 结果：失败。
   - 错误：`Recv failure: Connection was reset`。

结论：本地集成分支提交已完成，GitHub 推送当前被网络 443 连接失败和本机 SSH key 未配置阻塞。恢复网络或配置 GitHub SSH key 后，需要继续推送 `codex/skill-panel-app`。

### 20. 更新编号索引

日期：2026-06-13

为满足后续追溯要求，新增独立编号台账：

- 文件：`docs/update-log.md`
- 编号范围：`U001` 到 `U019`
- 覆盖内容：会话 29-33 的 feature 分支更新、主控集成提交、视觉 QA 留痕、推送阻塞记录、桌面最新版安装同步、桌面应用启动验证、集成分支远端同步成功、本地最终完成审计与台账收口、Windows 黑色控制台窗口修复。
- 后续要求：任何 UI、打包、安装、推送或验收变更都继续按 `U020`、`U021` 递增编号，并在台账中写明分支、commit、内容、验证和推送状态。

## 21. v2.0.0 迁移版方案、更新计划与迭代情况

日期：2026-06-16

状态：已完成本机更新、迁移包生成、GitHub Release 更新；待在另一台电脑上做实际安装验收。

### 21.1 背景

用户确认本地应用需要迁移到另一台电脑继续使用。迁移目标包含三类内容：

1. 应用程序本体：Windows 安装器和可直接运行的便携 exe。
2. 应用配置：语言、扫描目录、类目颜色、skill 自定义标签。
3. 本机 skill 数据：`%USERPROFILE%\.codex\skills` 和 `%USERPROFILE%\.agents\skills`。

上一轮 v2.0.0 已完成 Stitch 风格 UI 重构、左侧类目筛选、类目颜色、自定义标签、详情编辑状态控制、底部分页固定、语言切换简化和 GitHub Release 发布。本轮把这些更新整理为可迁移方案，并补齐配置持久化。

### 21.2 更新方案

本轮方案分为五个部分：

1. 配置模型扩展
   - `AppSettings` 增加 `categoryColors` 和 `skillTags`。
   - 旧版 `settings.json` 缺少新字段时继续按默认值读取。
   - Windows PowerShell 写出的 UTF-8 BOM 配置文件可被 Rust 设置读取层兼容。

2. UI 自定义状态持久化
   - 左侧类目右键改色后写入 `settings.json`。
   - skill 卡片右键添加自定义标签后写入 `settings.json`。
   - 设置页保存时保留当前类目颜色和标签数据。

3. 迁移包生成
   - 新增 `scripts/create-migration-package.ps1`。
   - 生成 `output/migration/Skill-Panel-v2.0.0-migration.zip`。
   - 包含安装器、便携 exe、当前配置、迁移指南和本机 skill 目录。

4. 文档补齐
   - 新增 `docs/migration-guide-v2.md`。
   - README 增加迁移包生成命令。
   - `output/migration/` 加入 `.gitignore`，避免本机个人 skill 包进入仓库。

5. 发布同步
   - 集成分支 `codex/skill-panel-app` 推送到 GitHub。
   - `v2.0.0` tag 更新到最新提交。
   - GitHub Release 中的 Windows 安装器覆盖为最新构建。

### 21.3 更新计划

本轮计划按以下顺序执行：

1. 确认当前本机运行版本和安装入口。
2. 复查 v2.0.0 UI 功能和迁移相关文件边界。
3. 扩展 `AppSettings`，让类目颜色和自定义标签可迁移。
4. 补齐前端保存逻辑和单元测试。
5. 补齐 Rust 设置兼容测试，覆盖 UTF-8 BOM 配置。
6. 生成 Windows NSIS 安装包。
7. 生成迁移 zip，并确认包内核心文件存在。
8. 将最新 release exe 覆盖到本机实际启动目录。
9. 提交、推送、更新 `v2.0.0` Release 资产。
10. 更新方案、更新计划和迭代记录。

### 21.4 已完成迭代

1. v2.0.0 UI 迭代
   - commit：`860db8b release: v2.0.0 skill panel ui`
   - 内容：Stitch 风格 UI、类目筛选、类目颜色、标签类目、固定分页、详情预览/编辑状态、语言切换简化。
   - 发布：`v2.0.0` Release 创建并上传 Windows 安装器。

2. 本机启动入口修正
   - 发现运行入口仍指向 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
   - 将 `skill-panel.exe` 和 `skill-panel-latest.exe` 覆盖为 v2.0.0 release 构建。
   - 运行验证：进程路径为 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`，版本为 `2.0.0`。

3. 迁移设置持久化
   - commit：`ef051f8 fix: make v2 migration settings portable`
   - 内容：类目颜色和 skill 标签写入 `settings.json`，旧配置兼容，UTF-8 BOM 兼容。
   - 设置位置：`%USERPROFILE%\.codex\skill-panel\settings.json`。

4. 迁移包生成
   - 本地包：`C:\Users\12925\Documents\skill面板\output\migration\Skill-Panel-v2.0.0-migration.zip`
   - 包大小：`5870902` bytes。
   - 核心内容：`app/Skill Panel_2.0.0_x64-setup.exe`、`portable/skill-panel.exe`、`config/settings.json`、`skills/.codex/skills`、`skills/.agents/skills`、`README-MIGRATION.md`。

5. GitHub 同步
   - 分支：`codex/skill-panel-app`
   - 最新提交：`ef051f8`
   - Release：`https://github.com/FengBuL/skill-panel/releases/tag/v2.0.0`
   - 资产：`Skill.Panel_2.0.0_x64-setup.exe`，大小 `1950208` bytes。

### 21.5 验证结果

已完成验证命令：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
powershell -ExecutionPolicy Bypass -File scripts\create-migration-package.ps1
```

验证结果：

- 前端测试：6 files / 71 tests passed。
- TypeScript：`tsc --noEmit` passed。
- Vite 构建：passed。
- Rust 测试：31 lib/bin tests + 3 contract tests passed。
- Windows NSIS 打包：生成 `Skill Panel_2.0.0_x64-setup.exe`。
- 迁移包：生成 `Skill-Panel-v2.0.0-migration.zip`。
- 本机运行：`skill-panel.exe` 版本 `2.0.0`，路径为 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。

### 21.6 后续迁移验收计划

目标电脑迁移时按以下步骤验收：

1. 解压 `Skill-Panel-v2.0.0-migration.zip`。
2. 运行 `app/Skill Panel_2.0.0_x64-setup.exe`。
3. 将 `config/settings.json` 复制到 `%USERPROFILE%\.codex\skill-panel\settings.json`。
4. 将 `skills/.codex/skills` 复制到 `%USERPROFILE%\.codex\skills`。
5. 将 `skills/.agents/skills` 复制到 `%USERPROFILE%\.agents\skills`。
6. 启动 Skill Panel 并点击重新扫描。
7. 核对 skill 数量、类目颜色、自定义标签、语言、详情编辑状态和分页行为。
8. 如 `settings.json` 中存在旧电脑绝对路径，在设置页改为新电脑目录。

### 21.7 下一轮可选迭代

1. 应用内增加“导出迁移包”入口。
2. 应用内增加“导入配置和 skill 目录”入口。
3. 增加安装身份统一策略，减少 `Skill Panel` 与 `SkillPanelUX` 双路径共存造成的启动混淆。
4. 增加设置文件 schemaVersion，便于后续配置迁移。
5. 增加标签删除、标签改色和标签重命名能力。
