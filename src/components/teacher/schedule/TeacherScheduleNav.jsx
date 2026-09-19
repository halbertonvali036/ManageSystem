import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

function TeacherScheduleNav({
  mode,
  onModeChange,
  weekStart,
  onOffsetChange,
  onJumpToWeek,
  todayLabel,
}) {
  return (
    <div className="schedule-nav">
      <div className="schedule-nav__group">
        <div
          className="schedule-mode-toggle"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            className={`schedule-mode-toggle__btn${
              mode === 'week' ? ' schedule-mode-toggle__btn--active' : ''
            }`}
            aria-pressed={mode === 'week'}
            onClick={() => onModeChange('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={`schedule-mode-toggle__btn${
              mode === 'day' ? ' schedule-mode-toggle__btn--active' : ''
            }`}
            aria-pressed={mode === 'day'}
            onClick={() => onModeChange('day')}
          >
            Day
          </button>
        </div>
      </div>

      <div className="schedule-nav__group">
        <button
          type="button"
          className="btn schedule-nav__arrow"
          aria-label={`Previous ${mode}`}
          onClick={() => onOffsetChange(-1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="schedule-nav__label">{todayLabel}</span>
        <button
          type="button"
          className="btn schedule-nav__arrow"
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

      <div className="schedule-nav__group">
        <label className="schedule-nav__picker-label" htmlFor="schedule-week-picker">
          Jump to week
        </label>
        <input
          id="schedule-week-picker"
          type="date"
          className="form__input schedule-nav__picker"
          value={weekStart}
          onChange={(event) => onJumpToWeek(event.target.value)}
          aria-label="Jump to week"
        />
      </div>
    </div>
  )
}

export default TeacherScheduleNav