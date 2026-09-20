import { useCallback, useState } from 'react'
import assessmentsService from '@/services/assessmentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateAssessment() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const assessment = await assessmentsService.createAssessment(values)
      return { ok: true, assessment }
    } catch (error) {
      const feedback = getSubmitFeedback(
        error,
        'Could not create the assessment.',
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

export default useCreateAssessment