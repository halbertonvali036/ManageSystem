import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import { ATTENDANCE_STATUS } from '@/models/attendance'

const STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Present' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Absent' },
  { value: ATTENDANCE_STATUS.LATE, label: 'Late' },
  { value: ATTENDANCE_STATUS.EXCUSED, label: 'Excused' },
]

function AttendanceRow({ row, index, onUpdate, isSaving }) {
  const controlDisabled = isSaving

  return (
    <tr className="attendance-marking-row">
      <td className="attendance-table__name">{row.studentName || '—'}</td>
      <td className="attendance-table__id">{row.studentId || '—'}</td>
      <td>
        <div className="attendance-marking-row__status">
          <select
            className={`form__select marking-control${row.status ? ` marking-control--${row.status}` : ''}`}
            value={row.status}
            onChange={(event) => onUpdate(index, { status: event.target.value })}
            disabled={controlDisabled}
            aria-label={`Attendance status for ${row.studentName || `student ${index + 1}`}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="attendance-marking-row__badge">
            <AttendanceStatusBadge status={row.status} />
          </span>
        </div>
      </td>
      <td>
        <input
          className="form__input marking-control marking-control--time"
          type="time"
          value={row.checkInTime}
          onChange={(event) => onUpdate(index, { checkInTime: event.target.value })}
          disabled={controlDisabled}
          aria-label={`Check-in time for ${row.studentName || `student ${index + 1}`}`}
        />
      </td>
      <td>
        <input
          className="form__input marking-control"
          type="text"
          autoComplete="off"
          value={row.notes}
          onChange={(event) => onUpdate(index, { notes: event.target.value })}
          disabled={controlDisabled}
          placeholder="Optional"
          aria-label={`Notes for ${row.studentName || `student ${index + 1}`}`}
        />
      </td>
    </tr>
  )
}

export default AttendanceRow