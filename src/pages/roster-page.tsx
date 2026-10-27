import { App, FloatButton } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { AppFooter } from '@/components/layout/app-footer'
import { AppHeader } from '@/components/layout/app-header'
import { ExportModal } from '@/components/roster/export-modal'
import { ImportModal } from '@/components/roster/import-modal'
import { RosterGrid } from '@/components/roster/roster-grid'
import { RosterToolbar } from '@/components/roster/roster-toolbar'
import { SelectedDrawer } from '@/components/roster/selected-drawer'
import { SummaryPanel } from '@/components/roster/summary-panel'
import { STUDENTS } from '@/data/students'
import {
  DEFAULT_FILTERS,
  filterStudents,
  type RosterFilters,
} from '@/features/roster/roster-filters'
import { useRoster } from '@/features/roster/use-roster'
import './roster-page.scss'

export function RosterPage() {
  const { selectedIds, selectedCount, addStudents, clearRoster, toggleStudent } = useRoster()
  const { message } = App.useApp()
  const [filters, setFilters] = useState<RosterFilters>(DEFAULT_FILTERS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const filteredStudents = useMemo(
    () => filterStudents(STUDENTS, selectedIds, filters),
    [selectedIds, filters],
  )

  const handleFiltersChange = useCallback((patch: Partial<RosterFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
  }, [])

  const handleSelectVisible = useCallback(() => {
    if (filteredStudents.length === 0) return
    addStudents(filteredStudents.map((student) => student.id))
    void message.success(`已把 ${filteredStudents.length} 名学生加入名单`)
  }, [addStudents, filteredStudents, message])

  const handleClear = useCallback(() => {
    clearRoster()
    void message.success('名单已清空')
  }, [clearRoster, message])

  return (
    <div className="app-shell">
      <AppHeader selectedCount={selectedCount} onOpenSelected={() => setDrawerOpen(true)} />

      <main className="page">
        <SummaryPanel />

        <div className="workflow" aria-label="使用步骤">
          <span>
            <strong>01</strong> 搜索或按学校找到学生
          </span>
          <span>
            <strong>02</strong> 点击卡片勾选你的 box
          </span>
          <span>
            <strong>03</strong> 生成名单，直接发给 Sensei
          </span>
        </div>

        <div className="page__section">
          <RosterToolbar
            filters={filters}
            visibleCount={filteredStudents.length}
            totalCount={STUDENTS.length}
            selectedCount={selectedCount}
            onFiltersChange={handleFiltersChange}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            onSelectVisible={handleSelectVisible}
            onClear={handleClear}
            onImport={() => setImportOpen(true)}
            onExport={() => setExportOpen(true)}
          />
        </div>

        <RosterGrid
          students={filteredStudents}
          selectedIds={selectedIds}
          sort={filters.sort}
          onToggle={toggleStudent}
        />

        <AppFooter />
      </main>

      <SelectedDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExport={() => {
          setDrawerOpen(false)
          setExportOpen(true)
        }}
      />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <FloatButton.BackTop tooltip="回到顶部" />
    </div>
  )
}
