import { useCallback, useState } from 'react'
import teacherService from '@/services/teacherService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { getSubmitFeedback } from '@/utils/apiErrors'

function useTeacherCreateGrade() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = useCallback(async (values) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const grade = await teacherService.createMyGrade(values)
      return { ok: true, grade }
    } catch (error) {
      const feedback =
        error instanceof BackendNotConnectedError
          ? { fieldErrors: {}, message: 'Backend API is not connected yet. The grade cannot be saved.' }
          : getSubmitFeedback(error, 'Could not create the grade.')
      setFieldErrors(feedback.fieldErrors)
      setSubmitError(feedback.message)
      return { ok: false }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, submitError, fieldErrors, submit }
}

export default useTeacherCreateGrade