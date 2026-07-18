---
项目: Skill Panel
当前发布版本: 3.8.3
上一正式版本: 3.8.2
当前任务: REL-3.8.3-SOURCE-RELEASE
状态: 开源源码正式发布收口中
更新时间: 2026-07-19
---

# 项目状态

## 版本状态

| 项目 | 状态 | 证据 |
|---|---|---|
| v3.8.3 源码发布 | 收口中 | 公开 GitHub 源码、tag `v3.8.3` 和 GitHub Release |
| macOS ARM | Preview | candidate-2 8A 与 8B 通过；最终包未签名、未公证 |
| Windows | CI Preview | CI 构建通过后保留安装器；人工安装、升级和回退未验收 |
| v3.8.2 | 上一正式版本 | tag `v3.8.2`，发布目录 `output/releases/v3.8.2/` |

## 发布口径

- v3.8.3 的正式发布对象是公开源码、Git tag 和 GitHub Release。
- macOS ARM 安装包作为未签名 Preview 附件，不声明 Apple 公证或 Gatekeeper 可信分发。
- Windows 安装包只在 CI 构建成功时作为 Preview 附件，不声明人工安装、升级或回退通过。
- Apple 证书、公证凭据和 Windows 设备不构成本次源码发布阻塞。

## 仓库状态

- 规范仓库：`/Users/shovy/Documents/skill-panel`
- 默认分支：`main`
- 发布收口分支：`codex/rel-3.8.3-source-release`
- 发布前 main：`f23ef8dcc4eb63c80e4508c9afb3e348a7d707b3`
- 应用版本：npm、Tauri、Cargo 均为 `3.8.3`
- 应用入口：`src/main.tsx` -> `src/layout/AppShell.tsx`
- CI：Windows NSIS 与 macOS App/DMG 构建

## 已完成证据

- candidate-2 修复与记录：`03865b3`、`57b29ae`、`2046733`。
- macOS 8A：真实 Skill、分页、搜索、筛选和 Library -> Detail -> Editor 流程通过。
- macOS 8B：v3.8.2 安装、升级到 v3.8.3、数据保留、回退和最终安装通过。
- candidate-2 DMG SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- 数据保护：设置和 Skill 文件数量、组合指纹在升级与回退期间保持一致。

## 当前收口内容

- 从最终源码提交重新执行完整验证和 macOS ARM Preview 构建。
- 建立 `output/releases/v3.8.3/` 正式源码发布归档。
- 创建并推送 annotated tag `v3.8.3`。
- 创建 GitHub Release 并上传源码发布附件和 Preview 安装包。
- 归档历史引用，清理已合并、废弃和失效分支。
- 同步 Git 文档和 Obsidian 项目总览。

## 保留限制

- macOS Preview 没有 Developer ID 签名和 Apple 公证，可能触发 Gatekeeper。
- Windows Preview 未完成人工安装、Credential Store、系统废纸篓、升级和回退验收。
- candidate-1 继续作为失败证据保留，禁止覆盖。
