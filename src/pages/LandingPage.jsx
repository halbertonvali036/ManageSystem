import AmbientVisual from '@/components/common/AmbientVisual'
import {
  ArrowRight,
  BellRing,
  FileText,
  Layers,
  LayoutTemplate,
  MonitorSmartphone,
  PanelsTopLeft,
  Rocket,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import BuilderVisual from '@/components/common/BuilderVisual'
import PricingSection from '@/components/landing/PricingSection'
import PublicFooter from '@/components/landing/PublicFooter'
import PublicHeader from '@/components/landing/PublicHeader'
import useTranslation from '@/hooks/useTranslation'
import '@/styles/landing.css'

/**
 * Product flow shown in the hero diagram and the feature grid.
 *
 * Icon and layout tone are static; every visible word is resolved through the
 * dictionary so the same cards render in Azerbaijani and English.
 */
const STEPS = [
  {
    key: 'step1',
    icon: PanelsTopLeft,
    tone: 'amber',
    flows: ['sites.emptyTitle', 'createSite.templateNone', 'createSite.reviewTitle'],
  },
  {
    key: 'step2',
    icon: SlidersHorizontal,
    tone: 'lime',
    flows: ['capabilities.pages.title', 'capabilities.appearance.title', 'capabilities.content.title'],
  },
  {
    key: 'step3',
    icon: Send,
    tone: 'accent',
    flows: ['capabilities.preview.title', 'workspace.publishingNote', 'nav.getStarted'],
  },
]

const CAPABILITIES = [
  {
    icon: PanelsTopLeft,
    tone: 'accent',
    size: 'lead',
    copyKey: 'projects',
    flows: ['sites.pageTitle', 'status.draft', 'workspace.recentTitle'],
  },
  {
    icon: Settings2,
    tone: 'accent',
    size: 'tall',
    copyKey: 'pages',
  },
  { icon: LayoutTemplate, tone: 'accent', copyKey: 'templates' },
  { icon: SlidersHorizontal, tone: 'lime', copyKey: 'appearance' },
  { icon: FileText, tone: 'amber', copyKey: 'content' },
  { icon: MonitorSmartphone, tone: 'accent', size: 'half', copyKey: 'preview' },
  { icon: Rocket, tone: 'amber', size: 'half', copyKey: 'publishing' },
  { icon: BellRing, tone: 'accent', size: 'half', copyKey: 'notifications' },
  { icon: ShieldCheck, tone: 'lime', size: 'half', copyKey: 'security' },
]

const STEP_INDEXES = ['01', '02', '03']

function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="landing-page" id="top">
      <PublicHeader />

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <AmbientVisual />
          <div className="landing-hero__inner">
            <div className="landing-hero__copy">
              <p className="landing-eyebrow anim-fade-up anim-delay-1">{t('landing.eyebrow')}</p>
              <h1 id="landing-title" className="anim-fade-up anim-delay-2">
                {t('landing.titleLine1')}<br />
                <span className="landing-hero__accent">{t('landing.titleAccent')}</span>
              </h1>
              <p className="landing-hero__description anim-fade-up anim-delay-3">
                {t('landing.description')}
              </p>
              <div className="landing-hero__actions anim-fade-up anim-delay-4">
                <Link to="/register" className="landing-button landing-button--primary">
                  {t('landing.primaryCta')} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/login" className="landing-button landing-button--secondary">
                  {t('landing.secondaryCta')}
                </Link>
                <a className="landing-hero__tertiary" href="#capabilities">
                  {t('landing.tertiaryCta')}
                </a>
              </div>
              <p className="landing-hero__flowline anim-fade-up anim-delay-5">
                <Layers size={15} aria-hidden="true" />
                <span>{t('landing.flowline')}</span>
              </p>
            </div>
            <BuilderVisual />
          </div>
        </section>

        <section className="landing-section landing-roles" id="workspaces" aria-labelledby="roles-title">
          <div className="landing-section__heading anim-fade-up">
            <p className="landing-eyebrow">{t('landing.stepsEyebrow')}</p>
            <h2 id="roles-title">{t('landing.stepsTitle')}</h2>
            <p>{t('landing.stepsDescription')}</p>
          </div>
          <div className="landing-roles__grid">
            {STEPS.map(({ key, icon: Icon, tone, flows }, position) => (
              <article
                className={`landing-role-card landing-role-card--${tone}${position === 0 ? ' landing-role-card--lead' : ''}`}
                key={key}
              >
                <div className="landing-role-card__top">
                  <span className="landing-role-card__index" aria-hidden="true">{STEP_INDEXES[position]}</span>
                  <span className="landing-role-card__icon"><Icon size={20} aria-hidden="true" /></span>
                </div>
                <div className="landing-role-card__tag" aria-hidden="true">{t(`landing.${key}.tag`)}</div>
                <h3>{t(`landing.${key}.title`)}</h3>
                <p>{t(`landing.${key}.description`)}</p>
                <ul className="landing-role-card__flows" aria-label={`${t(`landing.${key}.title`)} ${t('nav.features')}`}>
                  {flows.map((flow) => (
                    <li key={flow}>{t(flow)}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-section landing-capabilities"
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="landing-section__heading landing-section__heading--row anim-fade-up">
            <div>
              <p className="landing-eyebrow">{t('landing.capabilitiesEyebrow')}</p>
              <h2 id="capabilities-title">{t('landing.capabilitiesTitle')}</h2>
            </div>
            <p>{t('landing.capabilitiesDescription')}</p>
          </div>
          <div className="landing-feature-grid">
            {CAPABILITIES.map(({ icon: Icon, tone, size = 'third', copyKey, flows }) => (
              <article
                className={`landing-feature landing-feature--${tone} landing-feature--${size}`}
                key={copyKey}
              >
                <span className="landing-feature__icon"><Icon size={18} aria-hidden="true" /></span>
                <div className="landing-feature__body">
                  <h3>{t(`capabilities.${copyKey}.title`)}</h3>
                  <p>{t(`capabilities.${copyKey}.text`)}</p>
                </div>
                {flows && (
                  <ul className="landing-feature__flows" aria-label={t(`capabilities.${copyKey}.title`)}>
                    {flows.map((flow) => (
                      <li key={flow}>{t(flow)}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="landing-final-cta" aria-labelledby="landing-cta-title">
          <div className="landing-final-cta__content">
            <p className="landing-eyebrow">{t('landing.ctaEyebrow')}</p>
            <h2 id="landing-cta-title">{t('landing.ctaTitle')}</h2>
            <p>{t('landing.ctaDescription')}</p>
          </div>
          <div className="landing-final-cta__actions">
            <Link to="/register" className="landing-button landing-button--light">
              {t('landing.ctaPrimary')} <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/login" className="landing-button landing-button--ghost-on-dark">
              {t('nav.signIn')}
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default LandingPage
