import { ClipboardCheck } from 'lucide-react'
import AttendanceRow from '@/components/attendance/AttendanceRow'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'status', label: 'Attendance Status' },
  { key: 'checkInTime', label: 'Check-in Time' },
  { key: 'notes', label: 'Notes' },
]

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading students&hellip;
    </div>
  )
}

function EmptyState({ hint }) {
  return (
    <div className="table-state">
      <ClipboardCheck className="table-state__icon" size={40} aria-hidden="true" />
      <h3 className="table-state__title">{hint.title}</h3>
      <p className="table-state__text">{hint.text}</p>
    </div>
  )
}

function AttendanceMarkingTable({
  rows,
  isLoading,
  emptyHint,
  onUpdateRow,
  isSaving,
}) {
  if (isLoading) {
    return <LoadingState />
  }

  if (rows.length === 0) {
    return <EmptyState hint={emptyHint} />
  }

  return (
    <div className="table-responsive">
      <table className="attendance-table attendance-marking-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <AttendanceRow
              key={row.key}
              row={row}
              index={index}
              onUpdate={onUpdateRow}
              isSaving={isSaving}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendanceMarkingTable