import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import AssessmentForm from '@/components/assessments/AssessmentForm'
import useAssessment from '@/hooks/useAssessment'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useUpdateAssessment from '@/hooks/useUpdateAssessment'
import { BackendNotConnectedError } from '@/services/httpClient'
import { toAssessmentFormValues } from '@/utils/assessmentForm'

function EditAssessmentContent({ assessmentId }) {
  const navigate = useNavigate()
  const { assessment, isLoading, error, refetch } = useAssessment(assessmentId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateAssessment(assessmentId)
  const { courses, isLoading: coursesLoading } = useCourses()
  const { classes, isLoading: classesLoading } = useClasses()

  const handleCancel = () => {
    navigate(`/assessments/${assessmentId}`)
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate(`/assessments/${assessmentId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading assessment&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Assessment data is unavailable</h3>
          <p className="table-state__text">
            Assessment data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load assessment</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!assessment) {
    return null
  }

  return (
    <div className="edit-assessment-page">
      <p className="page-description">
        Update the assessment details below and save your changes.
      </p>
      <Card title="Edit Assessment">
        <AssessmentForm
          initialValues={toAssessmentFormValues(assessment)}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
          courses={courses}
          classes={classes}
          coursesLoading={coursesLoading}
          classesLoading={classesLoading}
        />
      </Card>
    </div>
  )
}

function EditAssessmentPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditAssessmentContent key={id} assessmentId={id} />
}

export default EditAssessmentPage