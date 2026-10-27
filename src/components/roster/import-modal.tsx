import { ImportOutlined } from '@ant-design/icons'
import { Alert, App, Button, Input, Modal } from 'antd'
import { useState } from 'react'
import { STUDENTS } from '@/data/students'
import { useRoster } from '@/features/roster/use-roster'
import { parseRosterInput } from '@/features/roster/roster-import'
import './import-modal.scss'

interface ImportModalProps {
  open: boolean
  onClose: () => void
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const { replaceRoster } = useRoster()
  const { message } = App.useApp()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleImport = () => {
    try {
      const result = parseRosterInput(text, STUDENTS)
      replaceRoster(result.ids)
      void message.success(`已导入 ${result.ids.length} 名学生`)
      for (const warning of result.warnings) void message.warning(warning)
      setText('')
      handleClose()
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : '导入失败')
    }
  }

  return (
    <Modal
      className="import-modal"
      open={open}
      onCancel={handleClose}
      title={
        <span className="import-modal__title">
          <ImportOutlined />
          导入名单
        </span>
      }
      footer={
        <div className="import-modal__footer">
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" disabled={!text.trim()} onClick={handleImport}>
            导入并覆盖
          </Button>
        </div>
      }
    >
      <p className="import-modal__hint">
        支持粘贴名单码（<code>SB1-…</code>）或本工具导出的 JSON。导入会覆盖当前勾选。
      </p>
      {error ? (
        <Alert className="import-modal__alert" type="error" showIcon message={error} />
      ) : null}
      <Input.TextArea
        rows={7}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          if (error) setError(null)
        }}
        placeholder='SB1-… 或 {"roster":{"ids":[...]}}'
        className="import-modal__input"
      />
    </Modal>
  )
}
