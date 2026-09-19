import { CalendarClock, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import { formatClassName } from '@/models/class'
import { parseSchedule } from '@/utils/classForm'

function TodaysScheduleCard({ items }) {
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
          {items.map((item) => {
            const schedule = parseSchedule(item.schedule || '')
            return (
              <li className="class-item" key={item.id}>
                <span className="class-item__time">{schedule.startTime || '—'}</span>
                <div className="class-item__info">
                  <h3 className="class-item__subject">{formatClassName(item)}</h3>
                  <p className="class-item__meta">{schedule.days || '—'}</p>
                </div>
                <span className="class-item__room">
                  <MapPin size={14} aria-hidden="true" />
                  {item.room || '—'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default TodaysScheduleCard