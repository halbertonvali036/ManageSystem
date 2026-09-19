import ScheduleItemCard from '@/components/teacher/schedule/ScheduleItemCard'
import { getScheduleDayKeys } from '@/models/schedule'
import {
  SCHEDULE_DAY_KEYS,
  addDays,
  getDayLongLabel,
  isSameDay,
  toDateKey,
} from '@/utils/scheduleDate'

function ScheduleWeekView({ items, weekStart, today = new Date() }) {
  const grouped = items.reduce((acc, item, itemIndex) => {
    const keys = getScheduleDayKeys(item)
    for (const key of keys) {
      if (SCHEDULE_DAY_KEYS.includes(key)) {
        acc[key] = acc[key] || []
        acc[key].push({ item, itemIndex })
      }
    }
    return acc
  }, {})

  return (
    <div className="schedule-week">
      {SCHEDULE_DAY_KEYS.map((dayKey, index) => {
        const dayDate = addDays(weekStart, index)
        const isToday = isSameDay(dayDate, today)
        const dayItems = grouped[dayKey] || []
        return (
          <section
            key={dayKey}
            className={`schedule-week__day${
              isToday ? ' schedule-week__day--today' : ''
            }`}
            aria-label={`${getDayLongLabel(dayKey)}, ${toDateKey(dayDate)}`}
          >
            <header className="schedule-week__day-head">
              <span className="schedule-week__day-name">
                {getDayLongLabel(dayKey)}
              </span>
              <span className="schedule-week__day-date">
                {dayDate.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </header>
            <div className="schedule-week__day-body">
              {dayItems.length === 0 ? (
                <p className="schedule-week__empty">No classes</p>
              ) : (
                dayItems.map(({ item, itemIndex }) => (
                  <ScheduleItemCard
                    key={item.key ?? item.id ?? `schedule-${itemIndex}`}
                    item={item}
                  />
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default ScheduleWeekView