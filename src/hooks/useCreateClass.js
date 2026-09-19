import { useCallback, useState } from 'react'
import classesService from '@/services/classesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateClass() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const classRecord = await classesService.createClass(values)
      return { ok: true, classRecord }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the class.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateClass