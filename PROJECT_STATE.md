---
项目: Skill Panel
版本: 3.8.3
发布任务: REL-3.8.3-CANDIDATE-MACOS
目标平台: macOS
状态: macOS 内部验收候选，可进入第 8 步
更新时间: 2026-07-16
---

# 项目状态

## 当前发布任务

- 任务编号：`REL-3.8.3-CANDIDATE-MACOS`
- 范围：macOS 单平台候选。
- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 当前记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`
- 版本：`3.8.3`
- bundle id：`com.fengbul.skillpanel`
- macOS 架构：`arm64`
- 候选状态：macOS 内部验收候选；正式对外发布受签名和公证条件阻塞。

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
| v3.8.3 候选 App Zip | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` | `4952711` | 内部验收候选 |
| v3.8.3 候选 App bundle | `output/releases/v3.8.3-candidate/Skill Panel.app` | 目录包 | `13480 KiB` | 内部验收候选 |
| v3.8.3 候选 DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` | `4964044` | 内部验收候选 |

## 已知风险

- Windows 候选和 Windows 验证延期。
- macOS 正式对外发布需等待 Developer ID 签名、公证和 Gatekeeper 验证。
- 第 8 步人工升级、数据保留和回退验收尚未开始。
