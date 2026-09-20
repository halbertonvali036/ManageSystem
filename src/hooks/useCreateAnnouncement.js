import { useCallback, useState } from 'react'
import announcementsService from '@/services/announcementsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateAnnouncement() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const announcement = await announcementsService.createAnnouncement(values)
      return { ok: true, announcement }
    } catch (error) {
      const feedback = getSubmitFeedback(
        error,
        'Could not create the announcement.',
      )
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateAnnouncement