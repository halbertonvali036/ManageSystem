import { ArrowRight, Globe2, LayoutTemplate, Lightbulb, MousePointer2, PanelsTopLeft, Plus, Rocket } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import '@/styles/builder-visual.css'

const stages = [
  ['idea', Lightbulb], ['template', LayoutTemplate], ['editor', PanelsTopLeft],
  ['website', Globe2], ['publish', Rocket],
]

/** Decorative product sketch, shared by auth and landing. No interactive controls. */
export default function BuilderVisual({ variant = 'hero' }) {
  const { t } = useTranslation()
  const copy = key => t(`builderVisual.${key}`)

  return (
    <div className={`builder-visual builder-visual--${variant}`} aria-hidden="true">
      <div className="builder-visual__scene">
        <svg className="builder-visual__connections" viewBox="0 0 600 440" fill="none" focusable="false">
          <g stroke="currentColor" strokeOpacity=".24">
            <path d="M92 104H175L220 149M430 160H520V315H444M116 312H176L215 269" />
            <circle cx="92" cy="104" r="4" /><circle cx="520" cy="160" r="4" />
            <circle cx="116" cy="312" r="4" /><circle cx="444" cy="315" r="4" />
          </g>
          <path className="builder-visual__signal" d="M98 104h34" stroke="currentColor" strokeWidth="2" />
          <path className="builder-visual__signal builder-visual__signal--later" d="M474 315h34" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="builder-visual__backplate" />
        <div className="builder-visual__editor">
          <div className="builder-visual__toolbar">
            <span className="builder-visual__dots"><i /><i /><i /></span>
            <span>{copy('editor')}</span><span className="builder-visual__draft">{copy('draft')}</span>
          </div>
          <div className="builder-visual__workspace">
            <div className="builder-visual__rail"><PanelsTopLeft /><LayoutTemplate /><Plus /></div>
            <div className="builder-visual__canvas">
              <div className="builder-visual__nav"><span /><i /><i /><i /></div>
              <div className="builder-visual__page-hero">
                <span className="builder-visual__kicker">{copy('yourSpace')}</span>
                <strong>{copy('pageTitle')}</strong>
                <span className="builder-visual__text-line" /><span className="builder-visual__text-line builder-visual__text-line--short" />
                <span className="builder-visual__page-cta">{copy('discover')} <ArrowRight size={10} /></span>
                <div className="builder-visual__sculpture"><span /><span /><span /></div>
                <span className="builder-visual__selection"><MousePointer2 size={13} />{copy('heroSection')}</span>
              </div>
              <div className="builder-visual__tiles"><span /><span /><span /></div>
            </div>
          </div>
        </div>
        <div className="builder-visual__float builder-visual__template">
          <span className="builder-visual__card-label"><LayoutTemplate size={13} />{copy('template')}</span>
          <div className="builder-visual__mini-page"><span /><i /><i /></div>
          <span className="builder-visual__card-note">{copy('blankCanvas')}</span>
        </div>
        <div className="builder-visual__float builder-visual__sections">
          <span className="builder-visual__card-label"><PanelsTopLeft size={13} />{copy('sections')}</span>
          <span className="builder-visual__section-row"><i />{copy('heroSection')}</span>
          <span className="builder-visual__section-row"><i />{copy('gallery')}</span>
          <span className="builder-visual__section-row"><i />{copy('contact')}</span>
        </div>
        <div className="builder-visual__float builder-visual__publish"><Rocket size={15} /><span>{copy('publish')}</span><ArrowRight size={13} /></div>
      </div>
      <div className="builder-visual__flow">
        {stages.map(([key, Icon], index) => (
          <div className="builder-visual__stage" key={key}>
            <span><Icon size={14} /><small>{String(index + 1).padStart(2, '0')}</small></span>
            <span>{copy(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
