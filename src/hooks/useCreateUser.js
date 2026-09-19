import { useCallback, useState } from 'react'
import usersService from '@/services/usersService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateUser() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const user = await usersService.createUser(values)
      return { ok: true, user }
    } catch (error) {
      const feedback = getSubmitFeedback(error, 'Could not create the user.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateUser