import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Search, UserPlus, UserX, Users } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EnrollStudentModal from '@/components/enrollments/EnrollStudentModal'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import useClassStudents from '@/hooks/useClassStudents'
import useRemoveClassStudent from '@/hooks/useRemoveClassStudent'
import { formatClassName } from '@/models/class'
import { formatStudentName } from '@/models/student'
import { BackendNotConnectedError } from '@/services/httpClient'

function ClassRosterCard({ classId, classRecord }) {
  const navigate = useNavigate()
  const { roster, isLoading, error, refetch } = useClassStudents(classId)
  const { isRemoving, removeError, removeStudent } = useRemoveClassStudent(
    classId,
  )
  const [search, setSearch] = useState('')
  const [removalTarget, setRemovalTarget] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const capacity = classRecord?.capacity
  const hasCapacity = Number.isInteger(capacity) && capacity > 0
  const atCapacity = hasCapacity && roster.length >= capacity
  const capacitySummary =
    hasCapacity && !isLoading && !error
      ? `Enrolled ${roster.length} / ${capacity}`
      : null

  const enrolledStudentIds = useMemo(
    () =>
      new Set(roster.map((entry) => entry.student.id).filter(Boolean)),
    [roster],
  )

  const filteredRoster = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) {
      return roster
    }
    return roster.filter((entry) => {
      const student = entry.student
      const haystack =
        `${formatStudentName(student)} ${student.studentId ?? ''} ${student.email ?? ''}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [roster, search])

  const handleRemoveConfirm = async () => {
    const studentId = removalTarget?.student?.id
    const result = await removeStudent(studentId)
    if (result.ok) {
      setRemovalTarget(null)
      refetch()
    }
  }

  let body
  if (isLoading) {
    body = (
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading roster&hellip;
      </div>
    )
  } else if (error) {
    body =
      error instanceof BackendNotConnectedError ? (
        <div className="table-state">
          <Users className="table-state__icon" size={40} aria-hidden="true" />
          <h3 className="table-state__title">Roster is unavailable</h3>
          <p className="table-state__text">
            Enrolled students will appear here when the backend API is
            connected.
          </p>
        </div>
      ) : (
        <div className="table-state table-state--error">
          <h3 className="table-state__title">Failed to load roster</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      )
  } else if (roster.length === 0) {
    body = (
      <div className="table-state">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No students enrolled yet</h3>
        <p className="table-state__text">
          Enroll students to build this class&rsquo;s roster.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={() => setShowEnrollModal(true)}
        >
          <UserPlus size={16} aria-hidden="true" />
          Enroll Student
        </button>
      </div>
    )
  } else {
    body = (
      <>
        <div className="roster-toolbar">
          <div className="search-input">
            <Search
              className="search-input__icon"
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              className="search-input__field"
              placeholder="Search roster by name or ID&hellip;"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search enrolled students"
            />
          </div>
          <span className="roster-toolbar__count">
            {filteredRoster.length} of {roster.length} student
            {roster.length === 1 ? '' : 's'}
          </span>
        </div>

        {atCapacity ? (
          <p className="roster-warning" role="status">
            This class has reached its capacity of {capacity}. Enrolling more
            students may exceed the class limit.
          </p>
        ) : null}

        {filteredRoster.length === 0 ? (
          <div className="table-state roster-table-state">
            <Search className="table-state__icon" size={40} aria-hidden="true" />
            <h3 className="table-state__title">No students match your search</h3>
            <p className="table-state__text">
              Try a different name or student ID.
            </p>
          </div>
        ) : (
          <div className="table-responsive roster-table">
            <table className="students-table">
              <thead>
                <tr>
                  <th scope="col">Student ID</th>
                  <th scope="col">Student Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((entry) => {
                  const student = entry.student
                  const studentId =
                    entry.enrollment.studentId ?? student.studentId
                  const canView = Boolean(student.id)
                  return (
                    <tr
                      key={
                        entry.enrollment.id ?? student.id ?? student.studentId
                      }
                      className="students-table__row roster-table__row"
                      onClick={() => {
                        if (canView) {
                          navigate(`/students/${student.id}`)
                        }
                      }}
                    >
                      <td className="students-table__id">{studentId || '—'}</td>
                      <td className="students-table__name">
                        {formatStudentName(student)}
                      </td>
                      <td>
                        <StudentStatusBadge status={student.status} />
                      </td>
                      <td>
                        <div className="students-table__actions">
                          {canView ? (
                            <button
                              type="button"
                              className="students-table__action"
                              aria-label="View student"
                              title="View student"
                              onClick={(event) => {
                                event.stopPropagation()
                                navigate(`/students/${student.id}`)
                              }}
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="students-table__action students-table__action--danger"
                            aria-label="Remove from class"
                            title="Remove from class"
                            onClick={(event) => {
                              event.stopPropagation()
                              setRemovalTarget(entry)
                            }}
                          >
                            <UserX size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Card
        title="Enrolled Students"
        className="roster-section"
        action={
          <>
            {capacitySummary ? (
              <span className="roster-capacity">{capacitySummary}</span>
            ) : null}
            <button
              type="button"
              className="btn btn--primary btn--icon-left"
              onClick={() => setShowEnrollModal(true)}
            >
              <UserPlus size={16} aria-hidden="true" />
              Enroll Student
            </button>
          </>
        }
      >
        {body}
      </Card>

      <ConfirmDialog
        open={Boolean(removalTarget)}
        title="Remove student from class"
        message="This removes the student from this class roster only. The student account, profile, grades and attendance history are not affected."
        confirmLabel="Remove from Class"
        isConfirming={isRemoving}
        error={removeError}
        onConfirm={handleRemoveConfirm}
        onCancel={() => {
          if (!isRemoving) {
            setRemovalTarget(null)
          }
        }}
      >
        {removalTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Student:{' '}
              <strong>{formatStudentName(removalTarget.student)}</strong>
            </p>
            <p className="modal__target-row">
              Student ID:{' '}
              <strong>
                {(removalTarget.enrollment.studentId ??
                  removalTarget.student.studentId) || '—'}
              </strong>
            </p>
            <p className="modal__target-row">
              Class:{' '}
              <strong>{formatClassName(classRecord)}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>

      <EnrollStudentModal
        open={showEnrollModal}
        classId={classId}
        className={formatClassName(classRecord)}
        capacity={hasCapacity ? capacity : null}
        enrolledCount={roster.length}
        enrolledIds={enrolledStudentIds}
        onClose={() => setShowEnrollModal(false)}
        onEnrolled={() => {
          setShowEnrollModal(false)
          refetch()
        }}
      />
    </>
  )
}

export default ClassRosterCard