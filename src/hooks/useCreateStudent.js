import { useCallback, useState } from 'react'
import studentsService from '@/services/studentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateStudent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const student = await studentsService.createStudent(values)
      return { ok: true, student }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the student.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateStudent