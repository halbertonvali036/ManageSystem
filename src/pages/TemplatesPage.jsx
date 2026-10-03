import { LayoutTemplate, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TemplateCard from '@/components/sites/TemplateCard'
import useTranslation from '@/hooks/useTranslation'
import {
  ALL_TEMPLATE_CATEGORIES,
  filterTemplatesByCategory,
  TEMPLATE_CATEGORIES,
} from '@/models/siteTemplate'
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * Templates.
 *
 * A short list of starter structures, not a marketplace. Each card previews the
 * template's real page and section skeleton and hands the visitor to the create
 * wizard with that template already chosen. Nothing here creates a project, and
 * nothing here claims a project exists.
 */
function TemplatesPage() {
  const { t } = useTranslation()
  const [category, setCategory] = useState(ALL_TEMPLATE_CATEGORIES)

  const templates = useMemo(() => filterTemplatesByCategory(category), [category])

  return (
    <div className="sites-page templates-page">
      <header className="sites-page__head">
        <div className="sites-page__headline">
          <p className="templates-page__eyebrow"><LayoutTemplate size={15} aria-hidden="true" />{t('builderPolish.templateEyebrow')}</p>
          <h1 className="sites-page__title">{t('templates.pageTitle')}</h1>
          <p className="page-description">{t('templates.pageDescription')}</p>
        </div>
        <Link to={NEW_SITE_PATH} className="btn btn--primary sites-page__cta">
          <Plus size={16} aria-hidden="true" />
          {t('sites.newCta')}
        </Link>
      </header>

      <div className="templates-page__browse">
      <div
        className="templates-filter"
        role="group"
        aria-label={t('templates.filterLabel')}
      >
        {TEMPLATE_CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="templates-filter__item"
            aria-pressed={category === entry.id}
            onClick={() => setCategory(entry.id)}
          >
            {t(entry.labelKey)}
          </button>
        ))}
      </div>
        <p className="templates-page__count" role="status">{t('builderPolish.templateCount', { count: templates.length })}</p>
      </div>

      {templates.length ? (
        <ul className="templates-grid">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </ul>
      ) : (
        <div className="templates-empty">
          <LayoutTemplate size={28} aria-hidden="true" />
          <p className="templates-empty__text">{t('templates.emptyText')}</p>
          <button type="button" className="btn btn--outline" onClick={() => setCategory(ALL_TEMPLATE_CATEGORIES)}>{t('templates.filterAll')}</button>
        </div>
      )}

      <p className="templates-note">{t('templates.note')}</p>
    </div>
  )
}

export default TemplatesPage
