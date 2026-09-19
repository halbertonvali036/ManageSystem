import { useCallback, useState } from 'react'
import departmentsService from '@/services/departmentsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateDepartment(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const department = await departmentsService.updateDepartment(id, values)
        return { ok: true, department }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the department.',
        )
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

export default useUpdateDepartment