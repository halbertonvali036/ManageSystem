import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import AcademicPeriodForm from '@/components/academicYears/AcademicPeriodForm'
import useCreateAcademicYear from '@/hooks/useCreateAcademicYear'
import { toAcademicYearPayload } from '@/utils/academicYearForm'

function AddAcademicYearPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useCreateAcademicYear()

  const handleCancel = () => {
    navigate('/academic-years')
  }

  const handleSubmit = async (values) => {
    const result = await submit(toAcademicYearPayload(values))
    if (result.ok) {
      navigate('/academic-years')
    }
  }

  return (
    <div className="add-academic-year-page">
      <p className="page-description">
        Create a new academic year with a start and end date. Semester
        records can be added from the academic year&rsquo;s details page.
      </p>
      <Card title="Add Academic Year">
        <AcademicPeriodForm
          label="Academic Year"
          submitLabel="Create Academic Year"
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

export default AddAcademicYearPage