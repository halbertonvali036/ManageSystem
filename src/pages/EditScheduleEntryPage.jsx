import { useNavigate, useParams } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import Card from '@/components/common/Card'
import ScheduleEntryForm from '@/components/schedules/ScheduleEntryForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useSchedule from '@/hooks/useSchedule'
import useTeachers from '@/hooks/useTeachers'
import useUpdateSchedule from '@/hooks/useUpdateSchedule'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditScheduleEntryContent({ scheduleId }) {
  const navigate = useNavigate()
  const { scheduleEntry, isLoading, error, refetch } = useSchedule(scheduleId)
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateSchedule(scheduleId)
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()
  const { teachers, isLoading: teachersLoading } = useTeachers()

  const handleCancel = () => {
    navigate(`/schedules/${scheduleId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/schedules/${scheduleId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading schedule entry&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <CalendarClock
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Schedule data is unavailable</h3>
          <p className="table-state__text">
            Schedule data will be available when the backend API is connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load schedule entry</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!scheduleEntry) {
    return null
  }

  return (
    <div className="edit-schedule-page">
      <p className="page-description">
        Update the timetable entry below and save your changes. Scheduling
        conflicts are resolved by the backend.
      </p>
      <Card title="Edit Schedule Entry">
        <ScheduleEntryForm
          initialValues={scheduleEntry}
          submitLabel="Save Changes"
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
          teachers={teachers}
          teachersLoading={teachersLoading}
        />
      </Card>
    </div>
  )
}

function EditScheduleEntryPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditScheduleEntryContent key={id} scheduleId={id} />
}

export default EditScheduleEntryPage