import { ArrowRight, Globe2, LayoutTemplate, Lightbulb, PanelsTopLeft, Rocket } from 'lucide-react'
import AmbientParticles from '@/components/common/AmbientParticles'
import '@/styles/landing-builder-visual.css'

const steps = [
  ['idea', Lightbulb], ['template', LayoutTemplate], ['editor', PanelsTopLeft],
  ['website', Globe2], ['publish', Rocket],
]
const labels = {
  idea: 'İdeya', template: 'Şablon', editor: 'Redaktor', website: 'Sayt', publish: 'Yayımla',
}

/**
 * Landing-only backdrop: particles, aurora, grid, connection lines and the
 * workflow ribbon. The editor mockup and its floating Template/Sections/Publish
 * cards were removed, so nothing here renders product UI anymore.
 */
export default function LandingBuilderVisual() {
  const copy = key => labels[key]

  return (
    <div className="landing-builder" aria-hidden="true">
      <AmbientParticles variant="landing" intensity="low" interactive />
      <div className="landing-builder__scene">
        <div className="landing-builder__aurora" />
        <div className="landing-builder__grid" />
        <svg className="landing-builder__connections" viewBox="0 0 560 440" fill="none" focusable="false">
          <g className="landing-builder__network">
            <path d="M66 94H142L184 136M423 112H509V285H448M72 323H137L199 376H421" />
            <circle cx="66" cy="94" r="3" /><circle cx="509" cy="112" r="3" />
            <circle cx="72" cy="323" r="3" /><circle cx="421" cy="376" r="3" />
          </g>
          <path className="landing-builder__signal" pathLength="100" d="M66 94H142L184 136M423 112H509V285H448" />
          <path className="landing-builder__streak" pathLength="100" d="M20 270Q100 100 300 55T540 95" />
          <path className="landing-builder__streak landing-builder__streak--later" pathLength="100" d="M25 355Q160 450 340 380T545 255" />
        </svg>
      </div>

      <ol className="landing-builder__flow">
        {steps.map(([key, Icon], index) => (
          <li key={key} className={key === 'editor' ? 'is-active' : undefined}>
            <span className="landing-builder__step-icon"><Icon size={15} /><small>{String(index + 1).padStart(2, '0')}</small></span>
            <span>{copy(key)}</span>
            {index < steps.length - 1 && <ArrowRight className="landing-builder__step-arrow" size={12} />}
          </li>
        ))}
      </ol>
    </div>
  )
}
