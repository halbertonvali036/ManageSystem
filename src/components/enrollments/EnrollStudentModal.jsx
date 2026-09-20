import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Search, Users, X } from 'lucide-react'
import config from '@/config'
import StudentStatusBadge from '@/components/students/StudentStatusBadge'
import useEnrollStudents from '@/hooks/useEnrollStudents'
import useStudents from '@/hooks/useStudents'
import { formatStudentName } from '@/models/student'

const EMPTY_IDS = new Set()

function EnrollStudentModal({
  open,
  classId,
  className = '',
  capacity = null,
  enrolledCount = 0,
  enrolledIds = EMPTY_IDS,
  onClose,
  onEnrolled,
}) {
  const titleId = useId()
  const closeButtonRef = useRef(null)

  const backendConnected = Boolean(config.api.baseUrl)
  const { students, isLoading, error, refetch } = useStudents(
    {},
    { enabled: open },
  )
  const { isEnrolling, enrollError, enrollStudents } = useEnrollStudents(classId)

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const candidates = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return students.filter((student) => {
      if (!student.id || enrolledIds.has(student.id)) {
        return false
      }
      if (!needle) {
        return true
      }
      const haystack =
        `${formatStudentName(student)} ${student.studentId ?? ''} ${student.email ?? ''}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [students, search, enrolledIds])

  const selectedCount = selectedIds.length
  const hasCapacity = Number.isInteger(capacity) && capacity > 0
  const isFull = hasCapacity && enrolledCount >= capacity

  const handleClose = useCallback(() => {
    if (isEnrolling) {
      return
    }
    setSearch('')
    setSelectedIds([])
    onClose?.()
  }, [isEnrolling, onClose])

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isEnrolling) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, isEnrolling, handleClose])

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  const handleToggle = (student) => {
    if (!student.id || isEnrolling) {
      return
    }
    setSelectedIds((previous) =>
      previous.includes(student.id)
        ? previous.filter((id) => id !== student.id)
        : [...previous, student.id],
    )
  }

  const handleSubmit = async () => {
    const result = await enrollStudents(selectedIds)
    if (result.ok) {
      onEnrolled?.()
    }
  }

  if (!open) {
    return null
  }

  let content
  if (!backendConnected) {
    content = (
      <div className="table-state enroll-modal__empty">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">
          Enrollment requires the backend API
        </h3>
        <p className="table-state__text">
          Student options are unavailable until the backend is connected, and
          no enrollment can be submitted until then.
        </p>
      </div>
    )
  } else if (isLoading) {
    content = (
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading students&hellip;
      </div>
    )
  } else if (error) {
    content = (
      <div className="table-state table-state--error enroll-modal__empty">
        <h3 className="table-state__title">Failed to load students</h3>
        <p className="table-state__text">{error.message}</p>
        <button type="button" className="btn btn--primary" onClick={refetch}>
          Retry
        </button>
      </div>
    )
  } else if (students.length === 0) {
    content = (
      <div className="table-state enroll-modal__empty">
        <Users className="table-state__icon" size={40} aria-hidden="true" />
        <h3 className="table-state__title">No students available</h3>
        <p className="table-state__text">
          No student records exist yet. Add students before enrolling them in
          this class.
        </p>
      </div>
    )
  } else {
    content = (
      <>
        <div className="enroll-modal__search">
          <div className="search-input">
            <Search
              className="search-input__icon"
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              className="search-input__field"
              placeholder="Search name, student ID or email&hellip;"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search students to enroll"
              disabled={isEnrolling}
            />
          </div>
        </div>

        {isFull ? (
          <p className="enroll-modal__notice" role="status">
            This class is full ({enrolledCount} of {capacity} enrolled).
            Enrolling more students may exceed the class capacity.
          </p>
        ) : null}

        {enrolledIds.size > 0 ? (
          <p className="enroll-modal__hint">
            {enrolledIds.size} already-enrolled student
            {enrolledIds.size === 1 ? '' : 's'} hidden.
          </p>
        ) : null}

        {candidates.length === 0 ? (
          <div className="table-state enroll-modal__empty">
            <Users className="table-state__icon" size={40} aria-hidden="true" />
            <h3 className="table-state__title">No students to enroll</h3>
            <p className="table-state__text">
              All available students are already enrolled, or none match your
              search.
            </p>
          </div>
        ) : (
          <>
            <p className="enroll-modal__hint">
              {candidates.length} of {students.length} student
              {students.length === 1 ? '' : 's'} available
              {candidates.length !== students.length ? ' for selection' : ''}.
            </p>
            <ul className="enroll-list">
              {candidates.map((student) => {
                const checked = selectedIds.includes(student.id)
                const selectable = Boolean(student.id)
                return (
                  <li
                    key={student.id}
                    className={`enroll-option${
                      checked ? ' enroll-option--selected' : ''
                    }`}
                  >
                    <label className="enroll-option__label">
                      <input
                        type="checkbox"
                        className="enroll-option__checkbox"
                        checked={checked}
                        disabled={isEnrolling || !selectable}
                        onChange={() => handleToggle(student)}
                      />
                      <span className="enroll-option__body">
                        <span className="enroll-option__name">
                          {formatStudentName(student)}
                        </span>
                        <span className="enroll-option__sub">
                          {student.studentId || student.email || '—'}
                        </span>
                      </span>
                      <span className="enroll-option__meta">
                        <StudentStatusBadge status={student.status} />
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </>
    )
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="modal modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal__header">
          <h2 className="modal__title" id={titleId}>
            Enroll Student
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal__close"
            aria-label="Close dialog"
            onClick={handleClose}
            disabled={isEnrolling}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <p className="modal__message">
          Add students to <strong>{className || 'this class'}</strong>.
          Already-enrolled students are hidden.
        </p>

        <div className="enroll-modal__body">{content}</div>

        {enrollError ? (
          <div className="modal__error" role="alert">
            {enrollError}
          </div>
        ) : null}

        <footer className="modal__actions">
          <button
            type="button"
            className="btn"
            onClick={handleClose}
            disabled={isEnrolling}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isEnrolling || selectedCount === 0}
          >
            {isEnrolling ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Enrolling&hellip;
              </>
            ) : selectedCount > 0 ? (
              `Enroll ${selectedCount} Student${selectedCount === 1 ? '' : 's'}`
            ) : (
              'Enroll Student'
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default EnrollStudentModal