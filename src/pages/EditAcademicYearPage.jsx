import { useNavigate, useParams } from 'react-router-dom'
import { CalendarRange } from 'lucide-react'
import Card from '@/components/common/Card'
import AcademicPeriodForm from '@/components/academicYears/AcademicPeriodForm'
import useAcademicYear from '@/hooks/useAcademicYear'
import useUpdateAcademicYear from '@/hooks/useUpdateAcademicYear'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toAcademicYearFormValues, toAcademicYearPayload } from '@/utils/academicYearForm'

function EditAcademicYearContent({ academicYearId }) {
  const navigate = useNavigate()
  const { academicYear, isLoading, error, refetch } =
    useAcademicYear(academicYearId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateAcademicYear(academicYearId)

  const handleCancel = () => {
    navigate(`/academic-years/${academicYearId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(toAcademicYearPayload(values))
    if (result.ok) {
      navigate(`/academic-years/${academicYearId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading academic year&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <CalendarRange
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Academic year data is unavailable</h3>
          <p className="table-state__text">
            Academic year data will be available when the backend API is
            connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load academic year</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!academicYear) {
    return null
  }

  return (
    <div className="edit-academic-year-page">
      <p className="page-description">
        Update the academic year details below and save your changes.
      </p>
      <Card title="Edit Academic Year">
        <AcademicPeriodForm
          label="Academic Year"
          initialValues={toAcademicYearFormValues(academicYear)}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
        />
      </Card>
    </div>
  )
}

function EditAcademicYearPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditAcademicYearContent key={id} academicYearId={id} />
}

export default EditAcademicYearPage