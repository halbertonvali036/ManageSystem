import { useCallback, useState } from 'react'
import departmentsService from '@/services/departmentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateDepartment() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const department = await departmentsService.createDepartment(values)
      return { ok: true, department }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the department.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateDepartment