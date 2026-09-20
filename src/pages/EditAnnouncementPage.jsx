import { useNavigate, useParams } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import Card from '@/components/common/Card'
import AnnouncementForm from '@/components/announcements/AnnouncementForm'
import useAcademicYears from '@/hooks/useAcademicYears'
import useAnnouncement from '@/hooks/useAnnouncement'
import useClasses from '@/hooks/useClasses'
import useCourses from '@/hooks/useCourses'
import useUpdateAnnouncement from '@/hooks/useUpdateAnnouncement'
import { BackendNotConnectedError } from '@/services/httpClient'

function EditAnnouncementContent({ announcementId }) {
  const navigate = useNavigate()
  const { announcement, isLoading, error, refetch } = useAnnouncement(
    announcementId,
  )
  const { isSubmitting, submitError, fieldErrors, submit } =
    useUpdateAnnouncement(announcementId)
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears()
  const { classes, isLoading: classesLoading } = useClasses()
  const { courses, isLoading: coursesLoading } = useCourses()

  const handleCancel = () => {
    navigate(`/announcements/${announcementId}`)
  }

  const handleSubmit = async (values) => {
    const result = await submit(values)
    if (result.ok) {
      navigate(`/announcements/${announcementId}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading announcement&hellip;
        </div>
      </Card>
    )
  }

  if (error) {
    return error instanceof BackendNotConnectedError ? (
      <Card>
        <div className="table-state">
          <Megaphone
            className="table-state__icon"
            size={40}
            aria-hidden="true"
          />
          <h3 className="table-state__title">Announcement data is unavailable</h3>
          <p className="table-state__text">
            Announcement data will be available when the backend API is
            connected.
          </p>
        </div>
      </Card>
    ) : (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load announcement</h3>
          <p className="table-state__text">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!announcement) {
    return null
  }

  return (
    <div className="edit-announcement-page">
      <p className="page-description">
        Update the announcement below and save your changes. Audiences, dates
        and the academic context can all be adjusted.
      </p>
      <Card title="Edit Announcement">
        <AnnouncementForm
          initialValues={announcement}
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
        />
      </Card>
    </div>
  )
}

function EditAnnouncementPage() {
  const { id } = useParams()
  if (!id) {
    return null
  }
  return <EditAnnouncementContent key={id} announcementId={id} />
}

export default EditAnnouncementPage