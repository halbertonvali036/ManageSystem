import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'
import { REPORT_CATEGORIES } from '@/models/report'

function ReportsQuickAccessCard() {
  return (
    <Card
      title="Reports"
      action={
        <Link to="/reports" className="form__link">
          Generate Reports
        </Link>
      }
    >
      <ul className="reports-quick">
        {REPORT_CATEGORIES.map((category) => (
          <li className="reports-quick__item" key={category.key}>
            <Link to="/reports" className="reports-quick__link">
              <span className="reports-quick__body">
                <span className="reports-quick__title">{category.title}</span>
                <span className="reports-quick__description">
                  {category.description}
                </span>
              </span>
              <BarChart3 size={16} className="reports-quick__icon" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="widget-actions">
        <Link to="/reports" className="btn btn--primary btn--block">
          Open Reports
        </Link>
      </div>
    </Card>
  )
}

export default ReportsQuickAccessCard