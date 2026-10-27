# Agent Note: 离线单文件构建

Status: implemented

## Problem

这个工具的核心使用场景是“用户在自己电脑上打开，勾选自己的 box”，而不是部署一个网站。用户明确要求离线可用，头像素材必须放在项目里；如果构建产物依赖 HTTP 服务器、CDN 或 `fetch()` 加载 JSON，双击 `index.html` 就会失败。

## Decision

使用 Vite 8 + `vite-plugin-singlefile`：

- `base: './'`，所有资源用相对路径；
- JS/CSS 内联进 `dist/index.html`；
- 学生头像放在 `public/students/icons/`，由 Vite 原样复制到 `dist/students/icons/`；
- 学生数据在构建时作为 JSON import 打进 bundle，不在运行时 `fetch`；
- 最终交付物是 `dist/index.html` + `dist/students/icons/`，不带服务器。

`vite build` 仍然需要 Node.js，但这是开发/构建期依赖；使用者只需要浏览器。

## Alternatives considered

**纯 HTTP 静态站点（Vercel/Netlify）。** 部署方便，但用户要求离线，且 file:// 下 ES module 的 CORS 限制会让默认 Vite 产物直接打不开。

**把所有头像 base64 内联进 HTML。** 真正单文件，但 266 张图会让 HTML 从 1MB 涨到 4MB+，编辑、diff、首屏解析都变差；头像放同目录已经满足“离线”。

**Tauri/Electron 打包。** 对一个勾选工具过重，且引入原生构建链。

**Service Worker 缓存。** 首次访问仍要联网，且 file:// 下不可用；不满足“拿到就能开”。

## Consequences

- 构建后必须验证 `file://`，不能只验证 `pnpm dev` 或 `vite preview`。
- 不能把 `index.html` 单独发给别人；必须连同 `students/icons/` 一起。
- 头像路径依赖 `import.meta.env.BASE_URL`，改 `base` 时要同步检查。
- 单文件 HTML 约 1MB（gzip 约 314KB），在可接受范围内；如果未来加图表/大型依赖，需要重新评估。
