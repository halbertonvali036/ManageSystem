import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

function StudentScheduleNav({
  mode,
  onModeChange,
  weekStart,
  onOffsetChange,
  onJumpToWeek,
  todayLabel,
}) {
  return (
    <div className="student-schedule-nav">
      <div className="student-schedule-nav__group">
        <div
          className="student-schedule-mode"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            className={`student-schedule-mode__btn${
              mode === 'week' ? ' student-schedule-mode__btn--active' : ''
            }`}
            aria-pressed={mode === 'week'}
            onClick={() => onModeChange('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={`student-schedule-mode__btn${
              mode === 'day' ? ' student-schedule-mode__btn--active' : ''
            }`}
            aria-pressed={mode === 'day'}
            onClick={() => onModeChange('day')}
          >
            Day
          </button>
        </div>
      </div>

      <div className="student-schedule-nav__group">
        <button
          type="button"
          className="btn student-schedule-nav__arrow"
          aria-label={`Previous ${mode}`}
          onClick={() => onOffsetChange(-1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="student-schedule-nav__label">{todayLabel}</span>
        <button
          type="button"
          className="btn student-schedule-nav__arrow"
          aria-label={`Next ${mode}`}
          onClick={() => onOffsetChange(1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={() => onOffsetChange(0)}
        >
          <CalendarDays size={16} aria-hidden="true" />
          Today
        </button>
      </div>

      <div className="student-schedule-nav__group">
        <label
          className="student-schedule-nav__picker-label"
          htmlFor="student-schedule-picker"
        >
          Jump to week
        </label>
        <input
          id="student-schedule-picker"
          type="date"
          className="form__input student-schedule-nav__picker"
          value={weekStart}
          onChange={(event) => onJumpToWeek(event.target.value)}
          aria-label="Jump to week"
        />
      </div>
    </div>
  )
}

export default StudentScheduleNav