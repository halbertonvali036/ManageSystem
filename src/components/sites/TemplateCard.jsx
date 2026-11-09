import { ArrowRight, Check, Eye, LayoutTemplate } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import TemplateStructurePreview from '@/components/sites/TemplateStructurePreview'
import {
  countTemplateSections,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_TIER_LABELS,
} from '@/models/siteTemplate'
import { getSiteTheme } from '@/models/siteTheme'
import { normalizeBackendCategoryId } from '@/models/templateCatalog'
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * One starter template.
 *
 * The card shows the template's own identity rather than a generic placeholder:
 * the preview is drawn from its real first page with its own theme tokens, and
 * those tokens also tint the frame and the category label, so the grid does not
 * read as one repeated card thirteen times.
 *
 * When a real backend is connected, `availability` says whether the server has
 * this template. A template with no backend match stays visible — the preview
 * is still useful — but its "Use template" action is inactive and it carries a
 * localized "Not available yet" badge. In demo mode `availability` is `demo`
 * and the card behaves exactly as before.
 */
function TemplateCard({ template, onPreview, availability = null }) {
  const { t } = useTranslation()
  const theme = getSiteTheme(template.themePreset)
  const sectionCount = countTemplateSections(template)

  const backendTemplate = availability?.backendTemplate ?? null
  const isBackendMode = Boolean(availability) && availability.status !== 'demo'
  const isUnavailable = isBackendMode && !availability.available
  const showUnavailableBadge =
    isBackendMode && ['missing', 'catalog-unavailable'].includes(availability.status)

  // The backend owns these two facts once it has the template. Until then the
  // static template still gives the card its honest frontend value.
  const tier = backendTemplate
    ? backendTemplate.premium
      ? 'pro'
      : 'free'
    : template.tier
  const backendCategoryId = normalizeBackendCategoryId(backendTemplate?.category)
  const categoryLabel = backendTemplate?.category
    ? backendCategoryId
      ? t(TEMPLATE_CATEGORY_LABELS[backendCategoryId])
      : backendTemplate.category
    : t(TEMPLATE_CATEGORY_LABELS[template.category] ?? 'templates.categoryBasic')

  return (
    <li
      className={`template-card${isUnavailable ? ' template-card--unavailable' : ''}`}
      data-tier={tier}
      data-theme={theme.id}
      data-unavailable={isUnavailable ? 'true' : undefined}
      style={{ '--template-accent': theme.tokens.primary }}
    >
      <div className="template-card__frame">
        <span className="template-card__tier" data-tier={tier}>
          {t(TEMPLATE_TIER_LABELS[tier])}
        </span>
        {showUnavailableBadge ? (
          <span className="template-card__unavailable">
            {t('templates.notAvailableYet')}
          </span>
        ) : null}
        <TemplateStructurePreview template={template} variant="card" />
      </div>

      <div className="template-card__body">
        <p className="template-card__category">{categoryLabel}</p>
        <h3 className="template-card__title">{t(template.nameKey)}</h3>
        <p className="template-card__text">{t(template.descriptionKey)}</p>

        {template.tags.length ? (
          <ul className="template-card__tags">
            {template.tags.map((tag) => <li key={tag}>{t(tag)}</li>)}
          </ul>
        ) : null}

        {template.features.length ? (
          <ul className="template-card__features">
            {template.features.map((feature) => (
              <li key={feature}>
                <Check size={14} aria-hidden="true" />
                {t(feature)}
              </li>
            ))}
          </ul>
        ) : null}

        <ul className="template-card__meta">
          <li>{t('templates.pageCount', { count: template.pages.length })}</li>
          <li>{t('templates.sectionCount', { count: sectionCount })}</li>
        </ul>
      </div>

      <div className="template-card__actions">
        {/*
          Preview and use are two different intentions, so they are two controls:
          a button that opens the read-only dialog, and a link into the create
          wizard. The template id travels in the query string rather than router
          state, so the link is a real, shareable URL.
        */}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => onPreview(template)}
        >
          <Eye size={14} aria-hidden="true" />
          {t('templates.previewAction')}
        </button>
        {isUnavailable ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled
            aria-disabled="true"
          >
            <LayoutTemplate size={14} aria-hidden="true" />
            {t('templates.useTemplate')}
          </button>
        ) : (
          <Link
            to={`${NEW_SITE_PATH}?template=${template.id}`}
            className="btn btn--primary btn--sm"
          >
            <LayoutTemplate size={14} aria-hidden="true" />
            {t('templates.useTemplate')}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </li>
  )
}

export default TemplateCard
