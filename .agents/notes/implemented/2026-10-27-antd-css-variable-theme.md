# Agent Note: Ant Design + CSS 变量主题

Status: implemented

## Problem

页面有 266 张卡片、多个筛选器、抽屉和 Modal。手搓一套 Button/Select/Modal 会带来大量重复的可访问性、键盘、弹层和主题细节；同时需要浅色/深色两套完整视觉，且首屏不能闪白。

## Decision

- 基础组件全部使用 Ant Design 6（`Button`、`Select`、`Segmented`、`Checkbox`、`Avatar`、`Modal`、`Drawer`、`Tabs`、`Form`、`App` 等）。
- 自定义 SCSS 只负责布局、卡片、品牌区域和少量 Ant Design 覆盖。
- 主题状态由 `ThemeProvider` 管理：`system | light | dark`，监听 `prefers-color-scheme`。
- `AntdProvider` 根据 `resolvedTheme` 切换 `theme.defaultAlgorithm` / `theme.darkAlgorithm`，并设置主色、圆角、字体等 token。
- 自定义颜色用 `src/styles/tokens.scss` 的 CSS 变量，`[data-theme='dark']` 覆盖；组件不写死颜色。
- `index.html` 的首屏脚本在 React 前写入 `data-theme` / `color-scheme`，避免闪白。
- 用户偏好存 `localStorage['ba-sensei-box:theme']`；`?theme=light|dark` 仅作为开发/截图覆盖。

## Alternatives considered

**Tailwind + 自建组件。** 参考项目 verifin-site 使用 Tailwind，但本工具有大量 Select/Modal/Drawer 交互；自建组件成本高于收益。SCSS + Ant Design 更贴合当前需求。

**Ant Design 默认主题，不自定义。** 默认蓝色和圆角与“档案/终端”方向不符，且卡片需要大量自定义视觉；保留 Ant Design 行为、只替换 token 是更小的改动面。

**CSS-in-JS 主题对象全部手写。** 会和 Ant Design 的 token 体系重复；采用“AntD token + CSS 变量”双层，各自负责组件和页面。

**只用 `prefers-color-scheme`，不做手动切换。** 用户明确要求深浅色切换；三态（跟随/浅/深）是必要产品面。

## Consequences

- Ant Design 的 CSS-in-JS 会增加运行时体积（构建后 HTML 约 1MB）；对本地工具可接受。
- 所有新增界面必须同时检查浅色/深色；不能只改 AntD token 而忘了 CSS 变量。
- 首屏主题脚本与 `ThemeProvider` 的存储键必须同步，否则刷新会闪白或状态不一致。
- 颜色对比度需要人工检查；深色下类型 chip 使用 `color-mix` 提亮。
