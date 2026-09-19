import { useCallback, useState } from 'react'
import studentsService from '@/services/studentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateStudent(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const student = await studentsService.updateStudent(id, values)
        return { ok: true, student }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the student.')
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

export default useUpdateStudent