import { Users } from 'lucide-react'
import { toDateInputValue } from '@/utils/dateInput'

function AttendanceSessionSelector({
  classes = [],
  classesLoading = false,
  selectedClassId,
  onClassChange,
  selectedDate,
  onDateChange,
  onLoad,
  isLoadingStudents = false,
}) {
  const classesAvailable = classes.length > 0
  const canLoad = classesAvailable && selectedClassId !== '' && selectedDate !== ''

  return (
    <div className="attendance-session">
      <div className="attendance-session__fields">
        <div className="form__field attendance-session__class">
          <label className="form__label" htmlFor="mark-class">
            Class
          </label>
          <select
            id="mark-class"
            className="form__input form__select"
            value={selectedClassId}
            onChange={(event) => onClassChange(event.target.value)}
            disabled={isLoadingStudents || classesLoading || !classesAvailable}
            aria-describedby="mark-class-hint"
          >
            {classesLoading ? (
              <option value="">Loading classes&hellip;</option>
            ) : classesAvailable ? (
              <>
                <option value="">Select class</option>
                {classes.map((classRecord) => {
                  const value = classRecord.id ?? classRecord.classCode
                  const label =
                    classRecord.name || classRecord.classCode || 'Class'
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                })}
              </>
            ) : (
              <option value="">No classes available yet</option>
            )}
          </select>
          {!classesLoading && !classesAvailable ? (
            <p className="form__hint" id="mark-class-hint">
              Class options will appear here once class records exist.
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="mark-date">
            Date
          </label>
          <input
            id="mark-date"
            className="form__input"
            type="date"
            value={selectedDate}
            max={toDateInputValue(new Date())}
            onChange={(event) => onDateChange(event.target.value)}
            disabled={isLoadingStudents}
          />
        </div>

        <div className="form__field attendance-session__action">
          <button
            type="button"
            className="btn btn--primary btn--icon-left attendance-session__load"
            onClick={onLoad}
            disabled={isLoadingStudents || !canLoad}
          >
            {isLoadingStudents ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Loading students&hellip;
              </>
            ) : (
              <>
                <Users size={18} aria-hidden="true" />
                Load Students
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceSessionSelector