import { useCallback, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateAcademicYear(id) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const academicYear = await academicYearsService.updateAcademicYear(
          id,
          values,
        )
        return { ok: true, academicYear }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the academic year.',
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

export default useUpdateAcademicYear