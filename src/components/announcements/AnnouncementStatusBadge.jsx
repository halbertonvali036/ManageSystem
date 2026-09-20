import StatusBadge from '@/components/common/StatusBadge'
import { ANNOUNCEMENT_STATUS_LABELS } from '@/models/announcement'

function AnnouncementStatusBadge({ status }) {
  return <StatusBadge status={status} labels={ANNOUNCEMENT_STATUS_LABELS} />
}

export default AnnouncementStatusBadge