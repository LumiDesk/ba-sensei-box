# AGENTS.md

本文件是 `ba-sensei-box` 的工程约束。开始改动前先读完；若与用户当前要求冲突，以用户当前要求为准。写法参考 `D:\Projects\Talyra42\deepseek-harness\AGENTS.md` 与 `D:\Projects\LumiDesk\verifin-site\AGENTS.md`，但本项目是纯前端离线工具，不引入后端。

## 项目概况

- 纯前端、离线优先的蔚蓝档案（国际服）学生清单工具。
- 线上形态：一个可双击打开的 `dist/index.html` + 本地 `students/icons/`。
- 技术栈：Vite 8、React 19、TypeScript 6、SCSS、Ant Design 6、`vite-plugin-singlefile`。
- 质量工具：Oxlint 1.90（唯一 lint 器）、Prettier、Vitest、TypeScript `tsc -b`。
- 运行环境：Node.js 24+、pnpm 12+（`packageManager` 固定 pnpm 12.15.0）。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm check          # lint -> typecheck -> test -> build
pnpm build          # tsc -b + vite build，产物在 dist/
pnpm test           # Vitest（纯逻辑，不启动浏览器）
pnpm data:sync      # 从 SchaleDB 同步学生与头像
```

提交前必须通过 `pnpm check`。构建后还必须手动验证 `dist/index.html` 能在 `file://` 下打开；这是本项目的核心使用方式。

## 目录职责

```text
src/
├─ app/                 App 外壳、Ant Design Provider
├─ components/
│  ├─ layout/           Header、Footer
│  ├─ roster/           清单业务组件（卡片/工具栏/抽屉/导入导出）
│  └─ ui/               领域小组件（TypeChip、StatTile）
├─ data/                生成数据、类型、分类表、别名
├─ features/
│  ├─ roster/           持有状态、筛选、名单码、导入导出、存储
│  └─ theme/            主题上下文与首屏主题同步
├─ lib/                 剪贴板、下载
├─ pages/               页面编排
└─ styles/              tokens / mixins / global
```

- `src/data/students.generated.json` 与 `public/students/icons/` 是**提交到仓库的生成物**，因为页面必须离线可用。不要手改。
- 基础组件优先使用 Ant Design（`Button`、`Select`、`Segmented`、`Modal`、`Drawer`、`Tabs`、`Checkbox`、`Avatar` 等），不要手搓一套通用组件库。
- 组件名用 kebab-case 文件名；导出用 PascalCase；纯逻辑放 `features/` 或 `lib/`，不塞进组件。

## 数据不变量

1. 只收 `IsReleased[1] === true` 的国际服学生；日服未上国际服的不显示。
2. 以中文名去重，保留较小 `id` 的那一行（例如 `10098` 与 `10099` 的星野临战）。
3. `order` 是名单码的稳定索引：已有学生保留原 `order`，新学生追加到最大 `order` 之后。**不得重排、删除或复用 `order`**；删除学生需要升级名单码版本并写迁移说明。
4. 学生分类必须能在 `src/data/taxonomy.json` 找到，否则 `data:sync` 直接失败，不允许静默落成未知分类。
5. 每个学生必须有对应的 `public/students/icons/<id>.webp`；同步失败即失败，不生成半套数据。
6. 数据来源是 SchaleDB 粉丝数据库，不是官方 API；更新后在提交信息/README 中保留日期。

## 名单码不变量

- 前缀固定 `SB1-`，内容为 Base64URL(bitset + 1 字节校验和)。
- 位图按 `order` 写，不按数组下标；`order` 有空洞也必须能正确解码。
- 校验和用 `hash = (hash * 31 + byte) % 256`；校验失败抛用户可读的中文错误。
- 只编码学生 ID，不包含 UID、账号、等级或备注。备注等元数据只进可读文本/JSON。
- 修改格式必须新增前缀版本（例如 `SB2-`），旧码解码测试必须保留。

## 主题与设计

- 设计令牌在 `src/styles/tokens.scss`，通过 `[data-theme='dark']` 覆盖；组件 SCSS 只使用语义变量（`--surface`、`--ink`、`--brand` 等），不要写死浅色/深色值。
- Ant Design 主题在 `src/app/providers/antd-provider.tsx`，使用 `theme.defaultAlgorithm` / `theme.darkAlgorithm`。
- `index.html` 的首屏脚本负责在 React 挂载前写入 `data-theme`，避免闪白；改主题存储键时必须同时改 `src/features/theme/theme-provider.tsx` 和该脚本。
- 新增界面必须同时检查浅色与深色；移动端断点至少检查 390px 与 768px。
- 详细规范见 [DESIGN.md](DESIGN.md)。

## 提交与协作

- 当前直接在 `main` 工作；用户未要求时不要新建分支。
- 在任务节点提交，不要把所有改动堆成一个 commit。一个可验收阶段一个提交。
- 提交信息使用 Conventional Commits：

```text
feat(ui): add roster toolbar and dark mode
fix(data): keep roster order stable on sync
docs: add data pipeline notes
chore: configure oxlint and prettier
```

- 不要提交 `node_modules/`、`dist/`、`_tmp*/`、浏览器 profile 或任何密钥。
- 不擅自 `push`、建远程或改写远程历史；用户创建仓库后再设置 remote。
- 如果用户要求截图/预览，截图放 `docs/assets/` 并压缩，不要提交 `dist/` 里的临时截图。

## 验证清单

- `pnpm check` 全绿。
- `pnpm build` 后 `dist/index.html` 在 Edge/Chrome 的 `file://` 下能渲染 266 张卡片。
- 勾选一张卡后刷新页面，勾选仍在；名单码可复制、可导入、可解回同一学生。
- 浅色/深色切换正常，390px 宽度无横向滚动。
- 数据更新后 `pnpm data:sync` 不改动已有学生的 `order`，旧名单码仍能解码。

## 文档地图

- [README.md](README.md)：使用、构建、数据同步、名单码。
- [DESIGN.md](DESIGN.md)：设计令牌与组件规范。
- [docs/architecture.md](docs/architecture.md)：模块边界、状态流、离线构建。
- [docs/data-pipeline.md](docs/data-pipeline.md)：数据字段、去重、`order`、头像。
- [.agents/notes](.agents/notes/README.md)：关键决策记录（为什么这样做、放弃了什么）。
