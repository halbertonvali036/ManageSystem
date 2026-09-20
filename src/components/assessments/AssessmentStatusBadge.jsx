import StatusBadge from '@/components/common/StatusBadge'
import { ASSESSMENT_STATUS_LABELS } from '@/models/assessment'

function AssessmentStatusBadge({ status }) {
  return <StatusBadge status={status} labels={ASSESSMENT_STATUS_LABELS} />
}

export default AssessmentStatusBadge