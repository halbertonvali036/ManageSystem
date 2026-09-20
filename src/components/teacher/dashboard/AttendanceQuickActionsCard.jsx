import { Link } from 'react-router-dom'
import { ClipboardCheck, MapPin } from 'lucide-react'
import Card from '@/components/common/Card'
import {
  formatScheduleClassName,
  formatScheduleCourseName,
  formatScheduleRoom,
  formatScheduleTimeRange,
  resolveScheduleClassId,
} from '@/models/schedule'

function LoadingState() {
  return (
    <div className="page-status">
      <span className="spinner" aria-hidden="true" />
      Loading classes&hellip;
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="table-state table-state--error">
      <h3 className="table-state__title">Failed to load attendance classes</h3>
      <p className="table-state__text">{message}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

function AttendanceQuickActionsCard({ todayClasses, isLoading, error, onRetry }) {
  return (
    <Card title="Attendance">
      <div className="attendance-actions">
        <Link to="/teacher/attendance" className="btn btn--primary">
          View Attendance
        </Link>
        <Link to="/teacher/attendance/mark" className="btn">
          Mark Attendance
        </Link>
      </div>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : null}
      {!isLoading && !error && todayClasses.length === 0 ? (
        <div className="widget-empty widget-empty--compact">
          <ClipboardCheck
            size={24}
            className="widget-empty__icon"
            aria-hidden="true"
          />
          <p className="widget-empty__title">No classes scheduled today</p>
          <p className="widget-empty__text">
            Classes scheduled today will appear here and can be reached directly
            for attendance marking.
          </p>
        </div>
      ) : null}
      {!isLoading && !error && todayClasses.length > 0 ? (
        <>
          <p className="widget-caption">Classes scheduled today</p>
          <ul className="class-list">
            {todayClasses.map((item) => {
              const classId = resolveScheduleClassId(item)
              return (
                <li className="class-item" key={item.id ?? item.scheduleId}>
                  <span className="class-item__time">
                    {formatScheduleTimeRange(item)}
                  </span>
                  <div className="class-item__info">
                    {classId ? (
                      <Link
                        to={`/teacher/classes/${classId}`}
                        className="class-item__subject-link"
                      >
                        <h3 className="class-item__subject">
                          {formatScheduleClassName(item)}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="class-item__subject">
                        {formatScheduleClassName(item)}
                      </h3>
                    )}
                    <p className="class-item__meta">
                      {formatScheduleCourseName(item)}
                    </p>
                  </div>
                  <span className="class-item__room">
                    <MapPin size={14} aria-hidden="true" />
                    {formatScheduleRoom(item)}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </Card>
  )
}

export default AttendanceQuickActionsCard