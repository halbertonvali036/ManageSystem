import { useCallback, useState } from 'react'
import academicYearsService from '@/services/academicYearsService'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useCreateAcademicYear() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const academicYear = await academicYearsService.createAcademicYear(values)
      return { ok: true, academicYear }
    } catch (error) {
      const feedback = getSubmitFeedback(
        error,
        'Could not create the academic year.',
      )
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useCreateAcademicYear