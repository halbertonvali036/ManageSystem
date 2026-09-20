import { useCallback, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateSemester(academicYearId) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(
    async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setFieldErrors({})
      try {
        const semester = await academicYearsService.createSemester(
          academicYearId,
          values,
        )
        return { ok: true, semester }
      } catch (error) {
        const feedback = getSubmitFeedback(
          error,
          'Could not create the semester.',
        )
        setFieldErrors(feedback.fieldErrors)
        setSubmitError(feedback.message)
        return { ok: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [academicYearId],
  )

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateSemester