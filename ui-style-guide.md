# Skill Panel v3.8.1 UI 样式规范

本文件是 Skill Panel UI 工作的执行标准。规范基于 v3.8.1 和 AI Rail 集成后的界面语言整理。

## 产品气质

Skill Panel 是用于管理本地 skills 的桌面生产力工具。界面要安静、紧凑、偏操作台，强调清晰工作区、紧凑控件、状态可见和快速浏览。

## 布局

- 使用现有 shell 模式：全局顶栏、页面工作区、上下文抽屉或工具 rail。
- 主工作区保持全高。
- 卡片只用于重复条目、模态框、抽屉和工具面板。
- 网格、rail、卡片、按钮、计数器、编辑器面板需要稳定尺寸。
- v3.8.1 编辑器保持三列：文件 rail、编辑区、预览或 AI rail。
- AI 工具位于右侧 rail，diff 确认使用模态框。

## 颜色 Token

使用 `src/styles/tokens.css` 和 `src/styles.css` 中的 token。

核心表面：

- 应用背景：`--bg` 或 `--background`
- 主面板：`--surface`
- 次级面板：`--surface-2`
- 轻量填充：`--surface-3`
- 边框：`--border`、`--border-2`、`--outline-variant`

文字：

- 主文字：`--text` 或 `--on-surface`
- 次级文字：`--text-2` 或 `--on-surface-variant`
- 弱化文字：`--text-muted`
- 元信息文字：`--text-faint`

状态：

- 主操作：`--accent`
- 成功：`--success`
- 警告：`--warning`
- 危险：`--danger`
- AI 中性表面：`--ai-soft`
- AI 文字：`--ai-text`

已有 token 能满足时，不新增十六进制颜色。重复出现的新语义角色可以新增 token。

## 字体

- 使用应用已定义的系统 UI 字体。
- 工作区紧凑标题保持在 12-16px。
- 元信息、标签、表格行、rail 文本使用 10-12px。
- 等宽字体只用于代码、Markdown、diff 行、路径和日志。
- 字间距保持 `0`。
- 字号不得随视口宽度缩放。

## 间距

- 紧凑控件内部间距：4-8px。
- 标准面板内边距：10-16px。
- 密集行高：24-36px。
- 卡片和列表行需要可预测间距，避免布局跳动。
- 优先使用圆角 token：`--radius-sm`、`--radius-md`、`--radius-lg`、`--radius-pill`。
- 新增重复 UI 默认使用 8px 圆角，已有局部模式可沿用当前 token。

## 按钮和控件

- 紧凑工具优先使用清晰的 Material Symbol 图标按钮。
- 需要明确语义的命令使用文字按钮。
- 破坏性操作使用 danger token。
- 禁用态使用透明度，保留布局尺寸。
- 纯图标控件必须提供可访问标签或 title。
- 二元设置使用 `Toggle`。
- 少量模式切换使用分段控件。
- 多步骤选择使用菜单、抽屉或模态框。

## 图标

- 使用 Material Symbols，并匹配现有 v3.8.1 页面。
- 当前 AI 图标：
  - `auto_awesome`：AI 入口
  - `account_tree`：完善结构
  - `notes`：优化描述
  - `auto_fix_high`：润色正文
  - `sell`：生成 frontmatter
  - `policy`：安全审查
  - `stop_circle`：取消
  - `shield`：隐私提示
- 密集 UI 中图标尺寸保持 14-20px。

## AI Rail

AI Rail 是助手型工作流的参考模式。

必备状态：

- 空闲态展示动作列表
- 生成态展示流式文本
- 生成期间可取消
- 错误或缺少 Key 提示
- 写回前 diff 确认
- 费用和 token 摘要

行为规则：

- 生成前检查所选厂商是否已存储 API Key。
- 写回动作不得直接覆盖编辑器内容。
- 写回动作必须展示 diff 确认。
- 安全审查为只读动作。
- 生成内容需要可选择、可滚动。
- 用户接受前保留编辑器草稿。

## Diff 模态框

- AI diff 审查使用模态框覆盖层。
- 展示修改块数量、新增行、删除行、token 数和费用。
- 默认选中全部修改块。
- 支持全选、取消全选、拒绝、采纳所选、全部接受。
- 代码层从底部向顶部应用 hunk，避免行偏移。
- diff 行使用等宽字体并允许换行。

## 表单

- 标签短而明确，直接对应字段。
- 帮助文字放在标签下方，使用弱化文字。
- 输入框保持统一高度和边框。
- 密码字段不得把密钥回显到设置状态。
- API Key 通过后端 Keychain 命令存储。

## 抽屉、Rail 和模态框

- 抽屉用于详情和次级工作流。
- Rail 用于当前工作区绑定的持续工具。
- 模态框用于确认、审查和阻塞式决策。
- 页面区块避免套入卡片式外框。

## 动效

- 动效用于解释状态变化，保持克制。
- 使用现有 0.15-0.2s 左右的过渡节奏。
- hover、active、模态框淡入保持轻量。
- 避免装饰性动态背景。
- 不要用会移动编辑器文字、卡片网格或控件位置的布局动画。

## 可访问性

- 操作使用语义化 button。
- 纯图标按钮需要 `aria-label` 或 `title`。
- 保留键盘焦点可见状态。
- 文本对比度遵守当前 token。
- 关键状态不得只依赖颜色表达。
- Toast 文案短、明确、可行动。

## 响应式规则

- 应用以桌面为主，最小宽度接近 900px。
- 1024x768、1280x800、1440x960 下内容不得重叠。
- 按钮和卡片文本需要完整显示或自然换行。
- rail 和侧栏保持固定宽度，除非页面已有响应式模式。

## 文件归属

- 全局 token：`src/styles/tokens.css`
- 全局基础样式：`src/styles.css`
- 共享 UI 组件：`src/components/ui.tsx`、`src/components/ui.css`
- AI UI：`src/components/ai/**`
- 页面局部样式：`src/pages/**/**.css`

新增 UI 仅在页面专属时放入页面 CSS。复用超过两个位置后，应抽取到共享组件或共享样式。

## 验证

UI 工作验收前运行：

```bash
npm run typecheck
npm test
npm run build
```

可见布局变化需要额外截取 Playwright 截图：

- 1024x768
- 1280x800
- 1440x960

涉及 Tauri 或后端联动 UI 时，还需要运行：

```bash
npm run cargo:test
```

