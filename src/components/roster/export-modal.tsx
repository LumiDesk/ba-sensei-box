import { CopyOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { Alert, App, Button, Form, Input, InputNumber, Modal, Select, Tabs, Tag } from 'antd'
import { useMemo } from 'react'
import { useRoster } from '@/features/roster/use-roster'
import {
  buildFullExport,
  buildJsonExport,
  buildReadableRoster,
  datasetDate,
} from '@/features/roster/roster-export'
import { encodeRoster } from '@/features/roster/roster-codec'
import { STUDENTS } from '@/data/students'
import { copyText } from '@/lib/clipboard'
import { downloadText } from '@/lib/download'
import './export-modal.scss'

const TARGET_OPTIONS = [
  { value: '总力战', label: '总力战' },
  { value: '大决战', label: '大决战' },
  { value: '竞技场', label: '竞技场' },
  { value: '活动 / 主线', label: '活动 / 主线' },
  { value: 'box 体检', label: '先做 box 体检' },
  { value: '其他', label: '其他' },
]

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { selectedStudents, selectedCount, meta, updateMeta } = useRoster()
  const { message } = App.useApp()

  const code = useMemo(
    () => encodeRoster(new Set(selectedStudents.map((student) => student.id)), STUDENTS),
    [selectedStudents],
  )
  const readable = useMemo(() => buildReadableRoster(selectedStudents), [selectedStudents])
  const fullText = useMemo(() => buildFullExport(selectedStudents, meta), [selectedStudents, meta])
  const jsonText = useMemo(() => buildJsonExport(selectedStudents, meta), [selectedStudents, meta])

  const copy = async (text: string, label: string) => {
    try {
      await copyText(text)
      void message.success(`${label}已复制`)
    } catch (error) {
      void message.error(error instanceof Error ? error.message : '复制失败')
    }
  }

  const downloadJson = () => {
    downloadText(`sensei-box-${datasetDate()}.json`, jsonText)
    void message.success('JSON 已开始下载')
  }

  return (
    <Modal
      className="export-modal"
      open={open}
      onCancel={onClose}
      width={820}
      title={
        <span className="export-modal__title">
          <FileTextOutlined />
          生成名单
          <Tag color="blue">{selectedCount} 人</Tag>
        </span>
      }
      footer={
        <div className="export-modal__footer">
          <Button onClick={onClose}>关闭</Button>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            disabled={selectedCount === 0}
            onClick={() => void copy(fullText, '完整名单')}
          >
            复制完整名单
          </Button>
        </div>
      }
    >
      {selectedCount === 0 ? (
        <Alert
          className="export-modal__alert"
          type="warning"
          showIcon
          message="还没有勾选学生"
          description="先回到学生网格勾选你拥有的学生，再生成名单。"
        />
      ) : null}

      <Form layout="vertical" className="export-modal__form">
        <div className="export-modal__form-grid">
          <Form.Item label="目标内容">
            <Select
              allowClear
              placeholder="例如：当前总力战"
              options={TARGET_OPTIONS}
              value={meta.target || undefined}
              onChange={(value) => updateMeta({ target: value ?? '' })}
            />
          </Form.Item>
          <Form.Item label="账号等级">
            <InputNumber
              min={1}
              max={120}
              placeholder="例如：85"
              value={meta.level}
              onChange={(value) => updateMeta({ level: value ?? null })}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
        <Form.Item label="备注">
          <Input.TextArea
            rows={2}
            maxLength={240}
            showCount
            placeholder="关键学生的星级/专武、想打的难度、手操还是自动……"
            value={meta.notes}
            onChange={(event) => updateMeta({ notes: event.target.value })}
          />
        </Form.Item>
      </Form>

      <Tabs
        className="export-modal__tabs"
        defaultActiveKey="full"
        items={[
          {
            key: 'full',
            label: '完整名单',
            children: (
              <Input.TextArea
                className="export-modal__text"
                readOnly
                autoSize={{ minRows: 10, maxRows: 15 }}
                value={fullText}
              />
            ),
          },
          {
            key: 'code',
            label: '名单码',
            children: (
              <div className="export-modal__code-wrap">
                <p className="export-modal__hint">
                  直接把这串码发给我即可。名单码只记录“拥有哪些学生”，不包含账号信息。
                </p>
                <Input.TextArea
                  className="export-modal__text export-modal__text--code"
                  readOnly
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  value={code}
                />
                <Button
                  icon={<CopyOutlined />}
                  disabled={selectedCount === 0}
                  onClick={() => void copy(code, '名单码')}
                >
                  复制名单码
                </Button>
              </div>
            ),
          },
          {
            key: 'readable',
            label: '可读名单',
            children: (
              <Input.TextArea
                className="export-modal__text"
                readOnly
                autoSize={{ minRows: 10, maxRows: 15 }}
                value={readable || '（还没有勾选学生）'}
              />
            ),
          },
          {
            key: 'json',
            label: 'JSON',
            children: (
              <div className="export-modal__code-wrap">
                <p className="export-modal__hint">
                  JSON 适合备份或换设备；导入时也支持直接粘贴这份 JSON。
                </p>
                <Input.TextArea
                  className="export-modal__text export-modal__text--code"
                  readOnly
                  autoSize={{ minRows: 8, maxRows: 14 }}
                  value={jsonText}
                />
                <Button
                  icon={<DownloadOutlined />}
                  disabled={selectedCount === 0}
                  onClick={downloadJson}
                >
                  下载 JSON
                </Button>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  )
}
