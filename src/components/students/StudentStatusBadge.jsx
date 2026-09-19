import StatusBadge from '@/components/common/StatusBadge'
import { STUDENT_STATUS_LABELS } from '@/models/student'

function StudentStatusBadge({ status }) {
  return <StatusBadge status={status} labels={STUDENT_STATUS_LABELS} />
}

export default StudentStatusBadge