---
项目: Skill Panel
版本: 3.8.3
发布任务: REL-3.8.3-GOVERNANCE
目标平台: macOS
状态: main 已建立，v3.8.3 candidate-2 8A 与 8B 通过，仓库治理执行中
更新时间: 2026-07-18
---

# 项目状态

## 当前发布任务

- 任务编号：`REL-3.8.3-GOVERNANCE`
- 范围：macOS 单平台候选。
- 默认分支：`main`
- 当前治理分支：`codex/repository-governance`
- 规范仓库：`/Users/shovy/Documents/skill-panel`
- main 基线提交：`15a67962e4bf6f65c74720af794c3e2fb9a7d9d6`
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 候选证据提交：`2046733`
- 版本：`3.8.3`
- bundle id：`com.fengbul.skillpanel`
- macOS 架构：`arm64`
- 候选状态：candidate-2 已通过 8A 人工验收和 8B 安装升级、回退、数据保留验证；正式对外发布仍受签名和公证条件阻塞。
- 应用入口：`src/main.tsx` → `src/layout/AppShell.tsx`。
- 文档同步：Git → Obsidian 单向摘要。

## 第 7 步门槛

- 第 6 步已按“历史证据已收口，缺失项已明示”关闭。
- Windows 基线缺失只阻塞 Windows 候选。
- macOS 可独立生成候选。
- `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` 作为第 8 步 macOS 升级与回退基线。
- 真实升级和安装包回退将在第 8 步使用 v3.8.3 候选包验证。
- macOS 签名和公证属于正式对外发布门槛。
- 缺少签名条件时，候选状态为 macOS 内部验收候选，正式发布保持阻塞。

## 签名与公证

- Developer ID Application 证书：本机只读检查未发现可用证书。
- codesign identity：`security find-identity -v -p codesigning` 返回 `0 valid identities found`。
- 公证 profile：`xcrun notarytool history` 返回需要凭据。
- 正式发布状态：已阻塞，原因是缺少签名或公证条件。

## 发布产物

| 项目 | 路径 | SHA256 | 大小 | 状态 |
|---|---|---|---:|---|
| v3.8.2 基线 DMG | `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` | `4320791` | 第 8 步基线 |
| v3.8.3 candidate-1 App Zip | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` | `4952711` | 历史失败候选 |
| v3.8.3 candidate-1 App bundle | `output/releases/v3.8.3-candidate/Skill Panel.app` | 目录包 | `13480 KiB` | 历史失败候选 |
| v3.8.3 candidate-1 DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` | `4964044` | 历史失败候选 |
| v3.8.3 candidate-2 DMG | `output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg` | `a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688` | `4964023` | 8A 与 8B 通过，内部候选保留 |

## 已知风险

- Windows 候选和 Windows 验证延期。
- macOS 正式对外发布需等待 Developer ID 签名、公证和 Gatekeeper 验证。
- candidate-1 第 8 步人工安装验收失败记录保留为历史证据。
- candidate-2 8A 与 8B 已通过；本机最终安装版本为 `3.8.3`。
- 签名与公证条件完成前禁止正式 tag 和正式发布。
- `~/.codex/logs_2.sqlite` 仍有约 478 MiB 空闲页；数据库由活动 Codex 进程打开，需在退出 Codex 后通过受支持维护流程压缩。
- 会话检索工具依赖已恢复，npm 审计仍报告 10 项上游依赖漏洞，升级需要单独兼容性任务。

## 2026-07-16 L3 失败状态

- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 当前修复任务：`REL-3.8.3-L3-REAL-DATA-PAGE-01`。
- 最后验证基线保留：candidate-1 的完整自动验证记录保留为历史证据，不再作为发布放行证据。

## 2026-07-17 candidate-2 8A 人工验收

- 任务编号：`REL-3.8.3-L3-CANDIDATE-2-8B`。
- 当前 HEAD：`57b29aeef5149e109ac016375968416c65e880cb`。
- candidate-2 DMG：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg`。
- candidate-2 SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- 8A 用户确认：安装版能够加载本机真实 Skill，没有显示固定演示 Skill，Library 分页正常，超过 100 个 Skill 可以进入中间页和最后一页，搜索、筛选和页码重置正常，Library → Detail → Editor → Detail → Library 流程正常，暂未发现新的 8A 问题。
- 8A 结论：人工验收通过。
- 8B 状态：2026-07-18 已通过。

## 2026-07-18 candidate-2 8B 记录

- 安全备份：`~/.codex/skill-panel-acceptance-backups/REL-3.8.3-GOVERNANCE-20260718-123946/`。
- 仓库证据：`output/releases/v3.8.3-candidate-2/8b-evidence/`。
- 验证序列：v3.8.2 基线安装、candidate-2 升级、v3.8.2 回退、用户确认后重新安装 candidate-2。
- Library 证据：120 个真实 Skill、20 页分页、末页 `115–120 / 120`。
- 数据证据：设置文件 SHA256 保持一致；两个默认 Skill 根目录共 228 个 `SKILL.md` 的数量与组合 SHA256 保持一致。
- 最终安装版本：`3.8.3`。
- 8B 结论：通过。
