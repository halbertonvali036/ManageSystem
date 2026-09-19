import { Eraser, RotateCcw } from 'lucide-react'

function BulkGradeControls({
  disabled = false,
  onClearScores,
  onResetChanges,
}) {
  return (
    <div className="attendance-bulk">
      <span className="attendance-bulk__label">Bulk actions</span>
      <div className="attendance-bulk__buttons">
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onClearScores}
          disabled={disabled}
        >
          <Eraser size={16} aria-hidden="true" />
          Clear Scores
        </button>
        <button
          type="button"
          className="btn btn--icon-left"
          onClick={onResetChanges}
          disabled={disabled}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset Changes
        </button>
      </div>
    </div>
  )
}

export default BulkGradeControls