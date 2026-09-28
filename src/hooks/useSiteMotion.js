import { useLayoutEffect, useRef } from 'react'

/** One observer per rendered page. Runs once per preview/page entry, never per
 * selection or keystroke. Markup stays visible if JS/observation is unavailable.
 */
export default function useSiteMotion(enabled, pageKey) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!enabled || !root) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const nodes = [...root.querySelectorAll('[data-site-motion]')]
    const clear = (node) => node.removeAttribute('data-motion-state')
    let observer
    const reveal = (node) => {
      observer?.unobserve(node)
      if (preference.matches) { clear(node); return }
      node.dataset.motionState = 'running'
    }
    const stop = () => {
      observer?.disconnect()
      nodes.forEach(clear)
    }
    if (!preference.matches) {
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) reveal(target)
          })
        }, { threshold: 0.01 })
      }
      nodes.forEach((node) => {
        if (node.dataset.motionTrigger === 'load') reveal(node)
        else if (observer) {
          node.dataset.motionState = 'pending'
          observer.observe(node)
        }
      })
    }
    // Focus must be visible immediately, even inside a delayed parent section.
    const onFocus = ({ target }) => nodes.forEach((node) => {
      if (node.contains(target)) { observer?.unobserve(node); clear(node) }
    })
    const onEnd = ({ target }) => {
      if (target.dataset.motionState === 'running') clear(target)
    }
    const onPreference = () => { if (preference.matches) stop() }
    root.addEventListener('focusin', onFocus)
    root.addEventListener('animationend', onEnd)
    preference.addEventListener('change', onPreference)
    return () => {
      stop()
      root.removeEventListener('focusin', onFocus)
      root.removeEventListener('animationend', onEnd)
      preference.removeEventListener('change', onPreference)
    }
  }, [enabled, pageKey])
  return ref
}
