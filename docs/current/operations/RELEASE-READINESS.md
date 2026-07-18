---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
目标平台: macOS
发布就绪状态: candidate-2 8A 与 8B 通过，正式发布仍受签名和公证阻塞
更新时间: 2026-07-18
---

# 发布就绪状态

## 当前状态

- 第 7 步目标平台：macOS。
- 候选类型：macOS 内部验收 candidate-2。
- Windows 状态：延期。
- 当前 HEAD：`57b29aeef5149e109ac016375968416c65e880cb`
- 8A 状态：人工验收通过。
- 8B 状态：已通过。
- 正式对外发布：签名和公证仍为阻塞项。

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
| candidate-2 DMG | `output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg` |
| candidate-2 SHA256 | `a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688` |
| 测试 Skill | `skill-panel-l3-upgrade-test`；创建前需用户确认 |
| 8A 状态 | 人工验收通过 |
| 8B 升级状态 | 已通过；candidate-2 显示 120 个真实 Skill 和 20 页分页 |
| 8B 回退状态 | 已通过；设置与源 Skill 指纹保持一致 |
| 最终安装版本 | `3.8.3`；用户已确认重新安装 candidate-2 |
| 8B 证据 | `output/releases/v3.8.3-candidate-2/8b-evidence/` |

## 正式发布阻塞项

- candidate-1 安装版显示虚拟 Skill 数据，未可靠读取本机真实 Skill；该记录保留为历史失败证据。
- candidate-1 Library 缺少分页，超过 100 个 Skill 时无法访问剩余内容；该记录保留为历史失败证据。
- 当前机器缺少 Developer ID Application 签名 identity。
- 当前机器缺少可用公证凭据或 profile。
- Gatekeeper、stapler 和完整签名包检查需在签名和公证条件恢复后执行。
- Windows 候选、Windows 安装、Windows 升级、Windows 回退、Credential Store、系统废纸篓验证延期。

## L3 失败更正

- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 原候选产物和 SHA256 保留，不覆盖。
- 签名与公证条件完成前禁止正式 tag 和正式发布。

## candidate-2 8A 记录

- 日期：2026-07-17。
- 任务编号：`REL-3.8.3-L3-CANDIDATE-2-8B`。
- 用户确认：安装版能够加载本机真实 Skill，没有显示固定演示 Skill，Library 分页正常，超过 100 个 Skill 可以进入中间页和最后一页，搜索、筛选和页码重置正常，Library → Detail → Editor → Detail → Library 流程正常。
- 8A 结论：人工验收通过。
- 8B 功能门槛：已完成 v3.8.2 基线、candidate-2 升级、数据保留和 v3.8.2 回退验证。

## candidate-2 8B 记录

- 日期：2026-07-18。
- 安全备份：`~/.codex/skill-panel-acceptance-backups/REL-3.8.3-GOVERNANCE-20260718-123946/`。
- 设置文件 SHA256 在基线、升级、回退和最终安装期间保持一致。
- 两个默认 Skill 根目录共 228 个 `SKILL.md`，数量与组合 SHA256 全程一致。
- candidate-2 升级和最终安装均显示 120 个真实 Skill、20 页分页和末页 `115–120 / 120`。
- 用户确认最终保留 candidate-2，本机安装版本为 `3.8.3`。
- 8B 结论：通过。
