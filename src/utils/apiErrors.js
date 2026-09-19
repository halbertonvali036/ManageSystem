export const normalizeFieldErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {}
  }
  const normalized = {}
  for (const [field, messages] of Object.entries(errors)) {
    const first = Array.isArray(messages) ? messages[0] : messages
    if (typeof first === 'string' && first) {
      normalized[field] = first
    }
  }
  return normalized
}

export const getSubmitFeedback = (
  error,
  fallbackMessage = 'Could not save the changes.',
) => {
  const bodyErrors = error?.data?.errors
  if (bodyErrors && typeof bodyErrors === 'object') {
    return {
      fieldErrors: normalizeFieldErrors(bodyErrors),
      message: error.data?.message ?? fallbackMessage,
    }
  }
  return { fieldErrors: {}, message: error?.message ?? fallbackMessage }
}