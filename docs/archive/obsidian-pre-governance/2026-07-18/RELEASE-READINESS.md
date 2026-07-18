---
title: Skill Panel Release Readiness
date: 2026-07-10
updated: 2026-07-17
tags: [SkillPanel, 发布, 验收]
status: released-evidence-closed-partial
---

# Skill Panel Release Readiness

## v3.8.3 L3 发布阻塞

当前结论：`V3_8_3_CANDIDATE_2_READY_FOR_STEP_8_RECHECK`。

- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- candidate-1 状态保持：L3 验证失败。
- candidate-2 状态：修复完成，等待重新执行第 8 步。
- 发布阻塞：安装版显示虚拟 Skill 数据。
- 发布阻塞：Library 缺少分页，超过 100 个 Skill 时无法访问剩余内容。
- 原候选目录、DMG、App Zip 和 SHA256 保留。
- candidate-2 修复验证完成前禁止 tag 和正式发布。

## 当前结论

`RELEASED_EVIDENCE_CLOSED_WITH_GAPS`

用户已确认 v3.8.2 发布。代码发布点为 `65140b081962a0177b56c1cf14c572515f320e4e`，npm、Tauri 与 Cargo 版本号均为 `3.8.2`。Dashboard 视觉 QA 已由 `421cafc9b51cb1245beb06a4a59d736b9b432d50` 修复并恢复 11/11。当前 `v3.8.2` tag 是 annotated tag，tag 对象为 `3ef7123660caa1de5fb8787e8d797ae06e9dccf6`，tag commit 为 `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`；macOS DMG、App Zip、源码归档、Git 回退包和 SHA256 清单已归档到 `output/releases/v3.8.2/`。第 6 步已新增 `docs/releases/v3.8.2/release-manifest.md`，文档 commit 为 `53e7ed3136e89cae52638dfdd9372983a918a0c5`。macOS 签名/公证、Windows 安装器、真实升级和上一版安装包回退材料仍待补齐。

UI-GAP-01 原型已在 WorkBuddy commit `6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab` 验收通过。DATA-EDITOR-01 已在 commit `9993992a164fd9f12fe8312223d0238e5b107666` 建立稳定基线：L2 通过、用户 2026-07-15 人工验收通过，工作区干净。SEC-FILE-01A/B/C/D 已完成文件命令边界、Detail 文件操作闭环、Keychain/日志/AI 发送安全、综合验证和人工验收，当前安全收口 HEAD 为 `fba74aeb030d89e626a04f665f6ac17b1054601d`。Windows 系统废纸篓、Windows Credential Store 和真实 macOS Keychain 写入测试仍需按平台单独补证。

## 已有发布证据

- 用户确认：v3.8.2 已发布。
- 发布 commit：`65140b081962a0177b56c1cf14c572515f320e4e`，提交说明为 `feat: release v3.8.2 notion ui migration`。
- Dashboard 视觉 QA 修复 commit：`421cafc9b51cb1245beb06a4a59d736b9b432d50`，提交说明为 `fix: restore dashboard visual qa parity`。
- 发布归档 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。
- 发布归档 commit：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`。
- 安装烟测记录 commit：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- REL-3.8.2-EVIDENCE-CLOSE 文档 commit：`53e7ed3136e89cae52638dfdd9372983a918a0c5`。
- 版本一致性：`package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 均为 `3.8.2`。
- 发布范围：Notion 风格 UI 迁移覆盖 Library、Dashboard、Detail、Editor、AI Assistant、Logs、Dependencies、Settings、New Skill、空白与错误状态。
- 视觉归档：`docs/design-migration-results/skill-panel-redesign-notion/` 包含十个页面实现截图和并排对照图。
- 当前自动验证：前端 40/40、打包配置 6/6、Rust 44/44、类型检查与生产构建通过。
- 当前视觉 QA：`npm run visual:qa` 已通过 11/11，Dashboard 场景 `v38-dashboard-1280x800` PASS。
- 发布归档目录：`output/releases/v3.8.2/`。
- Markdown Manifest：`docs/releases/v3.8.2/release-manifest.md`。
- macOS 安装包：`Skill Panel_3.8.2_aarch64.dmg`、`Skill Panel_3.8.2_aarch64.app.zip`。
- SHA256 清单：`output/releases/v3.8.2/SHA256SUMS.txt`，`shasum -a 256 -c SHA256SUMS.txt` 已通过。
- 回退包：`output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle`。

## 发布后待补齐项

- [x] 复核 Dashboard 视觉 QA 的 `dashboard is visible` 失败并恢复 11/11。
- [x] 确认发布渠道和正式 `v3.8.2` tag。
- [x] 归档 macOS 安装包、文件大小和 SHA256。
- [x] 归档源码包与 Git 回退包。
- [ ] 归档 Windows 安装包、文件大小和 SHA256。
- [ ] 保存真实安装、升级、数据保留和回退验证结果。
- [x] 生成 `docs/releases/v3.8.2/release-manifest.md`，引用现有归档并按平台记录缺失项。
- [x] 收口本轮视觉 QA 生成的清单、报告和截图工作区变化。

## 正式公开发布前项目

- [ ] macOS 签名与公证。
- [ ] Windows 与 macOS 真实安装验证。
- [ ] 升级安装后旧设置、标签、Skill 和版本历史仍可读取。
- [ ] 安装包 SHA256 与文件大小归档。
- [ ] 上一版安装包和回退步骤可用。
- [ ] 品牌图标、更新说明、已知限制完成。

## v3.8.3 当前准备

当前状态：`REL_3_8_2_EVIDENCE_CLOSED_STEP7_NOT_READY`。

| SOP 步骤 | 状态 | 发布意义 |
|---|---|---|
| 1. FIX-DASHBOARD-01 | 已完成 | 当前视觉 QA 11/11 |
| 2. AUDIT-REAL-FLOW-01 | 已完成 | 真实功能风险和后续范围已明确 |
| 3. UI-GAP-01 | 已完成 | WorkBuddy `6626908…` 提供稳定设计输入 |
| 4. DATA-EDITOR-01 | 已完成 | `9993992…`；44/44 前端、6/6 打包配置、Rust 45+3、typecheck、build、视觉 QA 11/11、`git diff --check`；用户验收通过 |
| 5. SEC-FILE-01 | 已完成 | 01A/B/C/D 已通过当前 HEAD 自动验证；2026-07-16 用户人工验收通过；Windows 与真实 Keychain 待验证项已单独列出 |
| 6. REL-3.8.2-EVIDENCE-CLOSE | 已完成，缺失项已明示 | `docs/releases/v3.8.2/release-manifest.md` 已建立；目标平台仍需要可信 v3.8.2 升级与回退基线 |
| 7–9. 候选、L3、发布 | 待开始 | 禁止提前升版、tag 或发布 |

### DATA-EDITOR-01 稳定基线

- 基线 commit：`9993992a164fd9f12fe8312223d0238e5b107666`，`feat: close editor data safety workflow`。
- 配套文档 commit：`3c0c3cab6171eb3d29ab1bff3c292720423289ac`，`docs: clarify navigation ownership`。
- 用户验收：2026-07-15，临时测试 Skill 人工验收通过；覆盖 Editor 进入、保存禁用、修改与保存、重启保留、撤销、外部冲突、diff 预览与覆盖确认、版本历史、安全恢复、同名 Skill 版本隔离、AI diff 草稿、弹窗和键盘操作。
- 自动验证：2026-07-15 18:56–18:58 CST，`npm test` 44/44、`npm run typecheck` 通过、`npm run build` 通过、`npm run packaging:check` 6/6、`npm run cargo:test` lib 45/45 与 contract 3/3、`npm run visual:qa` 11/11、`git diff --check` 通过。
- 视觉证据：`output/playwright/v38-editor-1440x960.png`；`output/playwright/visual-qa-report.json` 的 `generatedAt` 为 `2026-07-15T10:58:00.241Z`。
- 数据安全边界：未发现真实 Skill、密钥、隐私日志或临时验收数据进入 Git；删除、归档、系统废纸篓、打开目录、Keychain、日志脱敏和 AI 发送安全仍由 `SEC-FILE-01` 收口。

### SEC-FILE-01C 安全基线

- 基线 commit：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`，`feat: secure ai keys logs and outbound ai`。
- 开始 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`。
- 范围：Keychain 状态契约、统一脱敏、日志安全、Settings/Logs/Toast/错误展示防御性脱敏、AI Rail 发送确认、AI Assistant 网络边界、类型契约、模块文档和视觉证据。
- Keychain：前端只获取配置状态；完整 Key 只在后端保存到系统 Keychain/Credential Store，并仅供后端发起确认后的 AI 请求；vendor 允许列表为 `openai`、`claude`、`glm`、`ollama`；测试使用 mock Keychain。
- 脱敏和日志：统一规则覆盖 Key、Bearer、token/secret/password/api_key、JWT、用户路径、邮箱、URL 敏感查询参数、JSON 嵌套字符串和错误；新日志写入前脱敏，旧 JSONL 读取时再次脱敏，损坏行不回显原文。
- AI 发送：默认脱敏；发送前显示服务商、内容范围、脱敏状态和预览；用户可取消；关闭脱敏需单次风险确认；后端校验确认和预览，未确认无网络请求；AI 返回进入 Editor 草稿。
- 自动验证：`npm test` 54/54、`npm run typecheck` 通过、`npm run build` 通过、`npm run packaging:check` 6/6、`npm run cargo:test` lib 54/54 与 contract 4/4、`npm run visual:qa` 11/11、`git diff --check` 通过。
- 敏感信息扫描：源码、模块文档、测试 fixture、JSON、Markdown 和 Playwright 输出未发现真实 API Key、Bearer 或 JWT；受限表达扫描无命中。
- 视觉证据：`output/playwright/v38-settings-1280x800.png`、`output/playwright/v38-logs-1280x800.png`、`output/playwright/v38-editor-1440x960.png`、`output/playwright/sec-file-01c-ai-assistant-1280x800.png`；报告 `generatedAt` 为 `2026-07-16T03:36:12.984Z`。
- 平台边界：macOS 自动化使用 mock Keychain 和 mock HTTP 通过；真实 Keychain 人工测试待用户确认虚构 Key 后执行并清理；Windows Credential Store 等待 Windows 环境独立验证。

### SEC-FILE-01D 综合验证基线

- 收口 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`，`chore: add git diff check script`。
- 主修复提交：`518f0218594f8f3af64a8923d70517441e07c661`，`fix: restore library detail editor flow`。
- 用户验收：2026-07-16 最新人工验收通过；覆盖 Library 单击选中、双击/Enter/“查看完整详情”进入 Detail、Detail 进入普通 Editor、受保护 Skill 只读查看、Editor 返回 Detail、Detail 返回 Library、Editor 页头按钮位置和 Detail 操作按钮排版。
- 自动验证：`npm test` 67/67、`npm run typecheck` 通过、`npm run build` 通过、`npm run packaging:check` 6/6、`npm run cargo:test` lib 54/54 与 contract 4/4、`npm run visual:qa` 11/11、`npm run git:diff:check` 通过。
- 视觉证据：`output/playwright/visual-qa-report.json` 和 `output/playwright/sec-file-01d-flow-*.png`。
- 平台边界：macOS 当前验证覆盖临时 HOME、可丢弃测试 Skill、自动化回归、视觉 QA 和用户人工 UI 验收；Windows 系统废纸篓尚未验证；Windows Credential Store 尚未验证；真实 macOS Keychain 写入测试已阻塞；模拟 Keychain 和模拟 AI 网络测试已通过。

### v3.8.3 升级与回退基线

- macOS：使用 `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`，执行前核对 `SHA256SUMS.txt`。
- Windows：优先使用真实 v3.8.2 安装包；缺失时只允许在 Windows 或可信 CI 从 v3.8.2 tag 构建测试专用基线，并标记为重建产物。
- 某平台缺少可信基线时，该平台升级与回退保持“已阻塞”；已经明确批准的其他单平台范围可独立验收。

## 最新验证记录表

| 验证 | 命令 | 最新结论 | 证据 |
|---|---|---|---|
| 前端测试 | `npm test` | 67/67 通过 | 2026-07-16 SEC-FILE-01D |
| 类型检查 | `npm run typecheck` | 通过 | 2026-07-16 SEC-FILE-01C |
| Web 构建 | `npm run build` | 通过 | 2026-07-16 SEC-FILE-01C |
| 打包配置 | `npm run packaging:check` | 6/6 通过 | 2026-07-16 SEC-FILE-01D |
| Rust 测试 | `npm run cargo:test` | lib 54/54、contract 4/4 通过 | 2026-07-16 SEC-FILE-01D |
| 视觉 QA | `npm run visual:qa` | 11/11 通过 | `output/playwright/visual-qa-report.json`，2026-07-16 SEC-FILE-01D |
| Diff 检查 | `npm run git:diff:check` | 通过 | 2026-07-16 SEC-FILE-01D |
| Dashboard | `v38-dashboard-1280x800` | PASS | `output/playwright/v38-dashboard-1280x800.png` |
| tag | `git show v3.8.2 --no-patch` | tag 存在，目标 `2b53d548…` | 本地仓库检查 |
| macOS 打包 | `npm run tauri:build:macos` | 生成 `.app` 和 `.dmg` | `src-tauri/target/release/bundle/` |
| macOS DMG 验证 | `hdiutil attach` + `PlistBuddy` | DMG 可挂载，版本 `3.8.2`，bundle id `com.fengbul.skillpanel` | `output/releases/v3.8.2/INSTALL-VERIFY.md` |
| macOS 启动烟测 | 临时 `HOME` 运行 app 主执行文件 | 进程 5 秒存活，日志为空 | `output/releases/v3.8.2/INSTALL-VERIFY.md` |
| SHA256 | `shasum -a 256 -c SHA256SUMS.txt` | 7 项 OK | `output/releases/v3.8.2/SHA256SUMS.txt` |
| SHA256 路径上下文 | `shasum -a 256 -c output/releases/v3.8.2/SHA256SUMS.txt` | 仓库根目录执行因清单相对路径无法读取条目；归档目录执行通过 | `docs/releases/v3.8.2/release-manifest.md` |
| 回退包 | `git bundle verify` | bundle 完整，包含 `v3.8.2`、`v3.0.0`、`v2.0.0` refs | `output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle` |
| macOS App Zip 验证 | `zipinfo` + `PlistBuddy` | 13 个条目；版本 `3.8.2`，bundle id `com.fengbul.skillpanel` | `docs/releases/v3.8.2/release-manifest.md` |
| Windows 安装器 | `npm run tauri:build:windows` | macOS 本机未生成 `.exe/.msi` | 需 Windows 或 CI 复验 |
| macOS 签名 | `codesign --verify --deep --strict` | 失败：`code has no resources but signature indicates they must be present` | 需签名/公证环境收口 |
| macOS 公证 | `xcrun stapler validate` | DMG 没有 stapled notarization ticket | 需可信公证记录 |

## 发布结论边界

- “已发布”依据用户明确确认和发布 commit 记录。
- 当前证据支持代码版本一致、主要自动测试通过、视觉 QA 11/11、macOS 包生成、SHA256 校验、Git 回退包完整和历史证据 manifest 已建立。
- 当前证据仍不足以声明发布后 L3 全部通过、Windows 安装包已验证、签名/公证完整或真实升级/安装包回退已完成。
- v3.8.2 状态为“已发布，历史证据已收口，macOS 归档已建立，Windows 与签名/公证/真实升级/安装包回退待补齐”。
- UI-GAP-01 已晋升到“设计已验证”；DATA-EDITOR-01 已晋升到“稳定基线已建立”；SEC-FILE-01A/B/C/D 已晋升到“安全基线已建立”；REL-3.8.2-EVIDENCE-CLOSE 已晋升到“历史证据已收口，缺失项已明示”。Windows 与真实 Keychain 目标平台人工验证、发布证据仍未完成，当前禁止写成“v3.8.3 可发布”。

## 回退基线

当前可参考代码点：

- 管理目录 v3.8 UI 基线：`09930f087b50c802ae840db93c4d355c00957dbf`
- Codex v3.8.1 工作区起点：`1bd6f31908f05bbd14c057a2048730be6e0db6e7`
- v3.8.1 UI 迁移基线：`80816e52cb1e58f7f7d2ede5543fb983788fbfce`
- v3.8.2 发布代码点：`65140b081962a0177b56c1cf14c572515f320e4e`
- v3.8.2 Dashboard 视觉 QA 修复点：`421cafc9b51cb1245beb06a4a59d736b9b432d50`
- v3.8.2 tag 目标：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- v3.8.2 发布归档提交：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`
- v3.8.2 安装烟测记录提交：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`
- v3.8.2 历史证据收口提交：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- UI-GAP-01 原型验收提交：`6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`
- DATA-EDITOR-01 稳定基线提交：`9993992a164fd9f12fe8312223d0238e5b107666`
- SEC-FILE-01D 安全收口 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`
- SEC-FILE-01A 文件命令边界提交：`e962960fc51159516367f2f9d993fd63fa8e4da1`
- SEC-FILE-01B Detail 文件操作提交：`e06441df474b017ca01624c99d0c1d207d7288b8`
- SEC-FILE-01C 敏感数据安全提交：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`
- v3.0.0 tag：仓库 `v3.0.0`
- v2.0.0 tag：仓库 `v2.0.0`

补齐 Windows 安装包、签名/公证、真实安装与升级验证后，在本文件更新发布后归档状态，并在 [[DEVELOPMENT-LOG]] 追加同一 HEAD 与新工作区指纹对应记录。

## REL-3.8.3-CANDIDATE-MACOS 发布就绪记录（2026-07-16）

- 目标平台：macOS。
- 候选状态：内部验收候选，可进入第 8 步本机安装、升级和回退测试。
- Windows 状态：延期；本轮没有 Windows 安装、升级、回退、Credential Store 或系统废纸篓验证。
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 候选记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 候选 DMG：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`，SHA256 `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`。
- 候选 App Zip：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip`，SHA256 `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e`。
- 第 8 步基线 DMG：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`，SHA256 `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- 签名状态：本机没有有效 codesign identity；候选 App 为 ad-hoc/linker-signed；严格 codesign 未通过。
- 公证状态：notarytool 没有可用凭据；stapler 验证未通过，原因是 DMG 没有 stapled ticket。
- 正式发布阻塞：Developer ID Application 证书、公证 profile、Gatekeeper 放行验证、stapler 验证、Windows 候选与 Windows 平台验证。
