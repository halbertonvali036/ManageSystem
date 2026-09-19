import { LayoutPanelTop } from 'lucide-react'
import Card from '@/components/common/Card'
import { TEACHER_NAV_ITEMS } from '@/utils/teacherConstants'

const FALLBACK_DESCRIPTION = 'This module will be added in an upcoming milestone.'

function TeacherPlaceholderPage({ title, description = FALLBACK_DESCRIPTION }) {
  const navItem = TEACHER_NAV_ITEMS.find((item) => item.label === title)
  const Icon = navItem?.icon ?? LayoutPanelTop

  return (
    <Card className="teacher-placeholder">
      <div className="table-state">
        <Icon className="table-state__icon" size={40} aria-hidden="true" />
        <h2 className="table-state__title">{title}</h2>
        <p className="table-state__text">{description}</p>
        <span className="teacher-placeholder__badge" role="note">
          Coming soon
        </span>
      </div>
    </Card>
  )
}

export default TeacherPlaceholderPage