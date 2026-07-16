---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
目标平台: macOS
发布就绪状态: 内部验收候选可进入第 8 步
更新时间: 2026-07-16
---

# 发布就绪状态

## 当前状态

- 第 7 步目标平台：macOS。
- 候选类型：macOS 内部验收候选。
- Windows 状态：延期。
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 正式对外发布：等待签名和公证条件恢复并完成验证。

## 第 7 步门槛

- 第 6 步结论已接受：历史证据已收口，缺失项已明示。
- Windows 基线缺失阻塞 Windows 候选生成。
- Windows 基线缺失不阻塞 macOS 候选生成。
- v3.8.2 macOS DMG 是第 8 步升级与回退基线。
- 真实升级和安装包回退属于第 8 步活动，必须使用 v3.8.3 候选包。
- macOS 签名和公证是正式对外发布门槛。
- 签名条件缺失时，候选记录为 macOS 内部验收候选，正式发布保持阻塞。

## 签名与公证就绪状态

| 检查 | 结果 |
|---|---|
| Developer ID Application 证书 | 当前机器不可用 |
| codesign identity | 不可用；`0 valid identities found` |
| 公证 profile | 不可用；notarytool 需要凭据 |
| codesign 验证 | 候选 App 未通过：`code has no resources but signature indicates they must be present` |
| spctl 验证 | 返回 `accepted`，同时包含 `source=no usable signature` 和 `override=security disabled`；不能作为发布证据 |
| stapler 验证 | 未通过；DMG 没有 stapled ticket |

## 第 8 步输入

| 输入 | 值 |
|---|---|
| 基线 DMG | `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` |
| 基线 SHA256 | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` |
| 候选 DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` |
| 候选 SHA256 | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |
| 测试 Skill | `REL-3.8.3 disposable upgrade skill` |
| 升级状态 | 等待第 8 步人工验证 |
| 回退状态 | 等待第 8 步人工验证 |

## 正式发布阻塞项

- 当前机器缺少 Developer ID Application 签名 identity。
- 当前机器缺少可用公证凭据或 profile。
- Gatekeeper、stapler 和完整签名包检查需在签名和公证条件恢复后执行。
- Windows 候选、Windows 安装、Windows 升级、Windows 回退、Credential Store、系统废纸篓验证延期。
