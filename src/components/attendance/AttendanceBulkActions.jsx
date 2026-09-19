import { Check, UserMinus, RotateCcw } from 'lucide-react'

function AttendanceBulkActions({
  disabled = false,
  onMarkAllPresent,
  onMarkAllAbsent,
  onResetAll,
}) {
  return (
    <div className="attendance-bulk">
      <span className="attendance-bulk__label">Bulk actions</span>
      <div className="attendance-bulk__buttons">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onMarkAllPresent}
          disabled={disabled}
        >
          <Check size={16} aria-hidden="true" />
          Mark All Present
        </button>
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onMarkAllAbsent}
          disabled={disabled}
        >
          <UserMinus size={16} aria-hidden="true" />
          Mark All Absent
        </button>
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onResetAll}
          disabled={disabled}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset All
        </button>
      </div>
    </div>
  )
}

export default AttendanceBulkActions