import { useCallback, useState } from 'react'
import gradesService from '@/services/gradesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateGrade() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const grade = await gradesService.createGrade(values)
      return { ok: true, grade }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the grade.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateGrade