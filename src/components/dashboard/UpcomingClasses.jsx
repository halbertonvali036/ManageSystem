import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'

function UpcomingClasses({ items }) {
  return (
    <Card title="Upcoming classes">
      {items.length === 0 ? (
        <div className="widget-empty">
          <CalendarClock
            size={24}
            className="widget-empty__icon"
            aria-hidden="true"
          />
          <p className="widget-empty__title">No upcoming classes</p>
          <p className="widget-empty__text">
            Scheduled classes will appear here once the system has data.
          </p>
        </div>
      ) : (
        <ul className="class-list">
          {items.map((item) => (
            <li className="class-item" key={item.id}>
              <span className="class-item__time">{item.timeSlot}</span>
              <div className="class-item__info">
                <h3 className="class-item__subject">{item.subject}</h3>
                <p className="class-item__meta">{item.teacher}</p>
              </div>
              <span className="class-item__room">
                <MapPin size={14} aria-hidden="true" />
                {item.room}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default UpcomingClasses