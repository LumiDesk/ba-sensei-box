import { Avatar, Checkbox } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { memo } from 'react'
import type { Student } from '@/data/types'
import {
  ARMOR_BY_CODE,
  ATTACK_BY_CODE,
  ROLE_BY_CODE,
  armorLabel,
  attackLabel,
  roleLabel,
  schoolLabel,
  taxonomyColor,
} from '@/data/taxonomy'
import { studentIconUrl } from '@/data/students'
import { TypeChip } from '@/components/ui/type-chip'
import './student-card.scss'

interface StudentCardProps {
  student: Student
  selected: boolean
  onToggle: (id: number) => void
}

function StudentCardView({ student, selected, onToggle }: StudentCardProps) {
  const title = [
    `${student.name} / ${student.nameEn}`,
    schoolLabel(student.school),
    roleLabel(student.role),
    attackLabel(student.attack),
    armorLabel(student.armor),
  ].join(' · ')

  return (
    <label
      className={`student-card${selected ? ' is-selected' : ''}`}
      title={title}
      data-student-id={student.id}
    >
      <Checkbox
        className="student-card__checkbox"
        checked={selected}
        onChange={() => onToggle(student.id)}
        aria-label={`选择 ${student.name}`}
      />

      <span className="student-card__portrait">
        <Avatar
          shape="square"
          size={58}
          src={studentIconUrl(student)}
          alt={student.name}
          className="student-card__avatar"
        >
          {student.name.slice(0, 1)}
        </Avatar>
        <span className={`student-card__rarity rarity-${student.rarity}`}>{student.rarity}★</span>
      </span>

      <span className="student-card__identity">
        <span className="student-card__name">{student.name}</span>
        <span className="student-card__name-en">{student.nameEn}</span>
      </span>

      <span className="student-card__tags">
        <TypeChip
          label={roleLabel(student.role)}
          color={taxonomyColor(ROLE_BY_CODE, student.role)}
        />
        <TypeChip
          label={attackLabel(student.attack)}
          color={taxonomyColor(ATTACK_BY_CODE, student.attack)}
        />
        <TypeChip
          label={armorLabel(student.armor)}
          color={taxonomyColor(ARMOR_BY_CODE, student.armor)}
        />
      </span>

      {selected ? <CheckCircleFilled className="student-card__check" aria-hidden="true" /> : null}
    </label>
  )
}

export const StudentCard = memo(StudentCardView)
