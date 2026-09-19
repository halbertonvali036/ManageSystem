import { Activity } from 'lucide-react'
import Card from '@/components/common/Card'

function RecentActivity({ items }) {
  return (
    <Card title="Recent activity">
      {items.length === 0 ? (
        <div className="widget-empty">
          <Activity size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No recent activity</p>
          <p className="widget-empty__text">
            Activity will appear here once the system has data.
          </p>
        </div>
      ) : (
        <ul className="activity-list">
          {items.map((item) => (
            <li className="activity-item" key={item.id}>
              <span className="activity-item__marker" aria-hidden="true" />
              <div className="activity-item__body">
                <span className="activity-item__text">{item.text}</span>
                <span className="activity-item__time">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default RecentActivity