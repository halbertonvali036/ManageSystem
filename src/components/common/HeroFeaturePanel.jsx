import AmbientParticles from '@/components/common/AmbientParticles'
import useTranslation from '@/hooks/useTranslation'
import { Globe2, LayoutTemplate, Lightbulb, PanelsTopLeft, Rocket, Sparkles } from 'lucide-react'
import '@/styles/hero-feature-panel.css'

/** Mirrors the idea → template → editor → site → publish order used by
 *  BuilderVisual, so the panel and the product sketch describe one flow. */
const FEATURES = [
  { key: 'idea', icon: Lightbulb },
  { key: 'template', icon: LayoutTemplate },
  { key: 'editor', icon: PanelsTopLeft },
  { key: 'website', icon: Globe2 },
  { key: 'publish', icon: Rocket },
]

/** Premium feature panel for the landing hero. Decoration is a bounded
 *  AmbientParticles field plus CSS ribbons/mesh — no second animation engine.
 */
export default function HeroFeaturePanel() {
  const { t } = useTranslation()

  return (
    <section className="hero-panel anim-fade-up anim-delay-6" aria-labelledby="hero-panel-title">
      <span className="hero-panel__ambient" aria-hidden="true">
        <AmbientParticles variant="landing" intensity="low" />
        <span className="hero-panel__mesh" />
        <span className="hero-panel__ribbon hero-panel__ribbon--back" />
        <span className="hero-panel__ribbon hero-panel__ribbon--front" />
        <span className="hero-panel__bloom" />
      </span>

      <div className="hero-panel__content">
        <header className="hero-panel__head">
          <span className="hero-panel__icon">
            <Sparkles size={17} aria-hidden="true" />
          </span>
          <div className="hero-panel__headings">
            <h2 className="hero-panel__title" id="hero-panel-title">
              {t('landing.heroPanel.title')}
            </h2>
            <p className="hero-panel__status">
              <span className="hero-panel__pulse" aria-hidden="true" />
              {t('landing.heroPanel.status')}
            </p>
          </div>
        </header>

        <p className="hero-panel__description">{t('landing.heroPanel.description')}</p>

        <ol className="hero-panel__features">
          {FEATURES.map(({ key, icon: Icon }, index) => (
            <li className="hero-panel__feature" key={key}>
              <span className="hero-panel__feature-icon">
                <Icon size={14} aria-hidden="true" />
              </span>
              <span className="hero-panel__feature-label">
                {t(`landing.heroPanel.features.${key}`)}
              </span>
              <span className="hero-panel__feature-step" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
