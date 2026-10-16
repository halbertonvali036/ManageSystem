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
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * One starter template.
 *
 * The card shows the template's own identity rather than a generic placeholder:
 * the preview is drawn from its real first page with its own theme tokens, and
 * those tokens also tint the frame and the category label, so the grid does not
 * read as one repeated card thirteen times.
 *
 * The tier is stated plainly rather than implied. Nothing here enforces it: "Use
 * template" still goes to the create wizard with this template preselected,
 * exactly as a free one does.
 */
function TemplateCard({ template, onPreview }) {
  const { t } = useTranslation()
  const theme = getSiteTheme(template.themePreset)
  const sectionCount = countTemplateSections(template)

  return (
    <li
      className="template-card"
      data-tier={template.tier}
      data-theme={theme.id}
      style={{ '--template-accent': theme.tokens.primary }}
    >
      <div className="template-card__frame">
        <span className="template-card__tier" data-tier={template.tier}>
          {t(TEMPLATE_TIER_LABELS[template.tier])}
        </span>
        <TemplateStructurePreview template={template} variant="card" />
      </div>

      <div className="template-card__body">
        <p className="template-card__category">
          {t(TEMPLATE_CATEGORY_LABELS[template.category] ?? 'templates.categoryBasic')}
        </p>
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
        <Link
          to={`${NEW_SITE_PATH}?template=${template.id}`}
          className="btn btn--primary btn--sm"
        >
          <LayoutTemplate size={14} aria-hidden="true" />
          {t('templates.useTemplate')}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </li>
  )
}

export default TemplateCard
