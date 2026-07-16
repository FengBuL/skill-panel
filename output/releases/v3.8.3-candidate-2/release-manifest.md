# Skill Panel v3.8.3 candidate-2 macOS 清单

## 基本信息

- 任务编号：`REL-3.8.3-L3-REAL-DATA-PAGE-01`
- 修复提交：`03865b3d325b00e945e2f32407836bb741700aa2`
- 分支：`codex/agent-codex-v3.8`
- 版本：`3.8.3`
- 平台范围：macOS arm64
- 生成时间：`2026-07-16 17:37:58 CST`
- 候选输出目录：`output/releases/v3.8.3-candidate-2/`
- 正式 tag：未创建
- 正式发布：未执行

## 失败候选保留

| 文件 | SHA256 |
|---|---|
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` |
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |

## candidate-2 文件

| 文件 | 大小 bytes | SHA256 | 说明 |
|---|---:|---|---|
| `Skill Panel.app` | `13803520` | 目录包 | `du -sk` 为 `13480`。 |
| `Skill Panel_3.8.3_aarch64.app.zip` | `4953370` | `c2ad0df7cb7b165d533c3d2ebf85a316cfe9375774e44a4afa87c6cab360f426` | App bundle 压缩包。 |
| `Skill Panel_3.8.3_aarch64.dmg` | `4964023` | `a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688` | candidate-2 安装 DMG。 |

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

## 修复验证摘要

| 命令 | 结果 |
|---|---|
| `npm test` | 通过；10 个测试文件，80 个测试用例 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| `npm run packaging:check` | 通过；1 个测试文件，6 个测试用例 |
| `npm run cargo:test` | 通过；lib 56 项，bin 0 项，integration 4 项 |
| `npm run visual:qa` | 通过；17 个场景，0 失败 |
| `npm run git:diff:check` | 通过 |

## 第 8 步状态

- 第 8 步已从候选安装验收改为“验证失败”。
- candidate-2 已生成，可供重新执行第 8 步人工安装验收。
- 当前没有创建 tag，没有发布。
