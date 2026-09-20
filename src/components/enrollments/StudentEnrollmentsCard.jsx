import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye } from 'lucide-react'
import Card from '@/components/common/Card'
import StatusBadge from '@/components/common/StatusBadge'
import { ENROLLMENT_STATUS_LABELS } from '@/models/enrollment'
import useStudentEnrollments from '@/hooks/useStudentEnrollments'
import { BackendNotConnectedError } from '@/services/httpClient'

function StudentEnrollmentsCard({ studentId }) {
  const navigate = useNavigate()
  const { enrollments, isLoading, error, refetch } = useStudentEnrollments(
    studentId,
  )

  let body
  if (isLoading) {
    body = (
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading enrollments&hellip;
      </div>
    )
  } else if (error) {
    body =
      error instanceof BackendNotConnectedError ? (
        <div className="table-state">
          <BookOpen
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Enrollment data is unavailable</h3>
          <p className="table-state__text">
            Classes and enrollments will appear here when the backend API is
            connected.
          </p>
        </div>
      ) : (
        <div className="table-state table-state--error">
          <h3 className="table-state__title">Failed to load enrollments</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      )
  } else if (enrollments.length === 0) {
    body = (
      <div className="table-state">
        <BookOpen className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No enrollment records yet</h3>
        <p className="table-state__text">
          Enrollments will appear here once this student is added to classes.
        </p>
      </div>
    )
  } else {
    body = (
      <div className="table-responsive enrollments-table">
        <table className="students-table">
          <thead>
            <tr>
              <th scope="col">Class</th>
              <th scope="col">Course</th>
              <th scope="col">Academic Year</th>
              <th scope="col">Semester</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => {
              const classRecord = enrollment.class
              const canView = Boolean(classRecord?.id)
              const classLabel = classRecord?.name || '—'
              return (
                <tr
                  key={
                    enrollment.id ??
                    `${enrollment.classId}-${enrollment.studentId}`
                  }
                >
                  <td className="enrollments-table__class">
                    {canView ? (
                      <button
                        type="button"
                        className="roster-link"
                        onClick={() => navigate(`/classes/${classRecord.id}`)}
                      >
                        {classLabel}
                      </button>
                    ) : (
                      classLabel
                    )}
                    {classRecord?.classCode ? (
                      <span className="enrollments-table__classcode">
                        {classRecord.classCode}
                      </span>
                    ) : null}
                  </td>
                  <td>{classRecord?.course || '—'}</td>
                  <td>{classRecord?.academicYear || '—'}</td>
                  <td>{classRecord?.semester || '—'}</td>
                  <td>
                    {enrollment.status ? (
                      <StatusBadge
                        status={enrollment.status}
                        labels={ENROLLMENT_STATUS_LABELS}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="students-table__actions">
                      {canView ? (
                        <button
                          type="button"
                          className="students-table__action"
                          aria-label="View class"
                          title="View class"
                          onClick={() => navigate(`/classes/${classRecord.id}`)}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Card title="Classes / Enrollments" className="roster-section">
      {body}
    </Card>
  )
}

export default StudentEnrollmentsCard