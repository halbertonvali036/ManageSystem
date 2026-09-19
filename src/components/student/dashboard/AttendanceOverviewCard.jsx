import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'
import AttendanceStatusBadge from '@/components/attendance/AttendanceStatusBadge'
import {
  formatAttendanceClassRef,
  formatAttendanceDate,
} from '@/models/attendance'

function AttendanceOverviewCard({ records }) {
  return (
    <Card title="Attendance Overview" className="student-attendance-card">
      {records.length === 0 ? (
        <div className="widget-empty">
          <BarChart3 size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No attendance recorded yet</p>
          <p className="widget-empty__text">
            Attendance for your classes will appear here.
          </p>
        </div>
      ) : (
        <ul className="activity-list">
          {records.map((record) => (
            <li className="activity-item" key={record.id}>
              <span className="activity-item__marker" aria-hidden="true" />
              <div className="activity-item__body">
                <span className="activity-item__text">
                  {formatAttendanceClassRef(record)}
                </span>
                <span className="activity-item__time">
                  {formatAttendanceDate(record.date)}
                </span>
              </div>
              <AttendanceStatusBadge status={record.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default AttendanceOverviewCard