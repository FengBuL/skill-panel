---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
更新时间: 2026-07-17
---

# 开发日志

## 2026-07-16 REL-3.8.3-CANDIDATE-MACOS

### 范围

- 生成 v3.8.3 macOS 单平台候选。
- Windows 候选和 Windows 验证延期。
- 保留 v3.8.2 历史归档、tag 和安装包，不重建、不替换。

### 开工检查

- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 工作区起始状态：干净。
- 最近历史 HEAD：`53e7ed3 docs: close v3.8.2 release evidence`
- 起始包版本：npm `3.8.2`，Tauri `3.8.2`，Cargo `3.8.2`。

### 修改内容

- npm、Tauri、Cargo、Cargo.lock 包版本更新为 `3.8.3`。
- 打包配置测试新增 Cargo manifest 版本一致性断言，并改为 v3.8.3 macOS 候选口径。
- 新增发布任务状态、发布就绪、SOP、SOP mindmap、第 8 步准备材料和候选 manifest。

### 验证

| 命令 | 结果 |
|---|---|
| `npm test` | 通过；10 个测试文件，67 个测试用例 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| `npm run packaging:check` | 通过；1 个测试文件，6 个测试用例 |
| `npm run cargo:test` | 通过；lib 54 项，bin 0 项，integration 4 项 |
| `npm run visual:qa` | 通过 |
| `npm run git:diff:check` | 候选提交前通过；文档收口后再次通过 |

### 候选证据

- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 候选记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`
- 候选 App bundle：`output/releases/v3.8.3-candidate/Skill Panel.app`
- 候选 App Zip：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip`
- 候选 App Zip SHA256：`023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e`
- 候选 DMG：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`
- 候选 DMG SHA256：`7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`
- 构建命令：`PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- macOS 架构：`arm64`
- bundle id：`com.fengbul.skillpanel`
- 应用版本：`3.8.3`

### 构建备注

- 首次运行 `npm run tauri:build:macos` 因当前 shell `PATH` 找不到 `cargo metadata` 失败。
- 加入 `PATH="$HOME/.cargo/bin:$PATH"` 后构建成功。
- 候选包只有 ad-hoc/linker-signed 签名，DMG 没有公证票据。

### 回退点

- Git 回退点：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 第 8 步安装基线：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- 基线 SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

## 2026-07-16 REL-3.8.3-L3-REAL-DATA-PAGE-01 更正记录

### 触发原因

- 用户在第 8 步安装验收发现 v3.8.3 候选安装版显示虚拟 Skill 数据。
- Library 只显示少量 Skill，缺少分页，超过 100 个 Skill 时无法访问剩余内容。
- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。

### 更正决定

- 第 8 步标记为“验证失败”。
- 原候选目录 `output/releases/v3.8.3-candidate/`、App Zip、DMG 和 SHA256 保留。
- 禁止创建 tag、正式发布或覆盖失败候选包。
- 修复批次继续使用版本 `3.8.3`，新候选目录为 `output/releases/v3.8.3-candidate-2/`。

### 修复范围

- `scanSkills()` 不再在生产扫描失败时返回内置 demo Skill。
- Library 增加扫描失败、空结果和显式 demo 状态。
- Library 增加真实分页，默认每页 6 个，搜索、筛选和分类先完成后分页。
- 文件监听重扫失败时保留当前真实数据并显示失败提示。
- Dashboard、Detail、Editor、Dependencies、ValidationResult、AI Assistant 已审计虚构数据来源。

## 2026-07-17 REL-3.8.3-L3-CANDIDATE-2-8B 启动记录

### 8A 人工验收

- 用户确认 candidate-2 安装版能够加载本机真实 Skill。
- 用户确认没有显示固定演示 Skill。
- 用户确认 Library 分页正常，超过 100 个 Skill 可以进入中间页和最后一页。
- 用户确认搜索、筛选和页码重置正常。
- 用户确认 Library → Detail → Editor → Detail → Library 流程正常。
- 用户反馈暂未发现新的 8A 问题。
- 8A 结论：人工验收通过。

### 8B 输入

- 任务编号：`REL-3.8.3-L3-CANDIDATE-2-8B`。
- 当前 HEAD：`57b29aeef5149e109ac016375968416c65e880cb`。
- candidate-2 DMG：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg`。
- candidate-2 SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- v3.8.2 基线 DMG：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`。
- v3.8.2 SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- 8B 当前状态：待开始第一阶段安全备份。
- 数据保护要求：不移动、不删除原文件；不读取或输出 API Key、Token 或真实 Skill 内容；如需创建测试 Skill，需先征得用户确认并使用名称 `skill-panel-l3-upgrade-test`。
- 发布限制：签名、公证和 Windows 相关阻塞仍存在；未解决前禁止正式 tag 和发布。

## 2026-07-18 REL-3.8.3-L3-CANDIDATE-2-8B 验证记录

### 安装序列

- 建立应用数据、偏好文件、未提交文档和 Git 回退分支备份。
- 从 v3.8.2 DMG 安装并启动基线。
- 从 candidate-2 DMG 升级到 v3.8.3。
- 从 v3.8.2 DMG 完成安装包回退。
- 用户确认后重新安装 candidate-2，最终版本为 `3.8.3`。

### 数据与界面证据

- `settings.json` SHA256 全程保持 `c7b887458ed8fd4f31342f90facf6c2c8b237646b188ae70e1131d67b238fdb6`。
- `~/.codex/skills` 的 12 个 `SKILL.md` 数量与组合 SHA256 保持一致。
- `~/.agents/skills` 的 216 个 `SKILL.md` 数量与组合 SHA256 保持一致。
- candidate-2 显示 120 个真实 Skill、20 页分页和末页 `115–120 / 120`。
- 证据目录：`output/releases/v3.8.3-candidate-2/8b-evidence/`。

### 结论

- candidate-2 8B 安装、升级、回退和数据保留验证通过。
- macOS Developer ID 签名、公证、Gatekeeper 完整验证和 Windows 验证仍为发布阻塞项。

## 2026-07-18 REL-3.8.3-GOVERNANCE 启动记录

### 已完成

- 建立本地保护分支并备份设置、审计记录、应用包、截图和未提交改动。
- 完成 candidate-2 8B，证据提交为 `2046733`。
- 建立并推送 `main`，GitHub 默认分支已切换为 `main`。
- 规范仓库目录确认为 `/Users/shovy/Documents/skill-panel`。
- 修复 Obsidian 项目路径，自动化改为 Git → Obsidian 单向摘要并保持暂停。

### 当前批次

- 分支：`codex/repository-governance`
- main 基线：`15a67962e4bf6f65c74720af794c3e2fb9a7d9d6`
- 范围：治理规则、自动检查、架构说明、任务模板、旧入口清理、文档收口和维护。
- 首要检查：`npm run repo:doctor`

### 旧入口清理

- AppShell 实现从 `src/AppShell.tsx` 收敛到 `src/layout/AppShell.tsx`。
- 删除无生产和测试引用的 `src/SkillPanelWorkspace.tsx`。
- 保留覆盖当前导航和编辑流程的 `src/App.test.tsx` 与 `src/App.editor.test.tsx`。
- `repo:doctor` 增加历史源码回流检查。
- 模块索引已更新为当前应用壳、国际化和测试职责。
- 验证结果：前端 86 项、打包 6 项、Rust lib 56 项、Rust integration 4 项、视觉 QA 17 个场景全部通过。

### 文档收口

- PRD 和 UI 规范已导入 `docs/product/`，Git 成为产品规格权威来源。
- Obsidian `skill panel/` 中 11 份治理前副本已移动到 `归档/2026-07-18治理前/`。
- Obsidian 活动项目目录只保留 `Git状态摘要.md`，日常总结保留阅读入口、SOP 和复盘。
- 同步自动化只允许 Git → `Git状态摘要.md`，继续保持暂停。
- `repo:doctor` 已覆盖活动产品文档、旧稳定分支和旧固定 worktree 路径。

### 维护收口

- `git worktree prune` 已移除 `skill-panel-ci-fix` 和 `skill-panel-workbuddy-v3.9` 两条失效登记。
- 已停止旧 WorkBuddy 原型 HTTP 服务和旧截图 headless Chrome 进程。
- 历史 `skill-panel-v3-integration` 工作区干净且无编译进程，`cargo clean` 删除 7961 个文件并释放 2.6 GiB。
- Remembering Conversations 工具已按 lockfile 安装依赖，`better-sqlite3` 内存查询通过，数据库与模板测试 13 项通过。
- 该工具 npm 审计报告 2 项 moderate、6 项 high、2 项 critical，上游升级留作独立兼容性任务。
- `~/.codex/logs_2.sqlite` quick check 通过，122347 个空闲页约 478 MiB；两个活动 Codex 进程持有数据库，本批次不执行在线压缩。

### CI 首轮修复

- PR #2 的 macOS 与 Windows 首轮均在 `repo:doctor` 失败。
- 原因：Actions 默认浅克隆没有 `origin/main` 引用，祖先检查缺少必要 Git 历史。
- 修复：checkout 设置 `fetch-depth: 0`，保留 `HEAD` 必须派生自 `origin/main` 的门禁。

### CI 第二轮修复

- macOS 完整 CI 与 App/DMG 打包通过，用时 4 分 21 秒。
- Windows 在 `npm run cargo:test` 失败，原因是 package script 使用 POSIX `export`。
- 新增 Node 跨平台 Cargo 启动器与 3 项平台选择测试，Windows 从 PATH 调用 Cargo，macOS 优先使用 rustup Cargo。
- 第三轮 Windows 在前端平台测试失败：Windows runner 的 `path.join` 改写了模拟 macOS 路径。
- 非 Windows Cargo 路径改用 `path.posix.join`，测试结果不再受执行主机路径格式影响。

### 最终合并

- PR：`#2 chore: establish Skill Panel repository governance`。
- 第四轮 CI：macOS App/DMG 5 分 28 秒通过；Windows NSIS 8 分 20 秒通过。
- 合并提交：`d56fbaa4f7d78a170e31ad9da8d01ef659626ea1`。
- `main` 保护：要求 PR、Windows NSIS、macOS App/DMG 和对话解决；管理员受同一规则约束；禁止强推与分支删除。
- 已删除远端治理分支、已合并本地分支和 `skill-panel-codex-v3.8` worktree。

## 2026-07-18 DOC-STRUCTURE-01 项目接手结构整理

### 目标

- 明确当前开发版本、最新正式版本和每个历史阶段的文件归属。
- 让新同事从仓库 README 和 Obsidian 项目总览直接接手。
- 保持应用源码、发布产物和用户数据不受目录整理影响。

### Git 目录

- 根目录收敛为项目入口、当前状态、当前计划、Agent 规则、源码和工程配置。
- 现行产品、架构、流程、质量和任务模板进入 `docs/current/`。
- v2.0.0、v2.0.1、v3.0.0、v3.7.x、v3.8.1、v3.8.2 和 v3.8.3 历史资料进入 `docs/versions/`。
- 治理前 Obsidian 副本进入 `docs/archive/obsidian-pre-governance/`。
- 视觉 QA 证据从 `output/playwright/` 迁移至 `output/qa/v3.8.3/`。
- 建立 `docs/README.md`、`docs/current/README.md`、`docs/versions/README.md` 和 `output/README.md`。

### Obsidian 目录

- 建立 `00-Skill-Panel项目总览.md` 单一阅读入口。
- 活动资料分为 `01-现行开发`、`02-复盘` 和 `03-开发方法`。
- 七份主要规则和版本地图继续由 Git 单向同步。
- 旧项目副本、旧发布流程副本和历史审计材料退出 Obsidian 活动目录。
- 同步自动化已更新目标路径和文件映射，状态保持暂停。

### 验证

- `npm run repo:doctor`：通过。
- 前端测试：12 个文件、89 项通过。
- typecheck 和生产构建：通过。
- 打包配置：6 项通过。
- Rust：lib 56 项、integration 4 项通过。
- 视觉 QA：17 个场景通过，报告位于 `output/qa/v3.8.3/visual-qa-report.json`。
- Obsidian 七份镜像与 Git 源逐字一致；18 份现行 Markdown 本地链接全部有效。

### 合并

- 整理提交：`d69f710`。
- PR：`#4 docs: 按版本整理项目接手结构`。
- macOS App/DMG CI：6 分 19 秒通过。
- Windows NSIS CI：10 分 33 秒通过。
- main 合并提交：`2529c67`。

## 2026-07-19 REL-3.8.3-SOURCE-RELEASE 启动记录

### 发布决策

- v3.8.3 采用开源源码正式发布口径。
- 公开 GitHub 仓库源码、annotated tag `v3.8.3` 和 GitHub Release 构成正式发布结果。
- macOS ARM App/DMG 作为未签名、未公证 Preview 提供，并明确 Gatekeeper 风险。
- Windows NSIS 只在 CI 构建成功时作为未验收 Preview 保留。
- Apple 证书、公证凭据和 Windows 人工设备不阻塞源码、tag 和 GitHub Release。
- 本任务不处理或索取证书、密钥和 secrets。

### 启动基线

- 分支：`codex/rel-3.8.3-source-release`。
- main 基线：`f23ef8dcc4eb63c80e4508c9afb3e348a7d707b3`。
- 工作区启动状态：干净。
- `npm run repo:doctor`：通过。
- 应用版本：npm、Tauri、Cargo 均为 `3.8.3`。
- 当前机器代码签名 identity：`0 valid identities found`，记录为 macOS Preview 限制。

### 本地验证与最终产物

- 发布内容提交：`1e38b0d6c41960a315b2e5fbd330e0b85678b265`。
- `npm run repo:doctor`：通过。
- `npm test`：12 个文件、89 项通过。
- `npm run typecheck`、`npm run build` 和 `npm run git:diff:check`：通过。
- `npm run packaging:check`：6 项通过。
- `npm run cargo:test`：Rust lib 56 项、integration 4 项通过。
- `npm run visual:qa`：17 个场景通过，报告为 `output/qa/v3.8.3/visual-qa-report.json`。
- macOS ARM App/DMG 构建完成；DMG 可只读挂载，版本为 `3.8.3`，bundle id 为 `com.fengbul.skillpanel`，架构为 `arm64`。
- 临时 `HOME` 启动烟测中进程保持运行 5 秒。
- App 只有 ad-hoc 签名，严格签名校验失败；没有公证票据。该结果符合未签名、未公证 Preview 声明。
- 源码归档 SHA256：`969b0a6c0410af08c93f40e1a225801f913a92bb107ea4da5f1263490ec0e846`。
- rollback bundle SHA256：`6f44879c4e11ce1af66dbda6f53fdf55771d898463c449d6e8c23cb2708c0159`，`git bundle verify` 通过。
- App Preview SHA256：`3fb0a5b4dd486573129768e1bdf26a0b5924fb321b0f0ce51ca83fce8ffd2afb`。
- DMG Preview SHA256：`ed2b73c66cf1bd178f2d55e2b8f349379d5625e5cf2f80bf221e8d6e3b89be94`。
- 最终 tag 会落在受保护 `main` 的发布 PR 合并提交；GitHub 自动源码归档以该 tag 为准。

### PR 首轮 CI

- PR：`#6 release: publish Skill Panel v3.8.3 source release`。
- GitHub Actions run：`29652247904`。
- macOS App/DMG：5 分 55 秒通过。
- Windows NSIS：10 分 49 秒通过。
- Windows artifact id：`8431901676`，原始文件为 `Skill Panel_3.8.3_x64-setup.exe`。
- 发布附件重命名为 `Skill Panel_3.8.3_x64-setup-unverified-preview.exe`。
- Windows Preview SHA256：`b0f71d3c34759a06607e8c8aacdfb5f42747f01eec43d866a20fdc9ccb01c13b`。
- Windows 结果只证明 CI 构建成功，不包含人工安装、Credential Store、系统废纸篓、升级和回退验收。
- Actions 报告 Node.js 20 弃用提示，job 自动使用 Node.js 24 执行；提示未影响本次结果，后续作为 workflow 维护项处理。

### PR 第二轮 CI 与测试隔离修复

- 第二轮 run：`29652676732`。
- macOS 在 Rust 测试 `append_audit_log_accepts_json_detail` 失败，其余 55 项通过。
- 根因：该测试没有取得 HOME 环境锁，并行用例会临时改写 HOME 并删除测试目录。
- 修复：用例改用独立临时 HOME、共享锁和明确错误信息；生产审计命令没有变化。
- 本地 `npm run cargo:test`：56 个 lib 测试和 4 个 integration 测试通过。
- 两个审计日志用例以 16 个测试线程重复执行 5 轮，5/5 通过。
- 第二轮 Windows job 已取消，最终头提交重新执行双平台 CI。
