import { Award, BookOpen, CalendarCheck, FileBarChart2, GraduationCap, Users } from 'lucide-react'
import ReportCategoryCard from '@/components/reports/ReportCategoryCard'
import { REPORT_CATEGORIES, REPORT_TYPES } from '@/models/report'

const CATEGORY_ICONS = {
  [REPORT_TYPES.STUDENTS]: Users,
  [REPORT_TYPES.ATTENDANCE]: CalendarCheck,
  [REPORT_TYPES.GRADES]: Award,
  [REPORT_TYPES.COURSES]: BookOpen,
  [REPORT_TYPES.CLASSES]: GraduationCap,
}

function ReportCategories({ onSelect }) {
  return (
    <div className="reports-grid">
      {REPORT_CATEGORIES.map((category) => {
        const Icon = CATEGORY_ICONS[category.key] ?? FileBarChart2
        return (
          <ReportCategoryCard
            key={category.key}
            category={category}
            icon={<Icon size={24} aria-hidden="true" />}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}

export default ReportCategories