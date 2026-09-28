import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import ScheduleEntryForm from '@/components/schedules/ScheduleEntryForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useCreateSchedule from '@/hooks/useCreateSchedule'

function AddScheduleEntryPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } = useCreateSchedule()
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()

  const handleCancel = () => {
    navigate('/schedules')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/schedules')
    }
  }

  return (
    <div className="page">
      <p className="page-description">
        Add a new timetable entry. Select the academic period, class and course
        from existing records, then set the day, times and room.
      </p>
      <Card title="Add Schedule Entry">
        <ScheduleEntryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
          serverFieldErrors={fieldErrors}
          academicYears={academicYears}
          academicYearsLoading={academicYearsLoading}
          classes={classes}
          classesLoading={classesLoading}
          courses={courses}
          coursesLoading={coursesLoading}
        />
      </Card>
    </div>
  )
}

export default AddScheduleEntryPage