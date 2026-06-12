# Skill 面板最终审查报告

状态：READY_FOR_WINDOWS_TEST_RELEASE

审查对象：`codex/skill-panel-app`
审查日期：2026-06-12

## 结论

当前代码已经具备首版 Skill Panel 桌面应用能力：扫描本机 Skill、列表搜索筛选、详情读取、编辑保存、删除确认、打开目录、设置页、自定义扫描目录、新建 Skill、中英文切换、Rust 后端文件操作与 Windows 打包。

Windows 本机发布链路已经验证通过，并生成 NSIS 安装包：

```text
src-tauri/target/release/bundle/nsis/Skill Panel_0.1.0_x64-setup.exe
```

macOS 产物需要在 macOS runner 或 macOS 机器上生成。仓库已加入 GitHub Actions workflow：`.github/workflows/desktop-build.yml`，用于构建 Windows NSIS 与 macOS app/dmg artifacts。

## 已验证通过

- `npm.cmd test`：6 个 test files、46 个 tests 通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run build`：通过。
- `npm.cmd run packaging:check`：1 个 test file、4 个 tests 通过。
- `npm.cmd run cargo:test`：Rust lib/main/contract tests 通过，共 32 个有效测试。
- `npm.cmd run tauri:build:windows`：通过，生成 Windows NSIS 安装包。
- `git diff --check`：通过。

## 已解决的原阻塞项

- 新建 Skill UI 流程已接入。
- 自定义扫描目录下的 Skill 已支持读取、更新、删除、新建和打开目录。
- Rust stable toolchain manifest 已修复。
- Windows MSVC linker 已通过 Visual Studio Build Tools 修复。
- Tauri Windows build 所需图标资源已补齐。
- Windows 新建嵌套目录路径校验已修复，避免 canonical 路径和未创建路径比较失败。

## 当前发布边界

- Windows：可以进入测试发布，当前已生成 NSIS 安装包。
- macOS：代码与配置已准备，需通过 macOS runner 生成并验证 `.app` / `.dmg`。
- MSI：保留可选命令 `npm.cmd run tauri:build:windows:msi`，需要 WiX 与 Windows NetFx3 系统依赖。
- 正式公开发布前仍需准备品牌图标、签名证书、macOS notarization。

## 建议发布前命令

Windows 本机：

```powershell
npm.cmd install
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

macOS runner 或 macOS 本机：

```bash
npm install
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run tauri:build:macos
```

## 遗留风险

- 插件缓存 Skill 仍可被直接编辑和删除；建议正式发布前提供更醒目的风险提示或备份策略。
- 当前缺少真实桌面端点击流 smoke test。
- macOS 签名、公证和路径打开行为尚未在真实 macOS 机器上人工验收。
- 当前图标是轻量占位资源，正式品牌发布前应替换。
