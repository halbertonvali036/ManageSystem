import { useCallback, useEffect, useRef, useState } from 'react'
import authService from '@/services/authService'

/**
 * Shared resend-verification behaviour.
 *
 * The backend deliberately answers 200 whether or not an account exists, so
 * this hook exposes only a neutral `sent` / `failed` outcome. It never returns
 * the backend message, because that message must not be allowed to confirm an
 * address. A 60-second cooldown is enforced in a ref as well as in state so a
 * double click or a stale render cannot send a second request.
 */
export const RESEND_COOLDOWN_SECONDS = 60

function useVerificationResend() {
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [status, setStatus] = useState('idle')
  const sendingRef = useRef(false)
  const cooldownRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    },
    [],
  )

  const startCooldown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    cooldownRef.current = RESEND_COOLDOWN_SECONDS
    setCooldown(RESEND_COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      cooldownRef.current = Math.max(0, cooldownRef.current - 1)
      setCooldown(cooldownRef.current)
      if (cooldownRef.current === 0 && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 1000)
  }, [])

  const resend = useCallback(
    async (email) => {
      const normalized = typeof email === 'string' ? email.trim() : ''
      if (!normalized || sendingRef.current || cooldownRef.current > 0) {
        return false
      }

      sendingRef.current = true
      setIsSending(true)
      setStatus('idle')
      try {
        await authService.resendVerification(normalized)
        setStatus('sent')
        startCooldown()
        return true
      } catch {
        // The raw request error is intentionally discarded. Showing it could
        // leak whether an account exists or expose backend wording.
        setStatus('failed')
        startCooldown()
        return false
      } finally {
        sendingRef.current = false
        setIsSending(false)
      }
    },
    [startCooldown],
  )

  const resetStatus = useCallback(() => {
    setStatus('idle')
  }, [])

  return {
    resend,
    resetStatus,
    isSending,
    cooldown,
    canResend: cooldown === 0 && !isSending,
    status,
  }
}

export default useVerificationResend
