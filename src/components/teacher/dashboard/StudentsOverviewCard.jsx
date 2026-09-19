import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Card from '@/components/common/Card'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import { formatStudentName } from '@/models/student'

function StudentsOverviewCard({ students, total }) {
  return (
    <Card
      title="Students Overview"
      action={
        total > 0 ? (
          <Link to="/teacher/students" className="form__link">
            View all
          </Link>
        ) : null
      }
    >
      {students.length === 0 ? (
        <div className="widget-empty">
          <GraduationCap
            size={24}
            className="widget-empty__icon"
            aria-hidden="true"
          />
          <p className="widget-empty__title">No students yet</p>
          <p className="widget-empty__text">
            Students enrolled in your classes will appear here.
          </p>
        </div>
      ) : (
        <ul className="activity-list">
          {students.map((student) => (
            <li className="activity-item" key={student.id}>
              <span className="activity-item__marker" aria-hidden="true" />
              <div className="activity-item__body">
                <span className="activity-item__text">{formatStudentName(student)}</span>
                <span className="activity-item__time">
                  {student.studentId || student.email || '—'}
                </span>
              </div>
              <StudentStatusBadge status={student.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default StudentsOverviewCard