import { useCallback, useState } from 'react'
import announcementsService from '@/services/announcementsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateAnnouncement(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const announcement = await announcementsService.updateAnnouncement(
          id,
          values,
        )
        return { ok: true, announcement }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the announcement.',
        )
        setFieldErrors(feedback.fieldErrors)
        setSubmitError(feedback.message)
        return { ok: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [id],
  )

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useUpdateAnnouncement