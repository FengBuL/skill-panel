# Skill Panel 仓库治理执行计划

> 执行要求：按批次完成保护、基线、规则、代码清理、文档收口和维护，每个批次完成后保留验证证据。

**目标：** 让新会话稳定识别 `main`、v3.8.3 当前入口和双线协作边界，消除旧原型被当作默认基线的条件。

**架构策略：** Git 仓库持有可执行事实，Obsidian 持有阅读摘要；WorkBuddy 验证高不确定性交互，Codex 在稳定架构中完成已验收契约。

**技术栈：** Tauri 2、React 19、TypeScript、Rust、Vitest、Playwright、GitHub Actions。

## 批次

1. 保护候选分支、混合分支、设置、安装包和验收证据。
2. 完成 v3.8.3 candidate-2 8B。
3. 修复 Obsidian 路径和自动化同步方向。
4. 建立并推送 `main`，设置为远端默认分支。
5. 增加治理规则、任务模板、原型交接模板、当前架构和 `repo:doctor`。
6. 清理旧入口、旧测试和无引用样式。
7. 收口 Obsidian 阅读入口并归档重复文档。
8. 清理失效 worktree 记录，评估缓存和日志维护。
9. 完成全量测试、视觉验收和最终状态记录。

## 验证

```bash
npm run repo:doctor
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```
