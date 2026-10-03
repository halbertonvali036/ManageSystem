import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the fragment named by the current route.
 *
 * Some destinations are sections of a page rather than pages of their own —
 * password and notification preferences are sections of Account & Security.
 * Navigating to such a link with nothing listening leaves the reader at the top
 * of a long document, which reads as a link that went nowhere.
 *
 * The scroll waits a frame so a target that renders with the page is already in
 * the DOM, and it is cancelled if the route changes again first.
 */
function HashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (!target) {
      return undefined
    }
    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}

export default HashScroll