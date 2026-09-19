import { useCallback, useState } from 'react'
import coursesService from '@/services/coursesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateCourse() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const course = await coursesService.createCourse(values)
      return { ok: true, course }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the course.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateCourse