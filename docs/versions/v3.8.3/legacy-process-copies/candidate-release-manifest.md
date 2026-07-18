# Skill Panel v3.8.3 macOS 候选清单

## 基本信息

- 任务编号：`REL-3.8.3-CANDIDATE-MACOS`
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 候选记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`
- 分支：`codex/agent-codex-v3.8`
- 版本：`3.8.3`
- 平台范围：仅 macOS。
- 候选状态：macOS 内部验收候选。
- 正式对外发布：已阻塞，原因是缺少签名或公证条件。
- 构建机器架构：`arm64`
- bundle id：`com.fengbul.skillpanel`

## 构建

- 首次尝试命令：`npm run tauri:build:macos`
- 首次尝试结果：当前 shell `PATH` 中缺少 Cargo，`cargo metadata` 无法运行。
- 成功命令：`PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- Tauri 输出：
  - `src-tauri/target/release/bundle/macos/Skill Panel.app`
  - `src-tauri/target/release/bundle/dmg/Skill Panel_3.8.3_aarch64.dmg`
- 候选输出目录：`output/releases/v3.8.3-candidate/`

## 文件

| 文件 | 大小 bytes | SHA256 | 说明 |
|---|---:|---|---|
| `Skill Panel.app` | `13803520` | 目录包 | 从 Tauri bundle 输出复制；`du -sk` 为 `13480`。 |
| `Skill Panel_3.8.3_aarch64.app.zip` | `4952711` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` | App bundle 压缩包，用于文件级校验。 |
| `Skill Panel_3.8.3_aarch64.dmg` | `4964044` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` | 候选安装 DMG。 |

## 包元数据

| 检查 | 结果 |
|---|---|
| App `CFBundleIdentifier` | `com.fengbul.skillpanel` |
| App `CFBundleShortVersionString` | `3.8.3` |
| App `CFBundleVersion` | `3.8.3` |
| 二进制架构 | `arm64` |
| DMG 挂载检查 | 只读挂载成功 |
| DMG 内 App 版本 | `3.8.3` |
| DMG 内 App bundle id | `com.fengbul.skillpanel` |
| DMG 内可执行文件 | 可执行位存在 |

## 验证

| 命令 | 结果 |
|---|---|
| `npm test` | 通过；10 个测试文件，67 个测试用例 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| `npm run packaging:check` | 通过；1 个测试文件，6 个测试用例 |
| `npm run cargo:test` | 通过；lib 54 项，bin 0 项，integration 4 项 |
| `npm run visual:qa` | 通过 |
| `npm run git:diff:check` | 候选提交前通过；文档收口后再次通过 |

## 签名与公证

| 检查 | 结果 |
|---|---|
| Developer ID Application 证书 | 当前机器不可用 |
| codesign identity | 不可用；`0 valid identities found` |
| 公证 profile | 不可用；notarytool 需要凭据 |
| `codesign --verify --deep --strict --verbose=4` | 未通过：`code has no resources but signature indicates they must be present` |
| `codesign -dv --verbose=4` | `Signature=adhoc`；`TeamIdentifier=not set` |
| `spctl -a -vv -t install` | 返回 `accepted`，同时包含 `source=no usable signature` 和 `override=security disabled`；不能作为 Gatekeeper 发布证据 |
| `xcrun stapler validate` | 未通过；DMG 没有 stapled ticket |

## 回退点

- Git 回退点：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 第 8 步基线 DMG：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- 第 8 步基线 SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

## 第 8 步状态

- 本轮任务没有执行第 8 步人工升级、数据保留和安装包回退验收。
- 候选包可作为内部验收候选进入本机 macOS 第 8 步。
- 第 8 步截图需记录任何未签名应用警告弹窗。
