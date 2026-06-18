# Skill Panel v2.0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增加可持久化锁定、批量管理和更明显的卡片排序动效，并交付 v2.0.1 桌面与迁移包。

**Architecture:** 用户锁定和批量视觉属性继续走 `AppSettings` 设置边界；正文修改和删除继续走 Tauri `update_skill`、`delete_skill` 文件命令。前端以选择集合驱动批量工具栏，操作完成后用磁盘扫描结果校准界面。

**Tech Stack:** React 19、TypeScript、Vitest、Tauri 2、Rust、CSS、Playwright visual QA

---

### Task 1: 持久化用户锁定状态

**Files:**
- Modify: `src/types/skill.ts`
- Modify: `src/types/skill.test.ts`
- Modify: `src/i18n/runtime.tsx`
- Modify: `src/i18n/useI18n.test.tsx`
- Modify: `src-tauri/src/models.rs`
- Modify: `src-tauri/src/settings_store.rs`

- [ ] **Step 1: 写失败测试**

在类型和设置测试中要求 `skillLocks?: Record<string, boolean>`，并验证以下设置可往返：

```ts
skillLocks: {
  'C:\\Users\\demo\\.codex\\skills\\imagegen\\SKILL.md': true,
}
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm.cmd test -- src/types/skill.test.ts src/i18n/useI18n.test.tsx --reporter=dot`

Expected: FAIL，`skillLocks` 未进入类型或保存载荷。

- [ ] **Step 3: 最小实现**

在 TypeScript 和 Rust `AppSettings` 中加入 `skillLocks`，运行时规范化为布尔值为 `true` 的路径映射，空映射不写入磁盘。

- [ ] **Step 4: 验证前端和 Rust 设置测试**

Run: `npm.cmd test -- src/types/skill.test.ts src/i18n/useI18n.test.tsx --reporter=dot`

Run: `npm.cmd run cargo:test`

Expected: 全部 PASS。

### Task 2: 永久锁定与用户锁定交互

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/App.editor.test.tsx`
- Modify: `src/i18n/resources.ts`

- [ ] **Step 1: 写失败测试**

覆盖：插件和 lark Skill 始终显示 `lock`；可写 Skill 右键出现“锁定”；锁定后编辑标签页禁用；再次右键可“解锁”；重载设置后仍锁定。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm.cmd test -- src/App.test.tsx src/App.editor.test.tsx --reporter=dot`

Expected: FAIL，缺少锁定菜单和 `skillLocks` 状态。

- [ ] **Step 3: 最小实现**

增加以下权限判断：

```ts
const isPermanentlyLocked = (skill: SkillSummary | SkillDetail) => !isWritableSkill(skill);
const isSkillLocked = (skill: SkillSummary | SkillDetail) =>
  isPermanentlyLocked(skill) || Boolean(skillLocks[skill.path]);
```

右键菜单按状态调用 `updateSkillLock(path, true | false)` 并持久化；详情编辑权限使用 `isSkillLocked`。

- [ ] **Step 4: 验证测试**

Run: `npm.cmd test -- src/App.test.tsx src/App.editor.test.tsx --reporter=dot`

Expected: 新增锁定用例 PASS。

### Task 3: 批量选择和批量操作

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/i18n/resources.ts`

- [ ] **Step 1: 写失败测试**

覆盖卡片和列表选择、选择全部筛选结果、选择当前类目、批量类目、标签、颜色、锁定、解锁，以及删除确认后逐项调用：

```ts
expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: firstPath });
expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: secondPath });
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: FAIL，批量选择入口和批量工具栏不存在。

- [ ] **Step 3: 最小实现**

新增：

```ts
const [selectionMode, setSelectionMode] = useState(false);
const [selectedSkillPaths, setSelectedSkillPaths] = useState<Set<string>>(() => new Set());
```

批量设置操作在一份新 settings 快照中更新所有路径并保存一次；批量删除逐项等待 `delete_skill`，失败路径保持选中，完成后调用 `scanSkills()`。

- [ ] **Step 4: 验证测试**

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: 批量行为用例 PASS。

### Task 4: 强化拖拽排序动效

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: 写失败测试**

验证拖动经过目标卡片时出现 `drag-over-card`，源卡片出现 `dragging-card`，释放后两者清理且顺序设置已保存。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: FAIL，缺少目标卡片状态。

- [ ] **Step 3: 最小实现**

增加 `dragOverSkillPath`，pointer move 用 `elementFromPoint` 更新目标；CSS 为源卡片、目标卡片、相邻卡片定义 transform、outline、box-shadow 和 180ms transition。

- [ ] **Step 4: 验证测试**

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: 拖拽状态和持久化测试 PASS。

### Task 5: 真实文件更新删除与导航精简

**Files:**
- Modify: `src-tauri/src/skill_store.rs`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/i18n/resources.ts`

- [ ] **Step 1: 写失败或强化回归测试**

Rust 临时目录测试验证 `update_skill` 后磁盘 `SKILL.md` 内容变化，`delete_skill` 后 Skill 目录不存在；前端测试验证删除成功后重新调用 `scan_skills`。另加测试确认左侧无“需要关注”。

- [ ] **Step 2: 运行测试确认行为边界**

Run: `npm.cmd run cargo:test`

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: 真实文件测试保持 PASS，导航测试在删除入口前 FAIL。

- [ ] **Step 3: 最小实现**

移除左侧 `governance.needsAttention` 按钮和相关计数展示。保持文件命令为唯一正文更新和删除路径，批量删除也复用同一命令。

- [ ] **Step 4: 验证测试**

Run: `npm.cmd run cargo:test`

Run: `npm.cmd test -- src/App.test.tsx --reporter=dot`

Expected: 全部 PASS。

### Task 6: v2.0.1 交付

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/Cargo.lock`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `scripts/visual-qa.mjs`
- Modify: `docs/skill-panel-product-bug-review.md`
- Regenerate: `output/playwright/*`

- [ ] **Step 1: 更新版本与文档**

将应用版本统一改为 `2.0.1`，产品复盘追加拖拽反馈、锁定模型、批量操作、真实文件边界和导航精简。

- [ ] **Step 2: 运行完整验证**

Run: `npm.cmd test -- --reporter=dot`

Run: `npm.cmd run cargo:test`

Run: `npm.cmd run build`

Run: `npm.cmd run visual:qa`

Run: `npm.cmd run tauri:build`

Expected: 所有命令 exit 0，视觉报告所有场景 `passed: true`。

- [ ] **Step 3: 更新桌面与迁移包**

关闭旧桌面进程，复制 `src-tauri/target/release/skill-panel.exe` 到桌面。将现有 `output/send/Skill-Panel-v2.0.0-complete` 目录重命名并重建为 `Skill-Panel-v2.0.1-complete`，覆盖原交付 zip 路径对应的 v2.0.1 文件名。

- [ ] **Step 4: 提交并推送**

```powershell
git add package.json package-lock.json src src-tauri scripts docs output/playwright
git commit -m "feat: release skill panel v2.0.1"
git push origin codex/skill-panel-app
```

Expected: GitHub 远端分支包含 v2.0.1 提交。
