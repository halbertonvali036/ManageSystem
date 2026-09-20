import { getScheduleDayKeys } from '@/models/schedule'
import {
  SCHEDULE_DAY_KEYS,
  addDays,
  getDayLongLabel,
  isSameDay,
  toDateKey,
} from '@/utils/scheduleDate'

function WeeklyTimetableView({
  items,
  weekStart,
  today = new Date(),
  renderItem,
  classNamePrefix = 'schedule-week',
  emptyLabel = 'No classes',
}) {
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
    <div className={`${classNamePrefix}-week`}>
      {SCHEDULE_DAY_KEYS.map((dayKey, index) => {
        const dayDate = addDays(weekStart, index)
        const isToday = isSameDay(dayDate, today)
        const dayItems = grouped[dayKey] || []
        return (
          <section
            key={dayKey}
            className={`${classNamePrefix}-week__day${
              isToday ? ` ${classNamePrefix}-week__day--today` : ''
            }`}
            aria-label={`${getDayLongLabel(dayKey)}, ${toDateKey(dayDate)}`}
          >
            <header className={`${classNamePrefix}-week__day-head`}>
              <span className={`${classNamePrefix}-week__day-name`}>
                {getDayLongLabel(dayKey)}
              </span>
              <span className={`${classNamePrefix}-week__day-date`}>
                {dayDate.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </header>
            <div className={`${classNamePrefix}-week__day-body`}>
              {dayItems.length === 0 ? (
                <p className={`${classNamePrefix}-week__empty`}>{emptyLabel}</p>
              ) : (
                dayItems.map(({ item, itemIndex }) => (
                  <div
                    key={item.key ?? item.id ?? `schedule-${itemIndex}`}
                    className={`${classNamePrefix}-week__slot`}
                  >
                    {renderItem(item)}
                  </div>
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default WeeklyTimetableView