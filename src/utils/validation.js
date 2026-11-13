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

/** Digits of a card number, spaces and dashes removed. */
export const toCardDigits = (value) => String(value ?? '').replace(/\D/g, '')

/**
 * Luhn check over the card digits — the standard client-side sanity check for
 * a typed card number. Length is bounded the same way the networks bound it.
 */
export const isCardNumberValid = (value) => {
  const digits = toCardDigits(value)
  if (digits.length < 12 || digits.length > 19) {
    return false
  }
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/**
 * Expiry as `MM/YY`: must be a real month and must not be in the past — a card
 * stays valid through the last day of its expiry month.
 */
export const isCardExpiryValid = (value) => {
  const parts = String(value ?? '').split('/')
  if (parts.length !== 2) {
    return false
  }
  const [monthText, yearText] = parts.map((part) => part.trim())
  if (!/^\d{2}$/.test(monthText) || !/^\d{2}$/.test(yearText)) {
    return false
  }
  const month = Number(monthText)
  if (month < 1 || month > 12) {
    return false
  }
  const expiryEndsAt = new Date(2000 + Number(yearText), month, 1)
  return expiryEndsAt.getTime() > Date.now()
}

/** Card security code: 3 digits, or 4 for American Express. */
export const isCvcValid = (value) => /^\d{3,4}$/.test(String(value ?? '').trim())

export default {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidUrl,
  isFutureDate,
  isCardNumberValid,
  isCardExpiryValid,
  isCvcValid,
}