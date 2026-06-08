# Skill 面板最终审查报告

状态：DONE - 最终审查已完成，当前集成分支存在发布前阻塞问题。

审查范围：

- 集成基线：`e0c34b8 chore: configure desktop packaging`
- 审查分支：`codex/skill-panel-12-final-review`
- 工作树：`C:\Users\12925\.codex\worktrees\13fb\skill面板`
- 目标：检查需求覆盖、Windows/macOS 风险、i18n 覆盖、测试缺口、文件操作危险点和打包发布建议。

## 通过项

- 项目已形成 Tauri 2 + React + TypeScript + Rust 桌面应用结构。
- 手动扫描、Skill 列表、搜索、来源筛选、状态筛选、详情读取、保存、删除确认、打开目录和设置页都有主要代码路径。
- 设置页已包含语言设置、自定义扫描目录、Windows/macOS 默认路径展示和设置保存入口。
- i18n 资源已覆盖 `zh-CN` / `en-US`，并有 key 完整性、placeholder 完整性、系统语言 fallback 测试。
- Rust 扫描逻辑覆盖默认目录、插件缓存递归扫描、自定义目录扫描、frontmatter 状态和去重测试。
- Rust 文件操作有路径边界校验，删除前会拒绝删除允许根目录本身，并检查目标是 `SKILL.md` 所在目录。
- Windows/macOS 打包配置已存在：Windows `nsis` / `msi`，macOS `app` / `dmg`，并有配置检查测试。
- 中文字典经 Node 按 UTF-8 读取验证，内容本身有效；PowerShell 中的乱码属于控制台显示问题。

## 阻塞问题

1. 新建 Skill UI 入口尚未接入功能。
   - 证据：`src/App.tsx:352` 的 `actions.newSkill` 按钮没有 `onClick`，也没有表单或 `create_skill` 调用。
   - 影响：项目目标包含“增加 skill / 新建 Skill”，当前用户无法从 UI 创建 Skill。
   - 建议：补新建弹窗或右侧新建态，选择目标目录、填写 name/description/markdown 后调用 `create_skill`，并刷新列表。

2. 自定义扫描目录只能扫描，后续读写操作会被后端拒绝。
   - 证据：`scan_skills` 使用 `scan_configured_skill_roots` 读取设置中的 `custom_scan_directories`；`read_skill`、`create_skill`、`update_skill`、`delete_skill`、`open_skill_folder` 仍通过 `default_allowed_roots()` 限定默认根。
   - 影响：设置页添加的自定义目录可以出现在扫描结果里，但详情读取、编辑、删除、打开目录、在自定义目录创建 Skill 可能失败。
   - 建议：文件操作允许根应和扫描根保持一致，读取 `AppSettings` 后组合默认根和自定义根，并补自定义目录 CRUD 回归测试。

3. 当前机器无法完成 Rust 与真实 Tauri 打包验证。
   - 证据：`npm.cmd run cargo:test` 在 `rustc -vV` 阶段失败，提示 `Missing manifest in toolchain 'stable-x86_64-pc-windows-msvc'`。
   - 证据：`npm.cmd run tauri:build` 在 Tauri CLI Rust interface 处 panic：`called Option::unwrap() on a None value`。
   - 影响：Rust 单元测试和真实桌面安装包产物尚未在本机验证，发布前必须修复 Rust stable toolchain。
   - 建议：修复或重装 stable MSVC toolchain 后重新运行 Rust 测试和 Windows/macOS 目标平台打包。

## 非阻塞改进

- 设置页默认路径展示目前只列出 `.codex/skills` 与 `.agents/skills`，建议补充 `.codex/plugins/cache/**/skills`，与实际扫描逻辑保持一致。
- 左侧来源导航只提供全部、Codex、Agents、插件缓存，建议增加自定义、系统、未知或将左侧和列表筛选统一。
- 删除操作只有一次确认，计划中也记录了备份缺口；建议发布前增加备份、撤销或回收站策略。
- `SKILL.md` frontmatter 解析支持常见 scalar/array，复杂 YAML 对象可能在详情读取或保存时失败；建议后续接入成熟 YAML parser。
- 打包配置的 `icon` 仍为空数组；内部审查可接受，公开发布前建议补齐品牌图标并重新生成 Tauri icons。
- macOS 对外发布需要签名与 notarization，Windows 对外发布建议规划代码签名。
- 建议补 CI 矩阵：Windows 运行前端测试、Rust 测试、Tauri 配置检查；macOS 至少运行 Rust 测试和 `tauri build --bundles app,dmg`。

## 验证结果

已通过：

- `npm.cmd test`：6 个测试文件通过，42 个测试通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run build`：通过，生成 `dist` 前端产物。
- `npm.cmd run packaging:check`：1 个测试文件通过，4 个测试通过。
- `git diff --check`：通过。

未通过：

- `npm.cmd run cargo:test`：失败于 Rust stable MSVC toolchain manifest 缺失。
- `npm.cmd run tauri:build`：失败于 Tauri CLI Rust interface panic。

## 建议发布前测试命令

在 Windows 上：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
```

在 macOS 上：

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run tauri:build:macos
```

额外建议：

- 用一个真实自定义扫描目录做手工验收：扫描、查看详情、编辑保存、删除、打开目录、新建 Skill。
- 用真实 `.codex/plugins/cache/**/skills` 做只读/写入风险验收，确认用户明确知道插件缓存会被直接修改。
- 对中英文界面各走一遍主流程，确认按钮、弹窗、错误状态和设置页文案都可读。

## 发布建议

当前建议进入内部验收和修复阶段，暂不建议进入公开打包发布。

进入公开打包发布前至少需要完成：

- 实现新建 Skill UI 流程。
- 修复自定义扫描目录的读写允许根。
- 修复本机 Rust stable toolchain，并让 `cargo:test` 与目标平台 Tauri build 通过。

修复上述阻塞项后，可以重新执行最终审查，再进入 Windows/macOS 打包发布准备。
