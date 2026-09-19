import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Card from '@/components/common/Card'

function MyCoursesCard({ courses }) {
  return (
    <Card
      title="My Courses"
      action={
        courses.length > 0 ? (
          <Link to="/student/courses" className="form__link">
            View all
          </Link>
        ) : null
      }
    >
      {courses.length === 0 ? (
        <div className="widget-empty">
          <BookOpen size={24} className="widget-empty__icon" aria-hidden="true" />
          <p className="widget-empty__title">No courses yet</p>
          <p className="widget-empty__text">
            Courses you are enrolled in will appear here.
          </p>
        </div>
      ) : (
        <ul className="class-list">
          {courses.map((course) => {
            const name =
              course.name || course.courseName || 'Unnamed course'
            const code = course.courseCode || course.code || ''
            return (
              <li className="class-item" key={course.id}>
                <span className="class-item__time">{code || '—'}</span>
                <div className="class-item__info">
                  <h3 className="class-item__subject">{name}</h3>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default MyCoursesCard