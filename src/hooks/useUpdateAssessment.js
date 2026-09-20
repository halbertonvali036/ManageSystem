import { useCallback, useState } from 'react'
import assessmentsService from '@/services/assessmentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateAssessment(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const assessment = await assessmentsService.updateAssessment(
          id,
          values,
        )
        return { ok: true, assessment }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the assessment.',
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

export default useUpdateAssessment