import { useCallback, useState } from 'react'
import schedulesService from '@/services/schedulesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateSchedule(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const scheduleEntry = await schedulesService.updateSchedule(id, values)
        return { ok: true, scheduleEntry }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the schedule entry.',
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

export default useUpdateSchedule