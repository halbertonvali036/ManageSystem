import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import AcademicPeriodForm from '@/components/academicYears/AcademicPeriodForm'
import useAcademicYear from '@/hooks/useAcademicYear'
import useSemesters from '@/hooks/useSemesters'
import useUpdateSemester from '@/hooks/useUpdateSemester'
import { formatAcademicYearName } from '@/models/academicYear'
import { toSemesterFormValues, toSemesterPayload } from '@/utils/semesterForm'

function EditSemesterContent({ academicYearId, semesterId }) {
  const navigate = useNavigate()
  const { academicYear } = useAcademicYear(academicYearId)
  const { semesters, isLoading, error, refetch } = useSemesters(academicYearId)
  const { isSubmitting, submitError, fieldErrors, submit } = useUpdateSemester(
    academicYearId,
    semesterId,
  )

  const semester = useMemo(
    () => semesters.find((item) => item.id === semesterId) ?? null,
    [semesters, semesterId],
  )

  const handleCancel = () => {
    navigate(`/academic-years/${academicYearId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(toSemesterPayload(values))
    if (result.ok) {
      navigate(`/academic-years/${academicYearId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading semester&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="table-state table-state--error">
          <h3 className="table-state__title">Failed to load semester</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!semester) {
    return (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Semester not found</h3>
          <p className="table-state__text">
            The semester could not be found for this academic year.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(`/academic-years/${academicYearId}`)}
          >
            Back to Academic Year
          </button>
        </div>
      </Card>
    )
  }

  const academicYearLabel = academicYear
    ? formatAcademicYearName(academicYear)
    : null

  return (
    <div className="edit-semester-page">
      <p className="page-description">
        Update the semester details below and save your changes.
        {academicYearLabel ? (
          <>
            {' '}
            This semester belongs to{' '}
            <strong>{academicYearLabel}</strong>.
          </>
        ) : null}
      </p>
      <Card title="Edit Semester">
        <AcademicPeriodForm
          label="Semester"
          initialValues={toSemesterFormValues(semester)}
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

function EditSemesterPage() {
  const { id: academicYearId, semesterId } = useParams()
  if (!academicYearId || !semesterId) {
    return null
  }
  return (
    <EditSemesterContent
      key={`${academicYearId}-${semesterId}`}
      academicYearId={academicYearId}
      semesterId={semesterId}
    />
  )
}

export default EditSemesterPage