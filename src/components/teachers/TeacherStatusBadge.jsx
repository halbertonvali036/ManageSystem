import StatusBadge from '@/components/common/StatusBadge'
import { TEACHER_STATUS_LABELS } from '@/models/teacher'

function TeacherStatusBadge({ status }) {
  return <StatusBadge status={status} labels={TEACHER_STATUS_LABELS} />
}

export default TeacherStatusBadge