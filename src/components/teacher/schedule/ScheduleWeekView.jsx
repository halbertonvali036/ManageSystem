import ScheduleItemCard from '@/components/teacher/schedule/ScheduleItemCard'
import WeeklyTimetableView from '@/components/schedules/WeeklyTimetableView'

function ScheduleWeekView({ items, weekStart, today = new Date() }) {
  return (
    <WeeklyTimetableView
      items={items}
      weekStart={weekStart}
      today={today}
      classNamePrefix="schedule-week"
      renderItem={(item) => <ScheduleItemCard item={item} />}
    />
  )
}

export default ScheduleWeekView