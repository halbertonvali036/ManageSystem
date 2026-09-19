import StatusBadge from '@/components/common/StatusBadge'
import { SUBJECT_STATUS_LABELS } from '@/models/subject'

function SubjectStatusBadge({ status }) {
  return <StatusBadge status={status} labels={SUBJECT_STATUS_LABELS} />
}

export default SubjectStatusBadge