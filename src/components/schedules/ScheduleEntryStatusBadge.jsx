import StatusBadge from '@/components/common/StatusBadge'
import { SCHEDULE_STATUS_LABELS } from '@/models/schedule'

function ScheduleEntryStatusBadge({ status }) {
  return <StatusBadge status={status} labels={SCHEDULE_STATUS_LABELS} />
}

export default ScheduleEntryStatusBadge