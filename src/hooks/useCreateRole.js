import { useCallback, useState } from 'react'
import rolesService from '@/services/rolesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateRole() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const role = await rolesService.createRole(values)
      return { ok: true, role }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the role.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateRole