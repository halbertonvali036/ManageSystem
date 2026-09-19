import StatusBadge from '@/components/common/StatusBadge'
import { DEPARTMENT_STATUS_LABELS } from '@/models/department'

function DepartmentStatusBadge({ status }) {
  return <StatusBadge status={status} labels={DEPARTMENT_STATUS_LABELS} />
}

export default DepartmentStatusBadge