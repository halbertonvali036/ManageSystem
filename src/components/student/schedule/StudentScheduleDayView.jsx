import StudentScheduleItemCard from '@/components/student/schedule/StudentScheduleItemCard'

function StudentScheduleDayView({ items, dayHeading }) {
  return (
    <div className="student-schedule-day">
      <h2 className="student-schedule-day__heading">{dayHeading}</h2>
      {items.length === 0 ? (
        <p className="student-schedule-day__empty">No classes this day.</p>
      ) : (
        <ul className="student-schedule-day__list">
          {items.map((item, index) => (
            <li key={item.key ?? item.id ?? `schedule-${index}`}>
              <StudentScheduleItemCard item={item} showDate />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default StudentScheduleDayView