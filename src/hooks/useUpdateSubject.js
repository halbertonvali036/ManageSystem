import { useCallback, useState } from 'react'
import subjectsService from '@/services/subjectsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateSubject(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const subject = await subjectsService.updateSubject(id, values)
        return { ok: true, subject }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the subject.',
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

export default useUpdateSubject