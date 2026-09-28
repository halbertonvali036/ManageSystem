import { useNavigate, useParams } from 'react-router-dom'
import { School } from 'lucide-react'
import Card from '@/components/common/Card'
import ClassForm from '@/components/classes/ClassForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClass from '@/hooks/useClass'
import useCourses from '@/hooks/useCourses'
import useUpdateClass from '@/hooks/useUpdateClass'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditClassContent({ classId }) {
  const navigate = useNavigate()
  const { classRecord, isLoading, error, refetch } = useClass(classId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateClass(classId)
  const { courses, isLoading: coursesLoading } = useCourses()
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()

  const handleCancel = () => {
    navigate(`/classes/${classId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/classes/${classId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading class&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <School className="table-state__icon" size={40} aria-hidden="true" />
          <h3 className="table-state__title">Class data is unavailable</h3>
          <p className="table-state__text">
            Class data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load class</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!classRecord) {
    return null
  }

  return (
    <div className="edit-class-page">
      <p className="page-description">
        Update the class record below and save your changes.
      </p>
      <Card title="Edit Class">
        <ClassForm
          initialValues={classRecord}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
          courses={courses}
          academicYears={academicYears}
          coursesLoading={coursesLoading}
          academicYearsLoading={academicYearsLoading}
        />
      </Card>
    </div>
  )
}

function EditClassPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditClassContent key={id} classId={id} />
}

export default EditClassPage