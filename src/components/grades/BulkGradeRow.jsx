import { formatGradePercentage } from '@/models/grade'

const GRADING_SCALE_HINT = 'Letter grades require a grading scale'

function BulkGradeRow({ row, index, maxScore, onUpdate, isSaving }) {
  return (
    <tr className="grades-table__row">
      <td className="grades-table__name">{row.studentName || '—'}</td>
      <td className="grades-table__id">{row.studentId || '—'}</td>
      <td>
        <input
          className="form__input marking-control"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={row.score}
          max={maxScore || undefined}
          onChange={(event) => onUpdate(index, { score: event.target.value })}
          disabled={isSaving}
          aria-label={`Score for ${row.studentName || `student ${index + 1}`}`}
        />
      </td>
      <td className="grades-table__percentage">
        {formatGradePercentage({ score: row.score, maximumScore: maxScore })}
      </td>
      <td>
        <span className="table-dash" title={GRADING_SCALE_HINT}>
          —
        </span>
      </td>
      <td>
        <input
          className="form__input marking-control"
          type="text"
          autoComplete="off"
          value={row.notes}
          onChange={(event) => onUpdate(index, { notes: event.target.value })}
          disabled={isSaving}
          placeholder="Optional"
          aria-label={`Notes for ${row.studentName || `student ${index + 1}`}`}
        />
      </td>
    </tr>
  )
}

export default BulkGradeRow