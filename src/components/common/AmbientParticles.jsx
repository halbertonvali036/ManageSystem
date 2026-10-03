import { useEffect, useRef } from 'react'
import '@/styles/ambient-particles.css'

const COUNTS = { low: 18, medium: 30, high: 42 }
// Stable positions keep renders deterministic and distribute points across the field.
const POINTS = Array.from({ length: 42 }, (_, index) => ({
  x: 5 + ((index * 37) % 91),
  y: 4 + ((index * 23) % 93),
  size: index % 11 === 0 ? 13 : 1.5 + (index % 3) * 0.7,
  dx: ((index % 5) - 2) * 13,
  dy: -22 - (index % 4) * 12,
  duration: 19 + (index % 7) * 4,
}))

/** Decorative platform background. Mount inside a positioned, isolated host.
 * No frame-driven React state; CSS owns motion and the current theme palette.
 */
export default function AmbientParticles({ variant = 'dashboard', intensity = 'low', interactive = false }) {
  const rootRef = useRef(null)
  const count = COUNTS[intensity] ?? COUNTS.low

  useEffect(() => {
    const root = rootRef.current
    const host = root.parentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)')
    let inView = true
    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const resetPointer = () => {
      cancelAnimationFrame(frame)
      frame = 0
      root.style.setProperty('--ambient-pointer-x', '0px')
      root.style.setProperty('--ambient-pointer-y', '0px')
    }
    const syncActivity = () => {
      root.dataset.paused = String(document.hidden || !inView || reducedMotion.matches)
      if (root.dataset.paused === 'true' || !finePointer.matches) resetPointer()
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncActivity()
    })
    observer.observe(root)
    syncActivity()

    const movePointer = (event) => {
      if (root.dataset.paused === 'true' || !finePointer.matches) return
      pointerX = event.clientX
      pointerY = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const bounds = host.getBoundingClientRect()
        const x = Math.max(-0.5, Math.min(0.5, (pointerX - bounds.left) / Math.max(1, bounds.width) - 0.5))
        const y = Math.max(-0.5, Math.min(0.5, (pointerY - bounds.top) / Math.max(1, bounds.height) - 0.5))
        root.style.setProperty('--ambient-pointer-x', `${x * 12}px`)
        root.style.setProperty('--ambient-pointer-y', `${y * 10}px`)
      })
    }

    document.addEventListener('visibilitychange', syncActivity)
    reducedMotion.addEventListener('change', syncActivity)
    finePointer.addEventListener('change', syncActivity)
    if (interactive) {
      host.addEventListener('pointermove', movePointer, { passive: true })
      host.addEventListener('pointerleave', resetPointer)
    }
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncActivity)
      reducedMotion.removeEventListener('change', syncActivity)
      finePointer.removeEventListener('change', syncActivity)
      host.removeEventListener('pointermove', movePointer)
      host.removeEventListener('pointerleave', resetPointer)
      cancelAnimationFrame(frame)
    }
  }, [interactive])

  return (
    <div ref={rootRef} className={`ambient-particles ambient-particles--${variant} ambient-particles--${intensity}`} aria-hidden="true">
      <div className="ambient-particles__field">
        {POINTS.slice(0, count).map((point, index) => (
          <span
            key={index}
            className={`ambient-particles__point${index % 11 === 0 ? ' ambient-particles__point--soft' : ''}`}
            style={{
              left: `${point.x}%`, top: `${point.y}%`,
              '--point-size': `${point.size}px`,
              '--point-dx': `${point.dx}px`, '--point-dy': `${point.dy}px`,
              '--point-duration': `${point.duration * (variant === 'admin' ? 1.6 : 1)}s`,
              '--point-delay': `${-index * 2.7}s`,
            }}
          />
        ))}
        <svg className="ambient-particles__streaks" viewBox="0 0 1000 700" fill="none" focusable="false" preserveAspectRatio="xMidYMid slice">
          <path d="M130 490L260 360L350 380" />
          <path d="M610 180L720 240L870 140" />
          <path d="M580 590L700 480" />
        </svg>
      </div>
    </div>
  )
}
