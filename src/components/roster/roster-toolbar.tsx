import {
  CheckSquareOutlined,
  ClearOutlined,
  ExportOutlined,
  FilterOutlined,
  ImportOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, Popconfirm, Segmented, Select, Tooltip } from 'antd'
import type {
  RosterFilters,
  RosterRarityFilter,
  RosterSort,
  RosterView,
} from '@/features/roster/roster-filters'
import {
  ARMOR_OPTIONS,
  ATTACK_OPTIONS,
  POSITION_OPTIONS,
  ROLE_OPTIONS,
  SCHOOL_OPTIONS,
  SQUAD_OPTIONS,
} from '@/data/taxonomy'
import './roster-toolbar.scss'

interface RosterToolbarProps {
  filters: RosterFilters
  visibleCount: number
  totalCount: number
  selectedCount: number
  onFiltersChange: (patch: Partial<RosterFilters>) => void
  onResetFilters: () => void
  onSelectVisible: () => void
  onClear: () => void
  onImport: () => void
  onExport: () => void
}

const viewOptions: { value: RosterView; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'selected', label: '已选' },
  { value: 'missing', label: '未选' },
]

const rarityOptions: { value: RosterRarityFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '3', label: '3★' },
  { value: 'low', label: '1–2★' },
]

const sortOptions: { value: RosterSort; label: string }[] = [
  { value: 'school', label: '学校分组' },
  { value: 'rarity', label: '星级优先' },
  { value: 'order', label: '实装顺序' },
]

export function RosterToolbar({
  filters,
  visibleCount,
  totalCount,
  selectedCount,
  onFiltersChange,
  onResetFilters,
  onSelectVisible,
  onClear,
  onImport,
  onExport,
}: RosterToolbarProps) {
  return (
    <section className="toolbar" aria-label="学生筛选">
      <div className="toolbar__primary">
        <Input
          className="toolbar__search"
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索中文名 / 英文名 / 别名"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
          aria-label="搜索学生"
        />

        <Segmented
          className="toolbar__view"
          options={viewOptions}
          value={filters.view}
          onChange={(value) => onFiltersChange({ view: value as RosterView })}
          aria-label="显示范围"
        />

        <div className="toolbar__actions">
          <Tooltip title="把当前筛选结果全部加入名单">
            <Button
              icon={<CheckSquareOutlined />}
              onClick={onSelectVisible}
              disabled={visibleCount === 0}
            >
              全选结果
            </Button>
          </Tooltip>
          <Popconfirm
            title="清空整份名单？"
            description="只会清空本机保存的勾选，不会影响游戏账号。"
            okText="清空"
            cancelText="取消"
            onConfirm={onClear}
            disabled={selectedCount === 0}
          >
            <Button icon={<ClearOutlined />} disabled={selectedCount === 0}>
              清空
            </Button>
          </Popconfirm>
          <Button icon={<ImportOutlined />} onClick={onImport}>
            导入
          </Button>
          <Button type="primary" icon={<ExportOutlined />} onClick={onExport}>
            生成名单
          </Button>
        </div>
      </div>

      <div className="toolbar__filters">
        <span className="toolbar__filter-label">
          <FilterOutlined />
          筛选
        </span>

        <Select
          className="toolbar__select toolbar__select--school"
          options={SCHOOL_OPTIONS}
          placeholder="学校"
          allowClear
          value={filters.school ?? undefined}
          onChange={(value) => onFiltersChange({ school: value ?? null })}
        />
        <Select
          className="toolbar__select"
          options={ROLE_OPTIONS}
          placeholder="职业"
          allowClear
          value={filters.role ?? undefined}
          onChange={(value) => onFiltersChange({ role: value ?? null })}
        />
        <Select
          className="toolbar__select"
          options={ATTACK_OPTIONS}
          placeholder="攻击"
          allowClear
          value={filters.attack ?? undefined}
          onChange={(value) => onFiltersChange({ attack: value ?? null })}
        />
        <Select
          className="toolbar__select"
          options={ARMOR_OPTIONS}
          placeholder="护甲"
          allowClear
          value={filters.armor ?? undefined}
          onChange={(value) => onFiltersChange({ armor: value ?? null })}
        />
        <Select
          className="toolbar__select"
          options={POSITION_OPTIONS}
          placeholder="站位"
          allowClear
          value={filters.position ?? undefined}
          onChange={(value) => onFiltersChange({ position: value ?? null })}
        />
        <Select
          className="toolbar__select"
          options={SQUAD_OPTIONS}
          placeholder="部队"
          allowClear
          value={filters.squad ?? undefined}
          onChange={(value) => onFiltersChange({ squad: value ?? null })}
        />

        <Segmented
          className="toolbar__rarity"
          options={rarityOptions}
          value={filters.rarity}
          onChange={(value) => onFiltersChange({ rarity: value as RosterRarityFilter })}
          aria-label="星级筛选"
        />

        <Select
          className="toolbar__select toolbar__select--sort"
          options={sortOptions}
          value={filters.sort}
          onChange={(value) => onFiltersChange({ sort: value as RosterSort })}
          aria-label="排序方式"
        />

        <Button type="text" size="small" onClick={onResetFilters}>
          重置
        </Button>

        <span className="toolbar__result">
          显示 <strong>{visibleCount}</strong> / {totalCount}
        </span>
      </div>
    </section>
  )
}
