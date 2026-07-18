# Skill Panel UI/UX Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Windows 安装验收中发现的 9 个高优先级 UI/UX 与数据展示问题。

**Architecture:** 本计划拆成 4 个可独立审查的子会话，分别处理列表体验、详情阅读、扫描状态/时间/Agents 详情、响应式布局。所有会话都从最新 `codex/skill-panel-app` 创建独立 worktree，完成后推送模块分支并等待主控审核。

**Tech Stack:** Tauri 2、React 19、TypeScript、Rust、Vitest、Testing Library。

---

## Change Set A：列表密度、分页与左侧筛选清理

**会话标题：** `Skill 面板 - 18 列表分页与筛选清理`

**分支：** `codex/skill-panel-18-list-pagination`

**溯源板块：** 07 Skill 列表、06 UI 外壳

**覆盖问题：** 1、3、6

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/i18n/resources.ts`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: 写失败测试，覆盖描述两行截断、每页 10 条和筛选区移除**

在 `src/App.test.tsx` 增加测试：

```tsx
it('paginates skills by 10 items and removes low-value install issue filters', async () => {
  const manySkills = Array.from({ length: 12 }, (_, index) => ({
    path: `C:\\Users\\demo\\.codex\\skills\\skill-${index + 1}\\SKILL.md`,
    name: `Skill ${index + 1}`,
    description: `Long description ${index + 1} with enough words to exceed a compact row and prove the list remains dense.`,
    source: 'codex-user' as const,
    parseStatus: 'parsed' as const,
    modifiedAt: '2026-06-12T08:00:00Z',
  }));

  mockInvoke({ skills: manySkills });
  render(<App />);

  expect(await screen.findByText('Skill 1')).toBeInTheDocument();
  expect(screen.getByText('Skill 10')).toBeInTheDocument();
  expect(screen.queryByText('Skill 11')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '下一页' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: '可写' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '有问题' })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
```

Expected: 新增测试失败，原因包括分页控件不存在或列表仍展示超过 10 条。

- [ ] **Step 3: 实现分页状态和分页派生数据**

在 `src/App.tsx` 中增加：

```tsx
const skillsPerPage = 10;
const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.max(1, Math.ceil(filteredSkills.length / skillsPerPage));
const normalizedCurrentPage = Math.min(currentPage, totalPages);
const visibleSkills = filteredSkills.slice(
  (normalizedCurrentPage - 1) * skillsPerPage,
  normalizedCurrentPage * skillsPerPage,
);

useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, sourceFilter, statusFilter]);
```

把表格渲染从 `filteredSkills.map` 改为 `visibleSkills.map`。

- [ ] **Step 4: 增加分页控件和 i18n 文案**

在 `src/App.tsx` 列表底部增加：

```tsx
<nav className="pagination-bar" aria-label={t('pagination.ariaLabel')}>
  <button type="button" disabled={normalizedCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
    {t('pagination.previous')}
  </button>
  <span>{t('pagination.pageStatus', { page: String(normalizedCurrentPage), total: String(totalPages) })}</span>
  <button type="button" disabled={normalizedCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
    {t('pagination.next')}
  </button>
</nav>
```

在 `src/i18n/resources.ts` 增加中英文 key：

```ts
'pagination.ariaLabel': 'Skill 分页',
'pagination.previous': '上一页',
'pagination.next': '下一页',
'pagination.pageStatus': '第 {{page}} / {{total}} 页',
```

```ts
'pagination.ariaLabel': 'Skill pagination',
'pagination.previous': 'Previous',
'pagination.next': 'Next',
'pagination.pageStatus': 'Page {{page}} of {{total}}',
```

- [ ] **Step 5: 移除左侧低价值筛选区**

从 `src/App.tsx` 移除包含 `filters.writable` 与 `filters.withIssues` 的侧栏按钮区。保留顶部搜索区域中的来源和状态下拉筛选。

- [ ] **Step 6: 设置列表描述两行截断样式**

在 `src/styles.css` 增加：

```css
.skill-description-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  max-height: 2.7em;
}
```

在描述单元格中使用：

```tsx
<td><span className="skill-description-cell">{skill.description}</span></td>
```

- [ ] **Step 7: 验证并提交**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run typecheck
npm.cmd run packaging:check
git diff --check
```

Commit:

```powershell
git add src/App.tsx src/styles.css src/i18n/resources.ts src/App.test.tsx
git commit -m "fix: improve skill list pagination and filters"
```

---

## Change Set B：详情阅读区与路径跳转

**会话标题：** `Skill 面板 - 19 详情阅读和路径跳转`

**分支：** `codex/skill-panel-19-detail-reading-paths`

**溯源板块：** 08 详情编辑、04 文件操作

**覆盖问题：** 2、4

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/i18n/resources.ts`
- Modify: `src/App.editor.test.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: 写失败测试，覆盖路径点击和详情阅读区**

在 `src/App.editor.test.tsx` 增加测试：

```tsx
it('opens the selected skill folder from detail path and keeps markdown area readable', async () => {
  mockInvoke({ skills: scanResults });
  render(<App />);

  await userEvent.click(await screen.findByText('imagegen'));
  await userEvent.click(screen.getByRole('button', { name: /C:\\Users\\demo\\.codex\\skills\\imagegen\\SKILL.md/ }));

  expect(invokeMock).toHaveBeenCalledWith('open_skill_folder', {
    path: 'C:\\Users\\demo\\.codex\\skills\\imagegen\\SKILL.md',
  });
  expect(screen.getByLabelText('Markdown 正文')).toHaveClass('markdown-editor-fill');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm.cmd test -- --run src/App.editor.test.tsx
```

Expected: 路径按钮或 `markdown-editor-fill` class 缺失。

- [ ] **Step 3: 抽取可点击路径组件**

在 `src/App.tsx` 中创建：

```tsx
function ClickablePath({ path, onOpen }: { path: string; onOpen: (path: string) => void }) {
  return (
    <button type="button" className="path-link" onClick={() => onOpen(path)} title={path}>
      {path}
    </button>
  );
}
```

把列表路径和详情路径都改为 `ClickablePath`。

- [ ] **Step 4: 让打开目录支持传入路径**

在 `src/App.tsx` 中新增：

```tsx
const openSkillFolderByPath = async (path: string) => {
  setDetailError(null);
  try {
    await invoke('open_skill_folder', { path });
  } catch (error) {
    setDetailError(error instanceof Error ? error.message : String(error));
  }
};
```

- [ ] **Step 5: 调整详情布局和 Markdown 编辑区高度**

在 `src/styles.css` 增加或更新：

```css
.details-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-editor-fill {
  min-height: 320px;
  flex: 1;
  resize: vertical;
}

.path-link {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0;
  font: inherit;
  cursor: pointer;
  word-break: break-all;
}
```

- [ ] **Step 6: 验证并提交**

Run:

```powershell
npm.cmd test -- --run src/App.editor.test.tsx src/App.test.tsx
npm.cmd run typecheck
npm.cmd run packaging:check
git diff --check
```

Commit:

```powershell
git add src/App.tsx src/styles.css src/i18n/resources.ts src/App.editor.test.tsx src/App.test.tsx
git commit -m "fix: expand details reading area and clickable paths"
```

---

## Change Set C：扫描状态、时间格式与 Agents 详情

**会话标题：** `Skill 面板 - 20 扫描状态时间和 Agents 详情`

**分支：** `codex/skill-panel-20-scan-time-agents`

**溯源板块：** 03 扫描后端、04 文件操作、08 详情编辑

**覆盖问题：** 5、7、8

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/i18n/resources.ts`
- Modify: `src/App.test.tsx`
- Modify: `src/types/skill.ts` if scan summary type is introduced
- Modify: `src-tauri/src/skill_store.rs` if Agents read validation fails
- Modify: `src-tauri/src/skill_scanner.rs` if backend summary is required
- Modify: `src-tauri/tests/skill_contract.rs` if contract changes

- [ ] **Step 1: 写失败测试，覆盖扫描时间、扫描状态、修改时间格式、Agents 详情**

在 `src/App.test.tsx` 增加：

```tsx
it('shows concrete scan time, scan result state, formatted modified time, and agents detail metadata', async () => {
  mockInvoke({ skills: scanResults });
  render(<App />);

  await screen.findByText('standup');
  expect(screen.getByText(/上次扫描/)).toBeInTheDocument();
  expect(screen.getByText(/成功/)).toBeInTheDocument();
  expect(screen.queryByText('2026-06-01T11:00:00Z')).not.toBeInTheDocument();

  await userEvent.click(screen.getByText('standup'));
  expect(await screen.findByDisplayValue('standup')).toBeInTheDocument();
  expect(screen.getByText('Agents 用户')).toBeInTheDocument();
  expect(screen.getByText(/2026/)).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
```

Expected: 扫描状态仍显示空闲，修改时间仍为原始 ISO 或详情加载失败。

- [ ] **Step 3: 前端记录扫描时间和扫描结果**

在 `src/App.tsx` 中增加：

```tsx
type ScanState = 'not-scanned' | 'loading' | 'success' | 'partial-success' | 'failed';

const [lastScanAt, setLastScanAt] = useState<string | null>(null);
const [scanState, setScanState] = useState<ScanState>('not-scanned');
```

在扫描成功时：

```tsx
setLastScanAt(new Date().toISOString());
setScanState(nextSkills.some((skill) => skill.parseStatus !== 'parsed') ? 'partial-success' : 'success');
```

在失败时：

```tsx
setLastScanAt(new Date().toISOString());
setScanState('failed');
```

- [ ] **Step 4: 增加日期格式化函数**

在 `src/App.tsx` 中增加：

```tsx
const formatDateTime = (value: string | null | undefined, locale: Language) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
```

列表和详情中的 `modifiedAt` 都通过该函数展示。

- [ ] **Step 5: 补齐扫描状态 i18n 文案**

在 `src/i18n/resources.ts` 增加中英文 key：

```ts
'sources.scanSuccess': '成功',
'sources.scanPartialSuccess': '部分成功',
'sources.scanFailed': '失败',
```

```ts
'sources.scanSuccess': 'Success',
'sources.scanPartialSuccess': 'Partial success',
'sources.scanFailed': 'Failed',
```

- [ ] **Step 6: 修复 Agents 用户 Skill 详情读取**

检查 `src-tauri/src/skill_store.rs` 的 allowed roots 和来源识别。验收目标：

```rust
assert!(allowed_roots.iter().any(|root| root.ends_with(".agents/skills") || root.ends_with(".agents\\skills")));
```

如果 read validation 只允许 `.codex`，把 `.agents/skills` 纳入读取、更新、删除、打开目录的 allowed roots。

- [ ] **Step 7: 验证并提交**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run typecheck
npm.cmd run packaging:check
npm.cmd run cargo:test
git diff --check
```

Commit:

```powershell
git add src/App.tsx src/i18n/resources.ts src/App.test.tsx src/types/skill.ts src-tauri/src/skill_store.rs src-tauri/src/skill_scanner.rs src-tauri/tests/skill_contract.rs
git commit -m "fix: show scan status times and agents details"
```

---

## Change Set D：响应式窗口布局验收

**会话标题：** `Skill 面板 - 21 响应式窗口布局`

**分支：** `codex/skill-panel-21-responsive-layout`

**溯源板块：** 06 UI 外壳、10 测试补强

**覆盖问题：** 9，并回归 1、2、3 的布局影响

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.tsx` if wrapper class names need adjustment
- Modify: `src/App.test.tsx`

- [ ] **Step 1: 写布局结构测试**

在 `src/App.test.tsx` 增加：

```tsx
it('uses fluid app layout containers for resizing windows', async () => {
  mockInvoke({ skills: scanResults });
  render(<App />);

  expect(await screen.findByRole('main')).toHaveClass('app-main-fluid');
  expect(screen.getByRole('region', { name: 'Skills' })).toHaveClass('panel-fill');
  expect(screen.getByRole('complementary', { name: 'Skill details' })).toHaveClass('panel-fill');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
```

Expected: fluid layout class 缺失。

- [ ] **Step 3: 调整主布局 CSS**

在 `src/styles.css` 更新：

```css
html,
body,
#root {
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 100%;
}

.app-shell {
  width: 100%;
  min-width: 0;
  min-height: 100vh;
}

.app-main-fluid {
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - 72px);
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(360px, 1fr) minmax(420px, 0.95fr);
  gap: 16px;
  align-items: stretch;
}

.panel-fill {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

@media (max-width: 1100px) {
  .app-main-fluid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: 添加必要 className**

在 `src/App.tsx` 中让主区域与面板使用：

```tsx
<main className="app-main-fluid">
  <aside className="panel sidebar panel-fill" ...>
  <section className="panel skill-list-panel panel-fill" ...>
  <aside className="panel details-panel panel-fill" ...>
</main>
```

- [ ] **Step 5: 验证并提交**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
git diff --check
```

Commit:

```powershell
git add src/App.tsx src/styles.css src/App.test.tsx
git commit -m "fix: make desktop layout responsive"
```

---

## Final Integration Verification

主控会话审核 4 个子会话后，在 `codex/skill-panel-app` 运行：

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
npm.cmd run cargo:test
npm.cmd run tauri:build:windows
git diff --check
```

通过后提交集成更新并推送 GitHub。每个模块分支和集成分支都需要写清楚本次更新备注。
