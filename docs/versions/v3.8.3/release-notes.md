# Skill Panel v3.8.3 Release Notes

发布日期：2026-07-19

## 发布范围

v3.8.3 是开源源码正式版本。公开 GitHub 仓库源码、tag `v3.8.3` 和 GitHub Release 是本次正式发布结果。

> [!warning] macOS ARM Preview
> macOS App/DMG 没有 Developer ID 签名，也没有经过 Apple 公证，可能触发 Gatekeeper。该附件用于预览和内部使用，不代表 Apple 可信分发验收通过。

> [!warning] Windows Preview
> Windows NSIS 由 GitHub Actions 构建时可以作为 Preview 附件保留。当前没有完成人工安装、Credential Store、系统废纸篓、升级和回退验收。

## 主要变化

- Library 使用真实 Skill 扫描结果，生产扫描失败时不再回退到固定演示数据。
- Library 支持真实分页，搜索、筛选和分类在分页前完成。
- 完成 Library、Detail、Editor、Create、AI Assistant、Dashboard、Logs 和 Dependencies 的真实数据审计。
- 完成 macOS v3.8.2 -> v3.8.3 升级、数据保留、v3.8.2 回退和最终安装验证。
- 建立单一 `main`、仓库治理检查、当前文档层和版本历史层。
- 整理 QA、发布证据、历史原型和 Obsidian 项目入口。

## 验证摘要

- candidate-2 macOS 8A：通过。
- candidate-2 macOS 8B：通过。
- 真实 Skill：120 个，20 页分页，末页 `115-120 / 120`。
- 设置与默认 Skill 根目录数量和组合 SHA256 在升级与回退期间保持一致。
- 最终源码发布验证和 CI 结果见 `output/releases/v3.8.3/release-manifest.json`。

## 已知限制

- macOS Preview 未签名、未公证。
- Windows Preview 没有人工安装和升级回退证据。
- candidate-1 因演示数据和分页问题保留为历史失败证据。

## 升级与回退

- 上一正式版本：`v3.8.2`。
- v3.8.2 安装包与回退材料：`output/releases/v3.8.2/`。
- v3.8.3 回退说明：`output/releases/v3.8.3/ROLLBACK.md`。
