import StatusBadge from '@/components/common/StatusBadge'
import { COURSE_STATUS_LABELS } from '@/models/course'

function CourseStatusBadge({ status }) {
  return <StatusBadge status={status} labels={COURSE_STATUS_LABELS} />
}

export default CourseStatusBadge