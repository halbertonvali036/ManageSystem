import StudentScheduleItemCard from '@/components/student/schedule/StudentScheduleItemCard'
import WeeklyTimetableView from '@/components/schedules/WeeklyTimetableView'

function StudentScheduleWeekView({ items, weekStart, today = new Date() }) {
  return (
    <WeeklyTimetableView
      items={items}
      weekStart={weekStart}
      today={today}
      classNamePrefix="student-schedule-week"
      renderItem={(item) => <StudentScheduleItemCard item={item} />}
    />
  )
}

export default StudentScheduleWeekView