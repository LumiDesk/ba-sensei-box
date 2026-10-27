# 架构

`ba-sensei-box` 是一个没有后端的单页应用。构建时把 React 运行时、Ant Design、业务代码和样式全部内联进 `dist/index.html`；学生头像保留为 `dist/students/icons/` 下的静态文件。这样既能双击打开，也避免把 2.3MB 图片塞进 HTML。

## 模块分层

```text
src/app/App.tsx
  ThemeProvider
    AntdProvider (ConfigProvider + AntApp)
      RosterProvider
        RosterPage
          AppHeader
          SummaryPanel
          RosterToolbar
          RosterGrid -> StudentCard
          AppFooter
          SelectedDrawer / ExportModal / ImportModal
```

| 层                 | 职责                                     | 不做什么                |
| ------------------ | ---------------------------------------- | ----------------------- |
| `app/`             | 组合 Provider、注入 Ant Design 主题      | 不写业务状态            |
| `pages/`           | 页面级筛选状态、弹层开关、编排           | 不直接读写 localStorage |
| `components/`      | 展示与交互                               | 不实现名单码、过滤算法  |
| `features/roster/` | 持有状态、筛选、名单码、导入导出、持久化 | 不依赖具体页面布局      |
| `features/theme/`  | 主题模式、系统偏好、首屏同步             | 不关心 Ant Design 组件  |
| `data/`            | 生成数据、类型、分类表、别名             | 不写 UI 逻辑            |
| `lib/`             | 剪贴板、下载                             | 不依赖业务类型          |

## 状态流

### 持有名单

`RosterProvider` 是唯一持有 `selectedIds` 的地方：

1. 初始化时从 `localStorage['ba-sensei-box:roster:v1']` 读取 ID 数组，并用 `STUDENT_BY_ID` 过滤掉过期/未知 ID。
2. `toggleStudent` / `addStudents` / `clearRoster` / `replaceRoster` 都返回新的 `Set`，不原地修改。
3. `useEffect` 把 ID 排序后写回 localStorage；写入失败（隐私模式、file:// 限制）不阻塞页面。
4. `selectedStudents` 按 `order` 派生，供统计、抽屉、导出使用。

元数据（目标、等级、备注）单独存在 `ba-sensei-box:meta:v1`，不混进名单码。

### 筛选

`RosterPage` 持有 `RosterFilters`，`filterStudents()` 是纯函数：

- 搜索串由中英文名、SchaleDB tags、社区别名、学校/职业/攻击/护甲/站位/部队标签拼接并归一化；
- 视图 `all / selected / missing` 与星级 `all / 3 / low` 在过滤阶段处理；
- 排序 `school / rarity / order` 由 `groupStudentsBySchool()` 或 `sortStudents()` 处理；
- 所有筛选都是内存计算，266 条数据无需索引或虚拟列表。

### 名单码

`roster-codec.ts` 不依赖 React：

```text
order 0..N -> bit 0..N
bytes = ceil((maxOrder + 1) / 8)
payload = bytes || checksum(bytes)
code = "SB1-" + base64url(payload)
```

- 解码时按 `order` 反查学生，不按数组下标；
- 未知 `order` 的位被收集为 `unknownOrders`，UI 给出提示后忽略；
- 校验和失败、前缀错误、非法 Base64 都抛出中文错误，由导入 Modal 展示；
- 测试覆盖空名单、稀疏 order、全名单、真实数据单学生、篡改、未来 order。

### 导入/导出

`roster-export.ts` 生成三种视图：

- `buildReadableRoster()`：按 3★/2★/1★ 分组的人类可读名单；
- `buildFullExport()`：元数据 + 名单码 + 可读名单，直接粘贴给 Sensei；
- `buildJsonExport()`：包含 dataset meta、answers、roster.ids/students，供备份。

`roster-import.ts` 同时接受 `SB1-` 码和本工具导出的 JSON；导入成功后 `replaceRoster()` 覆盖当前名单。

## 离线构建

`vite.config.ts`：

- `base: './'`：所有资源用相对路径，`file://` 下可用；
- `viteSingleFile()`：把 JS/CSS 内联进 `index.html`；
- `public/students/icons/` 由 Vite 原样复制到 `dist/students/icons/`；
- `import.meta.env.BASE_URL` 在运行时拼出头像 URL。

构建后验证：

```bash
pnpm build
# 用浏览器打开 dist/index.html，确认卡片渲染、图片加载、勾选可保存
```

Vite 的预览服务器只用于开发验收；最终使用方式是直接打开 `dist/index.html`。

## 主题

- `index.html` 的首屏脚本在 CSS/JS 之前读取 `ba-sensei-box:theme` 和 `?theme=`，写入 `<html data-theme>` 与 `color-scheme`，避免闪白。
- `ThemeProvider` 维护 `system | light | dark`，监听 `matchMedia('(prefers-color-scheme: dark)')`。
- `AntdProvider` 根据 `resolvedTheme` 选择 `theme.defaultAlgorithm` / `theme.darkAlgorithm`。
- 自定义 SCSS 使用 `[data-theme='dark']` 覆盖语义变量。

## 错误处理

- 数据同步失败：脚本非零退出，不写半套数据；缺头像明确列出学生 ID。
- 名单码错误：抛 `Error`，导入 Modal 用 `Alert` 展示，不刷新页面。
- 剪贴板失败：回退到 `textarea + execCommand('copy')`；仍失败则提示手动复制。
- localStorage 不可用：页面继续以内存状态工作，导出仍可用。

## 测试策略

- `roster-codec.test.ts`：编码/解码、校验和、未知 order、真实数据。
- `roster-filters.test.ts`：学校排序、别名搜索、星级/已选过滤、英文名/学校名搜索。
- `students.test.ts`：数量、唯一 ID/order、分类映射、图标路径格式。

UI 不在 Vitest 中启动浏览器；交互验收通过 `pnpm build` + Edge `file://` 手工检查完成（见 AGENTS.md 验证清单）。
