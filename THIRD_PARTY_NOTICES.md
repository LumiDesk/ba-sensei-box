# Third-party notices

本仓库代码以 MIT 发布。以下第三方内容/依赖不适用 MIT。

## Blue Archive 学生资料与头像

- 名称、数值、头像等游戏素材版权归 **NEXON Games / Yostar** 所有。
- 数据经 [SchaleDB](https://schaledb.com/) 整理后同步，仅用于非官方、非商业的粉丝工具。
- 头像保存在 `public/students/icons/`，来自 SchaleDB 的 `images/student/icon/<id>.webp`；仓库不主张对这些图片的所有权。
- 本项目不包含游戏客户端、账号数据、UID、服务器凭据或官方 Logo。

## SchaleDB

- 站点：https://schaledb.com/
- 本项目只读取其公开的 `data/zh/students.min.json`、`data/en/students.min.json` 和头像 URL；不修改、不转售其数据库。
- SchaleDB 自身的许可/使用条款以其仓库与站点为准。

## 运行时依赖

- React / React DOM：MIT
- Ant Design / @ant-design/icons：MIT
- Vite：MIT
- Sass：MIT
- `vite-plugin-singlefile`：MIT
- 其余依赖见 `pnpm-lock.yaml` 与各包 `LICENSE`。

## 字体

页面不打包第三方字体，使用系统中文字体与等宽字体栈，不涉及字体再分发。
