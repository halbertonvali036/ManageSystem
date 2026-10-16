import { LayoutTemplate, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TemplateCard from '@/components/sites/TemplateCard'
import TemplatePreviewDialog from '@/components/sites/TemplatePreviewDialog'
import useTranslation from '@/hooks/useTranslation'
import {
  ALL_TEMPLATE_CATEGORIES,
  ALL_TEMPLATE_TIERS,
  filterTemplates,
  SITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_TIERS,
} from '@/models/siteTemplate'
import { NEW_SITE_PATH } from '@/utils/constants'

/**
 * Templates.
 *
 * The gallery for the starter structures. It filters, searches and previews the
 * real skeletons, and hands the visitor to the create wizard with a template
 * already chosen. Nothing here creates a project, and nothing here claims a
 * project exists.
 *
 * The list is a local constant, so the gallery renders synchronously: there is
 * no request to wait on and no loading state to fake. Each card previews the
 * template's real first page; the multi-page view lives in the preview dialog,
 * which renders only the page being looked at.
 */
function TemplatesPage() {
  const { t } = useTranslation()
  const [category, setCategory] = useState(ALL_TEMPLATE_CATEGORIES)
  const [tier, setTier] = useState(ALL_TEMPLATE_TIERS)
  const [query, setQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const templates = useMemo(
    () => filterTemplates({ category, tier, query, t }),
    [category, tier, query, t],
  )

  const total = SITE_TEMPLATES.length
  const trimmedQuery = query.trim()
  const isFiltered =
    category !== ALL_TEMPLATE_CATEGORIES || tier !== ALL_TEMPLATE_TIERS || trimmedQuery !== ''

  const resetFilters = () => {
    setCategory(ALL_TEMPLATE_CATEGORIES)
    setTier(ALL_TEMPLATE_TIERS)
    setQuery('')
  }

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

      <div className="templates-browse">
        <div className="templates-browse__top">
          <div className="templates-browse__search">
            <label className="visually-hidden" htmlFor="templates-search">
              {t('templates.searchLabel')}
            </label>
            <Search className="templates-browse__search-icon" size={16} aria-hidden="true" />
            <input
              id="templates-search"
              className="templates-browse__search-input"
              type="search"
              value={query}
              placeholder={t('templates.searchPlaceholder')}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button
                type="button"
                className="templates-browse__search-clear"
                onClick={() => setQuery('')}
                aria-label={t('templates.searchClear')}
              >
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div
            className="templates-tier"
            role="group"
            aria-label={t('templates.tierFilterLabel')}
          >
            {TEMPLATE_TIERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="templates-tier__item"
                data-tier={entry.id}
                aria-pressed={tier === entry.id}
                onClick={() => setTier(entry.id)}
              >
                {t(entry.labelKey)}
              </button>
            ))}
          </div>
        </div>

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

        <div className="templates-browse__summary">
          <p className="templates-page__count" role="status">
            {isFiltered
              ? t('templates.resultCountFiltered', { shown: templates.length, total })
              : t('templates.resultCount', { count: total })}
          </p>
          <p className="templates-browse__legend">{t('templates.tierLegend')}</p>
          {isFiltered ? (
            <button type="button" className="templates-browse__reset" onClick={resetFilters}>
              <X size={14} aria-hidden="true" />
              {t('templates.clearFilters')}
            </button>
          ) : null}
        </div>
      </div>

      {templates.length ? (
        <ul className="templates-grid">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onPreview={setPreviewTemplate} />
          ))}
        </ul>
      ) : (
        <div className="templates-empty">
          <LayoutTemplate size={28} aria-hidden="true" />
          <p className="templates-empty__title">
            {isFiltered ? t('templates.emptyFilteredTitle') : t('templates.emptyTitle')}
          </p>
          <p className="templates-empty__text">
            {isFiltered ? t('templates.emptyFilteredText') : t('templates.emptyText')}
          </p>
          {isFiltered ? (
            <button type="button" className="btn btn--outline" onClick={resetFilters}>
              {t('templates.clearFilters')}
            </button>
          ) : (
            <Link to={NEW_SITE_PATH} className="btn btn--outline">{t('templates.emptyCta')}</Link>
          )}
        </div>
      )}

      <p className="templates-note">{t('templates.note')}</p>

      {previewTemplate ? (
        <TemplatePreviewDialog
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      ) : null}
    </div>
  )
}

export default TemplatesPage
