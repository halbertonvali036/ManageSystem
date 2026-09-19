import StatusBadge from '@/components/common/StatusBadge'
import { ROLE_STATUS_LABELS } from '@/models/role'

function RoleStatusBadge({ status }) {
  return <StatusBadge status={status} labels={ROLE_STATUS_LABELS} />
}

export default RoleStatusBadge