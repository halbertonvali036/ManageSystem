import { AlertCircle, ArrowLeft, ArrowRight, Check, Eye, LayoutTemplate, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import useTranslation from '@/hooks/useTranslation'
import {
  buildSiteDraft,
  countTemplateSections,
  DEFAULT_SITE_TEMPLATE_ID,
  DEFAULT_SITE_THEME_ID,
  getSiteTemplate,
  getTemplateThemePresetId,
  isValidSiteName,
  isValidSiteSlug,
  isValidSiteTemplateId,
  slugifySiteName,
  SITE_NAME_MAX_LENGTH,
  SITE_TEMPLATES,
  SLUG_MAX_LENGTH,
} from '@/models/site'
import { SITE_THEME_PRESETS } from '@/models/siteTheme'
import siteService from '@/services/siteService'
import config from '@/config'
import { BackendNotConnectedError } from '@/services/httpClient'
import { SITES_PATH, SITE_DETAILS_PATH, SITE_EDITOR_PATH } from '@/utils/constants'

const LAST_STEP = 4

const STEPS = Object.freeze([
  { id: 'project', labelKey: 'createSite.stepProjectLabel' },
  { id: 'template', labelKey: 'createSite.stepTemplateLabel' },
  { id: 'style', labelKey: 'createSite.stepThemeLabel' },
  { id: 'review', labelKey: 'createSite.stepReviewLabel' },
])

/**
 * Create Website — four-step wizard.
 *
 * Steps are Project, Template, Site theme and Review. Template and theme are
 * front-end presets, so the whole flow can be completed offline; the write itself
 * still refuses to run until the backend exists, which is what keeps the review
 * step honest instead of showing a fake success.
 *
 * The wizard opens on the template step when it is reached from a template card
 * (`?template=business`), so "start from this template" does not drop the visitor
 * back into an empty wizard with their choice forgotten.
 */
function CreateWebsitePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const requestedTemplateId = searchParams.get('template')
  const hasRequestedTemplate = isValidSiteTemplateId(requestedTemplateId)
  const requestedTemplate = hasRequestedTemplate ? getSiteTemplate(requestedTemplateId) : null

  const [values, setValues] = useState({
    name: '',
    slug: '',
    slugTouched: false,
    templateId: hasRequestedTemplate ? requestedTemplateId : DEFAULT_SITE_TEMPLATE_ID,
    // A template that names a theme starts on that theme; otherwise the default.
    themePresetId: hasRequestedTemplate
      ? getTemplateThemePresetId(requestedTemplateId)
      : DEFAULT_SITE_THEME_ID,
  })

  const [step, setStep] = useState(hasRequestedTemplate ? 2 : 1)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const panelRef = useRef(null)

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => {
      const next = { ...current, [name]: value }
      // The URL follows the name until the visitor edits it themselves.
      if (name === 'name' && !current.slugTouched) {
        next.slug = slugifySiteName(value)
      }
      // Choosing a theme is an explicit choice, so the template's suggestion
      // stops following the template from this point on.
      if (name === 'templateId') {
        next.themePresetId = getTemplateThemePresetId(value)
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError('')
  }

  const handleSlugChange = (event) => {
    setValues((current) => ({
      ...current,
      slug: event.target.value,
      slugTouched: true,
    }))
    setErrors((current) => ({ ...current, slug: undefined }))
  }

  const validateProject = () => {
    const nextErrors = {}
    if (!isValidSiteName(values.name)) {
      nextErrors.name = t('createSite.nameError')
    }
    if (!isValidSiteSlug(values.slug)) {
      nextErrors.slug = t('createSite.slugError')
    }
    return nextErrors
  }

  const goToStep = (nextStep) => {
    setStep(nextStep)
    setFormError('')
    // Move focus to the new panel so keyboard and screen-reader users land on
    // the step that just opened instead of the stepper above it.
    window.requestAnimationFrame(() => panelRef.current?.focus())
  }

  const handleContinue = (event) => {
    event.preventDefault()
    if (step === 1) {
      const nextErrors = validateProject()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        return
      }
    }
    goToStep(Math.min(step + 1, LAST_STEP))
  }

  const handleBack = () => {
    goToStep(Math.max(step - 1, 1))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateProject()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      goToStep(1)
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      // `templateId` travels with the draft so a future backend can build the
      // project's pages from the template's section skeleton.
      const created = await siteService.createSite(buildSiteDraft(values))
      navigate(created?.id ? SITE_DETAILS_PATH(created.id) : SITES_PATH)
    } catch (error) {
      setFormError(
        error instanceof BackendNotConnectedError
          ? t('createSite.unavailableNotice')
          : t('createSite.failedNotice'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const field = (name, label, options = {}) => {
    const { placeholder, helper, maxLength } = options
    const error = errors[name]
    const describedBy = error
      ? `create-site-${name}-error`
      : helper
        ? `create-site-${name}-hint`
        : undefined

    return (
      <div className="form__field" key={name}>
        <label className="form__label" htmlFor={`create-site-${name}`}>
          {label}
        </label>
        <input
          id={`create-site-${name}`}
          className={`form__input${error ? ' form__input--error' : ''}`}
          type="text"
          name={name}
          placeholder={placeholder}
          maxLength={maxLength}
          value={values[name]}
          onChange={name === 'slug' ? handleSlugChange : updateField}
          onBlur={() =>
            setErrors((current) => ({
              ...current,
              [name]: validateProject()[name],
            }))
          }
          disabled={isSubmitting}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {helper ? (
          <p className="form__hint" id={`create-site-${name}-hint`}>
            {helper}
          </p>
        ) : null}
        {error ? (
          <p className="form__error" id={`create-site-${name}-error`}>
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  const template = getSiteTemplate(values.templateId)
  const theme = SITE_THEME_PRESETS.find((preset) => preset.id === values.themePresetId)

  return (
    <div className="sites-page create-site-page">
      <div className="create-site-page__head">
        <p className="landing-eyebrow">{t('createSite.eyebrow')}</p>
        <h1 className="create-site-page__title">{t('createSite.title')}</h1>
        <p className="create-site-page__subtitle">{t('createSite.subtitle')}</p>
      </div>

      {hasRequestedTemplate ? (
        <p className="create-site-page__preset" role="status">
          <LayoutTemplate size={16} aria-hidden="true" />
          <span>{t('createSite.presetFrom', { name: t(requestedTemplate.nameKey) })}</span>
        </p>
      ) : null}

      <ol className="create-site-steps" aria-label={t('createSite.progressLabel')}>
        {STEPS.map((item, index) => {
          const position = index + 1
          const state =
            position === step
              ? 'create-site-steps__item--active'
              : position < step
                ? 'create-site-steps__item--done'
                : ''
          return (
            <li
              className={`create-site-steps__item${state ? ` ${state}` : ''}`}
              key={item.id}
              aria-current={position === step ? 'step' : undefined}
            >
              <span className="create-site-steps__marker" aria-hidden="true">
                {position < step ? <Check size={14} /> : position}
              </span>
              <span className="create-site-steps__label">{t(item.labelKey)}</span>
            </li>
          )
        })}
      </ol>

      <Card>
        <form
          className="form"
          onSubmit={step < LAST_STEP ? handleContinue : handleSubmit}
          noValidate
        >
          {formError ? (
            <div className="form__error-area" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div
            className="form__panel anim-fade-up"
            key={`create-step-${step}`}
            ref={panelRef}
            tabIndex={-1}
          >
            {step === 1 ? (
              <>
                <h3 className="form__panel-title">{t('createSite.projectTitle')}</h3>
                <p className="form__hint">{t('createSite.projectHint')}</p>
                {field('name', t('createSite.nameLabel'), {
                  placeholder: t('createSite.namePlaceholder'),
                  helper: t('createSite.nameHelper'),
                  maxLength: SITE_NAME_MAX_LENGTH,
                })}
                {field('slug', t('createSite.slugLabel'), {
                  placeholder: t('createSite.slugPlaceholder'),
                  helper: t('createSite.slugHelper'),
                  maxLength: SLUG_MAX_LENGTH,
                })}
              </>
            ) : null}

            {step === 2 ? (
              <fieldset className="create-site-choice">
                <legend className="form__panel-title">{t('createSite.templateTitle')}</legend>
                <p className="form__hint">{t('createSite.templateHint')}</p>
                <div className="create-site-choice__grid">
                  {SITE_TEMPLATES.map((item) => (
                    <label
                      className="template-option"
                      key={item.id}
                      data-checked={values.templateId === item.id ? 'true' : undefined}
                    >
                      <input
                        className="create-site-choice__input"
                        type="radio"
                        name="templateId"
                        value={item.id}
                        checked={values.templateId === item.id}
                        onChange={updateField}
                        disabled={isSubmitting}
                      />
                      <span className="template-option__icon" aria-hidden="true">
                        <LayoutTemplate size={18} />
                      </span>
                      <span className="template-option__copy">
                        <span className="template-option__title">{t(item.nameKey)}</span>
                        <span className="template-option__text">{t(item.descriptionKey)}</span>
                        <span className="template-option__meta">
                          {t('templates.pageCount', { count: item.pages.length })}
                          {' · '}
                          {t('templates.sectionCount', { count: countTemplateSections(item) })}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {/*
              The theme step shows real token previews rather than the old
              "palette / font / radius" word salad, because those are the things
              the visitor will actually see on their site.
            */}
            {step === 3 ? (
              <fieldset className="create-site-choice">
                <legend className="form__panel-title">{t('createSite.themeTitle')}</legend>
                <p className="form__hint">{t('createSite.themeHint')}</p>
                <div className="create-site-choice__grid">
                  {SITE_THEME_PRESETS.map((preset) => (
                    <label
                      className="template-option"
                      key={preset.id}
                      data-checked={values.themePresetId === preset.id ? 'true' : undefined}
                    >
                      <input
                        className="create-site-choice__input"
                        type="radio"
                        name="themePresetId"
                        value={preset.id}
                        checked={values.themePresetId === preset.id}
                        onChange={updateField}
                        disabled={isSubmitting}
                      />
                      <span
                        className="create-site-theme-swatch"
                        aria-hidden="true"
                        style={{
                          background: preset.tokens.background,
                          color: preset.tokens.text,
                          borderRadius: preset.tokens.radiusScale,
                        }}
                      >
                        <span
                          className="create-site-theme-swatch__accent"
                          style={{ background: preset.tokens.accent }}
                        />
                        <span
                          className="create-site-theme-swatch__line"
                          style={{ background: preset.tokens.muted }}
                        />
                      </span>
                      <span className="template-option__copy">
                        <span className="template-option__title">{t(preset.nameKey)}</span>
                        <span className="template-option__text">{t(preset.descriptionKey)}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="form__hint">{t('createSite.themeNote')}</p>
              </fieldset>
            ) : null}

            {step === 4 ? (
              <>
                <h3 className="form__panel-title">{t('createSite.reviewTitle')}</h3>
                <p className="form__hint">{t('createSite.reviewHint')}</p>
                <dl className="create-site-review">
                  <div className="create-site-review__row">
                    <dt>{t('createSite.reviewName')}</dt>
                    <dd>{values.name}</dd>
                  </div>
                  <div className="create-site-review__row">
                    <dt>{t('createSite.reviewSlug')}</dt>
                    <dd>/{values.slug}</dd>
                  </div>
                  <div className="create-site-review__row">
                    <dt>{t('createSite.reviewTemplate')}</dt>
                    <dd>{t(template.nameKey)}</dd>
                  </div>
                  <div className="create-site-review__row">
                    <dt>{t('createSite.reviewTheme')}</dt>
                    <dd>{theme ? t(theme.nameKey) : '—'}</dd>
                  </div>
                </dl>
                <p className="create-site-review__note">
                  <Eye size={16} aria-hidden="true" />
                  <span>{t('createSite.reviewNote')}</span>
                </p>
              </>
            ) : null}
          </div>

          <div className="auth-register__actions">
            {step > 1 ? (
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {t('common.back')}
              </button>
            ) : (
              <Link to={SITES_PATH} className="btn btn--outline">
                {t('createSite.cancel')}
              </Link>
            )}

            {step < LAST_STEP ? (
              <button type="submit" className="btn btn--primary btn--block">
                {t('common.continue')}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    {t('createSite.submitting')}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} aria-hidden="true" />
                    {t('createSite.submit')}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
        {step === LAST_STEP && !config.api.baseUrl && <div className="local-draft-entry">
          <button type="button" className="btn btn--outline" onClick={() => {
            const nextErrors = validateProject()
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length) { goToStep(1); return }
            navigate(SITE_EDITOR_PATH('local-draft'), { state: { localDraft: buildSiteDraft(values) } })
          }}>{t('audit.localEditor')}</button>
          <p className="form__hint">{t('audit.localEditorHint')}</p>
        </div>}
      </Card>
    </div>
  )
}

export default CreateWebsitePage
