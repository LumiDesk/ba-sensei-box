# 数据管线

## 数据源

- 页面：[SchaleDB](https://schaledb.com/)
- 简中学生数据：`https://schaledb.com/data/zh/students.min.json`
- 英文学生数据：`https://schaledb.com/data/en/students.min.json`
- 头像：`https://schaledb.com/images/student/icon/<id>.webp`

SchaleDB 是粉丝数据库，不是官方 API。它的 `IsReleased` 是三个布尔值：

```ts
// [JP, Global, CN]
IsReleased: [true, true, false]
```

本项目只保留索引 `1` 为 `true` 的记录。截至 2026-10-27，国际服有 266 名去重后的学生；日服已出但国际服未出的不会显示。

## 生成字段

`scripts/sync-students.mjs` 产出：

```json
{
  "id": 10000,
  "order": 0,
  "name": "阿露",
  "nameEn": "Aru",
  "school": "gehenna",
  "rarity": 3,
  "role": "dealer",
  "attack": "explosion",
  "armor": "light",
  "position": "back",
  "squad": "main",
  "icon": "students/icons/10000.webp",
  "tags": []
}
```

- `name` 来自简中数据，`nameEn` 来自英文数据；缺一个时回退到另一个。
- `school/role/attack/armor/position/squad` 是 `taxonomy.json` 的 `code`，不是 SchaleDB 原始枚举。
- `rarity` 来自 `StarGrade`（1/2/3）。
- `tags` 来自 SchaleDB 的 `SearchTags`，目前大多为空；社区别名在 `src/data/aliases.ts` 单独维护。

## 分类表

`src/data/taxonomy.json` 是唯一分类真源：

```json
"roles": {
  "DamageDealer": { "code": "dealer", "label": "输出", "color": "#ef4444", "order": 1 }
}
```

同步脚本用原始枚举值查表；查不到直接失败，并提示把新枚举补进 `taxonomy.json`。UI 用 `code` 查 label/color/order，所以新增分类不需要改组件。

当前映射：

| 组   | 原始枚举                                                          | code                                                    |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| 学校 | Abydos / Gehenna / Millennium / Trinity / …                       | `abydos` / `gehenna` / …                                |
| 职业 | DamageDealer / Tanker / Healer / Supporter / Vehicle              | `dealer` / `tank` / `healer` / `support` / `vehicle`    |
| 攻击 | Explosion / Pierce / Mystic / Sonic                               | `explosion` / `pierce` / `mystic` / `sonic`             |
| 护甲 | LightArmor / HeavyArmor / Unarmed / ElasticArmor / CompositeArmor | `light` / `heavy` / `special` / `elastic` / `composite` |
| 站位 | Front / Middle / Back                                             | `front` / `middle` / `back`                             |
| 部队 | Main / Support                                                    | `main` / `support`                                      |

`Unarmed` 在游戏语境中对应“特殊装甲”，因此 code 用 `special` 而不是直译。

## 去重

SchaleDB 偶尔会为同一个可玩学生返回两条记录。当前例子：

- `10098` `星野（临战）` / `CH0258_02`
- `10099` `星野（临战）` / `CH0258_01`

同步脚本按中文名分组，保留较小 `id`，并在日志里列出被丢弃的行。这个规则写死在脚本里，不依赖手工排除列表；如果未来出现同名但真正不同的学生，需要改成按 `DevName`/playable 标记判断，并写决策记录。

## order 稳定性

`order` 是名单码的位图索引，必须满足：

1. 已有学生永远保留原 `order`；
2. 新学生追加到 `max(order) + 1`；
3. 不删除、不重排、不复用；
4. 允许空洞（例如未来下架某个学生），解码时按 `order` 映射，未知位忽略。

同步脚本每次先读取现有 `students.generated.json`，建立 `id -> order`；只有新 ID 才分配新序号。这意味着增量同步不会破坏旧名单码。

如果确实需要删除学生：

- 不要压缩数组或重排；
- 保留该学生的 `order` 空洞；
- 或者升级 `SB2` 名单码并写迁移说明。

## 头像

- 输出到 `public/students/icons/<id>.webp`，构建时复制到 `dist/students/icons/`。
- 脚本检查 `Content-Type: image/webp`、文件大于 512 字节、WebP 魔数 `RIFF`，避免把错误页当图片。
- 已存在的头像默认跳过；`pnpm data:sync -- --force` 强制重下。
- 任一失败都会让脚本非零退出，并列出失败学生；不会写入“缺图但成功”的状态。

## 更新流程

```bash
pnpm data:sync
pnpm test
pnpm build
git diff --stat
```

检查：

- `meta.count` 是否变化；
- 新学生的 `order` 是否都追加在末尾；
- `src/data/students.generated.json` 与 `public/students/icons/` 是否一起变更；
- 旧名单码是否仍能解码（`pnpm test` 会覆盖真实数据单学生）。

提交建议：

```text
feat(data): sync global roster 2026-11-01
```

## 版权

学生名称、资料、头像版权归 NEXON Games / Yostar 所有。仓库只保留运行这个非官方、非商业粉丝工具所需的最小素材；代码以 MIT 发布，素材不适用 MIT。详见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。
