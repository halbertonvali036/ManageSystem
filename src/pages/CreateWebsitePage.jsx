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
  TEMPLATE_TIER_LABELS,
} from '@/models/site'
import { SITE_THEME_PRESETS } from '@/models/siteTheme'
import {
  buildSiteContent,
  hasUserSiteContent,
  isValidSiteContentEmail,
  isValidSiteContentPhone,
  SITE_CONTENT_ABOUT_MAX,
  SITE_CONTENT_FIELDS,
  SITE_CONTENT_SHORT_FIELDS,
  SITE_CONTENT_SHORT_MAX,
} from '@/models/siteContent'
import siteService from '@/services/siteService'
import { SEED_STATUS, seedCreatedSite } from '@/services/siteSeedService'
import config from '@/config'
import {
  BackendNotConnectedError,
  getRequestErrorMessage,
  HTTP_STATUS,
  RequestError,
} from '@/services/httpClient'
import {
  SITES_PATH,
  SITE_DETAILS_PATH,
  SITE_EDITOR_PATH,
} from '@/utils/constants'

const LAST_STEP = 5

const STEPS = Object.freeze([
  { id: 'project', labelKey: 'createSite.stepProjectLabel' },
  { id: 'template', labelKey: 'createSite.stepTemplateLabel' },
  { id: 'info', labelKey: 'createSite.stepInfoLabel' },
  { id: 'style', labelKey: 'createSite.stepThemeLabel' },
  { id: 'review', labelKey: 'createSite.stepReviewLabel' },
])

/**
 * Backend field names that do not match the form's own names.
 *
 * `title` and `subdomain` are the two aliases the API contract allows for the
 * project name and URL. Content fields keep their exact names.
 */
const SERVER_FIELD_ALIASES = Object.freeze({
  name: 'name',
  title: 'name',
  slug: 'slug',
  subdomain: 'slug',
})

const CONTENT_FIELD_SET = new Set(SITE_CONTENT_FIELDS)

/** The first message in a backend field error, which is a `string[]`. */
const firstErrorMessage = (value) => {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim())?.trim() ?? ''
  }
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Reads `{ message, errors: { field: string[] } }` into form field errors.
 *
 * Unknown fields are ignored here: an error we cannot place is better shown in
 * the form's error area than attached to a field that does not exist.
 */
const getServerFieldErrors = (error) => {
  const raw = error?.data?.errors
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }

  const fieldErrors = {}
  for (const [key, value] of Object.entries(raw)) {
    const field = SERVER_FIELD_ALIASES[key] ?? (CONTENT_FIELD_SET.has(key) ? key : null)
    if (!field || fieldErrors[field]) {
      continue
    }
    const message = firstErrorMessage(value)
    if (message) {
      fieldErrors[field] = message
    }
  }
  return fieldErrors
}

const getServerMessage = (error) => {
  const value = error?.data?.message
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * A duplicate URL is reported as 409, as a 422 with a slug field error, or as a
 * plain message saying the slug/subdomain already exists.
 */
const isDuplicateSlugError = (error) => {
  if (!(error instanceof RequestError)) {
    return false
  }
  if (error.status === HTTP_STATUS.CONFLICT) {
    return true
  }
  if (error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    const raw = error.data?.errors
    if (raw && typeof raw === 'object' && ('slug' in raw || 'subdomain' in raw)) {
      return true
    }
  }
  const message = `${getServerMessage(error)} ${error.message ?? ''}`.toLocaleLowerCase()
  return (
    /(slug|subdomain)/.test(message) &&
    /(exist|taken|already|used|unique|in use|mövcud|istifadə|artıq)/.test(message)
  )
}

const stepForField = (field) => {
  if (field === 'name' || field === 'slug') {
    return 1
  }
  return CONTENT_FIELD_SET.has(field) ? 3 : LAST_STEP
}

/**
 * Create Website — five-step wizard.
 *
 * Steps are Project, Template, Your information, Site theme and Review.
 * Template and theme are front-end presets, so the whole flow can be completed
 * offline; the write itself still refuses to run until the backend exists, which
 * is what keeps the review step honest instead of showing a fake success.
 *
 * "Your information" is optional but travels with the create payload, so a new
 * project opens with the visitor's brand, hero and contact details instead of
 * the template's sample copy.
 *
 * The wizard opens on the template step when it is reached from a template card
 * (`?template=saas-starter`), so "start from this template" does not drop the
 * visitor back into an empty wizard with their choice forgotten.
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
    siteName: '',
    siteNameTouched: false,
    tagline: '',
    heroTitle: '',
    heroSubtitle: '',
    ctaLabel: '',
    aboutText: '',
    email: '',
    phone: '',
    address: '',
  })

  const [step, setStep] = useState(hasRequestedTemplate ? 2 : 1)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const panelRef = useRef(null)
  const fieldRefs = useRef({})
  const submitLockRef = useRef(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => {
      const next = { ...current, [name]: value }
      // The URL follows the name until the visitor edits it themselves.
      if (name === 'name' && !current.slugTouched) {
        next.slug = slugifySiteName(value)
      }
      // The brand starts as the project name until the visitor edits the brand
      // itself, so the information step opens with a sensible default.
      if (name === 'name' && !current.siteNameTouched) {
        next.siteName = value
      }
      if (name === 'siteName') {
        next.siteNameTouched = true
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

  const validateContent = () => {
    const nextErrors = {}
    for (const name of SITE_CONTENT_SHORT_FIELDS) {
      if ((values[name] ?? '').trim().length > SITE_CONTENT_SHORT_MAX) {
        nextErrors[name] = t('createSite.contentLengthError', {
          max: SITE_CONTENT_SHORT_MAX,
        })
      }
    }
    if ((values.aboutText ?? '').trim().length > SITE_CONTENT_ABOUT_MAX) {
      nextErrors.aboutText = t('createSite.contentLengthError', {
        max: SITE_CONTENT_ABOUT_MAX,
      })
    }
    if (!isValidSiteContentEmail(values.email)) {
      nextErrors.email = t('createSite.emailError')
    }
    if (!isValidSiteContentPhone(values.phone)) {
      nextErrors.phone = t('createSite.phoneError')
    }
    return nextErrors
  }

  const validateField = (name) => {
    if (name === 'name' || name === 'slug') {
      return validateProject()[name]
    }
    return validateContent()[name]
  }

  const goToStep = (nextStep) => {
    setStep(nextStep)
    setFormError('')
    // Move focus to the new panel so keyboard and screen-reader users land on
    // the step that just opened instead of the stepper above it.
    window.requestAnimationFrame(() => panelRef.current?.focus())
  }

  /**
   * Focuses a field after the step that owns it has rendered. The animation
   * frame waits for paint and the timer waits for React to re-enable the input
   * that was disabled while the request was in flight; focusing a disabled
   * input is silently ignored.
   */
  const focusField = (name) => {
    if (!name) return
    window.requestAnimationFrame(() => {
      window.setTimeout(() => fieldRefs.current[name]?.focus(), 0)
    })
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
    if (step === 3) {
      const nextErrors = validateContent()
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
    if (isSubmitting || submitLockRef.current) return

    const projectErrors = validateProject()
    const contentErrors = validateContent()
    const nextErrors = { ...projectErrors, ...contentErrors }
    setErrors(nextErrors)
    if (Object.keys(projectErrors).length > 0) {
      goToStep(1)
      return
    }
    if (Object.keys(contentErrors).length > 0) {
      goToStep(3)
      return
    }

    // The ref is the real guard: it stops a second submit even if the disabled
    // state has not reached the DOM yet.
    submitLockRef.current = true
    setIsSubmitting(true)
    setFormError('')
    try {
      // The draft is the local description of the project. `siteService` owns
      // the wire shape, and the same draft seeds the editor after creation.
      const draft = buildSiteDraft(values)
      const created = await siteService.createSite(draft)
      const createdId = created?.id ?? null

      /*
       * The project exists at this point. Seeding its first draft is a second
       * write, so a failure there must not turn into "could not create".
       */
      let notice = 'created'
      if (createdId) {
        try {
          const seed = await seedCreatedSite({
            siteId: createdId,
            name: draft.name,
            templateId: draft.templateId,
            themePresetId: draft.themePresetId,
            content: draft.content,
            t,
          })
          if (seed.status === SEED_STATUS.AUTH_EXPIRED) {
            // The auth layer is already redirecting to the expired-session page.
            return
          }
          if (seed.status === SEED_STATUS.PENDING) {
            notice = 'seedPending'
          }
        } catch {
          /*
           * The project exists, so an unexpected seeding problem must not be
           * reported as a failed creation. The editor can still start from the
           * template when it finds no draft.
           */
        }
      }

      navigate(createdId ? SITE_DETAILS_PATH(createdId) : SITES_PATH, {
        state: createdId ? { notice } : undefined,
      })
    } catch (error) {
      if (error instanceof BackendNotConnectedError) {
        setFormError(t('createSite.unavailableNotice'))
      } else {
        const fieldErrors = getServerFieldErrors(error)

        if (isDuplicateSlugError(error)) {
          const message =
            fieldErrors.slug ||
            getServerMessage(error) ||
            t('createSite.slugTakenError')
          setErrors((current) => ({ ...current, ...fieldErrors, slug: message }))
          goToStep(1)
          focusField('slug')
        } else if (Object.keys(fieldErrors).length > 0) {
          /*
           * A field error can belong to a step the visitor has already passed.
           * Show every mapped error, then return to the earliest step that owns
           * one and focus that field, so the message is not stranded off-screen.
           */
          setErrors((current) => ({ ...current, ...fieldErrors }))
          const earliest = Object.entries(fieldErrors).reduce(
            (best, [field]) => {
              const step = stepForField(field)
              return step < best.step ? { step, field } : best
            },
            { step: LAST_STEP, field: null },
          )
          goToStep(earliest.step)
          focusField(earliest.field)
        } else {
          setFormError(
            getRequestErrorMessage(error) || t('createSite.failedNotice'),
          )
        }
      }
    } finally {
      submitLockRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleOpenLocalEditor = () => {
    const projectErrors = validateProject()
    const contentErrors = validateContent()
    setErrors({ ...projectErrors, ...contentErrors })
    if (Object.keys(projectErrors).length > 0) {
      goToStep(1)
      return
    }
    if (Object.keys(contentErrors).length > 0) {
      goToStep(3)
      return
    }
    navigate(SITE_EDITOR_PATH('local-draft'), {
      state: { localDraft: buildSiteDraft(values) },
    })
  }

  const field = (name, label, options = {}) => {
    const {
      placeholder,
      helper,
      maxLength,
      multiline = false,
      inputType = 'text',
      inputMode,
      autoComplete,
      rows = 6,
      full = false,
    } = options
    const error = errors[name]
    const hintId = `create-site-${name}-hint`
    const errorId = `create-site-${name}-error`
    const describedBy = [helper ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined
    const controlProps = {
      id: `create-site-${name}`,
      className: `form__input${error ? ' form__input--error' : ''}`,
      name,
      placeholder,
      maxLength,
      value: values[name] ?? '',
      onChange: name === 'slug' ? handleSlugChange : updateField,
      ref: (node) => {
        fieldRefs.current[name] = node
      },
      onBlur: () =>
        setErrors((current) => ({
          ...current,
          [name]: validateField(name),
        })),
      disabled: isSubmitting,
      'aria-invalid': Boolean(error),
      'aria-describedby': describedBy,
      autoComplete,
      inputMode,
    }

    return (
      <div className={`form__field${full ? ' form__field--full' : ''}`} key={name}>
        <label className="form__label" htmlFor={`create-site-${name}`}>
          {label}
        </label>
        {multiline ? (
          <textarea {...controlProps} rows={rows} />
        ) : (
          <input {...controlProps} type={inputType} />
        )}
        {helper ? (
          <p className="form__hint" id={hintId}>
            {helper}
          </p>
        ) : null}
        {error ? (
          <p className="form__error" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  const template = getSiteTemplate(values.templateId)
  const theme = SITE_THEME_PRESETS.find((preset) => preset.id === values.themePresetId)
  const content = buildSiteContent(values)
  const contactLines = [content.email, content.phone, content.address].filter(Boolean)
  const hasContentInput =
    (values.siteNameTouched && values.siteName.trim() !== '') ||
    hasUserSiteContent(content)

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
                        <span className="template-option__title">
                          {t(item.nameKey)}
                          <span className="template-option__tier" data-tier={item.tier}>
                            {t(TEMPLATE_TIER_LABELS[item.tier])}
                          </span>
                        </span>
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

            {/* The optional "Your information" step. Nothing here is required:
                each field the visitor fills replaces matching template copy,
                while the brand falls back to the project name. */}
            {step === 3 ? (
              <>
                <h3 className="form__panel-title">{t('createSite.contentTitle')}</h3>
                <p className="form__hint">{t('createSite.contentHint')}</p>
                <div className="create-site-content-grid">
                  {field('siteName', t('createSite.siteNameLabel'), {
                    placeholder: t('createSite.siteNamePlaceholder'),
                    helper: t('createSite.siteNameHelper'),
                    maxLength: SITE_CONTENT_SHORT_MAX,
                    autoComplete: 'organization',
                  })}
                  {field('tagline', t('createSite.taglineLabel'), {
                    placeholder: t('createSite.taglinePlaceholder'),
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('heroTitle', t('createSite.heroTitleLabel'), {
                    placeholder: t('createSite.heroTitlePlaceholder'),
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('heroSubtitle', t('createSite.heroSubtitleLabel'), {
                    placeholder: t('createSite.heroSubtitlePlaceholder'),
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('ctaLabel', t('createSite.ctaLabelLabel'), {
                    placeholder: t('createSite.ctaLabelPlaceholder'),
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('aboutText', t('createSite.aboutTextLabel'), {
                    placeholder: t('createSite.aboutTextPlaceholder'),
                    helper: t('createSite.aboutTextHelper'),
                    maxLength: SITE_CONTENT_ABOUT_MAX,
                    multiline: true,
                    rows: 6,
                    full: true,
                  })}
                  {field('email', t('createSite.emailLabel'), {
                    placeholder: t('createSite.emailPlaceholder'),
                    inputType: 'email',
                    inputMode: 'email',
                    autoComplete: 'email',
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('phone', t('createSite.phoneLabel'), {
                    placeholder: t('createSite.phonePlaceholder'),
                    inputType: 'tel',
                    inputMode: 'tel',
                    autoComplete: 'tel',
                    maxLength: SITE_CONTENT_SHORT_MAX,
                  })}
                  {field('address', t('createSite.addressLabel'), {
                    placeholder: t('createSite.addressPlaceholder'),
                    autoComplete: 'street-address',
                    maxLength: SITE_CONTENT_SHORT_MAX,
                    full: true,
                  })}
                </div>
                <p className="create-site-content__note">
                  {t('createSite.contentOptionalNote')}
                </p>
              </>
            ) : null}

            {/*
              The theme step shows real token previews rather than the old
              "palette / font / radius" word salad, because those are the things
              the visitor will actually see on their site.
            */}
            {step === 4 ? (
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

            {step === 5 ? (
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
                  <div className="create-site-review__row">
                    <dt>{t('createSite.reviewBrand')}</dt>
                    <dd>{content.siteName || '—'}</dd>
                  </div>
                  {content.tagline ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewTagline')}</dt>
                      <dd>{content.tagline}</dd>
                    </div>
                  ) : null}
                  {content.heroTitle || content.heroSubtitle ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewHero')}</dt>
                      <dd>
                        {[content.heroTitle, content.heroSubtitle]
                          .filter(Boolean)
                          .join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                  {content.aboutText ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewAbout')}</dt>
                      <dd>{content.aboutText}</dd>
                    </div>
                  ) : null}
                  {contactLines.length ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewContact')}</dt>
                      <dd>{contactLines.join(' · ')}</dd>
                    </div>
                  ) : null}
                  {!hasContentInput ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewInfo')}</dt>
                      <dd>{t('createSite.reviewInfoEmpty')}</dd>
                    </div>
                  ) : null}
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
                {step === 3 && !hasContentInput
                  ? t('createSite.skip')
                  : t('common.continue')}
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
        {step === LAST_STEP && !config.api.baseUrl ? (
          <div className="local-draft-entry">
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleOpenLocalEditor}
            >
              {t('audit.localEditor')}
            </button>
            <p className="form__hint">{t('audit.localEditorHint')}</p>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default CreateWebsitePage
