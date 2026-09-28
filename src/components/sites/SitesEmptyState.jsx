import { Link } from 'react-router-dom'
import { ArrowRight, LayoutTemplate, Plus } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { NEW_SITE_PATH, TEMPLATES_PATH } from '@/utils/constants'

/**
 * Onboarding empty state.
 *
 * Used whenever the account genuinely has no projects. It never renders sample
 * projects — it explains what the workspace is for and offers the two real ways
 * forward: create a website, or start from a template.
 */
function SitesEmptyState({
  variant = 'full',
  titleKey = 'sites.emptyTitle',
  textKey = 'sites.emptyText',
  ctaKey = 'sites.newCta',
}) {
  const { t } = useTranslation()
  const isCompact = variant === 'compact'

  return (
    <div className={`site-empty${isCompact ? ' site-empty--compact' : ''}`}>
      <div className="site-empty__art" aria-hidden="true">
        <span className="site-empty__art-glow" />
        <span className="site-empty__art-frame">
          <span className="site-empty__art-bar" />
          <span className="site-empty__art-line" />
          <span className="site-empty__art-line site-empty__art-line--short" />
        </span>
        <span className="site-empty__art-badge">
          <Plus size={18} />
        </span>
      </div>

      <h3 className="site-empty__title">{t(titleKey)}</h3>
      <p className="site-empty__text">{t(textKey)}</p>

      <div className="site-empty__actions">
        <Link to={NEW_SITE_PATH} className="btn btn--primary site-empty__cta">
          <Plus size={16} aria-hidden="true" />
          {t(ctaKey)}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>

        {isCompact ? null : (
          <Link to={TEMPLATES_PATH} className="btn btn--outline site-empty__cta">
            <LayoutTemplate size={16} aria-hidden="true" />
            {t('sites.browseTemplates')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default SitesEmptyState
