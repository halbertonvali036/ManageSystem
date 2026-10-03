import { useId } from 'react'
import { ArrowRight, Check, Globe2, LayoutTemplate, Lightbulb, MousePointer2, Palette, PanelsTopLeft, Plus, Rocket, Type, AlignLeft, Image, RectangleHorizontal, Layers, TextCursorInput, Undo2, Redo2, Monitor, Smartphone, Square } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import '@/styles/builder-visual.css'

const stages = [
  ['idea', Lightbulb], ['template', LayoutTemplate], ['editor', PanelsTopLeft],
  ['website', Globe2], ['publish', Rocket],
]

const heroTools = [['heading', Type], ['text', AlignLeft], ['image', Image], ['button', RectangleHorizontal], ['section', Layers], ['form', TextCursorInput], ['more', Plus]]

/** Local SVG scenery keeps every preview crisp without network image requests. */
function HeroLandscape() {
  const id = useId().replace(/:/g, '')
  return <svg className="hero-builder__landscape" viewBox="0 0 700 400" preserveAspectRatio="xMidYMid slice" focusable="false">
    <defs>
      <linearGradient id={`${id}-sky`} x2=".8" y2="1"><stop stopColor="#749b9a" /><stop offset=".6" stopColor="#dce0c9" /><stop offset="1" stopColor="#eae5c9" /></linearGradient>
      <linearGradient id={`${id}-lake`} x2="0" y2="1"><stop stopColor="#507f73" /><stop offset=".5" stopColor="#264f49" /><stop offset="1" stopColor="#0a302f" /></linearGradient>
      <linearGradient id={`${id}-ridge`} x2=".6" y2="1"><stop stopColor="#577875" /><stop offset="1" stopColor="#153f3b" /></linearGradient>
      <linearGradient id={`${id}-shade`} x2="1" y2="1"><stop stopColor="#001710" stopOpacity=".05" /><stop offset="1" stopColor="#001710" stopOpacity=".6" /></linearGradient>
    </defs>
    <path fill={`url(#${id}-sky)`} d="M0 0h700v400H0z" />
    <g fill="none" stroke="#fff" opacity=".2" strokeWidth="2"><path d="M200 55q120-25 300 5M290 40q110-10 210 6M400 85q80-20 260-6" /></g>
    <path fill="#90a7a0" d="m0 180 80-76 50 48 81-101 72 98 57-49 40 44 80-66 70 66 80-60 90 68v148H0Z" />
    <path fill="#d9e1d7" d="m160 114 51-63 72 98-51-35-21-30-18 39-14-17Zm252-2 48-34 70 66-58-29-12-19-21 29Z" />
    <path fill={`url(#${id}-ridge)`} d="m0 90 75 62 44-20 94 98 77-35 45 46 97-76 48 16 104-85 35 44 81-65v240H0Z" />
    <path fill="#76928a" opacity=".6" d="m0 90 75 62 44-20 94 98-98-67-23 21-31-27Zm432 75 48 16 104-85-49 75-43 23-17-3-40 20Z" />
    <path fill={`url(#${id}-lake)`} d="M0 263q90-30 183-15t148 2q100-7 166-16t203 33v133H0Z" />
    <path fill="#87a699" opacity=".14" d="m150 263 63 90 77-64 45 50 97-69 48 5 104-30-90 118-74-16-67 53H220Z" />
    <path fill="#183f29" d="M700 130q-88 80-132 95t-111 37l108 9 135-4ZM0 207l110 25 114 29-124 16L0 303Z" />
    <g fill="#173c2b">{Array.from({length: 27}, (_, i) => { const x = 480 + i * 9; const y = 246 - i * 3.5; const h = 18 + (i % 5) * 8; return <path key={i} d={`M${x} ${y-h}l-8 ${h*.7}h4l-8 ${h*.4}h24l-8-${h*.4}h4Z`} /> })}</g>
    <g stroke="#cfdbb7" strokeWidth="1" opacity=".22"><path d="M240 276h126m42-9h62M174 300h156m30 20h117m-288 22h80m47 24h179m-38-73h67M120 385h190" /></g>
    <path fill={`url(#${id}-shade)`} d="M0 0h700v400H0z" />
  </svg>
}

function HeroBuilderVisual() {
  const { t } = useTranslation()
  const copy = key => t(`landingHero.visual.${key}`)
  return <div className="hero-builder" aria-hidden="true">
    <div className="hero-builder__scene">
      <div className="hero-builder__aura" /><div className="hero-builder__orbit" />
      <div className="hero-builder__editor">
        <div className="hero-builder__toolbar">
          <span className="hero-builder__brand"><LayoutTemplate /></span>
          <Undo2 /><Redo2 /><span className="hero-builder__divider" /><Monitor /><Smartphone />
          <span className="hero-builder__draft">{copy('draft')}</span>
          <span className="hero-builder__publish"><Rocket />{copy('publish')}</span>
        </div>
        <div className="hero-builder__workspace">
          <div className="hero-builder__rail">{heroTools.map(([key, Icon]) => <span key={key}><Icon />{copy(`tools.${key}`)}</span>)}</div>
          <div className="hero-builder__canvas">
            <div className="hero-builder__page-nav"><span><Globe2 />{copy('website')}</span><i /><i /><i /></div>
            <div className="hero-builder__page-hero">
              <HeroLandscape />
              <div className="hero-builder__selection"><i /><i /><i /><i /></div>
              <div className="hero-builder__page-copy"><strong>{copy('pageTitle')}</strong><p>{copy('pageDescription')}</p><span>{copy('discover')} <ArrowRight /></span></div>
            </div>
            <div className="hero-builder__tiles">{[0,1,2].map(index => <div key={index}><div><HeroLandscape /></div><i /><i /></div>)}</div>
          </div>
        </div>
      </div>
      <div className="hero-builder__template hero-builder__glass">
        <strong><LayoutTemplate />{copy('template')}</strong>
        <div className="hero-builder__mini"><div className="hero-builder__mini-nav"><i /><i /><i /></div><HeroLandscape /><span>{copy('pageTitle')}</span></div>
        <div className="hero-builder__thumbnails">{[0,1,2].map(index => <div key={index}><HeroLandscape /></div>)}</div>
      </div>
      <div className="hero-builder__sections hero-builder__glass">
        <strong><Layers />{copy('sections')}</strong>
        {['heroSection', 'gallery', 'contact', 'services', 'reviews'].map((key, index) => <div className={`hero-builder__section${index === 0 ? ' hero-builder__section--selected' : ''}`} key={key}>{index === 0 ? <PanelsTopLeft /> : index === 3 ? <Check /> : <Square />}{copy(key)}</div>)}
      </div>
      <span className="hero-builder__cursor"><MousePointer2 /><span>{copy('editor')}</span></span>
    </div>
    <div className="hero-builder__flow">{stages.map(([key, Icon], index) => <div className={`hero-builder__stage hero-builder__stage--edge${index === 4 ? ' hero-builder__stage--active' : ''}`} key={key}><div><Icon /><span>{String(index + 1).padStart(2, '0')}</span></div><strong>{copy(key)}</strong></div>)}</div>
  </div>
}

/** Decorative product sketch, shared by auth and landing. No interactive controls. */
export default function BuilderVisual({ variant = 'hero' }) {
  const { t } = useTranslation()
  const copy = key => t(`builderVisual.${key}`)
  const isAuth = variant === 'auth'
  const visibleStages = isAuth ? stages.filter(([key]) => key !== 'website') : stages

  if (variant === 'hero') return <HeroBuilderVisual />

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
        {isAuth && <div className="builder-visual__float builder-visual__idea">
          <span className="builder-visual__card-label"><Lightbulb size={13} />{copy('idea')}</span>
          <span className="builder-visual__idea-copy">{copy('ideaPrompt')}</span>
          <span className="builder-visual__idea-line" />
        </div>}
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
        {isAuth && <div className="builder-visual__float builder-visual__styles">
          <span className="builder-visual__card-label"><Palette size={13} />{copy('style')}</span>
          <div className="builder-visual__swatches"><i><Check size={10} /></i><i /><i /><i /></div>
          <div className="builder-visual__type-sample"><strong>Aa</strong><span>{copy('yourStyle')}</span></div>
        </div>}
        <div className="builder-visual__float builder-visual__publish"><Rocket size={15} />
          <span>{copy('publish')}{isAuth && <small>{copy('launchReady')}</small>}</span>
          {isAuth ? <span className="builder-visual__status-dot" /> : <ArrowRight size={13} />}
        </div>
      </div>
      <div className="builder-visual__flow">
        {visibleStages.map(([key, Icon], index) => (
          <div className="builder-visual__stage" key={key}>
            <span><Icon size={14} /><small>{String(index + 1).padStart(2, '0')}</small></span>
            <span>{copy(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
