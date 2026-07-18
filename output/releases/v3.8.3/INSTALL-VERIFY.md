# Skill Panel v3.8.3 Preview 安装包验证

## 发布身份

- 版本：`3.8.3`
- macOS Preview 构建源码提交：`1e38b0d6c41960a315b2e5fbd330e0b85678b265`
- 最终源码归档提交：见 `release-manifest.json`
- 正式 tag：`v3.8.3`
- 正式发布对象：开源源码、Git tag、GitHub Release
- macOS 附件状态：未签名、未公证 Preview

## 完整验证

| 命令 | 结果 |
|---|---|
| `npm run repo:doctor` | 通过 |
| `npm test` | 12 个文件、89 项通过 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| `npm run packaging:check` | 1 个文件、6 项通过 |
| `npm run cargo:test` | lib 56 项、integration 4 项通过 |
| `npm run visual:qa` | 17/17 通过 |
| `npm run git:diff:check` | 通过 |
| `PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos` | App 和 DMG 构建通过 |

## macOS ARM Preview 验证

- DMG 只读挂载：通过。
- `CFBundleShortVersionString`：`3.8.3`。
- `CFBundleIdentifier`：`com.fengbul.skillpanel`。
- 主执行文件架构：`arm64`。
- 主执行文件可执行位：存在。
- 临时 `HOME` 启动烟测：进程 5 秒后仍存活。
- 烟测未读取真实用户 Skill、设置或密钥。

## 签名与公证边界

- `codesign -dv`：`Signature=adhoc`，`TeamIdentifier=not set`。
- `codesign --verify --deep --strict`：退出码 1，报告 `code has no resources but signature indicates they must be present`。
- `xcrun stapler validate`：退出码 65，DMG 没有 stapled ticket。
- 以上结果符合未签名、未公证 Preview 声明。
- 用户打开 Preview 时可能遇到 Gatekeeper 提示。

## Windows 边界

- GitHub Actions run `29652247904` 的 Windows NSIS job 通过。
- 附件：`Skill Panel_3.8.3_x64-setup-unverified-preview.exe`。
- SHA256：`b0f71d3c34759a06607e8c8aacdfb5f42747f01eec43d866a20fdc9ccb01c13b`。
- 当前没有 Windows 人工安装、Credential Store、系统废纸篓、升级和回退验收。
- Windows 附件必须显示 Preview 或未验收说明。
