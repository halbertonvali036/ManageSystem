import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '@/components/common/Card'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AcademicPeriodStatusBadge from '@/components/academicYears/AcademicPeriodStatusBadge'
import useDeleteSemester from '@/hooks/useDeleteSemester'
import useSemesters from '@/hooks/useSemesters'
import {
  formatAcademicPeriodDate,
  formatAcademicYearName,
} from '@/models/academicYear'
import { formatSemesterName } from '@/models/semester'
import { BackendNotConnectedError } from '@/services/httpClient'

const COLUMNS = [
  { key: 'name', label: 'Semester' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function SemestersCard({ academicYearId, academicYearName }) {
  const navigate = useNavigate()
  const { semesters, isLoading, error, refetch } = useSemesters(academicYearId)
  const [deletionTarget, setDeletionTarget] = useState(null)
  const { isDeleting, deleteError, deleteSemester } = useDeleteSemester(
    academicYearId,
    deletionTarget?.id,
  )

  const handleAddSemester = () => {
    navigate(`/academic-years/${academicYearId}/semesters/new`)
  }

  const handleEditSemester = (semester) => {
    navigate(`/academic-years/${academicYearId}/semesters/${semester.id}/edit`)
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteSemester()
    if (result.ok) {
      setDeletionTarget(null)
      refetch()
    }
  }

  const yearLabel = academicYearName || formatAcademicYearName({ id: academicYearId })

  let body
  if (isLoading) {
    body = (
      <div className="page-status">
        <span className="spinner" aria-hidden="true" />
        Loading semesters&hellip;
      </div>
    )
  } else if (error) {
    body =
      error instanceof BackendNotConnectedError ? (
        <div className="table-state">
          <CalendarDays
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Semesters are unavailable</h3>
          <p className="table-state__text">
            Semester records will appear here when the backend API is connected.
          </p>
        </div>
      ) : (
        <div className="table-state table-state--error">
          <h3 className="table-state__title">Failed to load semesters</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      )
  } else if (semesters.length === 0) {
    body = (
      <div className="table-state">
        <CalendarDays
          className="table-state__icon"
          size={40}
          aria-hidden="true"
        />
        <h3 className="table-state__title">No semesters yet</h3>
        <p className="table-state__text">
          Add a semester to this academic year to start organizing classes.
        </p>
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={handleAddSemester}
        >
          <Plus size={16} aria-hidden="true" />
          Add Semester
        </button>
      </div>
    )
  } else {
    body = (
      <div className="table-responsive">
        <table className="academic-years-table">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semesters.map((semester) => (
              <tr key={semester.id}>
                <td className="academic-years-table__name">
                  {formatSemesterName(semester)}
                </td>
                <td>{formatAcademicPeriodDate(semester.startDate)}</td>
                <td>{formatAcademicPeriodDate(semester.endDate)}</td>
                <td>
                  <AcademicPeriodStatusBadge status={semester.status} />
                </td>
                <td>
                  <div className="students-table__actions">
                    <button
                      type="button"
                      className="students-table__action"
                      aria-label="Edit semester"
                      title="Edit semester"
                      onClick={() => handleEditSemester(semester)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="students-table__action students-table__action--danger"
                      aria-label="Delete semester"
                      title="Delete semester"
                      onClick={() => setDeletionTarget(semester)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <Card
        title="Semesters"
        className="semesters-section"
        action={
          <button
            type="button"
            className="btn btn--primary btn--icon-left"
            onClick={handleAddSemester}
          >
            <Plus size={16} aria-hidden="true" />
            Add Semester
          </button>
        }
      >
        {body}
      </Card>

      <ConfirmDialog
        open={Boolean(deletionTarget)}
        title="Delete semester"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Semester"
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setDeletionTarget(null)
          }
        }}
      >
        {deletionTarget ? (
          <div className="modal__target">
            <p className="modal__target-row">
              Semester: <strong>{formatSemesterName(deletionTarget)}</strong>
            </p>
            <p className="modal__target-row">
              Academic Year: <strong>{yearLabel}</strong>
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  )
}

export default SemestersCard