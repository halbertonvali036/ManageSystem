import { ArrowRight, FileBarChart2 } from 'lucide-react'
import Card from '@/components/common/Card'

function ReportCategoryCard({ category, icon, onSelect }) {
  return (
    <Card className={`report-category report-category--${category.key}`}>
      <span className="report-category__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="report-category__title">{category.title}</h3>
      <p className="report-category__description">{category.description}</p>
      <div className="report-category__action">
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={() => onSelect(category)}
        >
          <FileBarChart2 size={16} aria-hidden="true" />
          View Report
        </button>
        <ArrowRight className="report-category__arrow" size={18} aria-hidden="true" />
      </div>
    </Card>
  )
}

export default ReportCategoryCard