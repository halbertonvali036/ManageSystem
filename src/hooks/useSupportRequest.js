import { useCallback, useState } from 'react'
import supportService from '@/services/supportService'
import { BackendNotConnectedError, getRequestErrorMessage } from '@/services/httpClient'
import { toSupportRequestPayload, validateSupportRequest } from '@/models/support'

const EMPTY_DRAFT = Object.freeze({ category: '', subject: '', message: '' })

/**
 * Support / contact form state.
 *
 * The draft lives only in component state — nothing is written to storage and
 * no message is queued anywhere. Submission is a single backend call; with no
 * backend it fails with `BackendNotConnectedError` and the form reports an
 * integration-pending state instead of a ticket number.
 */
function useSupportRequest() {
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isUnavailable, setIsUnavailable] = useState(!supportService.isBackendConnected())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedReference, setSubmittedReference] = useState(null)

  const setField = useCallback((field, value) => {
    setSubmittedReference(null)
    setSubmitError(null)
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }
      const next = { ...current }
      delete next[field]
      return next
    })
  }, [])

  const submit = useCallback(async () => {
    if (isSubmitting) {
      return false
    }
    const validationErrors = validateSupportRequest(draft)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return false
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await supportService.createSupportRequest(toSupportRequestPayload(draft))
      const reference = response?.reference ?? response?.id ?? null
      setSubmittedReference(reference)
      setIsSubmitted(true)
      setDraft(EMPTY_DRAFT)
      setIsUnavailable(false)
      return true
    } catch (error) {
      setSubmitError(
        error instanceof BackendNotConnectedError
          ? null
          : getRequestErrorMessage(error),
      )
      setIsUnavailable(error instanceof BackendNotConnectedError)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [draft, isSubmitting])

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT)
    setErrors({})
    setSubmitError(null)
    setIsSubmitted(false)
    setSubmittedReference(null)
  }, [])

  return {
    draft,
    errors,
    isSubmitting,
    isUnavailable,
    submitError,
    submittedReference,
    isSubmitted,
    setField,
    submit,
    reset,
  }
}

export default useSupportRequest
