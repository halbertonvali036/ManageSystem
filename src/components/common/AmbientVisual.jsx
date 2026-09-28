import { useId } from 'react'

/** Decorative, bounded SVG/CSS foundation for auth/landing surfaces.
 * Inherits currentColor (or --ambient-color); no runtime loop or external asset.
 */
export default function AmbientVisual() {
  const id = useId()
  return <div className="ambient-visual" aria-hidden="true">
    <span className="ambient-visual__glow" />
    <svg viewBox="0 0 800 500" fill="none" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" stroke="currentColor" strokeOpacity=".1" />
      </pattern></defs>
      <rect width="800" height="500" fill={`url(#${id})`} />
      <g className="ambient-visual__nodes" stroke="currentColor" strokeOpacity=".2">
        <path d="M96 144L288 96L480 240L672 144M288 96L336 384L480 240L720 384" />
        {[[96, 144], [288, 96], [480, 240], [672, 144], [336, 384], [720, 384]].map(([x, y]) =>
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" fillOpacity=".3" />)}
      </g>
    </svg>
  </div>
}
