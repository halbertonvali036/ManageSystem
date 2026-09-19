import { useCallback, useState } from 'react'
import teachersService from '@/services/teachersService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateTeacher(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const teacher = await teachersService.updateTeacher(id, values)
        return { ok: true, teacher }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the teacher.')
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

export default useUpdateTeacher