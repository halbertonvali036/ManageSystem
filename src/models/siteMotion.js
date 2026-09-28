/** Plain JSON metadata, independent of content, styles and responsive overrides.
 * null timing values inherit the site preset; explicit values survive preset changes.
 * Existing sites remain static until an effect is chosen.
 */
export const MOTION_TYPES = Object.freeze(['none', 'fade', 'slide-up', 'slide-left', 'slide-right', 'scale'])
export const MOTION_PRESETS = Object.freeze({
  minimal: { duration: 180, delay: 0, distance: 6 },
  balanced: { duration: 380, delay: 0, distance: 18 },
  expressive: { duration: 580, delay: 0, distance: 28 },
})
export const normalizeSiteMotion = (raw) => ({
  preset: Object.hasOwn(MOTION_PRESETS, raw?.preset) ? raw.preset : 'balanced',
})
const timing = (value, min, max) => typeof value === 'number' && Number.isFinite(value)
  ? Math.round(Math.min(max, Math.max(min, value))) : null
export const normalizeAnimation = (raw) => ({
  type: MOTION_TYPES.includes(raw?.type) ? raw.type : 'none',
  duration: timing(raw?.duration, 100, 1200),
  delay: timing(raw?.delay, 0, 2000),
  easing: ['ease-out', 'ease-in-out', 'linear'].includes(raw?.easing) ? raw.easing : 'ease-out',
  trigger: raw?.trigger === 'load' ? 'load' : 'scroll',
})
export const resolveAnimation = (raw, siteMotion, device) => {
  const animation = normalizeAnimation(raw)
  const preset = MOTION_PRESETS[normalizeSiteMotion(siteMotion).preset]
  const mobile = device === 'mobile'
  return { ...animation,
    duration: mobile ? Math.min(animation.duration ?? preset.duration, 300) : animation.duration ?? preset.duration,
    delay: mobile ? Math.min(animation.delay ?? preset.delay, 200) : animation.delay ?? preset.delay,
    distance: mobile ? Math.min(preset.distance, 8) : preset.distance,
  }
}
export const getMotionProps = (raw, siteMotion, device, enabled) => {
  if (!enabled) return {}
  const animation = resolveAnimation(raw, siteMotion, device)
  if (animation.type === 'none') return {}
  return {
    'data-site-motion': animation.type,
    'data-motion-trigger': animation.trigger,
    style: {
      '--site-motion-duration': `${animation.duration}ms`,
      '--site-motion-delay': `${animation.delay}ms`,
      '--site-motion-distance': `${animation.distance}px`,
      '--site-motion-easing': animation.easing,
    },
  }
}
