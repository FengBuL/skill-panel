---
项目: Skill Panel
任务: REL-3.8.3-SOURCE-RELEASE
版本: 3.8.3
更新时间: 2026-07-19
---

# 当前计划

## 目标

完成 v3.8.3 开源源码正式发布，统一代码、文档、Git 引用、发布产物和 Obsidian 状态，为后续重大原型变更建立唯一冻结基线。

## 发布范围

- 正式内容：公开源码、annotated tag `v3.8.3`、GitHub Release、发布说明和回退材料。
- macOS：ARM App/DMG 作为未签名 Preview，明确 Gatekeeper 与未公证限制。
- Windows：CI 构建成功时保留 NSIS Preview，明确人工验收尚未完成。
- 排除内容：Apple 证书、公证凭据、Windows 人工设备验收。

## 执行状态

| 步骤 | 状态 | 完成条件 |
|---|---|---|
| 基线和发布口径核验 | 已完成 | `main` 干净、版本一致、范围已由用户确认 |
| 状态与规则统一 | 已完成 | 活动文档没有候选/正式状态冲突和失效路径 |
| 完整验证 | 已完成 | repo doctor、前端、类型、构建、打包、Rust、视觉 QA 全部通过 |
| 最终产物 | 已完成 | 源码归档、rollback bundle、macOS Preview、清单和 SHA256 已生成并校验 |
| CI 验证 | 已完成 | PR 与 main push 的 macOS App/DMG、Windows NSIS workflow 通过 |
| Git 收口 | 已完成 | PR 已合并，历史分支已归档清理，`origin/HEAD` 指向 `main` |
| 正式发布 | 已完成 | tag `v3.8.3` 和 GitHub Release 已创建 |
| Obsidian 收口 | 已完成 | 总览、Git 摘要、版本地图、开发台账和 v3.8.3 索引一致 |

## 验证命令

```bash
npm run repo:doctor
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos
```

## 数据安全

- 不读取或修改真实 Skill 内容。
- 不读取、记录或索取证书、密钥和 secrets。
- Preview 启动烟测使用临时 `HOME`。
- 安装升级与回退沿用 candidate-2 8B 已确认指纹证据，不重复操作真实用户文件。

## 当前证据

- 发布内容提交：`1e38b0d6c41960a315b2e5fbd330e0b85678b265`。
- 最终 tag 提交：`4d71c4578dda284d1ab5c1c54ca0e1be5f10a5ba`。
- 自制源码归档从最终发布内容提交生成，具体提交和 SHA256 以发布目录清单为准。
- macOS ARM App Preview SHA256：`3fb0a5b4dd486573129768e1bdf26a0b5924fb321b0f0ce51ca83fce8ffd2afb`。
- macOS ARM DMG Preview SHA256：`ed2b73c66cf1bd178f2d55e2b8f349379d5625e5cf2f80bf221e8d6e3b89be94`。
- 完整验证：前端 89 项、打包 6 项、Rust 60 项、视觉 QA 17 个场景通过。
- macOS Preview 校验：版本、bundle id、arm64 架构、DMG 挂载和临时 HOME 启动烟测通过；仅 ad-hoc 签名且没有公证票据。
- GitHub Actions：run `29652247904`，macOS App/DMG 与 Windows NSIS 均通过。
- Windows NSIS Preview SHA256：`b0f71d3c34759a06607e8c8aacdfb5f42747f01eec43d866a20fdc9ccb01c13b`；只确认 CI 构建，未执行人工安装、升级和回退。
- 第二轮 run `29652676732` 暴露审计日志测试共享 HOME 的并行竞态；生产命令未变，测试已改为独立临时 HOME 并取得全局锁。
- 完整 rollback bundle 超过 GitHub 仓库单文件限制，保存在本机冷归档并作为 GitHub Release 附件上传，Git 树只保存哈希和恢复说明。
- 最终 PR CI：run `29653105230`，macOS 5 分 19 秒、Windows 11 分 7 秒通过。
- main push CI：run `29653488657`，macOS 5 分 34 秒、Windows 10 分 1 秒通过。
- 分支清理前完整 bundle：`/Users/shovy/Documents/Skill-Panel-Archive/git-bundles/pre-v3.8.3-branch-cleanup-20260719.bundle`，SHA256 `67fe996548eb8095bbf92ca7c41f46e4b22a9a19ad9c9f55304a4c5266344a76`。
