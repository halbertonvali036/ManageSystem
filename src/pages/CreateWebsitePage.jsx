import { AlertCircle, ArrowLeft, ArrowRight, Check, Eye, LayoutTemplate, RefreshCw, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import useTemplateCatalog from '@/hooks/useTemplateCatalog'
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
import { buildSiteSeedDocument } from '@/models/siteSeed'
import {
  buildSiteContent,
  getSupportedContentFields,
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
import {
  clearCreateWizardState,
  readCreateWizardState,
  writeCreateWizardState,
} from '@/services/createWizardStore'
import config from '@/config'
import {
  SITES_PATH,
  SITE_DETAILS_PATH,
  SITE_EDITOR_PATH,
} from '@/utils/constants'
import { LAST_STEP, planCreateFailure } from '@/services/createWizardErrors'

const STEPS = Object.freeze([
  { id: 'project', labelKey: 'createSite.stepProjectLabel' },
  { id: 'template', labelKey: 'createSite.stepTemplateLabel' },
  { id: 'info', labelKey: 'createSite.stepInfoLabel' },
  { id: 'style', labelKey: 'createSite.stepThemeLabel' },
  { id: 'review', labelKey: 'createSite.stepReviewLabel' },
])

/**
 * The content fields in the order the form shows them (a full-width about
 * block sits between the hero fields and the contact details). Labels and
 * placeholders stay in the i18n files; this only records which key is which.
 */
const contentFieldSpecs = (t) => [
  {
    name: 'siteName',
    label: t('createSite.siteNameLabel'),
    options: {
      placeholder: t('createSite.siteNamePlaceholder'),
      helper: t('createSite.siteNameHelper'),
      maxLength: SITE_CONTENT_SHORT_MAX,
      autoComplete: 'organization',
    },
  },
  {
    name: 'tagline',
    label: t('createSite.taglineLabel'),
    options: {
      placeholder: t('createSite.taglinePlaceholder'),
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'heroTitle',
    label: t('createSite.heroTitleLabel'),
    options: {
      placeholder: t('createSite.heroTitlePlaceholder'),
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'heroSubtitle',
    label: t('createSite.heroSubtitleLabel'),
    options: {
      placeholder: t('createSite.heroSubtitlePlaceholder'),
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'ctaLabel',
    label: t('createSite.ctaLabelLabel'),
    options: {
      placeholder: t('createSite.ctaLabelPlaceholder'),
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'aboutText',
    label: t('createSite.aboutTextLabel'),
    options: {
      placeholder: t('createSite.aboutTextPlaceholder'),
      helper: t('createSite.aboutTextHelper'),
      maxLength: SITE_CONTENT_ABOUT_MAX,
      multiline: true,
      rows: 6,
      full: true,
    },
  },
  {
    name: 'email',
    label: t('createSite.emailLabel'),
    options: {
      placeholder: t('createSite.emailPlaceholder'),
      inputType: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'phone',
    label: t('createSite.phoneLabel'),
    options: {
      placeholder: t('createSite.phonePlaceholder'),
      inputType: 'tel',
      inputMode: 'tel',
      autoComplete: 'tel',
      maxLength: SITE_CONTENT_SHORT_MAX,
    },
  },
  {
    name: 'address',
    label: t('createSite.addressLabel'),
    options: {
      placeholder: t('createSite.addressPlaceholder'),
      autoComplete: 'street-address',
      maxLength: SITE_CONTENT_SHORT_MAX,
      full: true,
    },
  },
]

/**
 * The blank form for a visit with no saved state. A `?template=` in the URL
 * picks the starting template and theme; without one the defaults apply.
 */
const createDefaultValues = (requestedTemplateId) => ({
  name: '',
  slug: '',
  slugTouched: false,
  templateId: requestedTemplateId ?? DEFAULT_SITE_TEMPLATE_ID,
  themePresetId: requestedTemplateId
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

/**
 * Restores a previous attempt on mount.
 *
 * A `?template=` that differs from the stored selection starts fresh with the
 * URL's template (on the Template step), so "use this template" can never be
 * hijacked by an earlier half-finished wizard. Everything else — the stored
 * values and the step — comes back as it was, with unknown ids falling back to
 * the defaults instead of a template the catalogue cannot resolve.
 */
const resolveInitialState = (requestedTemplateId) => {
  const defaults = createDefaultValues(requestedTemplateId)
  const saved = readCreateWizardState()

  if (requestedTemplateId && saved?.values?.templateId !== requestedTemplateId) {
    clearCreateWizardState()
    return { values: defaults, step: 2 }
  }
  if (!saved) {
    return { values: defaults, step: requestedTemplateId ? 2 : 1 }
  }

  const values = { ...defaults, ...saved.values }
  if (!isValidSiteTemplateId(values.templateId)) {
    values.templateId = defaults.templateId
  }
  if (!SITE_THEME_PRESETS.some((preset) => preset.id === values.themePresetId)) {
    values.themePresetId = defaults.themePresetId
  }
  return { values, step: saved.step }
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

  /*
   * Restores a previous attempt from sessionStorage on mount. The initializer
   * runs once, so a `?template=` that differs from the saved selection starts
   * fresh (and drops the saved state) while everything else comes back as it
   * was, step included.
   */
  const [initialState] = useState(() =>
    resolveInitialState(hasRequestedTemplate ? requestedTemplateId : null),
  )
  const [values, setValues] = useState(initialState.values)

  const {
    firstAvailableTemplateId,
    getAvailability,
    isBackendConnected,
    isCatalogUnavailable,
    isLoading: isCatalogLoading,
    refetch: refetchCatalog,
  } = useTemplateCatalog()

  /*
   * A real backend may not have the frontend's default (`blank`) or the template
   * named in the URL. The effective selection falls forward to the first
   * template the catalogue actually has, without writing a second copy into
   * state: every render derives it from the same two facts. Demo mode has no
   * fallback, so its starting state is unchanged.
   */
  const currentAvailability = getAvailability(values.templateId)
  const useFirstAvailableTemplate =
    isBackendConnected &&
    !currentAvailability.available &&
    Boolean(firstAvailableTemplateId)
  const activeTemplateId = useFirstAvailableTemplate
    ? firstAvailableTemplateId
    : values.templateId
  const activeThemePresetId =
    activeTemplateId === values.templateId
      ? values.themePresetId
      : getTemplateThemePresetId(activeTemplateId)

  const selectedAvailability = getAvailability(activeTemplateId)
  const isSelectedTemplateAvailable =
    !isBackendConnected || selectedAvailability.available
  const canCreateSite =
    !isBackendConnected || selectedAvailability.status === 'available'
  const draftValues = {
    ...values,
    templateId: activeTemplateId,
    themePresetId: activeThemePresetId,
  }

  /*
   * The content step shows only the fields this template can host. The probe
   * document is the template's own seed structure, and
   * `getSupportedContentFields` derives support from the same mapping the
   * create payload uses, so the form and the saved content can never
   * disagree about what a template ignores.
   */
  const probeDocument = useMemo(
    () =>
      buildSiteSeedDocument({
        templateId: activeTemplateId,
        themePresetId: activeThemePresetId,
        t,
      }),
    [activeTemplateId, activeThemePresetId, t],
  )
  const supportedContentSet = useMemo(
    () => new Set(getSupportedContentFields(probeDocument)),
    [probeDocument],
  )

  const [step, setStep] = useState(initialState.step)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const panelRef = useRef(null)
  const fieldRefs = useRef({})
  const submitLockRef = useRef(false)

  /*
   * Every change is mirrored into sessionStorage so a reload restores the
   * values and the step. Cleared on successful creation, on logout and on
   * session expiry, and by "Start over".
   */
  useEffect(() => {
    writeCreateWizardState({ values, step })
  }, [values, step])

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
      // A template chosen by the catalogue fallback is not stored in `values`
      // yet. Picking a theme also commits that template, so the theme choice is
      // not replaced by the fallback's suggestion on the next render.
      if (name === 'themePresetId') {
        next.templateId = activeTemplateId
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
    // Fields this template cannot host are not on the form and never block
    // the step; they are only ignored, not wrong.
    for (const name of SITE_CONTENT_SHORT_FIELDS) {
      if (!supportedContentSet.has(name)) continue
      if ((values[name] ?? '').trim().length > SITE_CONTENT_SHORT_MAX) {
        nextErrors[name] = t('createSite.contentLengthError', {
          max: SITE_CONTENT_SHORT_MAX,
        })
      }
    }
    if (
      supportedContentSet.has('aboutText') &&
      (values.aboutText ?? '').trim().length > SITE_CONTENT_ABOUT_MAX
    ) {
      nextErrors.aboutText = t('createSite.contentLengthError', {
        max: SITE_CONTENT_ABOUT_MAX,
      })
    }
    if (supportedContentSet.has('email') && !isValidSiteContentEmail(values.email)) {
      nextErrors.email = t('createSite.emailError')
    }
    if (supportedContentSet.has('phone') && !isValidSiteContentPhone(values.phone)) {
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

  /**
   * Live format feedback for the Project step: the message appears as soon as
   * a non-empty value breaks the rules (capitals or a double hyphen in the
   * URL, a name past its limit) and clears the moment the value is valid
   * again. Empty values stay quiet here — blur and submit still demand them
   * through `validateProject`.
   */
  const liveProjectError = (name) => {
    if (name !== 'name' && name !== 'slug') {
      return undefined
    }
    const value = values[name]
    if (typeof value !== 'string' || value === '') {
      return undefined
    }
    if (name === 'name') {
      return isValidSiteName(value) ? undefined : t('createSite.nameError')
    }
    return isValidSiteSlug(value) ? undefined : t('createSite.slugError')
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
    if (isSubmitting || submitLockRef.current) return
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

    /*
     * The create request must never carry a guessed template id. The button is
     * disabled in this state, but the guard also covers Enter-key submits and a
     * catalogue that failed after the review step rendered.
     */
    if (!canCreateSite) {
      setFormError(
        isCatalogUnavailable
          ? t('templates.catalogUnavailable')
          : t('createSite.templateUnavailable'),
      )
      goToStep(2)
      return
    }

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
      const draft = buildSiteDraft(draftValues)

      /*
       * The document the editor will open is built here, before the request,
       * with the same builder the editor uses when no server draft exists.
       * `buildSiteSeedDocument` runs `applySiteContent`, so the visitor's words
       * are already in the document that `POST /api/sites` stores as `content`.
       * Building it first is what makes the create request the only write.
       */
      const editorDocument = buildSiteSeedDocument({
        name: draft.name,
        templateId: draft.templateId,
        themePresetId: draft.themePresetId,
        content: draft.content,
        t,
      })

      const created = await siteService.createSite(draft, {
        content: editorDocument,
      })
      // The stored wizard state is spent the moment the project exists.
      clearCreateWizardState()
      const createdId = created?.id ?? null

      /*
       * The project and its first document now exist. Seeding only prepares the
       * editor's local fallback; it never writes a second draft to the backend.
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
            document: editorDocument,
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
      /*
       * Routing is decided by `planCreateFailure`: back to Project for a name
       * or slug problem (a duplicate URL focuses the slug field), to the
       * content step for content fields, to the Template step for template
       * errors, and no step change at all for network, 5xx or unknown
       * failures — which keeps the values exactly as they were typed.
       */
      const plan = planCreateFailure(error, t)
      if (plan.fieldErrors) {
        setErrors((current) => ({ ...current, ...plan.fieldErrors }))
      }
      if (plan.step !== null) {
        goToStep(plan.step)
        if (plan.focus) {
          focusField(plan.focus)
        }
      }
      // Set after goToStep, which clears the banner on every step change.
      if (plan.formError) {
        setFormError(plan.formError)
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
      state: { localDraft: buildSiteDraft(draftValues) },
    })
  }

  /**
   * Discards the saved attempt and returns to the wizard's starting point:
   * the Template step when the URL carried a template, the Project step
   * otherwise. The stored state is dropped first, so the next mount starts
   * fresh as well.
   */
  const handleStartOver = () => {
    clearCreateWizardState()
    setErrors({})
    setFormError('')
    setValues(createDefaultValues(hasRequestedTemplate ? requestedTemplateId : null))
    goToStep(hasRequestedTemplate ? 2 : 1)
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
    const error = errors[name] ?? liveProjectError(name)
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

  const template = getSiteTemplate(activeTemplateId)
  const theme = SITE_THEME_PRESETS.find((preset) => preset.id === activeThemePresetId)
  const content = buildSiteContent(values)
  const fieldSpecs = contentFieldSpecs(t)
  const ignoredContentLabels = fieldSpecs
    .filter((spec) => !supportedContentSet.has(spec.name))
    .map((spec) => spec.label)
  const contactLines = ['email', 'phone', 'address']
    .filter((name) => supportedContentSet.has(name))
    .map((name) => content[name])
    .filter(Boolean)
  const supportedContentInput = Object.fromEntries(
    SITE_CONTENT_FIELDS.filter((name) => supportedContentSet.has(name)).map((name) => [
      name,
      content[name],
    ]),
  )
  const hasContentInput =
    (supportedContentSet.has('siteName') &&
      values.siteNameTouched &&
      values.siteName.trim() !== '') ||
    hasUserSiteContent(supportedContentInput)

  /*
   * "Start over" is offered once there is an attempt worth discarding: any
   * typed value, a chosen template or theme, or a step away from where this
   * visit began.
   */
  const canStartOver =
    step !== initialState.step ||
    values.name !== '' ||
    values.slug !== '' ||
    hasContentInput ||
    values.templateId !== initialState.values.templateId ||
    values.themePresetId !== initialState.values.themePresetId

  return (
    <div className="sites-page create-site-page">
      <div className="create-site-page__head">
        <p className="landing-eyebrow">{t('createSite.eyebrow')}</p>
        <h1 className="create-site-page__title">{t('createSite.title')}</h1>
        <p className="create-site-page__subtitle">{t('createSite.subtitle')}</p>
      </div>

      {hasRequestedTemplate &&
      activeTemplateId === requestedTemplateId &&
      isSelectedTemplateAvailable ? (
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

          {isCatalogUnavailable ? (
            <div className="create-site-catalog-notice" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <div className="create-site-catalog-notice__copy">
                <p className="create-site-catalog-notice__title">
                  {t('templates.catalogUnavailable')}
                </p>
                <p className="create-site-catalog-notice__text">
                  {t('templates.catalogUnavailableHint')}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={refetchCatalog}
                disabled={isSubmitting}
              >
                <RefreshCw size={14} aria-hidden="true" />
                {t('templates.catalogRetry')}
              </button>
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
                {isBackendConnected && isCatalogLoading ? (
                  <p className="form__hint" role="status">
                    {t('templates.catalogLoading')}
                  </p>
                ) : null}
                <div className="create-site-choice__grid">
                  {SITE_TEMPLATES.map((item) => {
                    const itemAvailability = getAvailability(item.id)
                    const isItemUnavailable =
                      isBackendConnected && !itemAvailability.available
                    const backendTemplate = itemAvailability.backendTemplate
                    const tier = backendTemplate
                      ? backendTemplate.premium
                        ? 'pro'
                        : 'free'
                      : item.tier

                    return (
                      <label
                        className="template-option"
                        key={item.id}
                        data-checked={activeTemplateId === item.id ? 'true' : undefined}
                        data-unavailable={isItemUnavailable ? 'true' : undefined}
                      >
                        <input
                          className="create-site-choice__input"
                          type="radio"
                          name="templateId"
                          value={item.id}
                          checked={activeTemplateId === item.id}
                          onChange={updateField}
                          disabled={isSubmitting || isItemUnavailable}
                        />
                        <span className="template-option__icon" aria-hidden="true">
                          <LayoutTemplate size={18} />
                        </span>
                        <span className="template-option__copy">
                          <span className="template-option__title">
                            {t(item.nameKey)}
                            <span className="template-option__tier" data-tier={tier}>
                              {t(TEMPLATE_TIER_LABELS[tier])}
                            </span>
                            {itemAvailability.status === 'missing' ? (
                              <span className="template-option__unavailable">
                                {t('templates.notAvailableYet')}
                              </span>
                            ) : null}
                          </span>
                          <span className="template-option__text">{t(item.descriptionKey)}</span>
                          <span className="template-option__meta">
                            {t('templates.pageCount', { count: item.pages.length })}
                            {' · '}
                            {t('templates.sectionCount', { count: countTemplateSections(item) })}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            {/* The optional "Your information" step. Nothing here is required:
                each field the visitor fills replaces matching template copy,
                while the brand falls back to the project name. Only the fields
                the selected template can host are shown; the rest are listed
                in a short note so nothing silently disappears. */}
            {step === 3 ? (
              <>
                <h3 className="form__panel-title">{t('createSite.contentTitle')}</h3>
                <p className="form__hint">{t('createSite.contentHint')}</p>
                <div className="create-site-content-grid">
                  {fieldSpecs
                    .filter((spec) => supportedContentSet.has(spec.name))
                    .map((spec) => field(spec.name, spec.label, spec.options))}
                </div>
                {ignoredContentLabels.length > 0 ? (
                  <p className="create-site-content__note">
                    {t('createSite.fieldsIgnoredByTemplate', {
                      template: t(template.nameKey),
                      fields: ignoredContentLabels.join(', '),
                    })}
                  </p>
                ) : null}
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
                      data-checked={activeThemePresetId === preset.id ? 'true' : undefined}
                    >
                      <input
                        className="create-site-choice__input"
                        type="radio"
                        name="themePresetId"
                        value={preset.id}
                        checked={activeThemePresetId === preset.id}
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
                  {supportedContentSet.has('siteName') ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewBrand')}</dt>
                      <dd>{content.siteName || '—'}</dd>
                    </div>
                  ) : null}
                  {supportedContentSet.has('tagline') && content.tagline ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewTagline')}</dt>
                      <dd>{content.tagline}</dd>
                    </div>
                  ) : null}
                  {(supportedContentSet.has('heroTitle') && content.heroTitle) ||
                  (supportedContentSet.has('heroSubtitle') && content.heroSubtitle) ? (
                    <div className="create-site-review__row">
                      <dt>{t('createSite.reviewHero')}</dt>
                      <dd>
                        {[
                          supportedContentSet.has('heroTitle') ? content.heroTitle : '',
                          supportedContentSet.has('heroSubtitle')
                            ? content.heroSubtitle
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                  {supportedContentSet.has('aboutText') && content.aboutText ? (
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
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={isSubmitting || (step === 2 && !isSelectedTemplateAvailable)}
              >
                {step === 3 && !hasContentInput
                  ? t('createSite.skip')
                  : t('common.continue')}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={isSubmitting || !canCreateSite}
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
        {canStartOver ? (
          <div className="create-site-startover">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleStartOver}
              disabled={isSubmitting}
            >
              <RotateCcw size={14} aria-hidden="true" />
              {t('createSite.startOver')}
            </button>
          </div>
        ) : null}
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
