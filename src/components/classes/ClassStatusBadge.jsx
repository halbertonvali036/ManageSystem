import StatusBadge from '@/components/common/StatusBadge'
import { CLASS_STATUS_LABELS } from '@/models/class'

function ClassStatusBadge({ status }) {
  return <StatusBadge status={status} labels={CLASS_STATUS_LABELS} />
}

export default ClassStatusBadge