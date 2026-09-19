import { ClipboardList } from 'lucide-react'
import BulkGradeRow from '@/components/grades/BulkGradeRow'

const COLUMNS = [
  { key: 'student', label: 'Student' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'score', label: 'Score' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'grade', label: 'Grade' },
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
      <ClipboardList className="table-state__icon" size={40} aria-hidden="true" />
      <h3 className="table-state__title">{hint.title}</h3>
      <p className="table-state__text">{hint.text}</p>
    </div>
  )
}

function BulkGradeTable({
  rows,
  maxScore,
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
      <table className="grades-table attendance-marking-table">
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
            <BulkGradeRow
              key={row.key}
              row={row}
              index={index}
              maxScore={maxScore}
              onUpdate={onUpdateRow}
              isSaving={isSaving}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BulkGradeTable