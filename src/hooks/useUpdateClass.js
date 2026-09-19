import { useCallback, useState } from 'react'
import classesService from '@/services/classesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateClass(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const classRecord = await classesService.updateClass(id, values)
        return { ok: true, classRecord }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the class.')
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

export default useUpdateClass