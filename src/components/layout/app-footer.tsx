import { DATASET_META } from '@/data/students'
import { datasetDate } from '@/features/roster/roster-export'
import './app-footer.scss'

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__row">
        <span>
          SENSEI BOX · 非官方粉丝工具 · 数据来自{' '}
          <a href={DATASET_META.sourceUrl} target="_blank" rel="noreferrer">
            SchaleDB
          </a>
          （{datasetDate()}）
        </span>
        <span>学生资料与头像版权归 NEXON Games / Yostar 所有 · 代码以 MIT 许可发布</span>
      </div>
      <div className="app-footer__row app-footer__row--muted">
        <span>为 Sensei 的个人 box 管理而做</span>
        <span className="app-footer__mono">LOCAL-FIRST / NO SERVER</span>
      </div>
    </footer>
  )
}
