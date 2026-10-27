import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ReactNode } from 'react'
import { useTheme } from '@/features/theme/use-theme'

const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif'

export function AntdProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f8cff',
          colorInfo: '#4f8cff',
          borderRadius: 10,
          controlHeight: 36,
          fontFamily: FONT_STACK,
          fontFamilyCode: '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
        },
        components: {
          Button: { fontWeight: 600 },
          Card: { borderRadiusLG: 14 },
          Modal: { borderRadiusLG: 16 },
          Segmented: { itemSelectedBg: isDark ? '#1e3358' : '#ffffff' },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}
