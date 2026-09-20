import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import AcademicPeriodForm from '@/components/academicYears/AcademicPeriodForm'
import useAcademicYear from '@/hooks/useAcademicYear'
import useCreateSemester from '@/hooks/useCreateSemester'
import { formatAcademicYearName } from '@/models/academicYear'
import { toSemesterPayload } from '@/utils/semesterForm'

function AddSemesterPage() {
  const { id: academicYearId } = useParams()
  const navigate = useNavigate()
  const { academicYear } = useAcademicYear(academicYearId)
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateSemester(
    academicYearId,
  )

  if (!academicYearId) {
    return null
  }

  const handleCancel = () => {
    navigate(`/academic-years/${academicYearId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(toSemesterPayload(values))
    if (result.ok) {
      navigate(`/academic-years/${academicYearId}`)
    }
  }

  const academicYearLabel = academicYear
    ? formatAcademicYearName(academicYear)
    : null

  return (
    <div className="add-semester-page">
      <p className="page-description">
        Create a new semester for this academic year.
        {academicYearLabel ? (
          <>
            {' '}
            This semester will belong to{' '}
            <strong>{academicYearLabel}</strong>.
          </>
        ) : null}
      </p>
      <Card title="Add Semester">
        <AcademicPeriodForm
          label="Semester"
          submitLabel="Create Semester"
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

export default AddSemesterPage