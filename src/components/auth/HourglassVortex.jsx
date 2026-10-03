import { useEffect, useRef, useState } from 'react'
import useTheme from '@/hooks/useTheme'
import '@/styles/hourglass-vortex.css'

// Adapted from Hourglass Vortex.html: hyperbolic waist, opposing spiral
// families, concentric accretion rings and suspended dust.
const radius = (y) => 0.6 * Math.sqrt(1 + (y / 0.9) ** 2) + 0.15 * y * y
const BOTTOM = -5.2
const TOP = 6.6

function addCurve(positions, curve, segments) {
  let previous = curve(0)
  for (let i = 1; i <= segments; i++) {
    const point = curve(i / segments)
    positions.push(...previous, ...point)
    previous = point
  }
}

function HourglassVortex() {
  const hostRef = useRef(null)
  const { theme } = useTheme()
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const mobile = window.matchMedia('(max-width: 767px)')
    const tablet = window.matchMedia('(max-width: 1199px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    let disposed = false
    let teardown = () => {}
    let generation = 0

    // Load the renderer only when this decorative desktop/tablet panel is used.
    const initialize = async () => {
      const current = ++generation
      teardown()
      teardown = () => {}
      if (mobile.matches || disposed) return
      const THREE = await import('three')
      if (disposed || current !== generation) return
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !tablet.matches, powerPreference: 'low-power' })
      } catch {
        setUnavailable(true)
        return
      }
      setUnavailable(false)
      const light = theme === 'light'
      const compact = tablet.matches
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(light ? '#e7f3e9' : '#07110b', light ? 0.025 : 0.021)
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 150)
      const composition = new THREE.Group()
      const lines = new THREE.Group()
      const disk = new THREE.Group()
      const dust = new THREE.Group()
      composition.add(lines, disk, dust)
      scene.add(composition)
      renderer.setClearColor(0, 0)
      renderer.domElement.setAttribute('aria-hidden', 'true')
      host.appendChild(renderer.domElement)

      const makeLines = (positions, color, opacity, parent) => {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        const material = new THREE.LineBasicMaterial({
          color, transparent: true, opacity: opacity * (light ? 0.65 : 1),
          depthWrite: false, blending: THREE.NormalBlending,
        })
        parent.add(new THREE.LineSegments(geometry, material))
      }

      // Three layers keep the outer field quiet and reserve neon for a few threads.
      for (let layer = 0; layer < 3; layer++) {
        const positions = []
        const count = compact ? 24 : 42
        for (const direction of [1, -1]) {
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + layer * 0.065
            addCurve(positions, (t) => {
              const y = BOTTOM + (TOP - BOTTOM) * t
              const r = radius(y) * (1 + layer * 0.055)
              const theta = angle + direction * (0.38 + layer * 0.035) * y
              return [Math.cos(theta) * r, y, Math.sin(theta) * r]
            }, compact ? 72 : 120)
          }
        }
        makeLines(positions, light ? '#398c60' : ['#48e58b', '#7cff9b', '#48e58b'][layer], [0.2, 0.075, 0.04][layer], lines)
      }
      const highlights = []
      for (let i = 0; i < 6; i++) {
        addCurve(highlights, (t) => {
          const y = BOTTOM + (TOP - BOTTOM) * t
          const theta = (i / 6) * Math.PI * 2 + 0.38 * y
          const r = radius(y) * 1.002
          return [Math.cos(theta) * r, y, Math.sin(theta) * r]
        }, compact ? 72 : 120)
      }
      makeLines(highlights, light ? '#5baa76' : '#39ff14', 0.24, lines)

      const rings = []
      const arms = []
      const ringCount = compact ? 14 : 24
      for (let k = 0; k < ringCount; k++) {
        const r = 3.4 + (k / (ringCount - 1)) ** 1.5 * 15
        addCurve(rings, (t) => [Math.cos(t * Math.PI * 2) * r, BOTTOM + 0.003 * r * r, Math.sin(t * Math.PI * 2) * r], compact ? 100 : 160)
      }
      for (let i = 0; i < (compact ? 16 : 28); i++) {
        addCurve(arms, (t) => {
          const r = 3.4 + t * 15
          const theta = (i / (compact ? 16 : 28)) * Math.PI * 2 + 1.5 * Math.log(r / 3.4 + 1)
          return [Math.cos(theta) * r, BOTTOM + 0.003 * r * r, Math.sin(theta) * r]
        }, compact ? 72 : 110)
      }
      makeLines(rings, light ? '#398c60' : '#48e58b', 0.09, disk)
      makeLines(arms, light ? '#5baa76' : '#7cff9b', 0.075, disk)

      // Separate point layers provide size/brightness variation; perspective
      // attenuation and scene fog also dim particles further from the camera.
      const particleLayers = []
      for (let layer = 0; layer < 3; layer++) {
        const count = (compact ? [70, 40, 12] : [150, 85, 24])[layer]
        const positions = new Float32Array(count * 3)
        const seeds = new Float32Array(count)
        for (let i = 0; i < count; i++) {
          const y = BOTTOM + Math.random() * (TOP - BOTTOM)
          const r = radius(y) * (0.65 + Math.random() * 0.85)
          const angle = Math.random() * Math.PI * 2
          positions.set([Math.cos(angle) * r, y, Math.sin(angle) * r], i * 3)
          seeds[i] = Math.random() * Math.PI * 2
        }
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage)
        const material = new THREE.PointsMaterial({
          color: light ? '#398c60' : ['#48e58b', '#7cff9b', '#39ff14'][layer],
          size: [0.026, 0.042, 0.065][layer], opacity: [0.25, 0.48, 0.75][layer] * (light ? 0.5 : 1),
          transparent: true, depthWrite: false, sizeAttenuation: true,
        })
        dust.add(new THREE.Points(geometry, material))
        particleLayers.push({ geometry, base: positions.slice(), seeds })
      }

      let frame = 0
      let elapsed = 0
      let previousTime = 0
      let inView = false
      let contextLost = false
      const target = { x: 0, y: 0 }
      const render = () => renderer.render(scene, camera)
      const stop = () => {
        cancelAnimationFrame(frame)
        frame = 0
        previousTime = 0
      }
      const animate = (now) => {
        frame = 0
        const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0
        previousTime = now
        elapsed += delta
        lines.rotation.y = elapsed * 0.045
        disk.rotation.y = -elapsed * 0.025
        dust.rotation.y = elapsed * 0.065
        composition.rotation.x += (target.y * 0.018 - composition.rotation.x) * 0.035
        composition.rotation.z += (target.x * 0.022 - composition.rotation.z) * 0.035
        for (const { geometry, base, seeds } of particleLayers) {
          const positions = geometry.attributes.position.array
          for (let i = 0; i < seeds.length; i++) {
            positions[i * 3] = base[i * 3] + Math.cos(elapsed * 0.3 + seeds[i]) * 0.06
            positions[i * 3 + 1] = base[i * 3 + 1] + Math.sin(elapsed * 0.4 + seeds[i]) * 0.12
          }
          geometry.attributes.position.needsUpdate = true
        }
        render()
        frame = requestAnimationFrame(animate)
      }
      const sync = () => {
        stop()
        if (!inView || document.hidden || contextLost || !host.clientWidth || !host.clientHeight) return
        render()
        if (!reducedMotion.matches) frame = requestAnimationFrame(animate)
      }
      const resize = () => {
        const width = host.clientWidth
        const height = host.clientHeight
        if (!width || !height) return stop()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75))
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.position.set(0, 2.6, Math.max(19, 13 / camera.aspect))
        camera.lookAt(0, -0.25, 0)
        camera.updateProjectionMatrix()
        sync()
      }
      const pointerMove = (event) => {
        if (reducedMotion.matches || !finePointer.matches || !inView) return
        const bounds = host.getBoundingClientRect()
        target.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
        target.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
      }
      const resetPointer = () => { target.x = 0; target.y = 0 }
      const motionChange = () => {
        resetPointer()
        composition.rotation.set(0, 0, 0)
        sync()
      }
      const onContextLost = (event) => { event.preventDefault(); contextLost = true; stop(); setUnavailable(true) }
      const onContextRestored = () => { contextLost = false; setUnavailable(false); resize() }
      const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync() })
      const resizeObserver = new ResizeObserver(resize)
      observer.observe(host)
      resizeObserver.observe(host)
      document.addEventListener('visibilitychange', sync)
      window.addEventListener('pointermove', pointerMove, { passive: true })
      window.addEventListener('blur', resetPointer)
      reducedMotion.addEventListener('change', motionChange)
      renderer.domElement.addEventListener('webglcontextlost', onContextLost)
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)
      resize()

      teardown = () => {
        stop()
        observer.disconnect()
        resizeObserver.disconnect()
        document.removeEventListener('visibilitychange', sync)
        window.removeEventListener('pointermove', pointerMove)
        window.removeEventListener('blur', resetPointer)
        reducedMotion.removeEventListener('change', motionChange)
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
        scene.traverse((object) => {
          object.geometry?.dispose()
          object.material?.dispose()
        })
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }
    }
    const start = () => { initialize().catch(() => { if (!disposed) setUnavailable(true) }) }
    mobile.addEventListener('change', start)
    tablet.addEventListener('change', start)
    start()
    return () => {
      disposed = true
      generation++
      mobile.removeEventListener('change', start)
      tablet.removeEventListener('change', start)
      teardown()
    }
  }, [theme])

  return <div ref={hostRef} className={`hourglass-vortex${unavailable ? ' hourglass-vortex--fallback' : ''}`} aria-hidden="true" />
}

export default HourglassVortex
