import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import AnnouncementForm from '@/components/announcements/AnnouncementForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useCreateAnnouncement from '@/hooks/useCreateAnnouncement'

function AddAnnouncementPage() {
  const navigate = useNavigate()
  const { isSubmitting, submitError, fieldErrors, submit } =
    useCreateAnnouncement()
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()

  const handleCancel = () => {
    navigate('/announcements')
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate('/announcements')
    }
  }

  return (
    <div className="add-announcement-page">
      <p className="page-description">
        Create a new announcement. Pick the audience it reaches; classes and
        courses are selected from existing records, and the academic context is
        optional.
      </p>
      <Card title="Add Announcement">
        <AnnouncementForm
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

export default AddAnnouncementPage