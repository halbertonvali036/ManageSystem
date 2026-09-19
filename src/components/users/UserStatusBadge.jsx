import StatusBadge from '@/components/common/StatusBadge'
import { USER_STATUS_LABELS } from '@/models/user'

function UserStatusBadge({ status }) {
  return <StatusBadge status={status} labels={USER_STATUS_LABELS} />
}

export default UserStatusBadge