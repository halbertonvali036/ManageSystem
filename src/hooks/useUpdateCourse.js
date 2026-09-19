import { useCallback, useState } from 'react'
import coursesService from '@/services/coursesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateCourse(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const course = await coursesService.updateCourse(id, values)
        return { ok: true, course }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the course.')
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

export default useUpdateCourse