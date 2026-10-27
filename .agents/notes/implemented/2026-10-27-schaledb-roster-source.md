# Agent Note: 以 SchaleDB 为数据源

Status: implemented

## Problem

需要一个能覆盖国际服当前学生、包含中英文名/头像/职业/攻击/护甲/站位的结构化数据源。官方没有公开的 roster API，游戏客户端数据又需要解密和资产提取；手动维护 266 条数据不可持续。

## Decision

以 [SchaleDB](https://schaledb.com/) 为唯一数据源：

- 拉取 `data/zh/students.min.json` 与 `data/en/students.min.json`；
- 只保留 `IsReleased[1] === true`（国际服）；
- 按中文名去重，保留较小 `id`；
- 将原始枚举映射为 `taxonomy.json` 的稳定 code；
- 头像从 `images/student/icon/<id>.webp` 下载到 `public/students/icons/`；
- 生成 `src/data/students.generated.json`，并把 `order` 作为名单码的稳定索引。

同步脚本 `scripts/sync-students.mjs` 可重复执行，已存在的头像默认跳过。

## Alternatives considered

**官方 API / 游戏客户端解包。** 更权威，但需要认证或解密工具链，更新成本高，且不适合这个纯前端小工具。

**Blue Archive Wiki / 其他 wiki。** 页面结构适合人读，不适合稳定抽取 266 条结构化字段；头像路径和命名也不统一。

**手写 JSON。** 初始 266 条可以生成一次，但每次新学生/改名/新分类都要人工维护，违背可维护性目标。

**只保存学生 ID，运行时请求 SchaleDB。** 需要联网，直接违反离线要求。

## Consequences

- 数据新鲜度取决于 SchaleDB；同步后要检查 `meta.generatedAt` 和数量。
- 国际服/日服进度差异由 `IsReleased[1]` 表达；如果 SchaleDB 字段顺序变化，必须更新 `REGION_INDEX` 并写迁移说明。
- 分类枚举新增时同步脚本会失败，迫使维护者补 `taxonomy.json`，避免静默显示未知分类。
- 头像与资料版权归 NEXON Games / Yostar；仓库只保留非商业粉丝工具所需素材。
- `order` 一旦分配不能重排；删除学生需要保留空洞或升级名单码版本。
