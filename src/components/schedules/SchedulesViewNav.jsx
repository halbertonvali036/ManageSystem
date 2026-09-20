import { CalendarDays, ChevronLeft, ChevronRight, LayoutList, CalendarRange } from 'lucide-react'

function SchedulesViewNav({
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
          aria-label="Timetable view"
        >
          <button
            type="button"
            className={`schedule-mode-toggle__btn${
              mode === 'week' ? ' schedule-mode-toggle__btn--active' : ''
            }`}
            aria-pressed={mode === 'week'}
            onClick={() => onModeChange('week')}
          >
            <CalendarRange size={16} aria-hidden="true" />
            Week
          </button>
          <button
            type="button"
            className={`schedule-mode-toggle__btn${
              mode === 'list' ? ' schedule-mode-toggle__btn--active' : ''
            }`}
            aria-pressed={mode === 'list'}
            onClick={() => onModeChange('list')}
          >
            <LayoutList size={16} aria-hidden="true" />
            List
          </button>
        </div>
      </div>

      {mode === 'week' ? (
        <>
          <div className="schedule-nav__group">
            <button
              type="button"
              className="btn schedule-nav__arrow"
              aria-label="Previous week"
              onClick={() => onOffsetChange(-1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="schedule-nav__label">{todayLabel}</span>
            <button
              type="button"
              className="btn schedule-nav__arrow"
              aria-label="Next week"
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
            <label className="schedule-nav__picker-label" htmlFor="schedules-week-picker">
              Jump to week
            </label>
            <input
              id="schedules-week-picker"
              type="date"
              className="form__input schedule-nav__picker"
              value={weekStart}
              onChange={(event) => onJumpToWeek(event.target.value)}
              aria-label="Jump to week"
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default SchedulesViewNav