import { ArrowRight, Check, Globe2, GripVertical, Image, LayoutTemplate, Lightbulb, Monitor, MousePointer2, PanelsTopLeft, Plus, Rocket } from 'lucide-react'
import AmbientParticles from '@/components/common/AmbientParticles'
import '@/styles/landing-builder-visual.css'

const steps = [
  ['idea', Lightbulb], ['template', LayoutTemplate], ['editor', PanelsTopLeft],
  ['website', Globe2], ['publish', Rocket],
]
const sections = [['heroSection', PanelsTopLeft], ['gallery', Image], ['services', LayoutTemplate], ['contact', Globe2]]
const labels = {
  idea: 'İdeya', template: 'Şablon', editor: 'Redaktor', website: 'Sayt', publish: 'Yayımla',
  draft: 'Qaralama', yourStyle: 'Sizin məkanınız', heroSection: 'Baş bölmə',
  gallery: 'Qalereya', services: 'Xidmətlər', contact: 'Əlaqə', sections: 'Bölmələr',
  blankCanvas: 'Yaradıcı portfolio', launchReady: 'Yayıma hazır dizayn',
}
const previewCards = [
  { title: 'Xidmətlər', description: 'Təkliflərinizi təqdim edin.', icon: LayoutTemplate },
  { title: 'Layihələr', description: 'İşlərinizi sərgiləyin.', icon: Image },
  { title: 'Üstünlüklər', description: 'Fərqinizi göstərin.', icon: Check },
]

/** Landing-only illustration. All controls are non-interactive visual samples. */
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
        <div className="landing-builder__backplate" />

        <div className="landing-builder__editor">
          <div className="landing-builder__toolbar">
            <span className="landing-builder__dots"><i /><i /><i /></span>
            <span><PanelsTopLeft size={13} />{copy('editor')}</span>
            <span className="landing-builder__draft"><i />{copy('draft')}</span>
          </div>
          <div className="landing-builder__workspace">
            <div className="landing-builder__rail"><PanelsTopLeft /><LayoutTemplate /><Plus /></div>
            <div className="landing-builder__page">
              <div className="landing-builder__page-bar"><span>Ana səhifə</span><Monitor size={12} /><span>100%</span></div>
              <div className="landing-builder__canvas">
                <div className="landing-builder__nav"><strong>{copy('yourStyle')}</strong><span>{copy('contact')}</span></div>
                <div className="landing-builder__selection">
                  <span className="landing-builder__section-tag">{copy('heroSection')}</span>
                  <div className="landing-builder__page-copy">
                    <strong>İdeyanız burada həyata keçir</strong>
                    <p>Öz üslubunuzu göstərin. İşlərinizi dünya ilə paylaşın.</p>
                    <span className="landing-builder__sample-cta">Ətraflı<ArrowRight size={12} /></span>
                  </div>
                  <div className="landing-builder__art"><span /><span /><span /></div>
                  <span className="landing-builder__cursor"><MousePointer2 size={16} /></span>
                </div>
                <div className="landing-builder__content-cards">
                  {previewCards.map(({ title, description, icon: Icon }) => (
                    <div className="landing-builder__content-card" key={title}>
                      <span><Icon size={13} /><strong>{title}</strong></span>
                      <p>{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="landing-builder__editor-foot"><span><Check size={12} />Dizayn önizləməsi</span><span><Monitor size={12} /><Globe2 size={12} /></span></div>
        </div>

        <div className="landing-builder__card landing-builder__template">
          <span className="landing-builder__card-title"><LayoutTemplate size={14} />{copy('template')}<Check size={12} /></span>
          <div className="landing-builder__template-preview">
            <span>{copy('blankCanvas')}</span><div className="landing-builder__template-art" /><i /><i />
          </div>
          <span className="landing-builder__note"><Check size={11} />Seçilmiş şablon</span>
        </div>

        <div className="landing-builder__card landing-builder__sections">
          <span className="landing-builder__card-title"><PanelsTopLeft size={14} />{copy('sections')}</span>
          {sections.map(([key, Icon], index) => (
            <div className={`landing-builder__section-row${index === 0 ? ' is-selected' : ''}`} key={key}>
              <GripVertical size={10} /><Icon size={12} /><span>{copy(key)}</span>
            </div>
          ))}
        </div>

        <div className="landing-builder__card landing-builder__publish">
          <span className="landing-builder__launch-icon"><Rocket size={17} /></span>
          <span><strong>{copy('publish')}</strong><small>{copy('launchReady')}</small></span>
          <span className="landing-builder__publish-arrow"><ArrowRight size={15} /></span>
        </div>
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
