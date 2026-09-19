import { useState } from 'react'
import ReportCategories from '@/components/reports/ReportCategories'
import ReportWorkspace from '@/components/reports/ReportWorkspace'
import { REPORT_CATEGORIES } from '@/models/report'

function ReportsPage() {
  const [activeCategoryKey, setActiveCategoryKey] = useState(null)
  const activeCategory =
    REPORT_CATEGORIES.find((category) => category.key === activeCategoryKey) ??
    null

  return (
    <div className="reports-page">
      <p className="page-description">
        Generate reports across students, attendance, grades, courses and
        classes. Configure filters, then generate to build a report.
      </p>
      {activeCategory ? (
        <ReportWorkspace
          key={activeCategory.key}
          category={activeCategory}
          onBack={() => setActiveCategoryKey(null)}
        />
      ) : (
        <ReportCategories onSelect={(category) => setActiveCategoryKey(category.key)} />
      )}
    </div>
  )
}

export default ReportsPage