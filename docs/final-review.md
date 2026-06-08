# Skill 面板最终审查报告

状态：BLOCKED

审查对象：`codex/skill-panel-app` 集成分支
审查基线：`e0c34b8 chore: configure desktop packaging`
审查 worktree：`C:\Users\12925\.codex\worktrees\13fb\skill面板`
审查分支：`codex/skill-panel-12-final-review`
审查日期：2026-06-08

## 结论

当前代码已经具备可运行的 Tauri + React + TypeScript + Rust 基础、手动扫描、列表搜索筛选、详情编辑删除、设置面板、i18n 字典和打包配置检查。前端测试、类型检查、生产构建和打包配置检查通过。

发布前仍有阻塞项：新建 Skill 的 UI 流程未接入，扫描出的自定义目录 Skill 无法继续读取或管理，本机 Rust stable toolchain manifest 缺失导致 Rust 测试和 Tauri build 无法完成。当前不建议进入打包发布。

## 通过项

- 独立 worktree 已确认：`GIT_DIR` 指向主仓库 `.git/worktrees/skill面板12`，分支为 `codex/skill-panel-12-final-review`，HEAD 为 `e0c34b8`。
- 前端自动化验证通过：`npm.cmd test` 为 6 个 test files、42 个 tests 全部通过。
- TypeScript 验证通过：`npm.cmd run typecheck` 成功。
- 前端生产构建通过：`npm.cmd run build` 生成 `dist/index.html`、CSS 和 JS 产物。
- 打包配置检查通过：`npm.cmd run packaging:check` 为 1 个 test file、4 个 tests 全部通过。
- 空白字符检查通过：`git diff --check` 无输出。
- 默认扫描路径覆盖 Windows/macOS 的 `.codex/skills`、`.agents/skills`，并递归发现 `.codex/plugins/cache/**/skills`，见 `src-tauri/src/skill_scanner.rs:49`、`src-tauri/src/skill_scanner.rs:56`、`src-tauri/src/skill_scanner.rs:64`。
- 插件缓存扫描包含最大深度限制并跳过 symlink 目录，降低递归失控风险，见 `src-tauri/src/skill_scanner.rs:10`、`src-tauri/src/skill_scanner.rs:70`、`src-tauri/src/skill_scanner.rs:89`。
- 文件操作边界包含 allowed roots 校验、`SKILL.md` 文件名校验、删除目录根保护，见 `src-tauri/src/skill_store.rs:43`、`src-tauri/src/skill_store.rs:57`、`src-tauri/src/skill_store.rs:134`、`src-tauri/src/skill_store.rs:140`。
- i18n 字典覆盖 `zh-CN` 和 `en-US`，并有 key 完整性与 placeholder 对齐测试，见 `src/i18n.test.ts:14`、`src/i18n.test.ts:24`。
- 打包配置声明 Windows `nsis`/`msi` 与 macOS `app`/`dmg`，见 `src-tauri/tauri.conf.json:26`、`src-tauri/tauri.conf.json:28`。

## 阻塞问题

1. 新建 Skill 流程未实现。
   - 计划要求支持“新建 Skill”，后端 command 和前端类型已声明，见 `src/types/skill.ts:61`、`src/types/skill.ts:75`。
   - 顶栏 `新建 Skill` 按钮没有 `onClick`，当前只渲染按钮，见 `src/App.tsx:352`。
   - `src/App.tsx` 没有调用 `create_skill`。用户无法从 UI 完成新增 Skill。

2. 自定义扫描目录的 Skill 可以被扫描，后续读取、编辑、删除、打开目录会被后端拒绝。
   - 扫描命令会加载设置并合并 `custom_scan_directories`，见 `src-tauri/src/commands.rs:14`、`src-tauri/src/skill_scanner.rs:32`、`src-tauri/src/skill_scanner.rs:41`。
   - 读取、新建、更新、删除、打开目录均调用 `default_allowed_roots()`，该函数只返回默认扫描根，见 `src-tauri/src/skill_store.rs:21`、`src-tauri/src/skill_store.rs:25`、`src-tauri/src/skill_store.rs:29`、`src-tauri/src/skill_store.rs:33`、`src-tauri/src/skill_store.rs:37`、`src-tauri/src/skill_store.rs:492`。
   - 结果是设置面板保存的自定义目录能进入列表，选中详情或管理操作会命中 “outside the allowed skill roots”。这会破坏“自定义扫描目录”和“统一管理”的核心路径。

3. Rust/Tauri 本机发布验证被工具链 manifest 问题阻塞。
   - `npm.cmd run cargo:test` 失败在 `rustc -vV`，错误为 `Missing manifest in toolchain 'stable-x86_64-pc-windows-msvc'`。
   - `rustup show` 与 `rustc -Vv` 同样失败，`cargo -V` 可输出 `cargo 1.96.0 (30a34c682 2026-05-25)`。
   - `npm.cmd run tauri:build` 触发 `@tauri-apps/cli` Rust interface panic：`crates\tauri-cli\src\interface\rust.rs:1149:14 called Option::unwrap() on a None value`。
   - 影响：Rust 单元测试、Tauri 桌面构建、Windows/macOS bundle 产物在当前机器上均未验证。

## 非阻塞改进

- 设置页默认路径展示只列出 `.codex/skills` 与 `.agents/skills`，未展示插件缓存通配路径；计划中的默认扫描路径包含 `.codex/plugins/cache/**/skills`，见 `src/App.tsx:43`。
- 左侧来源导航只提供全部、Codex、Agents、插件缓存，`custom`、`system`、`unknown` 只能通过列表区下拉筛选，见 `src/App.tsx:34`、`src/App.tsx:519`。
- 左侧 `可写`、`有问题` 等筛选按钮目前没有事件处理；状态筛选下拉可用，按钮仍容易给用户造成可点击预期。
- 插件缓存 Skill 允许被直接更新和删除，删除流程只有一次确认且无备份。计划中已列为风险，发布前建议至少提供更醒目的风险提示或备份策略。
- macOS 配置开启 `hardenedRuntime`，发布给其他用户仍需要签名和 notarization 流程确认，见 `src-tauri/tauri.conf.json:42`。
- `bundle.icon` 当前为空，README 记录了图标生成策略。正式品牌发布前需要补齐图标资源，见 `src-tauri/tauri.conf.json:29`、`README.md:97`。
- 当前自动化覆盖主要是前端组件、i18n、配置和 Rust 单元测试设计；还缺少真实 Tauri 桌面 smoke test、跨平台文件路径手动测试、Windows 安装包与 macOS app/dmg 实测。

## 规格审查结论

- 已满足：技术栈、手动扫描、默认路径扫描、列表搜索筛选、详情读取展示、编辑保存、删除确认、打开目录、语言切换、设置保存、i18n key 完整性测试、Windows/macOS 打包配置检查。
- 存在缺口：新建 Skill UI 流程、自定义扫描目录后续管理、插件缓存默认路径展示、部分左侧筛选按钮交互。
- 发布建议：当前不建议进入打包发布。应先补齐阻塞问题，并在修复 Rust toolchain 后重新执行 Rust 测试与 Tauri build。

## 代码质量审查结论

- 整体结构清晰，前后端模型命名一致，Tauri command 边界明确，i18n runtime 处理了系统语言和持久化失败场景。
- 文件操作的 allowed roots 校验和删除根保护值得保留；`remove_dir_all` 仅在 canonical skill 目录通过校验后执行。
- 主要质量风险集中在设置读取路径和 mutation allowed roots 的不一致：扫描用用户设置，mutation 用默认根。这是当前最需要修复的后端契约问题。
- Tauri build 的 CLI panic 源于 Rust toolchain manifest 缺失触发的环境状态，仍建议在工具链修复后关注是否仍有 Tauri CLI panic。

## 建议发布前测试命令

```powershell
npm.cmd install
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
git diff --check
rustup show
rustc -Vv
npm.cmd run cargo:test
npm.cmd run tauri:build
npm.cmd run tauri:build:windows
npm.cmd run tauri:build:macos
```

## 本次验证结果

| 命令 | 结果 |
| --- | --- |
| `npm.cmd install` | 通过，新增本地依赖，0 vulnerabilities |
| `npm.cmd test` | 通过，6 files / 42 tests |
| `npm.cmd run typecheck` | 通过 |
| `npm.cmd run build` | 通过 |
| `npm.cmd run packaging:check` | 通过，1 file / 4 tests |
| `git diff --check` | 通过 |
| `npm.cmd run cargo:test` | 失败，stable Rust toolchain manifest 缺失 |
| `npm.cmd run tauri:build` | 失败，Tauri CLI Rust interface panic |
| `rustup show` | 失败，stable Rust toolchain manifest 缺失 |
| `rustc -Vv` | 失败，stable Rust toolchain manifest 缺失 |
| `cargo -V` | 通过，`cargo 1.96.0 (30a34c682 2026-05-25)` |

## 当前 Rust toolchain manifest 风险与影响

当前机器的 `stable-x86_64-pc-windows-msvc` toolchain manifest 缺失，导致依赖 `rustc -vV` 的命令在编译前失败。Tauri CLI 在读取 Rust interface 信息时没有优雅处理这个状态，并发生 panic。该风险不会证明 Rust 代码本身有缺陷，影响是当前环境无法产出可信的 Rust 测试结果和 Tauri bundle 结果。

修复建议：重新安装或修复 stable toolchain，确认 `rustup show` 与 `rustc -Vv` 成功后，再执行 `npm.cmd run cargo:test` 与 `npm.cmd run tauri:build`。完成后需在 Windows 本机验证 NSIS/MSI，在 macOS 本机验证 app/dmg、签名与 notarization 准备。

## 遗留风险

- 发布验证：Rust/Tauri 构建链未通过，无法确认桌面产物可用。
- 产品功能：新增 Skill 和自定义目录管理缺口会影响首版核心目标。
- 文件操作：插件缓存直接修改和删除存在误操作风险，当前无备份机制。
- 跨平台：macOS 构建、签名、notarization、路径打开行为尚未实机验证。
- 测试：缺少从扫描到详情再到保存/删除的真实 Tauri 端到端验证。
