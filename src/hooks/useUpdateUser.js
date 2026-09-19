import { useCallback, useState } from 'react'
import usersService from '@/services/usersService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateUser(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const user = await usersService.updateUser(id, values)
        return { ok: true, user }
      } catch (error) {
        const feedback = getSubmitFeedback(error, 'Could not update the user.')
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

export default useUpdateUser