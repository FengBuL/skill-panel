---
title: Skill Panel 详细用户流程图
date: 2026-07-15
updated: 2026-07-15
tags:
  - SkillPanel
  - 用户流程
  - Mermaid
  - 产品设计
  - 验收
aliases:
  - Skill Panel用户流程
  - Skill Panel流程图
status: active
project_version: 3.8.0
related:
  - "[[../日常总结/01-Skill-Panel执行SOP]]"
  - "[[../app sop及提示词/非程序员用Codex制作App全流程SOP]]"
---

# Skill Panel 详细用户流程图

这份笔记描述用户从安装 Skill Panel、扫描本机 Skill、查找、查看、新建、编辑、备份、设置 AI 到处理错误的完整过程。

关联文档：[[../日常总结/01-Skill-Panel执行SOP]]

> [!important] 流程图状态说明
> 🟢 当前已连接真实能力；🟡 当前部分连接、使用内存状态或需要桌面复核；🔴 当前主要是页面展示或仍需开发；🔵 系统自动执行；⚪ 用户确认节点。

---

## 一、用户全流程总图

```mermaid
flowchart TD
    A["用户获得 Skill Panel 安装包"] --> B["安装并启动 App"]
    B --> C["进入 Library"]
    C --> D["自动扫描本机 Skill"]
    D --> E{"扫描结果"}
    E -->|"有 Skill"| F["显示 Skill 卡片和数量"]
    E -->|"没有 Skill"| G["显示空白状态和新建入口"]
    E -->|"扫描失败"| H["显示失败原因和重试入口"]

    F --> I{"用户想做什么"}
    G --> J["新建第一个 Skill"]
    H --> K["检查目录、权限和设置"]

    I -->|"了解整体情况"| L["打开 Dashboard"]
    I -->|"查找 Skill"| M["搜索、筛选、排序和分页"]
    I -->|"查看 Skill"| N["打开详情抽屉"]
    I -->|"创建 Skill"| J
    I -->|"调整偏好"| O["打开 Settings"]
    I -->|"查看记录"| P["打开 Logs"]

    N --> Q{"Skill 是否允许编辑"}
    Q -->|"用户 Skill"| R["进入 Editor"]
    Q -->|"插件或系统 Skill"| S["只读查看或复制成用户 Skill"]

    R --> T["修改名称、描述或 Markdown"]
    T --> U["校验内容"]
    U --> V{"是否使用 AI"}
    V -->|"使用"| W["确认厂商、发送内容和费用"]
    W --> X["查看 AI 建议和差异"]
    X --> Y["接受、调整或放弃建议"]
    V -->|"跳过"| Z["准备保存"]
    Y --> Z

    Z --> AA["保存前创建快照和备份"]
    AA --> AB["写入真实 SKILL.md"]
    AB --> AC["重新扫描并核对页面结果"]
    AC --> AD["关闭并重新打开 App 验证"]

    J --> AE["填写名称、描述、目录和正文"]
    AE --> AF["创建真实 Skill 文件夹和 SKILL.md"]
    AF --> AC

    O --> AG["保存语言、扫描目录、主题和安全设置"]
    AG --> AH["重启后验证设置保持"]

    P --> AI["查看成功、失败、耗时和 Token"]
    AI --> AJ["清理或导出日志"]

    AD --> AK["继续日常使用"]
    AH --> AK
    AJ --> AK

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    classDef system fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    classDef decision fill:#ffffff,stroke:#64748b,color:#0f172a;

    class C,D,F,L,M,N,P,R,U,O,W,AI done;
    class G,H,J,Q,S,V,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AJ partial;
    class K pending;
    class B system;
    class E,I,Q,V decision;
```

### 总流程中的当前关键情况

| 流程段 | 当前状态 | 用户现在会遇到什么 |
|---|---|---|
| 打开 Library 并扫描 | 🟢 桌面真实 / 🧪 浏览器模拟 | 桌面读取本机目录，浏览器显示示例 Skill |
| Dashboard | 🟢 | 指标来自当前 Skill 列表 |
| 搜索、筛选、分页 | 🟢 | 当前页面内可正常操作 |
| 详情抽屉 | 🟡 | 可以查看摘要，部分按钮还未连接真实操作 |
| 新建 Skill | 🟡 | 已调用真实命令，默认 `~` 目录需要修正和桌面验证 |
| Editor 读取 | 🟢 | 能读取选中 Skill 的 Markdown |
| Editor 保存 | 🔴 | 当前正式页面还没有写入真实文件 |
| Settings 普通设置 | 🔴 | 多数设置只在当前内存变化 |
| AI Key | 🟢 | 写入系统 Keychain |
| AI 优化 | 🟡 | 能发送和显示结果，确认差异与写入流程仍需补齐 |
| Logs | 🟡 | 能读取日志文件，完整写入和清理流程需要确认 |

---

## 二、首次安装和启动流程

```mermaid
flowchart TD
    A["用户下载对应平台安装包"] --> B{"操作系统"}
    B -->|"Windows"| C["运行 NSIS 安装程序"]
    B -->|"macOS"| D["打开 DMG 并拖入应用程序"]

    C --> E["启动 Skill Panel"]
    D --> E

    E --> F{"系统是否允许启动"}
    F -->|"允许"| G["打开主窗口"]
    F -->|"未知开发者或签名提示"| H["用户查看发布说明"]
    H --> I{"安装包来源是否可信"}
    I -->|"可信"| J["按照系统步骤允许启动"]
    I -->|"无法确认"| K["停止启动并核对校验值"]
    J --> G

    G --> L["进入 Library"]
    L --> M["自动扫描默认 Skill 目录"]
    M --> N{"默认目录是否存在"}
    N -->|"存在"| O["读取 Skill"]
    N -->|"不存在"| P["显示空白状态"]
    O --> Q{"是否有解析错误"}
    Q -->|"没有"| R["显示完整列表"]
    Q -->|"有"| S["显示可用 Skill 和异常提示"]

    P --> T["引导新建 Skill 或添加目录"]
    S --> U["用户查看异常 Skill 路径"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    classDef decision fill:#ffffff,stroke:#64748b,color:#0f172a;

    class E,G,L,M,O,R done;
    class C,D,F,H,I,J,N,P,Q,S,T,U partial;
    class K pending;
    class B decision;
```

### 用户需要看到的信息

| 阶段 | 页面要显示什么 | 用户要确认什么 |
|---|---|---|
| 下载 | 平台、版本、处理器类型、校验值 | 文件来自正式发布位置 |
| 安装 | App 名称、图标、安装位置 | 没有安装到意外目录 |
| 首次启动 | 当前版本、扫描状态 | 启动的是刚安装的版本 |
| 首次扫描 | 扫描目录、数量、完成时间 | 扫描的是自己的真实目录 |
| 扫描异常 | 失败路径、原因、重试动作 | 是否需要授权或修复文件 |

### 当前项目发布前需要补齐

- 生成 3.8.0 Windows 和 macOS 候选安装包。
- 确认品牌图标。
- 准备 Windows 签名和 macOS 公证说明。
- 验证从旧版升级后的设置和 Skill 数据。
- 在安装版中逐页完成真实操作。

---

## 三、启动扫描详细流程

```mermaid
flowchart TD
    A["用户启动 App 或进入 Library"] --> B["Library 调用 scanSkills"]
    B --> C{"当前环境"}

    C -->|"Tauri 桌面环境"| D["调用 Rust scan_skills"]
    C -->|"浏览器预览"| E["使用 MOCK_SKILLS 示例数据"]

    D --> F["读取 settings.json"]
    F --> G["组合默认目录和自定义目录"]
    G --> H["扫描 ~/.codex/skills"]
    G --> I["扫描 ~/.agents/skills"]
    G --> J["递归发现插件 cache 中的 skills 目录"]
    G --> K["扫描用户自定义目录"]

    H --> L["发现 SKILL.md"]
    I --> L
    J --> L
    K --> L

    L --> M["读取 frontmatter 的 name 和 description"]
    M --> N{"解析结果"}
    N -->|"成功"| O["生成 SkillSummary"]
    N -->|"frontmatter 异常"| P["标记 invalid-frontmatter"]
    N -->|"读取失败"| Q["标记 read-error"]

    O --> R["前端映射成我的或插件"]
    P --> R
    Q --> R
    R --> S["推断分类"]
    S --> T["写入 skillStore"]
    T --> U["应用搜索和筛选"]
    U --> V["计算分页"]
    V --> W["显示卡片和数量"]

    E --> T

    W --> X{"用户看到的结果"}
    X -->|"有数据"| Y["开始浏览"]
    X -->|"空列表"| Z["新建或添加目录"]
    X -->|"模拟数据"| AA["页面明确提示 Tauri 不可用"]
    X -->|"部分异常"| AB["查看异常来源和文件路径"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    classDef system fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;

    class B,D,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W done;
    class E,X,Y,Z,AA,AB partial;
    class A system;
```

### 扫描结果审核表

| 用户看到的内容 | 数据来源 | 当前风险 |
|---|---|---|
| Skill 总数 | 当前 `skillStore.skills` | 模拟回退也会产生数量 |
| “我的”数量 | Codex、Agents、自定义目录映射 | 来源被压缩后细节减少 |
| “插件”数量 | plugin-cache、system、unknown 映射 | unknown 也会进入插件保护 |
| 分类 | frontmatter、标签、路径、名称、描述推断 | Rust 当前摘要未完整返回分类字段 |
| 修改时间 | 文件系统时间戳字符串 | 前端显示格式需要统一 |
| 文件大小 | 当前页面模型中常为 0 | 详情抽屉可能显示 0 KB |

### 扫描失败分支

```mermaid
flowchart TD
    A["扫描调用失败"] --> B{"运行环境"}
    B -->|"浏览器"| C["显示示例数据和模拟提示"]
    B -->|"桌面"| D["记录真实错误"]
    D --> E{"错误类型"}
    E -->|"目录不存在"| F["提示检查扫描目录"]
    E -->|"没有权限"| G["提示授权或更换目录"]
    E -->|"settings.json 损坏"| H["提示备份并重置设置"]
    E -->|"某个 Skill 解析失败"| I["保留其他结果并标记异常 Skill"]
    E -->|"未知错误"| J["提供日志和重试"]

    F --> K["用户修正后重新扫描"]
    G --> K
    H --> K
    I --> L["用户打开异常文件目录"]
    J --> K

    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class C,I partial;
    class D,F,G,H,J,K,L pending;
```

---

## 四、Library 浏览和查找流程

```mermaid
flowchart TD
    A["用户进入 Library"] --> B["看到来源、分类、状态和卡片"]
    B --> C{"用户怎样查找"}

    C -->|"输入关键词"| D["搜索名称和描述"]
    C -->|"选择来源"| E["筛选我的或插件"]
    C -->|"选择分类"| F["筛选金融、数据、文案等"]
    C -->|"选择状态"| G["筛选收藏、禁用或待关注"]
    C -->|"查看下一页"| H["切换分页"]

    D --> I["组合所有筛选条件"]
    E --> I
    F --> I
    G --> I
    H --> J["显示当前页卡片"]
    I --> K{"结果数量"}
    K -->|"有结果"| J
    K -->|"没有结果"| L["显示空结果和清除筛选入口"]

    J --> M{"用户下一步"}
    M -->|"点击卡片"| N["打开详情抽屉"]
    M -->|"点击收藏星标"| O["切换收藏状态"]
    M -->|"进入批量模式"| P["选择多个 Skill"]
    M -->|"新建"| Q["进入 Create"]

    P --> R{"批量动作"}
    R -->|"移动分类"| S["更新分类设置"]
    R -->|"添加标签"| T["更新标签设置"]
    R -->|"归档"| U["更新归档设置"]
    R -->|"清空"| V["取消选择"]

    O --> W["保存设置并更新卡片"]
    S --> W
    T --> W
    U --> W
    W --> X["重启后验证状态保持"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,Q done;
    class O,P,V partial;
    class R,S,T,U,W,X pending;
```

### Library 当前按钮状态

| 操作 | 当前用户结果 | 当前状态 |
|---|---|---|
| 搜索名称和描述 | 立即过滤卡片 | 🟢 |
| 来源筛选 | 立即过滤卡片 | 🟢 |
| 分类筛选 | 立即过滤卡片 | 🟢，分类推断还需加强 |
| 收藏 | 当前页面星标变化 | 🟡，重启后可能丢失 |
| 分页 | 切换 8 个一页 | 🟢 |
| 打开详情 | 显示详情抽屉 | 🟢 |
| 批量全选和清空 | 更新当前选择 | 🟢 页面内状态 |
| 批量移动分类 | 当前按钮缺少处理 | 🔴 |
| 批量加标签 | 当前按钮缺少处理 | 🔴 |
| 批量归档 | 显示 Toast 并退出批量 | 🔴，没有持久化 |
| 网格和列表切换 | 当前图标缺少处理 | 🔴 |
| 最近修改排序 | 当前按钮缺少处理 | 🔴 |

### 详情抽屉流程

```mermaid
flowchart TD
    A["用户点击 Skill 卡片"] --> B["打开详情抽屉"]
    B --> C["显示名称、描述、来源、分类、时间和状态"]
    C --> D{"用户动作"}

    D -->|"上一个或下一个"| E["切换抽屉中的 Skill"]
    D -->|"关闭"| F["回到 Library"]
    D -->|"打开目录"| G["调用 open_skill_folder"]
    D -->|"在编辑器打开"| H["进入 Editor 并传入 Skill 名称"]
    D -->|"归档"| I["保存归档状态"]

    H --> J["根据名称在 skillStore 找到路径"]
    J --> K["调用 read_skill 读取真实 Markdown"]
    K --> L{"读取结果"}
    L -->|"成功"| M["显示真实编辑内容"]
    L -->|"失败"| N["保留原页面并显示错误"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,C,D,E,F,H,J,K,L,M done;
    class N partial;
    class G,I pending;
```

---

## 五、新建 Skill 详细流程

### 用户目标

在批准的用户 Skill 目录中创建一个新的文件夹和 `SKILL.md`。

```mermaid
flowchart TD
    A["用户点击 + 新建"] --> B["进入 Create 页面"]
    B --> C["填写名称"]
    C --> D["填写描述"]
    D --> E["选择目标目录"]
    E --> F["编辑 Markdown 正文"]
    F --> G["查看右侧预览"]
    G --> H{"基础校验"}

    H -->|"名称为空"| I["提示填写名称"]
    H -->|"描述为空"| J["提示填写描述"]
    H -->|"目录为空"| K["提示选择目录"]
    H -->|"全部有效"| L["启用创建按钮"]

    I --> C
    J --> D
    K --> E

    L --> M["用户点击创建 Skill"]
    M --> N["前端调用 create_skill"]
    N --> O["Rust 检查目标目录属于允许根目录"]
    O --> P{"路径检查"}

    P -->|"目录不允许"| Q["显示错误并保留表单"]
    P -->|"目录允许"| R["生成安全的文件夹名称"]
    R --> S{"同名目录是否存在"}
    S -->|"存在"| T["提示更换名称或目录"]
    S -->|"不存在"| U["创建 Skill 文件夹"]
    U --> V["写入 SKILL.md frontmatter 和正文"]
    V --> W["重新读取 SkillDetail"]
    W --> X["加入当前列表"]
    X --> Y["返回 Library 并显示成功提示"]
    Y --> Z["用户搜索新 Skill 并打开核对"]
    Z --> AA["重启 App 后再次核对"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y done;
    class J,Z,AA partial;
```

### 新建流程当前注意点

| 项目 | 当前情况 | 需要补齐 |
|---|---|---|
| 默认名称 | `my-awesome-skill` | 用户可修改，创建前检查重复 |
| 默认目录 | `~/.codex/skills` | 转成绝对路径后再传给 Rust |
| 描述 | 页面允许为空，Rust 要求非空 | 前后端校验统一 |
| 分类 | 页面可以选择 | 当前创建输入没有保存分类字段 |
| 正文 | 会写入 Markdown | 检查 frontmatter 和正文是否重复 |
| 创建后 | 加入当前列表 | 还要重新扫描磁盘确认 |
| 失败 | 页面显示后端错误 | 保留全部表单内容 |

### 创建完成标准

- [ ] 目标目录显示为完整绝对路径。
- [ ] 名称、描述和正文校验一致。
- [ ] 磁盘出现新的 Skill 文件夹和 `SKILL.md`。
- [ ] Library 能搜索到新 Skill。
- [ ] 关闭并重新打开 App 后仍然存在。
- [ ] 创建失败时不会留下半成品目录。

---

## 六、编辑、校验、AI 和保存流程

### 当前编辑流程

```mermaid
flowchart TD
    A["用户从详情进入 Editor"] --> B["根据 Skill 名称查找路径"]
    B --> C["调用 read_skill"]
    C --> D{"读取成功"}
    D -->|"成功"| E["加载真实 Markdown 和描述"]
    D -->|"失败"| F["保留默认示例或显示错误"]
    E --> G["用户修改名称、描述和正文"]
    G --> H["dirty 状态变为 true"]
    H --> I{"用户动作"}
    I -->|"校验"| J["调用 validate_skill"]
    I -->|"AI"| K["调用 ai_optimize"]
    I -->|"保存"| L["当前正式页面缺少真实 update_skill 调用"]

    J --> M["显示评分和检查项"]
    K --> N["显示 AI 输出"]
    L --> O["当前代码只会清除 dirty 并显示提示"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,C,D,E,G,H,I,J,K,M,N done;
    class F partial;
    class L,O pending;
```

### 目标完整保存流程

```mermaid
flowchart TD
    A["用户修改内容"] --> B["实时更新 Markdown 预览"]
    B --> C{"是否存在未保存变化"}
    C -->|"没有"| D["保存按钮保持禁用"]
    C -->|"有"| E["启用保存按钮"]

    E --> F["用户点击保存"]
    F --> G{"Skill 权限"}
    G -->|"插件、系统或锁定"| H["阻止写入并提供复制入口"]
    G -->|"用户可写"| I["执行前端校验"]

    I --> J{"校验结果"}
    J -->|"失败"| K["定位字段并保留编辑内容"]
    J -->|"通过"| L["显示保存影响摘要"]
    L --> M["用户确认保存"]
    M --> N["调用 update_skill"]

    N --> O["Rust 核对允许目录"]
    O --> P["创建保存前版本快照"]
    P --> Q["复制整个 Skill 文件夹到备份目录"]
    Q --> R["锁定 SKILL.md"]
    R --> S["写入名称、描述和正文"]
    S --> T["同步到磁盘"]
    T --> U["重新读取保存结果"]
    U --> V{"写入结果"}

    V -->|"成功"| W["更新页面和列表摘要"]
    V -->|"失败"| X["显示错误并保留编辑内容"]
    X --> Y["提供从快照或备份恢复"]
    W --> Z["重新扫描"]
    Z --> AA["用户关闭并重新打开 App"]
    AA --> AB["重新打开该 Skill 核对内容"]

    classDef system fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    classDef decision fill:#ffffff,stroke:#64748b,color:#0f172a;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class O,P,Q,R,S,T,U system;
    class C,G,J,V decision;
    class A,B,D,E,F,H,I,K,L,M,N,W,X,Y,Z,AA,AB pending;
```

### 编辑页面审核表

| 区域 | 用户要确认什么 | 当前状态 |
|---|---|---|
| 左栏文件列表 | 显示该 Skill 真实文件 | 🔴 当前多为固定示例 |
| 名称 | 修改后 frontmatter `name` 同步 | 🟡 页面可改，真实保存未连接 |
| 分类 | 修改后保存到设置或 frontmatter | 🔴 |
| 描述 | 修改后 frontmatter `description` 同步 | 🟡 |
| Markdown | 读取和编辑真实正文 | 🟢 读取，🔴 保存 |
| 右侧预览 | 随当前 Markdown 实时变化 | 🔴 当前内容主要固定 |
| 校验 | 对当前 Skill 文件运行规则 | 🟢 |
| AI | 发送内容并显示建议 | 🟡 |
| 保存 | 快照、备份、写入、重扫 | 🔴 当前正式页面未连接 |

---

## 七、AI 优化详细流程

```mermaid
flowchart TD
    A["用户在 Settings 选择 AI 厂商"] --> B["输入 API Key"]
    B --> C["点击保存"]
    C --> D["调用 set_ai_key"]
    D --> E["Key 写入系统 Keychain"]
    E --> F["页面只记录 Key 已配置"]

    F --> G["用户进入 Editor"]
    G --> H["点击 AI"]
    H --> I{"选择优化动作"}
    I -->|"完善结构"| J["struct"]
    I -->|"优化描述"| K["desc"]
    I -->|"润色正文"| L["polish"]
    I -->|"生成 frontmatter"| M["fm"]
    I -->|"安全审查"| N["safe"]

    J --> O["准备发送内容"]
    K --> O
    L --> O
    M --> O
    N --> O

    O --> P["显示厂商、内容范围、费用和隐私提示"]
    P --> Q{"用户是否确认发送"}
    Q -->|"取消"| R["返回编辑器，内容不变"]
    Q -->|"确认"| S["读取 Keychain 中的 Key"]
    S --> T["脱敏路径和密钥"]
    T --> U["请求厂商 API"]
    U --> V{"请求结果"}
    V -->|"成功"| W["分块显示 AI 建议"]
    V -->|"失败"| X["显示网络、Key、额度或格式错误"]

    W --> Y["显示原文和建议差异"]
    Y --> Z{"用户选择"}
    Z -->|"接受全部"| AA["更新编辑草稿"]
    Z -->|"接受部分"| AB["只应用选中差异"]
    Z -->|"放弃"| AC["保留原文"]
    AA --> AD["用户再点击保存"]
    AB --> AD
    AC --> G

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,S,T,U,V,W done;
    class X partial;
    class O,P,Q,R,Y,Z,AA,AB,AC,AD pending;
```

### AI 流程当前风险

| 风险 | 用户影响 | 流程要求 |
|---|---|---|
| Editor 当前固定使用 `glm` | 设置中选了其他厂商也可能调用 GLM | 使用 Settings 中的真实厂商 |
| 发送确认不完整 | 用户不知道正文会发到哪里 | 每次显示厂商、范围和费用 |
| 脱敏范围有限 | 邮箱或其他密钥格式可能保留 | 扩展规则并允许用户预览发送内容 |
| 厂商请求格式不同 | Claude、Ollama 等可能调用失败 | 每家厂商单独测试 |
| AI 结果缺少 diff 接受 | 用户难以控制写入范围 | 增加差异视图和逐项接受 |
| 调用成本显示为固定示例 | 用户无法知道真实费用 | 根据真实请求统计 |

---

## 八、Settings 设置流程

```mermaid
flowchart TD
    A["用户点击设置"] --> B["进入 Settings"]
    B --> C["启动时读取 settings.json"]
    C --> D["把设置写入 settingsStore"]
    D --> E{"用户修改哪类设置"}

    E -->|"主题"| F["亮、暗或自动"]
    E -->|"自动扫描"| G["打开或关闭启动扫描"]
    E -->|"文件监听"| H["打开或关闭自动重扫"]
    E -->|"关注规则"| I["调整规则和天数"]
    E -->|"扫描目录"| J["添加或删除自定义目录"]
    E -->|"AI 厂商"| K["选择 GLM、OpenAI、Claude 或 Ollama"]
    E -->|"AI Key"| L["保存到 Keychain"]
    E -->|"隐私"| M["脱敏发送和 diff 确认"]
    E -->|"预算"| N["设置月预算"]
    E -->|"导入导出"| O["选择文件和影响范围"]

    F --> P["更新页面并保存 settings.json"]
    G --> P
    H --> P
    I --> P
    J --> P
    K --> P
    M --> P
    N --> P
    L --> Q["Keychain 保存成功或失败"]
    O --> R["导入前备份，导出后给出路径"]

    P --> S["显示保存结果"]
    S --> T["关闭并重新打开 App"]
    T --> U["重新读取并恢复设置"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;

    class A,B,E,L,Q done;
    class F,G,H,I,J,K,M,N partial;
    class C,D,O,P,R,S,T,U pending;
```

### Settings 当前状态表

| 设置 | 当前页面操作 | 是否写入磁盘 |
|---|---|---|
| 主题 | 更新 `settingsStore.theme` | 🔴 当前普通设置未统一保存 |
| 启动自动扫描 | 更新内存开关 | 🔴 |
| 文件监听 | 更新内存开关 | 🔴，AppShell 仍会启动监听调用 |
| 关注规则 | 更新内存数组 | 🔴 |
| 自定义扫描目录 | 当前页面没有完整管理界面 | 🔴 |
| AI 厂商 | 更新内存 | 🟡，Editor 当前固定使用 GLM |
| AI Key | 写入系统 Keychain | 🟢 |
| 脱敏发送 | 更新内存 | 🔴，Rust 当前总会执行基础脱敏 |
| diff 确认 | 更新内存 | 🔴，Editor 未实现差异接受 |
| 月预算 | 更新内存 | 🔴，已用金额是页面示例 |
| 导入和导出 | 按钮已显示 | 🔴，缺少处理 |

### 设置保存完成标准

- [ ] 启动时调用 `load_app_settings`。
- [ ] 修改普通设置后调用 `save_app_settings`。
- [ ] 设置保存失败时恢复页面旧值。
- [ ] 重启后所有设置保持。
- [ ] AI Key 明文只进入 Keychain。
- [ ] 设置损坏时提供备份和重置。

---

## 九、归档、删除、备份和恢复流程

### 归档流程

归档只隐藏或标记 Skill，保留真实文件。

```mermaid
flowchart TD
    A["用户点击归档"] --> B["显示 Skill 名称和影响"]
    B --> C{"用户确认"}
    C -->|"取消"| D["返回原页面"]
    C -->|"确认"| E["把路径写入 skillArchives"]
    E --> F["保存 settings.json"]
    F --> G["从默认列表隐藏"]
    G --> H["提供查看已归档入口"]
    H --> I["用户可以取消归档"]

    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,C,D,E,F,G,H,I pending;
```

当前 AppShell 的归档按钮主要显示 Toast，还没有保存 `skillArchives`。

### 删除流程

```mermaid
flowchart TD
    A["用户选择删除"] --> B["显示 Skill 名称、路径和来源"]
    B --> C{"是否允许删除"}
    C -->|"插件、系统或锁定"| D["阻止删除并解释原因"]
    C -->|"用户可写"| E["显示确认弹窗"]
    E --> F["说明将删除整个 Skill 文件夹"]
    F --> G["说明备份位置和恢复方式"]
    G --> H{"用户最终确认"}
    H -->|"取消"| I["返回原页面"]
    H -->|"确认"| J["调用 delete_skill"]
    J --> K["Rust 核对允许根目录"]
    K --> L["确认目标是该目录里的 SKILL.md"]
    L --> M["拒绝删除扫描根目录"]
    M --> N["备份整个 Skill 文件夹"]
    N --> O["删除原 Skill 文件夹"]
    O --> P["重新扫描"]
    P --> Q["列表中移除 Skill"]
    Q --> R["显示撤销或恢复入口"]

    classDef system fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class K,L,M,N,O system;
    class A,B,C,D,E,F,G,H,I,J,P,Q,R pending;
```

### 版本恢复流程

```mermaid
flowchart TD
    A["用户打开版本历史"] --> B["列出保存前快照"]
    B --> C["选择一个时间点"]
    C --> D["预览旧版和当前版差异"]
    D --> E{"用户确认恢复"}
    E -->|"取消"| F["保持当前内容"]
    E -->|"确认"| G["先保存当前内容为新快照"]
    G --> H["调用 restore_version"]
    H --> I["把旧快照写回 SKILL.md"]
    I --> J["重新扫描和读取"]
    J --> K["显示恢复成功"]
    K --> L["用户重启后再次核对"]

    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class H,I partial;
    class A,B,C,D,E,F,G,J,K,L pending;
```

### 危险操作完成标准

- [ ] 归档和删除有不同文字、颜色和结果。
- [ ] 插件、系统和锁定 Skill 在 Rust 层得到保护。
- [ ] 删除前展示完整路径和备份位置。
- [ ] 删除失败时原文件保持。
- [ ] 恢复前保存当前版本。
- [ ] 用户能从界面找到备份和版本历史。

---

## 十、文件自动监听流程

```mermaid
flowchart TD
    A["用户开启文件监听"] --> B["App 获取真实扫描目录绝对路径"]
    B --> C["调用 watch_scan_dirs"]
    C --> D["Rust watcher 递归监听目录"]
    D --> E{"外部文件事件"}
    E -->|"创建"| F["发出 scan-changed"]
    E -->|"修改"| F
    E -->|"删除"| F
    E -->|"其他事件"| G["忽略"]
    F --> H["AppShell 收到事件"]
    H --> I["重新调用 scanSkills"]
    I --> J["更新 skillStore"]
    J --> K["显示检测到文件变化提示"]
    K --> L["用户看到最新列表和内容"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class D,E,F,G,H,I,J,K done;
    class A partial;
    class B,C,L pending;
```

### 当前需要修正

AppShell 传入的默认目录是：

```text
~/.codex/skills
~/.agents/skills
~/.codex/plugins/cache
```

Rust watcher 使用普通路径判断是否存在。`~` 没有在当前流程中展开成用户主目录，默认监听可能没有真正启动。

目标流程要先获得绝对路径，例如：

```text
/Users/用户名/.codex/skills
/Users/用户名/.agents/skills
/Users/用户名/.codex/plugins/cache
```

---

## 十一、Logs 调用日志流程

```mermaid
flowchart TD
    A["某个 Skill 或 AI 操作发生"] --> B["生成调用记录"]
    B --> C["脱敏 Prompt 和路径"]
    C --> D["追加写入 call_logs.jsonl"]
    D --> E["用户打开 Logs"]
    E --> F["调用 get_call_logs 读取最近记录"]
    F --> G{"读取结果"}
    G -->|"有记录"| H["显示总数、成功率、Skill、耗时和 Token"]
    G -->|"空文件"| I["显示暂无调用日志"]
    G -->|"读取失败"| J["显示错误和日志路径"]
    H --> K{"用户动作"}
    K -->|"选择时间范围"| L["读取 7 天、30 天或全部"]
    K -->|"查看失败"| M["打开错误详情"]
    K -->|"清理日志"| N["确认范围并删除旧记录"]
    K -->|"导出"| O["生成脱敏日志文件"]

    classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d;
    classDef partial fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef pending fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class E,F,G,H,I,J done;
    class D partial;
    class A,B,C,K,L,M,N,O pending;
```

### 当前情况

- Logs 页面已经调用 `get_call_logs('7d')`。
- Rust 会读取 `~/.codex/skill-panel/call_logs.jsonl`。
- 文件不存在时返回空列表。
- 浏览器环境会显示三条模拟日志。
- `range = 7d` 当前按最多 50 条处理，尚未按真实日期过滤。
- App 内的完整日志写入来源还需要统一。
- 清理、导出和隐私开关还需要实现。

---

## 十二、用户错误恢复总图

```mermaid
flowchart TD
    A["用户遇到问题"] --> B{"问题发生在哪一步"}

    B -->|"启动失败"| C["核对安装包、系统提示和版本"]
    B -->|"扫描失败"| D["核对目录、权限和 settings.json"]
    B -->|"Skill 解析失败"| E["打开 SKILL.md 检查 frontmatter"]
    B -->|"新建失败"| F["核对绝对目录、名称和描述"]
    B -->|"保存失败"| G["保留编辑内容，检查快照和备份"]
    B -->|"误删"| H["查找 .skill-panel-backups"]
    B -->|"AI 失败"| I["核对 Key、厂商、网络和额度"]
    B -->|"设置丢失"| J["检查 settings.json 和保存结果"]
    B -->|"页面异常"| K["ErrorBoundary 显示错误和重启入口"]

    C --> L["记录系统、版本和完整操作步骤"]
    D --> L
    E --> L
    F --> L
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L

    L --> M["保存截图、错误文字和相关路径"]
    M --> N["停止新增功能"]
    N --> O["Codex 先重复问题并定位开始位置"]
    O --> P["增加能够重复发现问题的检查"]
    P --> Q["执行最小修复"]
    Q --> R["重新检查相关功能和完整构建"]
    R --> S["用户按照原步骤重新验收"]
    S --> T{"结果"}
    T -->|"通过"| U["更新问题记录和稳定存档"]
    T -->|"仍失败"| V["恢复到修复前存档并继续定位"]

    classDef system fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    classDef decision fill:#ffffff,stroke:#64748b,color:#0f172a;
    class O,P,Q,R system;
    class B,T decision;
```

### 用户报告问题模板

```text
Skill Panel 版本：
操作系统和版本：
安装版或开发版：
发生问题的页面：
Skill 来源：Codex / Agents / 插件 / 自定义目录
Skill 完整路径：
我从哪个页面开始：
我依次点击了什么：
我输入了什么：
我期望看到什么：
实际看到什么：
是否影响真实文件：
快照或备份是否存在：
错误文字：
截图或录屏：
```

---

## 十三、按用户目标快速查流程

| 用户目标 | 从哪里开始 | 主要流程 | 当前完成度 |
|---|---|---|---|
| 看本机有多少 Skill | 启动 App | Library 扫描 → Dashboard | 🟢 |
| 找到某个 Skill | Library | 搜索 → 筛选 → 分页 | 🟢 |
| 查看 Skill 信息 | Library | 点击卡片 → 详情抽屉 | 🟢 摘要 |
| 查看完整 Markdown | 详情抽屉 | 在编辑器打开 → read_skill | 🟢 读取 |
| 新建 Skill | 顶栏 | + 新建 → 表单 → create_skill | 🟡 路径需修正 |
| 编辑并保存 | Editor | 修改 → 校验 → 快照 → update_skill | 🔴 保存待连接 |
| 打开文件夹 | 详情抽屉 | 打开目录 → open_skill_folder | 🔴 待连接 |
| 收藏 | Library | 点击星标 → 保存设置 | 🟡 当前内存 |
| 归档 | Library | 归档 → skillArchives → 保存设置 | 🔴 待连接 |
| 批量整理 | Library | 批量选择 → 分类/标签/归档 | 🔴 待连接 |
| 修改主题 | Settings | 选择主题 → 保存 → 重启恢复 | 🔴 待连接 |
| 添加扫描目录 | Settings | 选择目录 → 保存 → 重扫 | 🔴 待连接 |
| 保存 AI Key | Settings | 输入 Key → Keychain | 🟢 |
| 使用 AI 优化 | Editor | 选择动作 → 确认发送 → diff → 保存 | 🟡 |
| 查看调用日志 | Logs | get_call_logs → 表格 | 🟡 |
| 恢复旧版本 | 版本历史 | 预览差异 → 快照当前版 → 恢复 | 🟡 底层有能力 |
| 删除 Skill | 详情或批量 | 权限检查 → 备份 → 删除 → 重扫 | 🔴 当前页面待连接 |

---

## 十四、3.8.0 用户流程验收清单

### 启动和扫描

- [ ] 安装 3.8.0 后首次启动成功。
- [ ] App 内显示版本 3.8.0。
- [ ] 默认扫描目录显示为绝对路径。
- [ ] 扫描数量与磁盘实际 Skill 数量一致。
- [ ] 空目录显示新建和添加目录入口。
- [ ] 解析错误显示具体 Skill 和处理入口。
- [ ] 浏览器模拟数据有明显标记。

### Library

- [ ] 搜索名称和描述正确。
- [ ] 来源、分类和状态筛选正确。
- [ ] 多个筛选组合结果正确。
- [ ] 清空筛选回到第一页。
- [ ] 分页范围和总数正确。
- [ ] 详情抽屉显示真实路径和解析状态。
- [ ] 收藏、归档、分类和标签在重启后保持。

### 新建

- [ ] 使用绝对目标目录。
- [ ] 名称、描述和正文校验清楚。
- [ ] 同名目录得到明确提示。
- [ ] 创建后磁盘出现真实文件。
- [ ] 创建失败不留下半成品。
- [ ] 重启后新 Skill 仍能扫描到。

### 编辑和保存

- [ ] Editor 显示选中 Skill 的真实 Markdown。
- [ ] 预览随着正文变化。
- [ ] 只读 Skill 无法保存。
- [ ] 保存前显示影响摘要。
- [ ] 保存前创建版本快照和文件夹备份。
- [ ] 保存后磁盘内容正确。
- [ ] 重启后修改仍然存在。
- [ ] 保存失败时编辑内容保留。

### AI

- [ ] AI Key 只保存在系统 Keychain。
- [ ] Editor 使用 Settings 中选择的厂商。
- [ ] 每次发送前显示厂商、内容和费用。
- [ ] 用户能预览脱敏后的发送内容。
- [ ] AI 建议通过 diff 接受或放弃。
- [ ] 放弃建议不会修改原文。

### 设置和监听

- [ ] 启动时加载 `settings.json`。
- [ ] 主题、扫描目录、监听和规则可以保存。
- [ ] 重启后设置保持。
- [ ] 外部修改 `SKILL.md` 后列表自动刷新。
- [ ] 设置文件损坏时提供备份和重置。

### 删除和恢复

- [ ] 归档不会删除真实文件。
- [ ] 插件、系统和锁定 Skill 得到保护。
- [ ] 删除前显示完整路径和备份位置。
- [ ] 删除前备份整个 Skill 文件夹。
- [ ] 用户能从备份恢复误删 Skill。
- [ ] 恢复旧版本前保存当前版本。

### 安装和升级

- [ ] Windows 候选包完成安装、升级和卸载。
- [ ] macOS 候选包完成安装、升级和卸载。
- [ ] 升级后旧 Skill、设置和 Keychain 状态符合说明。
- [ ] 旧稳定版回退流程可以执行。
- [ ] 安装包、测试报告和代码存档一一对应。

> [!success] 使用这份流程图的方法
> 开发一个功能前，先找到对应流程图中的起点和结束点；把中间每个红色或黄色节点拆成独立任务；完成后使用本页验收清单亲自操作。每次只让一个流程从红色变成绿色，Skill Panel 的真实完成度会非常清楚。
