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

状态：待用户审核

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
