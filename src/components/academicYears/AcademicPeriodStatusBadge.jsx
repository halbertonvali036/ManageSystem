import StatusBadge from '@/components/common/StatusBadge'
import { ACADEMIC_PERIOD_STATUS_LABELS } from '@/models/academicYear'

function AcademicPeriodStatusBadge({ status }) {
  return <StatusBadge status={status} labels={ACADEMIC_PERIOD_STATUS_LABELS} />
}

export default AcademicPeriodStatusBadge