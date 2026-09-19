import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Card from '@/components/common/Card'
import ScheduleDayView from '@/components/teacher/schedule/ScheduleDayView'
import ScheduleWeekView from '@/components/teacher/schedule/ScheduleWeekView'
import TeacherScheduleNav from '@/components/teacher/schedule/TeacherScheduleNav'
import useMySchedule from '@/hooks/teacher/useMySchedule'
import {
  addDays,
  formatDayHeading,
  formatWeekRangeLabel,
  getMondayOfWeek,
  toDateKey,
} from '@/utils/scheduleDate'

function LoadingState() {
  return (
    <Card>
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading schedule&hellip;
      </div>
    </Card>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <Card>
      <div className="table-state table-state--error">
        <h3 className="table-state__title">Failed to load schedule</h3>
        <p className="table-state__text">{message}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    </Card>
  )
}

function EmptyState({ weekStart, mode }) {
  const emptyLabel =
    mode === 'day'
      ? formatDayHeading(weekStart)
      : formatWeekRangeLabel(weekStart)

  return (
    <Card>
      <div className="table-state">
        <CalendarDays className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No classes scheduled</h3>
        <p className="table-state__text">
          Your schedule for {emptyLabel} will appear here once class schedules
          are set up for your account.
        </p>
      </div>
    </Card>
  )
}

function TeacherSchedulePage() {
  const [mode, setMode] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => new Date())

  const today = new Date()
  const weekStart = getMondayOfWeek(anchorDate)
  const weekStartKey = toDateKey(weekStart)
  const currentDay = mode === 'day' ? anchorDate : null
  const dateKey = currentDay ? toDateKey(currentDay) : null

  const { items, isLoading, error, refetch } = useMySchedule(
    dateKey ? { date: dateKey } : { weekStart: weekStartKey },
  )

  const handleOffsetChange = (offset) => {
    if (offset === 0) {
      setAnchorDate(new Date())
      return
    }
    const delta = mode === 'week' ? offset * 7 : offset
    setAnchorDate((current) => addDays(current, delta))
  }

  const handleJumpToWeek = (value) => {
    if (!value) {
      return
    }
    const [year, month, day] = value.split('-').map(Number)
    const target = new Date(year, month - 1, day)
    setAnchorDate(mode === 'week' ? getMondayOfWeek(target) : target)
  }

  const navLabel =
    mode === 'day'
      ? formatDayHeading(anchorDate)
      : formatWeekRangeLabel(weekStart)

  return (
    <div className="schedule-page">
      <p className="page-description">
        View your weekly teaching schedule. Switch between week and day views,
        navigate between periods, and jump to any week from the selector.
      </p>

      <TeacherScheduleNav
        mode={mode}
        onModeChange={setMode}
        weekStart={weekStartKey}
        onOffsetChange={handleOffsetChange}
        onJumpToWeek={handleJumpToWeek}
        todayLabel={navLabel}
      />

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : null}
      {!isLoading && !error && items.length === 0 ? (
        <EmptyState weekStart={anchorDate} mode={mode} />
      ) : null}
      {!isLoading && !error && items.length > 0 && mode === 'week' ? (
        <Card>
          <ScheduleWeekView items={items} weekStart={weekStart} today={today} />
        </Card>
      ) : null}
      {!isLoading && !error && items.length > 0 && mode === 'day' ? (
        <ScheduleDayView items={items} dayHeading={formatDayHeading(anchorDate)} />
      ) : null}
    </div>
  )
}

export default TeacherSchedulePage