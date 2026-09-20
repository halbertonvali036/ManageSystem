import { useCallback, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useUpdateSemester(academicYearId, semesterId) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const semester = await academicYearsService.updateSemester(
          academicYearId,
          semesterId,
          values,
        )
        return { ok: true, semester }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not update the semester.',
        )
        setFieldErrors(feedback.fieldErrors)
        setSubmitError(feedback.message)
        return { ok: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [academicYearId, semesterId],
  )

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useUpdateSemester