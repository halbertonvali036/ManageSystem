import { BarChart3 } from 'lucide-react'
import Card from '@/components/common/Card'

function AttendanceSummary({ data }) {
  const hasData = Boolean(
    data && data.presentRate != null && data.lateRate != null && data.absentRate != null,
  )

  return (
    <Card title="Attendance summary">
      {!hasData ? (
        <div className="widget-empty">
          <BarChart3 size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No attendance data</p>
          <p className="widget-empty__text">
            Attendance rates will appear here once the system has data.
          </p>
        </div>
      ) : (
        <div className="attendance-summary">
          <div className="attendance-summary__bars">
            {[
              {
                key: 'present',
                label: 'Present',
                value: data.presentRate,
                className: 'attendance-bar--present',
              },
              {
                key: 'late',
                label: 'Late',
                value: data.lateRate,
                className: 'attendance-bar--late',
              },
              {
                key: 'absent',
                label: 'Absent',
                value: data.absentRate,
                className: 'attendance-bar--absent',
              },
            ].map((bar) => (
              <div className="attendance-bar" key={bar.key}>
                <span className="attendance-bar__label">{bar.label}</span>
                <div className="attendance-bar__track">
                  <div
                    className={`attendance-bar__fill ${bar.className}`}
                    style={{ width: `${Math.min(bar.value, 100)}%` }}
                  />
                </div>
                <span className="attendance-bar__value">{bar.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default AttendanceSummary