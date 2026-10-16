import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stayed unchanged for `delay` ms.
 *
 * Used by filter fields that drive a request: the input updates on every
 * keystroke so typing stays responsive, but the debounced value — and the
 * request keyed on it — only moves once the user pauses. A burst of keystrokes
 * then costs one request instead of one per character.
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
