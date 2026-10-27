import { DesktopOutlined, MoonOutlined, SunOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'
import { DATASET_META } from '@/data/students'
import type { ThemeMode } from '@/features/theme/theme-context'
import { useTheme } from '@/features/theme/use-theme'
import './app-header.scss'

const themeOptions = [
  {
    value: 'system',
    label: (
      <span className="theme-option">
        <DesktopOutlined />
        <span className="theme-option__label">跟随</span>
      </span>
    ),
  },
  {
    value: 'light',
    label: (
      <span className="theme-option">
        <SunOutlined />
        <span className="theme-option__label">浅色</span>
      </span>
    ),
  },
  {
    value: 'dark',
    label: (
      <span className="theme-option">
        <MoonOutlined />
        <span className="theme-option__label">深色</span>
      </span>
    ),
  },
]

interface AppHeaderProps {
  selectedCount: number
  onOpenSelected: () => void
}

export function AppHeader({ selectedCount, onOpenSelected }: AppHeaderProps) {
  const { mode, setMode } = useTheme()

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand" aria-label="Sensei Box">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand__text">
            <strong>SENSEI BOX</strong>
            <small>BLUE ARCHIVE · GLOBAL</small>
          </span>
        </div>

        <div className="app-header__actions">
          <span className="app-header__data">
            <span className="app-header__pulse" aria-hidden="true" />
            {DATASET_META.count} STUDENTS
          </span>

          <Segmented
            className="theme-switch"
            size="small"
            value={mode}
            options={themeOptions}
            onChange={(value) => setMode(value as ThemeMode)}
            aria-label="主题模式"
          />

          <Button
            className="roster-button"
            icon={<TeamOutlined />}
            onClick={onOpenSelected}
            title="我的名单"
          >
            <span className="roster-button__label">我的名单</span>
            <span className="roster-button__count">{selectedCount}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
