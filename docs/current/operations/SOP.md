---
项目: Skill Panel
任务: REL-3.8.3-SOURCE-RELEASE
版本: 3.8.3
发布对象: 开源源码、Git tag、GitHub Release、Preview 安装包
更新时间: 2026-07-19
---

# SOP

## 第 9 步开源源码发布收口

1. 固定最终源码提交并确认 npm、Tauri、Cargo 版本均为 `3.8.3`。
2. 运行完整验证、视觉 QA 和仓库治理检查。
3. 从固定源码提交生成源码归档、Git rollback bundle 和 macOS ARM Preview。
4. macOS Preview 明确标注未签名、未公证和 Gatekeeper 风险。
5. Windows NSIS 只在 CI 构建成功时作为未验收 Preview 保留。
6. 发布 PR 合并到 `main` 后创建 annotated tag `v3.8.3`。
7. 创建 GitHub Release，上传清单、校验值、源码归档、rollback bundle 和 Preview 产物。
8. 归档并清理历史分支，修正远程默认引用。
9. 更新 Git 状态文档和 Obsidian 摘要。

本次发布不会读取或索取 Apple 证书、公证凭据和任何 secrets。

## 第 7 步 macOS 候选流程

1. 确认分支、HEAD、最近提交、工作区状态、diff stat 和版本元数据。
2. 使用只读命令确认签名和公证前置条件。
3. 将 npm、Tauri、Cargo、Cargo.lock 包版本统一为 `3.8.3`。
4. 保持业务功能不变。
5. 更新版本一致性测试。
6. 运行完整验证：

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

7. 验证通过后创建 v3.8.3 候选代码提交；candidate-1 已在人工安装验收中失败，candidate-2 已通过 8A 人工验收。
8. 在当前 macOS 真机构建 App 和 DMG。若当前 shell 找不到 Cargo，使用 `PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`。
9. 将候选产物存放到 `output/releases/v3.8.3-candidate/`。
10. 记录 commit、文件名、大小、SHA256、架构、bundle id、应用版本、构建命令、测试结果、签名状态、公证状态和回退点。

## 门槛口径

- 第 7 步平台目标为 macOS。
- Windows 基线缺失只阻塞 Windows 候选生成。
- macOS 可独立生成候选。
- v3.8.2 macOS DMG 是第 8 步基线。
- 第 8 步使用 v3.8.3 候选 DMG 执行真实升级、数据保留和安装包回退验证。
- macOS 签名和公证是可信 macOS 安装包分发门槛。
- 开源源码、Git tag 和 GitHub Release可以在明确 Preview 限制后发布。

## 第 8 步准备

### 基线

- DMG 路径：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

### 候选

- candidate-1 DMG 路径：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`
- candidate-1 SHA256：`7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`
- candidate-2 DMG 路径：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg`
- candidate-2 SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`

### 可丢弃测试 Skill

- 名称：`skill-panel-l3-upgrade-test`
- 内容：创建一个简单 Markdown Skill，包含唯一标题、一个 tag 和一段短正文。
- 用途：验证 Skill 列表、详情页、文件内容和回退行为。
- 限制：创建前必须征得用户确认；禁止修改其他真实 Skill。

## 8A 人工验收记录

- 日期：2026-07-17。
- candidate-2 8A 结论：人工验收通过。
- 已确认：安装版能够加载本机真实 Skill，没有显示固定演示 Skill，Library 分页正常，超过 100 个 Skill 可以进入中间页和最后一页，搜索、筛选和页码重置正常，Library → Detail → Editor → Detail → Library 流程正常。
- 暂未发现新的 8A 问题。

## 8B 执行原则

- 每次只给用户一个操作，并等待用户反馈后继续。
- 安装操作前先完成安全备份。
- 备份只复制 `~/.codex/skill-panel/settings.json`、`~/.codex/skill-panel/versions/`、`call_logs.jsonl` 和 `audit.log`。
- 记录备份路径、设置文件 SHA256、版本历史目录文件数量。
- 不移动、不删除原文件。
- 不读取或输出 API Key、Token 或真实 Skill 内容。
- 任一真实 Skill 丢失、内容变化或设置无法读取时立即停止。
- 回退通过后询问用户是否重新安装 candidate-2，未经确认不得决定最终保留版本。

### 升级前检查清单

- 截图记录已安装应用版本。
- 截图记录现有 Skill 数量。
- 截图记录可丢弃 Skill 的标题、tag、颜色、类目和文件路径。
- 记录设置语言和扫描路径。
- 记录应用数据目录时间戳或备份路径。

### 升级后检查清单

- 确认应用版本为 `3.8.3`。
- 确认可丢弃 Skill 仍可见且可编辑。
- 确认类目、tag、颜色和正文保持一致。
- 确认设置语言和扫描路径保持一致。
- 确认日志中没有启动迁移错误。

### 回退操作步骤

1. 退出 Skill Panel。
2. 使用 v3.8.2 基线 DMG 覆盖安装 v3.8.3 候选。
3. 启动 Skill Panel。
4. 确认应用版本回到 `3.8.2`。
5. 确认可丢弃 Skill 和设置仍可用，或记录具体兼容性问题。
6. 退出 Skill Panel，并保留截图和日志。

### 所需截图

- 升级前 v3.8.2 应用版本。
- 升级前可丢弃 Skill 详情。
- 升级后 v3.8.3 应用版本。
- 升级后可丢弃 Skill 详情。
- 升级后设置路径。
- 回退后 v3.8.2 应用版本。
- 回退后可丢弃 Skill 详情。
- 内部候选触发的 macOS 未签名警告弹窗。

## 第 8 步失败处理

- 发现安装版虚拟数据或 Library 分页缺陷时，第 8 步立即标记为验证失败。
- 保留失败候选目录、文件大小和 SHA256。
- 修复批次使用独立 candidate-2 目录。
- 修复批次完成前禁止创建正式 tag，禁止发布。

## 8B 执行记录

- 日期：2026-07-18。
- 安全备份、v3.8.2 基线、candidate-2 升级、v3.8.2 回退和 candidate-2 最终安装均已执行。
- 设置文件与两个默认 Skill 根目录的数量和组合 SHA256 全程一致。
- candidate-2 显示 120 个真实 Skill、20 页分页和末页 `115–120 / 120`。
- 用户确认最终保留 candidate-2，本机版本为 `3.8.3`。
- 证据目录：`output/releases/v3.8.3-candidate-2/8b-evidence/`。
- 8B 结论：通过；签名、公证限制 macOS Preview 的可信分发声明，Windows 人工验收状态继续保持未完成。
