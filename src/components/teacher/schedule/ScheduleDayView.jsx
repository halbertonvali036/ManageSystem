import ScheduleItemCard from '@/components/teacher/schedule/ScheduleItemCard'

function ScheduleDayView({ items, dayHeading }) {
  return (
    <div className="schedule-day">
      <h2 className="schedule-day__heading">{dayHeading}</h2>
      {items.length === 0 ? (
        <p className="schedule-week__empty">No classes scheduled this day.</p>
      ) : (
        <ul className="schedule-day__list">
          {items.map((item, index) => (
            <li key={item.key ?? item.id ?? `schedule-${index}`}>
              <ScheduleItemCard item={item} showDate={Boolean(item.date)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ScheduleDayView