# Skill Panel v3.8.2 Release Manifest

## 基本信息

- 版本：`v3.8.2`
- 发布时间：`2026-07-13 11:03:34 CST`，依据 `v3.8.2` annotated tag tagger date。
- tag：`v3.8.2`
- tag 对象：`3ef7123660caa1de5fb8787e8d797ae06e9dccf6`
- tag commit：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- 发布代码点：`65140b081962a0177b56c1cf14c572515f320e4e`
- 当前审计 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`
- 当前审计分支：`codex/agent-codex-v3.8`
- 当前 HEAD 与 tag 关系：`v3.8.2^{commit}` 是当前审计 HEAD 的祖先；当前 HEAD 属于后续候选开发线，本次没有把当前 HEAD 的测试结果作为 v3.8.2 安装包质量证明。
- 归档目录：`output/releases/v3.8.2/`
- 调查日期：`2026-07-16`

## 只读复核命令

| 目录 | 命令 | 结论 |
|---|---|---|
| 仓库根目录 | `git status --short --branch` | `## codex/agent-codex-v3.8`，审计开始时工作区无短状态变更。 |
| 仓库根目录 | `git branch --show-current` | `codex/agent-codex-v3.8`。 |
| 仓库根目录 | `git rev-parse HEAD` | `fba74aeb030d89e626a04f665f6ac17b1054601d`。 |
| 仓库根目录 | `git rev-parse v3.8.2` | `3ef7123660caa1de5fb8787e8d797ae06e9dccf6`，为 annotated tag 对象。 |
| 仓库根目录 | `git rev-parse v3.8.2^{commit}` | `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。 |
| 仓库根目录 | `git show --no-patch --oneline v3.8.2` | tag 说明为 `Skill Panel v3.8.2`，目标提交为 `2b53d54 test: isolate settings store temp cleanup`。 |
| 仓库根目录 | `git merge-base --is-ancestor v3.8.2^{commit} HEAD` | 退出码 `0`，tag commit 是当前审计 HEAD 的祖先。 |
| 仓库根目录 | `find output/releases/v3.8.2 -maxdepth 3 -type f` | 找到 9 个归档文件，见下方文件台账。 |
| 仓库根目录 | `shasum -a 256 -c output/releases/v3.8.2/SHA256SUMS.txt` | 失败原因是 `SHA256SUMS.txt` 内文件名按归档目录相对路径记录，在仓库根目录执行无法读取条目；未出现哈希内容不匹配证据。 |
| 归档目录 | `shasum -a 256 -c SHA256SUMS.txt` | 7 项全部 `OK`。 |
| 仓库根目录 | `git bundle verify output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle` | bundle 完整，包含 `v3.8.2`、`v3.0.0`、`v2.0.0` 三个 refs，记录 complete history。 |
| 归档目录 | `zipinfo -1 "Skill Panel_3.8.2_aarch64.app.zip"` | App Zip 包含 `Skill Panel.app`，共 13 个条目，主执行文件存在。 |
| 归档目录 | `zipinfo -1 skill-panel-v3.8.2-source.zip` | 源码包共 303 个条目；未发现 `.git/`、`node_modules/`、`dist/` 或 `output/releases/` 条目。 |
| 归档目录 | `hdiutil attach` + `PlistBuddy` | DMG 可只读挂载，App 版本和 bundle id 与 App Zip 一致。 |
| 归档目录 | `codesign --verify --deep --strict` | DMG 内 App 与 App Zip 解压 App 均失败：`code has no resources but signature indicates they must be present`。 |
| 归档目录 | `xcrun stapler validate "Skill Panel_3.8.2_aarch64.dmg"` | 失败，DMG 没有 stapled notarization ticket。 |

## 归档文件台账

| 文件名 | 大小 bytes | SHA256 | 文件用途 | 生成或归档依据 |
|---|---:|---|---|---|
| `FILES.txt` | 264 | `90006bb447b03486ed974bc4aa4dd80f414a010690354b98efb4f73027835dd1` | 归档文件清单。 | 本次只读计算 SHA256；文件内容列出归档目录内 8 个发布材料文件和大小。 |
| `INSTALL-VERIFY.md` | 3400 | `9b44d867565e4d5a775d177ddaf9ab96e69900f64548373205b58812544b034e` | macOS 安装结构、启动烟测、签名和 Windows 包状态记录。 | `SHA256SUMS.txt` 校验 OK；内容已读取复核。 |
| `ROLLBACK.md` | 1646 | `4494309ca634b84439f5a31acb4e5fdc098a3b59c15d33a0276bde6afa829881` | Git bundle、源码包和安装包回退说明。 | `SHA256SUMS.txt` 校验 OK；内容已读取复核。 |
| `SHA256SUMS.txt` | 643 | `dd30e36d56fc613c74e1e49ab5d36fecef59a1340c3d1880e77908b488fe8380` | 归档校验清单。 | 本次只读计算清单自身 SHA256；清单内 7 项在归档目录校验 OK。 |
| `Skill Panel_3.8.2_aarch64.app.zip` | 4307570 | `562ef02e9bec99c30698656568d7e656aa507efd0b30b862153443f8df39192e` | macOS App Zip。 | `release-manifest.json` 和 `FILES.txt` 均列出；`SHA256SUMS.txt` 校验 OK；本次解压到临时目录复核 `Info.plist`。 |
| `Skill Panel_3.8.2_aarch64.dmg` | 4320791 | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` | macOS DMG 安装包。 | `release-manifest.json` 和 `FILES.txt` 均列出；`SHA256SUMS.txt` 校验 OK；本次只读挂载复核 `Info.plist`。 |
| `release-manifest.json` | 1503 | `c0111be0ea6d2a0db2d0cb0e7d9d3f5dd0390dd4cd29712fcf2e26d67eb1510b` | 机器可读发布清单。 | `SHA256SUMS.txt` 校验 OK；`tagTarget` 与 `v3.8.2^{commit}` 一致。 |
| `skill-panel-v3.8.2-rollback.bundle` | 17770399 | `8cabec05e97fd9157ddc79c4776231013155376ae6dd0dfd82c65c04ed5fe569` | Git 回退 bundle。 | `SHA256SUMS.txt` 校验 OK；`git bundle verify` 通过。 |
| `skill-panel-v3.8.2-source.zip` | 6766459 | `fece96b283bea002f5a57ba0deb3190839fd3f3f4b502e5d688b64edec3754c7` | 源码包。 | `SHA256SUMS.txt` 校验 OK；本次读取 `package.json` 与 `src-tauri/tauri.conf.json` 确认版本。 |

## 版本与包元数据

| 材料 | 复核方式 | 结论 |
|---|---|---|
| App Zip | 解压到临时目录后读取 `Skill Panel.app/Contents/Info.plist` | `CFBundleShortVersionString=3.8.2`，`CFBundleVersion=3.8.2`，`CFBundleIdentifier=com.fengbul.skillpanel`，主执行文件可执行。 |
| DMG | `hdiutil attach -readonly -nobrowse` 后读取 `Skill Panel.app/Contents/Info.plist` | `CFBundleShortVersionString=3.8.2`，`CFBundleVersion=3.8.2`，`CFBundleIdentifier=com.fengbul.skillpanel`，主执行文件可执行。 |
| 源码包 | `unzip -p skill-panel-v3.8.2-source.zip package.json` | `name=skill-panel`，`version=3.8.2`。 |
| 源码包 | `unzip -p skill-panel-v3.8.2-source.zip src-tauri/tauri.conf.json` | `productName=Skill Panel`，`version=3.8.2`，`identifier=com.fengbul.skillpanel`，bundle targets 包含 `nsis`、`msi`、`app`、`dmg`。 |

## macOS 证据

| 项目 | 状态 | 证据与结论 |
|---|---|---|
| macOS 发布材料 | 已归档 | DMG 与 App Zip 均存在，SHA256 校验 OK，版本号与 bundle id 一致。 |
| macOS 安装验证 | 部分已验证 | `INSTALL-VERIFY.md` 记录 DMG 可挂载、版本 `3.8.2`、bundle id `com.fengbul.skillpanel`、主执行文件存在并可执行；本次只读复核得到一致结论。 |
| macOS 启动烟测 | 依据历史记录通过 | `INSTALL-VERIFY.md` 记录使用临时 `HOME` 启动 app 主执行文件，进程 5 秒仍存活，标准输出和错误日志为空。本次没有重新运行启动烟测。 |
| 签名验证状态 | 未通过 | 本次对 DMG 内 App 和 App Zip 解压 App 执行 `codesign --verify --deep --strict --verbose=4` 均失败：`code has no resources but signature indicates they must be present`。 |
| Gatekeeper 状态 | 尚未验证 | `spctl` 输出 `accepted` 同时包含 `override=security disabled`，该结果不能作为 Gatekeeper 放行证据。 |
| 公证状态 | 证据缺失 | `xcrun stapler validate` 返回 DMG 没有 stapled notarization ticket；未找到可信公证记录。 |
| 真实升级验证状态 | 证据缺失 | 未找到从真实旧版安装包升级到 v3.8.2 的记录。 |
| 安装包回退验证状态 | 证据缺失 | `ROLLBACK.md` 说明本机未找到 v3.8.1、v3.0.0 或 v2.0.0 的对应 macOS/Windows 安装包副本；未找到使用上一版安装包执行回退的记录。 |

## Windows 证据

| 项目 | 状态 | 证据与结论 |
|---|---|---|
| Windows 安装包状态 | 证据缺失 | 归档目录没有 `.exe`、`.msi` 或 NSIS 安装器。 |
| Windows 构建记录 | 尚未形成可发布安装器 | `INSTALL-VERIFY.md` 记录在 macOS 上执行 `npm run tauri:build:windows` 退出 0，但没有生成 `.exe`、`.msi` 或 NSIS 安装器。 |
| Windows 安装验证状态 | 尚未验证 | 未找到 Windows 真机或可信 CI 的安装记录。 |
| Windows Credential Store | 尚未验证 | 未找到 Windows 环境下 Credential Store 写入、读取状态和清理记录。 |
| Windows 系统废纸篓 | 尚未验证 | 既有 SEC-FILE-01B 仅覆盖 macOS 临时 Skill 废纸篓事务；Windows 行为仍需 Windows 环境验证。 |
| Windows 升级与回退 | 证据缺失 | 没有可信 v3.8.2 Windows 安装包，因此无法形成 Windows 真实升级和安装包回退基线。 |

## Git Bundle 回退方式

已验证命令：

```bash
git bundle verify output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle
git bundle list-heads output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle
```

结论：

- bundle 完整，记录 complete history。
- bundle refs 包含 `refs/tags/v3.8.2`、`refs/tags/v3.0.0`、`refs/tags/v2.0.0`。
- `refs/tags/v3.8.2` 指向 annotated tag 对象 `3ef7123660caa1de5fb8787e8d797ae06e9dccf6`，其目标 commit 为 `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。

恢复示例：

```bash
mkdir -p /tmp/skill-panel-restore
cd /tmp/skill-panel-restore
git clone /path/to/skill-panel-v3.8.2-rollback.bundle skill-panel
cd skill-panel
git checkout v3.8.2
```

## 已知缺失证据

- macOS 严格签名验证未通过。
- macOS 公证证据缺失，DMG 没有 stapled notarization ticket。
- macOS Gatekeeper 放行尚未验证；当前 `spctl` 结果受 `security disabled` 影响。
- 真实旧版本升级到 v3.8.2 的证据缺失。
- 使用上一版安装包执行回退的证据缺失。
- Windows `.exe`、`.msi` 或 NSIS 安装器缺失。
- Windows 安装、升级、回退、Credential Store 和系统废纸篓验证尚未完成。
- 仓库根目录直接执行 `shasum -a 256 -c output/releases/v3.8.2/SHA256SUMS.txt` 会因相对路径上下文失败；归档目录内执行同一清单校验通过。

## 后续处理建议

1. 保留现有 v3.8.2 历史归档，不重建、不替换、不移动 tag。
2. 使用正式证书环境重新处理后续候选版本的 macOS 签名、公证和 Gatekeeper 复核；v3.8.2 当前归档只能记录为签名未通过、公证证据缺失。
3. 在 Windows 真机或可信 CI 中补齐 v3.8.2 Windows 基线；若只能从 tag 重建测试专用基线，必须标记为重建产物。
4. 补齐目标平台真实升级、数据保留、安装包回退和 Git bundle 恢复演练记录后，再进入对应平台的第 7 步。
5. 第 6 步可以按“历史证据已收口，缺失项已明示”关闭；当前证据不具备进入第 7 步的完整跨平台条件。若发布范围明确为 macOS 单平台，仍需先补齐可信签名、公证或明确接受未签名分发边界。
