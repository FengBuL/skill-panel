---
项目: Skill Panel
任务: REL-3.8.3-SOURCE-RELEASE
版本: 3.8.3
发布对象: 开源源码、Git tag、GitHub Release
发布就绪状态: 收口中
更新时间: 2026-07-19
---

# v3.8.3 发布就绪状态

## 发布定义

v3.8.3 采用开源源码正式发布口径。公开 GitHub 仓库源码、annotated tag `v3.8.3` 和 GitHub Release 构成正式发布结果。

| 平台或内容 | 发布状态 | 声明边界 |
|---|---|---|
| 开源源码 | 正式发布 | 以 tag `v3.8.3` 和 GitHub Release 为准 |
| macOS ARM App/DMG | 未签名 Preview | 可能触发 Gatekeeper，未经过 Apple 公证 |
| Windows NSIS | CI Preview | CI 构建成功时保留，未完成人工安装、升级和回退 |

Apple Developer 证书、公证凭据和 Windows 人工设备不构成本次源码发布门槛。本任务不会处理或索取任何证书、密钥和 secrets。

## candidate-2 已完成证据

- 修复提交：`03865b3d325b00e945e2f32407836bb741700aa2`。
- 候选记录：`57b29aeef5149e109ac016375968416c65e880cb`。
- 8B 证据提交：`2046733`。
- 8A：真实 Skill、分页、搜索、筛选和核心编辑流程通过。
- 8B：v3.8.2 基线安装、v3.8.3 升级、数据保留、安装包回退和最终安装通过。
- candidate-2 DMG SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- 证据目录：`output/releases/v3.8.3-candidate-2/8b-evidence/`。

## 最终发布门槛

- [x] 活动代码与文档统一记录 v3.8.3 源码正式发布口径。
- [x] 完整测试、构建、Rust 和视觉 QA 通过。
- [x] 从发布内容提交生成 macOS ARM Preview。
- [x] 生成源码归档、Git rollback bundle、清单和 SHA256。
- [x] PR #6 的 macOS 与 Windows CI 通过，run `29652247904`。
- [ ] 发布 PR 合并到 `main`。
- [ ] annotated tag `v3.8.3` 已创建并推送。
- [ ] GitHub Release 已创建并上传发布附件。
- [ ] 分支、Git 默认引用和 Obsidian 摘要完成收口。

## Preview 限制

### macOS ARM

- 当前机器没有有效 Developer ID identity。
- Preview 没有 Apple 公证票据。
- 用户可能需要在系统设置中确认打开来自未识别开发者的应用。
- Release Notes 必须持续显示该限制。

### Windows

- CI 构建成功只能证明安装器生成和自动化构建通过。
- Windows 人工安装、Credential Store、系统废纸篓、升级和回退保持未验收状态。
- Release Notes 和附件名称必须包含 Preview 或未验收说明。

## 历史候选

- candidate-1 因固定演示数据和分页缺失验收失败，保留于 `output/releases/v3.8.3-candidate/`。
- candidate-2 完成真实数据、分页、升级和回退验证，保留于 `output/releases/v3.8.3-candidate-2/`。
- 最终发布目录使用 `output/releases/v3.8.3/`，禁止覆盖两个候选目录。

## 最终本地产物

| 产物 | SHA256 | 状态 |
|---|---|---|
| `skill-panel-v3.8.3-source.zip` | 见 `SHA256SUMS.txt` | 最终发布内容提交的源码归档 |
| `skill-panel-v3.8.3-rollback.bundle` | `a80d24a2debc1f49a96b0ae6a62726eef4397ab9b35036c766071064ba34a6d6` | 完整 Git 回退 bundle，保存在本机冷归档并上传 GitHub Release |
| `Skill Panel_3.8.3_aarch64-unsigned-preview.app.zip` | `3fb0a5b4dd486573129768e1bdf26a0b5924fb321b0f0ce51ca83fce8ffd2afb` | macOS ARM 未签名 Preview |
| `Skill Panel_3.8.3_aarch64-unsigned-preview.dmg` | `ed2b73c66cf1bd178f2d55e2b8f349379d5625e5cf2f80bf221e8d6e3b89be94` | macOS ARM 未签名 Preview |
| `Skill Panel_3.8.3_x64-setup-unverified-preview.exe` | `b0f71d3c34759a06607e8c8aacdfb5f42747f01eec43d866a20fdc9ccb01c13b` | Windows NSIS CI Preview，未人工验收 |

GitHub 会依据最终 annotated tag 自动提供源码归档。仓库内自制源码归档用于复现发布内容提交，最终 tag 提交将在 PR 合并后单独记录。

## CI 复核说明

- 首轮 run `29652247904` 的 macOS 与 Windows job 均通过。
- 第二轮 run `29652676732` 暴露一个审计日志测试的 HOME 环境并行竞态。
- 测试已改为独立临时 HOME 并取得全局锁，生产命令逻辑没有变化。
- 最终 PR 头提交需要重新通过双平台 CI 后才能合并。

完整 rollback bundle 为 152.9 MB，超过 GitHub 仓库单文件 100 MB 限制。该文件不进入 Git 树，本机路径为 `/Users/shovy/Documents/Skill-Panel-Archive/releases/v3.8.3/skill-panel-v3.8.3-rollback.bundle`，发布时作为 GitHub Release 附件上传。
