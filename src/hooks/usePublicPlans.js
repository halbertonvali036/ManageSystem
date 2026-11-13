import { useCallback, useEffect, useState } from 'react'
import billingService from '@/services/billingService'
import { toPlanList } from '@/models/billing'

/**
 * Loads the published plan catalogue for a public surface (the landing page).
 *
 * The request itself is anonymous — `billingService.getPublicPlans` sends no
 * token — so a visitor with a missing or expired session gets the same prices
 * as everyone else and is never bounced to sign-in by this read.
 *
 * State is deliberately small and honest:
 * - `isLoading` while the request is in flight (render a skeleton, not prices);
 * - `plans` only ever holds what the backend published;
 * - `isUnavailable` when the request failed or served nothing, so the caller
 *   can render a neutral "pricing unavailable" state instead of fake numbers.
 */
function usePublicPlans() {
  const [reloadToken, setReloadToken] = useState(0)
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)

  useEffect(() => {
    let isActive = true

    billingService
      .getPublicPlans()
      .then((records) => {
        if (!isActive) {
          return
        }
        const loaded = toPlanList(records)
        setPlans(loaded)
        setIsUnavailable(loaded.length === 0)
        setIsLoading(false)
      })
      .catch(() => {
        // A failed public read degrades to the neutral state — never to
        // placeholder prices and never to an error that hijacks the landing page.
        if (!isActive) {
          return
        }
        setPlans([])
        setIsUnavailable(true)
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  return { plans, isLoading, isUnavailable, refetch }
}

export default usePublicPlans
