import StatusBadge from '@/components/common/StatusBadge'
import { deriveGradeLetter, GRADE_LETTER_LABELS } from '@/models/grade'

function GradeStatusBadge({ record }) {
  const letter = deriveGradeLetter(record)
  if (!letter) {
    return null
  }
  return <StatusBadge status={letter} labels={GRADE_LETTER_LABELS} />
}

export default GradeStatusBadge