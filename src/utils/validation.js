export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

export const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime())
}

export const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const isFutureDate = (value) => {
  const date = new Date(`${value}T00:00:00`)
  return date.getTime() > Date.now()
}

export default { isValidEmail, isValidPhone, isValidDate, isValidUrl, isFutureDate }