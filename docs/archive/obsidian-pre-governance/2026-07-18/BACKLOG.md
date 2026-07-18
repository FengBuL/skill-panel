---
title: Skill Panel Backlog
date: 2026-07-10
updated: 2026-07-16
tags: [SkillPanel, Backlog, 产品规划]
status: active
---

# Skill Panel Backlog

> [!info] 当前执行状态
> `DATA-EDITOR-01` 已完成，最终 commit 为 `9993992a164fd9f12fe8312223d0238e5b107666`。`SEC-FILE-01D` 已完成，收口 HEAD 为 `fba74aeb030d89e626a04f665f6ac17b1054601d`。第 5 步可关闭，下一步进入第 6 步。

## P0：稳定性与数据安全

- [x] 复核 v3.8.2 Dashboard 视觉 QA 的 `dashboard is visible` 失败，确认根因为 PageHeader DOM 类名契约，并恢复 11/11。
- [x] `DATA-EDITOR-01`：为 Editor 保存、外部冲突和版本恢复建立 Rust 后端内部备份，失败时保留原文件与草稿。
- [x] `DATA-EDITOR-01`：版本历史按规范化完整路径 SHA256 隔离，避免不同根目录的同名 Skill 串档。
- [x] `DATA-EDITOR-01`：AI diff 只进入编辑器草稿，统一通过保存流程写回。
- [x] `SEC-FILE-01`：删除采用系统废纸篓 + 应用内备份，并在 macOS 临时 Skill 场景验证。
- [ ] `SEC-FILE-01`：Windows 系统废纸篓事务独立验证。
- [x] `SEC-FILE-01`：插件缓存和系统来源增加显著风险提示、默认只读与复制到可编辑目录。
- [ ] `SEC-FILE-01`：为 Detail 独立“备份”按钮设计后端命令契约、成功反馈、失败保护和测试；完成前按钮保持禁用并标注待实现。
- [x] API Key 统一经系统 Keychain/Credential Store 命令契约保存，日志与截图执行脱敏检查；自动化使用 mock Keychain。
- [ ] 真实 macOS Keychain 写入测试：等待用户明确同意虚构 Key、测试 vendor 和安全清理路径。
- [ ] Windows Credential Store 写入、读取状态和清理路径独立验证。
- [x] 盘点稳定线未提交改动并建立可回退代码基线；当前 5 份既有或随批次更新的项目文档修改仍需保留和收口。
- [ ] 建立真实桌面端核心点击流 smoke test。

## P1：已有 Skill 管理效率

- [ ] `SEC-FILE-01`：归档、取消归档与启用/禁用保持独立语义；归档使用 `skillArchives + save_app_settings`。
- [ ] Skill 质量校验结果可解释，并能定位到具体段落。
- [ ] 依赖分析支持缺失依赖、循环依赖和影响范围。
- [ ] Dependencies 接入真实数据后增加独立视觉 QA 场景，覆盖导航高亮、加载、无依赖、部分成功和失败状态。
- [x] `DATA-EDITOR-01`：版本历史支持查看差异、安全恢复、恢复前快照和 20 份/30 天保留策略。
- [ ] 搜索、筛选、标签、分类的组合状态可持久化。
- [ ] 批量操作增加预览清单和撤销路径。

## P1：发布与跨平台

- [ ] macOS 真实设备签名、公证、安装与路径打开验收。
- [ ] Windows 安装升级与旧数据保留验证。
- [ ] Windows 安装包 SHA256、更新说明、上一版安装包回退材料统一归档。
- [x] v3.8.2 的 npm、Tauri 与 Cargo 版本号保持一致。
- [x] 补齐 v3.8.2 tag、macOS 安装包 SHA256、文件大小与发布说明归档。
- [ ] 补齐 v3.8.2 Windows 安装包、签名/公证、真实安装验证和上一版安装包回退材料。
- [ ] 生成 `docs/releases/v3.8.2/release-manifest.md`，复用现有 macOS 归档并按平台记录缺失项。

## P2：体验优化

- [ ] Logs 详情接入真实调用 ID 后移除固定占位 ID。
- [ ] Dependencies 接入真实页面级依赖聚合命令后展示拓扑和风险摘要。
- [ ] Editor 新建 Skill 模板流独立设计，避免与已加载 Skill 编辑混用。
- [ ] 1024×768 下复杂编辑器与抽屉的密度复查。
- [ ] 键盘导航、焦点顺序、图标无障碍名称审计。
- [ ] 空白、加载、失败、部分成功状态的文案统一。
- [ ] 大量 Skill 下的虚拟列表与性能基准。

## v3.9 候选池

以下事项等待 v3.8.3 完成后排序，保存恢复、版本历史、归档和本地删除不再重复列为新目标：

- [ ] Dashboard 使用真实 Skill、日志、健康和归档数据，移除 fallback 数字与样例项。
- [ ] Dependencies 接入真实依赖分析、缺失依赖、循环依赖和失败状态。
- [ ] Logs 接入真实搜索、状态筛选、选中详情和统一脱敏后的成本汇总。
- [ ] Settings 偏好持久化、Keychain 状态初始化和脱敏说明。
- [ ] Library Filter/Sort、分类、归档筛选和组合状态持久化。
- [ ] Detail 真实元数据、使用统计、质量校验和依赖摘要。

## 讨论区

以下主题需要先写产品说明、风险清单和数据方案：

- 云同步与多设备。
- 在线 Skill 市场、分享与社区分发。
- 账号体系与团队权限。
- AI 自动生成完整 Skill 或批量生成。
- 遥测、埋点、订阅与付费。

## 进入开发的条件

每个事项需要补齐：目标用户、真实场景、预期结果、范围、数据风险、验收方式、前置依赖和回退方案。满足后再进入 [[CURRENT-PLAN]]。
