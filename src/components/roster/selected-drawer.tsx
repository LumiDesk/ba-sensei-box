import { CloseOutlined, ExportOutlined, TeamOutlined } from '@ant-design/icons'
import { Avatar, Button, Drawer, Empty, List, Popconfirm, Tag } from 'antd'
import { studentIconUrl } from '@/data/students'
import { schoolLabel } from '@/data/taxonomy'
import { useRoster } from '@/features/roster/use-roster'
import './selected-drawer.scss'

interface SelectedDrawerProps {
  open: boolean
  onClose: () => void
  onExport: () => void
}

export function SelectedDrawer({ open, onClose, onExport }: SelectedDrawerProps) {
  const { selectedStudents, selectedCount, toggleStudent, clearRoster } = useRoster()
  const threeStar = selectedStudents.filter((student) => student.rarity === 3).length

  return (
    <Drawer
      className="selected-drawer"
      title={
        <span className="selected-drawer__title">
          <TeamOutlined />
          我的名单
          <Tag color="blue">{selectedCount}</Tag>
        </span>
      }
      placement="right"
      width={440}
      open={open}
      onClose={onClose}
      footer={
        <div className="selected-drawer__footer">
          <span>
            3★ {threeStar} · 1–2★ {selectedCount - threeStar}
          </span>
          <div className="selected-drawer__footer-actions">
            <Popconfirm
              title="清空整份名单？"
              okText="清空"
              cancelText="取消"
              onConfirm={clearRoster}
              disabled={selectedCount === 0}
            >
              <Button danger disabled={selectedCount === 0}>
                清空
              </Button>
            </Popconfirm>
            <Button type="primary" icon={<ExportOutlined />} onClick={onExport}>
              生成名单
            </Button>
          </div>
        </div>
      }
    >
      {selectedCount === 0 ? (
        <Empty description="还没有勾选学生，先从左侧卡片开始吧。" />
      ) : (
        <List
          className="selected-drawer__list"
          dataSource={selectedStudents}
          renderItem={(student) => (
            <List.Item
              actions={[
                <Button
                  key="remove"
                  type="text"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  aria-label={`移除 ${student.name}`}
                  onClick={() => toggleStudent(student.id)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar shape="square" size={42} src={studentIconUrl(student)} alt={student.name}>
                    {student.name.slice(0, 1)}
                  </Avatar>
                }
                title={
                  <span className="selected-drawer__name">
                    {student.name}
                    <Tag color={student.rarity === 3 ? 'gold' : 'default'}>{student.rarity}★</Tag>
                  </span>
                }
                description={
                  <span className="selected-drawer__meta">
                    {schoolLabel(student.school)} · {student.nameEn}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  )
}
