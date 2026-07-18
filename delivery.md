---
项目: Skill Panel
任务: REL-3.8.3-SOURCE-RELEASE
版本: 3.8.3
状态: 已完成
更新时间: 2026-07-19
---

# v3.8.3 交付说明

## 完成内容

- v3.8.3 开源源码正式发布。
- PR #6 合并到 `main`，发布提交为 `4d71c4578dda284d1ab5c1c54ca0e1be5f10a5ba`。
- annotated tag `v3.8.3` 与 GitHub Release 已公开。
- macOS ARM 未签名 Preview、Windows 未人工验收 Preview、源码归档和回退材料已上传。
- 本地与远端分支收敛为 `main`，清理前 refs 已完整归档。

## 验证

- repo doctor、前端 89 项、类型检查、生产构建、打包配置 6 项、Rust 60 项和视觉 QA 17 个场景通过。
- 最终 PR CI run `29653105230` 双平台通过。
- main push CI run `29653488657` 双平台通过。
- Release 附件 SHA256 与服务端 digest 一致。

## 数据安全

- 未读取或修改真实 Skill 内容。
- 未处理或索取证书、密钥和 secrets。
- macOS 启动烟测使用临时 `HOME`。
- Windows 没有人工安装、Credential Store、系统废纸篓、升级和回退验收声明。

## 截图与证据

- 视觉 QA：`output/qa/v3.8.3/`。
- candidate-2 8B：`output/releases/v3.8.3-candidate-2/8b-evidence/`。
- 发布归档：`output/releases/v3.8.3/`。

## 回退

- GitHub Release 附件：`skill-panel-v3.8.3-rollback.bundle`。
- 本机发布 bundle：`/Users/shovy/Documents/Skill-Panel-Archive/releases/v3.8.3/skill-panel-v3.8.3-rollback.bundle`。
- 分支清理前 bundle：`/Users/shovy/Documents/Skill-Panel-Archive/git-bundles/pre-v3.8.3-branch-cleanup-20260719.bundle`。

## 已知限制

- macOS Preview 没有 Developer ID 签名和 Apple 公证，可能触发 Gatekeeper。
- Windows Preview 只通过 CI 构建，未完成人工平台验收。
- Actions 依赖存在 Node.js 20 弃用提示，runner 已使用 Node.js 24 完成构建。
