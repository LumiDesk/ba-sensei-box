import { AntdProvider } from './providers/antd-provider'
import { RosterProvider } from '@/features/roster/roster-provider'
import { ThemeProvider } from '@/features/theme/theme-provider'
import { RosterPage } from '@/pages/roster-page'

export default function App() {
  return (
    <ThemeProvider>
      <AntdProvider>
        <RosterProvider>
          <RosterPage />
        </RosterProvider>
      </AntdProvider>
    </ThemeProvider>
  )
}
