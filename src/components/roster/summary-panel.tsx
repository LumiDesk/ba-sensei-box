import { DatabaseOutlined } from '@ant-design/icons'
import { Progress } from 'antd'
import { DATASET_META, STUDENTS } from '@/data/students'
import { useRoster } from '@/features/roster/use-roster'
import { datasetDate } from '@/features/roster/roster-export'
import { StatTile } from '@/components/ui/stat-tile'
import './summary-panel.scss'

export function SummaryPanel() {
  const { selectedStudents, selectedCount } = useRoster()
  const threeStar = selectedStudents.filter((student) => student.rarity === 3).length
  const lowStar = selectedCount - threeStar
  const schools = new Set(selectedStudents.map((student) => student.school)).size
  const percent = Math.max(
    selectedCount > 0 ? 1 : 0,
    Math.round((selectedCount / STUDENTS.length) * 100),
  )

  return (
    <section className="summary">
      <div className="summary__copy">
        <span className="summary__eyebrow">
          <span className="summary__halo" aria-hidden="true" />
          GLOBAL · STUDENT BOX
        </span>
        <h1>
          把 box 摊开，
          <em>配队才有解。</em>
        </h1>
        <p>
          勾选你实际拥有的学生，生成一份 Sensei 能直接读懂的名单。所有筛选、保存和导出都在本地完成，
          断网也能用。
        </p>
        <span className="summary__meta">
          <DatabaseOutlined />
          {DATASET_META.count} 名学生 · 数据 {datasetDate()} · 头像已本地化
        </span>
      </div>

      <div className="summary__panel">
        <div className="summary__stats">
          <StatTile label="已选" value={selectedCount} hint={`/ ${STUDENTS.length}`} tone="brand" />
          <StatTile label="3★" value={threeStar} tone="gold" />
          <StatTile label="1–2★" value={lowStar} />
          <StatTile label="覆盖学校" value={schools} />
        </div>
        <div className="summary__progress">
          <div className="summary__progress-label">
            <span>BOX 完成度</span>
            <strong>{percent}%</strong>
          </div>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor={{ '0%': '#4f8cff', '100%': '#7dd3fc' }}
            trailColor="var(--bg-soft)"
            size={['100%', 7]}
          />
        </div>
      </div>
    </section>
  )
}
