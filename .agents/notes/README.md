# Agent Notes

这里记录会影响本仓库的**设计决策**：为什么这样做、放弃了什么、以后修改时要守住什么。代码和 README 能说明“是什么”，Agent Note 只补“为什么”。

## 命名

```text
.agents/notes/implemented/yyyy-mm-dd-topic-title.md
```

本仓库只保留 `implemented/`。如果未来有尚未落地的方案，加 `proposed/`；被否掉的方案加 `rejected/`，并在 `Status:` 行写一句原因。

## 文件格式

```markdown
# Agent Note: <title>

Status: implemented

## Problem

## Decision

## Alternatives considered

## Consequences
```

- `Problem`：不依赖方案也能读懂的背景。
- `Decision`：现在实际运行的做法，用现在时；代码移动/改名时同步更新事实。
- `Alternatives considered`：真实考虑过的替代方案，以及为什么没选。
- `Consequences`：得到的和付出的，包含后续修改的约束。

## 什么时候写

- 影响数据结构、离线形态、名单码格式、主题机制、依赖选择时写。
- 纯 UI 间距、文案、局部样式调整不写。
- 决策反转时新建一条并交叉链接，不把旧 note 改成相反结论。

## 现有决策

- [2026-10-27 离线单文件构建](implemented/2026-10-27-offline-single-file-build.md)
- [2026-10-27 以 SchaleDB 为数据源](implemented/2026-10-27-schaledb-roster-source.md)
- [2026-10-27 名单码使用 order 位图](implemented/2026-10-27-roster-code-bitset.md)
- [2026-10-27 Ant Design + CSS 变量主题](implemented/2026-10-27-antd-css-variable-theme.md)
