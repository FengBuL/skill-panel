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
| 状态与规则统一 | 进行中 | 活动文档没有候选/正式状态冲突和失效路径 |
| 完整验证 | 待执行 | repo doctor、前端、类型、构建、打包、Rust、视觉 QA 全部通过 |
| 最终产物 | 待执行 | 正式源码归档、rollback bundle、macOS Preview、清单和 SHA256 |
| CI 验证 | 待执行 | PR 的 macOS App/DMG 与 Windows NSIS workflow 通过 |
| Git 收口 | 待执行 | PR 合并、历史分支归档与清理、`origin/HEAD` 指向 `main` |
| 正式发布 | 待执行 | tag `v3.8.3` 和 GitHub Release 已创建 |
| Obsidian 收口 | 待执行 | 总览、Git 摘要、版本地图、开发台账和 v3.8.3 索引一致 |

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
