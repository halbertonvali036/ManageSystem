import { CalendarClock } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatScheduleClassName,
  formatScheduleRoom,
  formatScheduleTimeRange,
} from '@/models/schedule'

function TodayScheduleCard({ items }) {
  return (
    <Card title="Today's Schedule">
      {items.length === 0 ? (
        <div className="widget-empty">
          <CalendarClock
            size={24}
            className="widget-empty__icon"
            aria-hidden="true"
          />
          <p className="widget-empty__title">No classes scheduled today</p>
          <p className="widget-empty__text">
            Today&rsquo;s schedule will appear here once classes are set up.
          </p>
        </div>
      ) : (
        <ul className="class-list">
          {items.map((item, index) => (
            <li className="class-item" key={item.id ?? index}>
              <span className="class-item__time">
                {formatScheduleTimeRange(item)}
              </span>
              <div className="class-item__info">
                <h3 className="class-item__subject">
                  {formatScheduleClassName(item)}
                </h3>
              </div>
              <span className="class-item__room">
                {formatScheduleRoom(item) === '—' ? null : formatScheduleRoom(item)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default TodayScheduleCard