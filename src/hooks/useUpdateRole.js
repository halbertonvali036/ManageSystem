import { useCallback, useState } from 'react'
import rolesService from '@/services/rolesService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateRole(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const role = await rolesService.updateRole(id, values)
        return { ok: true, role }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the role.')
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

export default useUpdateRole