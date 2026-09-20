import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import AssessmentForm from '@/components/assessments/AssessmentForm'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useCreateAssessment from '@/hooks/useCreateAssessment'

function AddAssessmentPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useCreateAssessment()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { classes, isLoading: classesLoading } = useClasses()

  const handleCancel = () => {
    navigate('/assessments')
  }

  const handleSubmit = async (payload) => {
    const result = await submit(payload)
    if (result.ok) {
      navigate('/assessments')
    }
  }

  return (
    <div className="add-assessment-page">
      <p className="page-description">
        Create a new assessment linked to a course and an optional class.
        Assessment records can be referenced by the grade records flow.
      </p>
      <Card title="Add Assessment">
        <AssessmentForm
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

export default AddAssessmentPage