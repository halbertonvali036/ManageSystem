import DomainFoundation from '@/components/sitesettings/DomainFoundation'
import {
  ArrowLeft,
  Globe,
  Image as ImageIcon,
  Link2,
  Palette,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MediaLibraryDialog from '@/components/editor/MediaLibraryDialog'
import FaviconPreview from '@/components/sitesettings/FaviconPreview'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsColorField from '@/components/sitesettings/SettingsColorField'
import SettingsField from '@/components/sitesettings/SettingsField'
import SettingsMediaField from '@/components/sitesettings/SettingsMediaField'
import SettingsSectionNav from '@/components/sitesettings/SettingsSectionNav'
import SocialPreviewCard from '@/components/sitesettings/SocialPreviewCard'
import useTranslation from '@/hooks/useTranslation'
import siteSettingsService from '@/services/siteSettingsService'
import {
  MEDIA_SOURCE,
  createLocalPreviewMediaItem,
  isAcceptedImageFile,
  normalizeMediaItem,
  readImageSize,
  revokeAllMediaUrls,
  revokeMediaUrlsExcept,
} from '@/models/siteMedia'
import {
  BRAND_DESCRIPTION_MAX,
  BRAND_NAME_MAX,
  CANONICAL_URL_MAX,
  createLocalSiteSettings,
  getDomainState,
  getSeoLengthState,
  listSettingsMediaIdsInUse,
  normalizeSiteSettings,
  SEO_LENGTHS,
  SITE_FONTS,
  SITE_LANGUAGES,
  SITE_NAME_MAX,
  SITE_STATUS_VALUES,
  SITE_TIMEZONES,
  SITE_VISIBILITIES,
} from '@/models/siteSettings'
import { SITE_DETAILS_PATH, SITE_EDITOR_PATH } from '@/utils/constants'

const SECTIONS = [
  { id: 'settings-general', labelKey: 'siteSettings.nav.general' },
  { id: 'settings-identity', labelKey: 'siteSettings.nav.identity' },
  { id: 'settings-seo', labelKey: 'siteSettings.nav.seo' },
  { id: 'settings-social', labelKey: 'siteSettings.nav.social' },
  { id: 'settings-branding', labelKey: 'siteSettings.nav.branding' },
  { id: 'settings-domain', labelKey: 'siteSettings.nav.domain' },
  { id: 'settings-privacy', labelKey: 'siteSettings.nav.privacy' },
]

/**
 * Site settings for one project.
 *
 * The whole page works on one local object, `settings`, which starts from the
 * site's own name and status and is otherwise empty. That is the honest shape of
 * the problem: there is no backend, so there is nothing to load and nothing to
 * save to. The read is still attempted, because the service contract is real and
 * the day a backend appears this page should already be asking it the right
 * question.
 *
 * The save button is present and permanently unavailable. It is not hidden,
 * because a settings page with no save affordance at all would suggest the changes
 * are being applied somewhere, and it is not a fake button, because it cannot
 * reach a success state. Pressing it runs the same `updateSiteSettings` that
 * refuses while the backend is absent, and the live region reports the refusal.
 */
function SiteSettingsPage() {
  const { siteId } = useParams()
  const { t } = useTranslation()

  const [settings, setSettings] = useState(() =>
    createLocalSiteSettings({ id: siteId, name: '', status: 'draft' }),
  )
  const [isLoading, setIsLoading] = useState(() => siteSettingsService.isBackendConnected())
  const [hasChanges, setHasChanges] = useState(false)
  const [saveNotice, setSaveNotice] = useState(null)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [mediaField, setMediaField] = useState(null)

  const isBackendConnected = siteSettingsService.isBackendConnected()

  /* ---------------------------------------------------------------- *
   * Loading
   * ---------------------------------------------------------------- */

  useEffect(() => {
    let isCurrent = true

    if (!isBackendConnected) {
      return undefined
    }

    siteSettingsService
      .getSiteSettings(siteId)
      .then((stored) => {
        if (!isCurrent || !stored) {
          return
        }
        setSettings(stored)
        setHasChanges(false)
      })
      .catch(() => {
        if (isCurrent) setSaveNotice({ kind: 'error', message: t('audit.loadFailed') })
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [isBackendConnected, siteId, t])

  /* ---------------------------------------------------------------- *
   * Local media lifetime
   * ---------------------------------------------------------------- */

  /*
   * A `blob:` url created for a file chosen from this device is revoked as soon as
   * nothing refers to it any more. The list of what is still referred to comes from
   * the model, so the logo, the favicon and the social image all count. Without
   * this, changing an unrelated field would revoke the url of an image the user had
   * just chosen and blank the preview.
   */
  useEffect(() => {
    revokeMediaUrlsExcept(listSettingsMediaIdsInUse(settings))
  }, [settings])

  // Nothing can keep an Object URL alive past this page.
  useEffect(() => () => revokeAllMediaUrls(), [])

  /* ---------------------------------------------------------------- *
   * Editing
   * ---------------------------------------------------------------- */

  /** Writes one section of the settings and marks the form as changed. */
  const patchSection = useCallback((section, patch) => {
    setSettings((current) => {
      const next = normalizeSiteSettings({
        ...current,
        [section]: { ...current[section], ...patch },
      })
      return next
    })
    setHasChanges(true)
  }, [])

  const setMedia = useCallback(
    (field, media) => {
      const section = field === 'socialImage' ? 'seo' : 'identity'
      patchSection(section, { [field]: media })
    },
    [patchSection],
  )

  const handlePickLocalFile = useCallback(
    async (file) => {
      if (!mediaField || !isAcceptedImageFile(file)) {
        return
      }
      /*
       * The Object URL is created once, here, and tracked against the media id by
       * the media model. The pruning effect above then keeps it alive for exactly
       * as long as this settings object still names it.
       */
      const field = mediaField
      const item = createLocalPreviewMediaItem({ file, objectUrl: URL.createObjectURL(file) })
      setMediaField(null)
      /*
       * Dimensions are read so the model carries the real size. A failure here must
       * not stop the image from being usable, so the dimensions stay unknown.
       */
      readImageSize(item.url)
        .then(({ width, height }) => setMedia(field, { ...item, width, height }))
        .catch(() => setMedia(field, item))
    },
    [mediaField, setMedia],
  )

  const handlePickUrl = useCallback(
    (url) => {
      if (!mediaField || !url) {
        return
      }
      const field = mediaField
      setMediaField(null)
      setMedia(field, normalizeMediaItem({ source: MEDIA_SOURCE.URL, url }))
    },
    [mediaField, setMedia],
  )

  /* ---------------------------------------------------------------- *
   * Saving
   * ---------------------------------------------------------------- */

  const handleSave = useCallback(async () => {
    setSaveNotice({ kind: 'pending', message: t('siteSettings.save.pending') })
    try {
      await siteSettingsService.updateSiteSettings(siteId, settings)
      /*
       * Unreachable while the backend is absent, and that is the point. If a
       * backend is ever connected this becomes the success path, and it is only
       * reachable after the server has actually agreed to the write.
       */
      setSaveNotice({ kind: 'saved', message: t('siteSettings.save.saved') })
      setHasChanges(false)
    } catch (error) {
      setSaveNotice({
        kind: 'error',
        message:
          error?.name === 'BackendNotConnectedError'
            ? t('siteSettings.save.unavailable')
            : t('siteSettings.save.failed'),
      })
    }
  }, [siteId, settings, t])

  /* ---------------------------------------------------------------- *
   * Active section
   * ---------------------------------------------------------------- */

  /*
   * Tracks which section is on screen so the navigation can mark it. `rootMargin`
   * biases the trigger line towards the top of the viewport, which is where a
   * section "starts" as far as a reader is concerned.
   */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    )

    for (const { id } of SECTIONS) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [])

  /* ---------------------------------------------------------------- *
   * Derived values
   * ---------------------------------------------------------------- */

  const titleLength = getSeoLengthState(settings.seo.defaultTitle, 'title')
  const descriptionLength = getSeoLengthState(settings.seo.metaDescription, 'description')
  const domainState = getDomainState(settings)

  const statusOptions = useMemo(
    () =>
      SITE_STATUS_VALUES.map((value) => ({
        value,
        labelKey: `siteStatus.${value}`,
      })),
    [],
  )

  /* ---------------------------------------------------------------- *
   * Render
   * ---------------------------------------------------------------- */

  return (
    <div className="site-settings">
      <header className="site-settings__topbar">
        <div className="site-settings__topbar-left">
          <Link
            to={SITE_DETAILS_PATH(siteId)}
            className="editor-topbar__icon-button"
            aria-label={t('siteSettings.topBar.backToSite')}
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
          <div className="site-settings__identity">
            <h1 className="site-settings__title">{t('siteSettings.pageTitle')}</h1>
            <p className="site-settings__status" role="status" aria-live="polite">
              {isBackendConnected
                ? t('siteSettings.state.backendConnected')
                : t('siteSettings.state.localOnly')}
              {hasChanges ? ` · ${t('siteSettings.state.unsaved')}` : ''}
            </p>
          </div>
        </div>

        <div className="site-settings__topbar-actions">
          <Link
            to={SITE_EDITOR_PATH(siteId)}
            className="btn btn--outline"
            aria-label={t('siteSettings.topBar.openEditor')}
          >
            <Palette size={16} aria-hidden="true" />
            {t('siteSettings.topBar.openEditor')}
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            aria-describedby="site-settings-save-note"
          >
            {t('siteSettings.topBar.save')}
          </button>
        </div>
      </header>

      {/*
        One sentence under the header, and one live region, carrying every honesty
        statement this page needs to make. Repeating "the backend is not connected"
        next to each of six controls would be noise; stating it once where the
        save button is makes the same point without the clutter.
      */}
      <p className="site-settings__notice" id="site-settings-save-note">
        {isBackendConnected
          ? t('siteSettings.state.connectedNote')
          : t('siteSettings.state.localOnlyNote')}
      </p>

      <p
        className={`site-settings__save-notice site-settings__save-notice--${saveNotice?.kind ?? 'idle'}`}
        role="status"
        aria-live="polite"
      >
        {saveNotice?.message ?? ''}
      </p>

      <div className="site-settings__layout">
        <div className="site-settings__nav">
          <SettingsSectionNav sections={SECTIONS} activeId={activeSection} />
        </div>

        <div className="site-settings__content">
          {isLoading ? (
            <p className="site-settings__loading" role="status">
              {t('siteSettings.state.loading')}
            </p>
          ) : null}

          {/* ---------------- General ---------------- */}
          <SettingsCard
            id="settings-general"
            title={t('siteSettings.general.title')}
            description={t('siteSettings.general.description')}
            icon={Globe}
          >
            <div className="settings-grid">
              <SettingsField
                id="settings-site-name"
                label={t('siteSettings.general.name')}
                hint={t('siteSettings.general.nameHint')}
              >
                <input
                  id="settings-site-name"
                  type="text"
                  className="editor-input"
                  value={settings.general.name}
                  maxLength={SITE_NAME_MAX}
                  onChange={(event) =>
                    patchSection('general', { name: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsField
                id="settings-site-description"
                label={t('siteSettings.general.descriptionLabel')}
                hint={t('siteSettings.general.descriptionHint')}
              >
                <textarea
                  id="settings-site-description"
                  className="editor-input editor-textarea"
                  rows={3}
                  value={settings.general.description}
                  maxLength={BRAND_DESCRIPTION_MAX}
                  onChange={(event) =>
                    patchSection('general', { description: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsField id="settings-language" label={t('siteSettings.general.language')}>
                <select
                  id="settings-language"
                  className="editor-input"
                  value={settings.general.language}
                  onChange={(event) =>
                    patchSection('general', { language: event.target.value })
                  }
                >
                  {SITE_LANGUAGES.map(({ id, labelKey }) => (
                    <option key={id} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </SettingsField>

              <SettingsField
                id="settings-timezone"
                label={t('siteSettings.general.timezone')}
                hint={t('siteSettings.general.timezoneHint')}
              >
                <select
                  id="settings-timezone"
                  className="editor-input"
                  value={settings.general.timezone}
                  onChange={(event) =>
                    patchSection('general', { timezone: event.target.value })
                  }
                >
                  {SITE_TIMEZONES.map(({ id, labelKey }) => (
                    <option key={id || 'none'} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </SettingsField>

              <SettingsField
                id="settings-status"
                label={t('siteSettings.general.status')}
                hint={t('publishing.pending')}
              >
                <select
                  id="settings-status"
                  className="editor-input"
                  value={settings.general.status}
                  disabled
                >
                  {statusOptions.map(({ value, labelKey }) => (
                    <option key={value} value={value}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </SettingsField>
            </div>
          </SettingsCard>

          {/* ---------------- Identity ---------------- */}
          <SettingsCard
            id="settings-identity"
            title={t('siteSettings.identity.title')}
            description={t('siteSettings.identity.description')}
            icon={ImageIcon}
          >
            <div className="settings-grid">
              <SettingsField
                id="settings-brand-name"
                label={t('siteSettings.identity.brandName')}
                hint={t('siteSettings.identity.brandNameHint')}
              >
                <input
                  id="settings-brand-name"
                  type="text"
                  className="editor-input"
                  value={settings.identity.brandName}
                  maxLength={BRAND_NAME_MAX}
                  onChange={(event) =>
                    patchSection('identity', { brandName: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsField
                id="settings-brand-description"
                label={t('siteSettings.identity.brandDescription')}
                hint={t('siteSettings.identity.brandDescriptionHint')}
              >
                <textarea
                  id="settings-brand-description"
                  className="editor-input editor-textarea"
                  rows={2}
                  value={settings.identity.brandDescription}
                  maxLength={BRAND_DESCRIPTION_MAX}
                  onChange={(event) =>
                    patchSection('identity', { brandDescription: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsMediaField
                id="settings-logo"
                variant="logo"
                label={t('siteSettings.identity.logo')}
                hint={t('siteSettings.identity.logoHint')}
                media={settings.identity.logo}
                onPick={() => setMediaField('logo')}
                onClear={() => setMedia('logo', null)}
              />

              <SettingsMediaField
                id="settings-favicon"
                variant="favicon"
                label={t('siteSettings.identity.favicon')}
                hint={t('siteSettings.identity.faviconHint')}
                media={settings.identity.favicon}
                onPick={() => setMediaField('favicon')}
                onClear={() => setMedia('favicon', null)}
              />

              <FaviconPreview settings={settings} />
            </div>
          </SettingsCard>

          {/* ---------------- SEO ---------------- */}
          <SettingsCard
            id="settings-seo"
            title={t('siteSettings.seo.title')}
            description={t('siteSettings.seo.description')}
            icon={Search}
          >
            <div className="settings-grid">
              <SettingsField
                id="settings-default-seo-title"
                label={t('siteSettings.seo.defaultTitle')}
                hint={t('siteSettings.seo.titleHint', {
                  min: SEO_LENGTHS.title.min,
                  max: SEO_LENGTHS.title.max,
                })}
                counter={`${titleLength.length} / ${SEO_LENGTHS.title.max}`}
                error={titleLength.isOverLimit ? t('siteSettings.seo.titleTooLong') : null}
              >
                <input
                  id="settings-default-seo-title"
                  type="text"
                  className="editor-input"
                  value={settings.seo.defaultTitle}
                  onChange={(event) =>
                    patchSection('seo', { defaultTitle: event.target.value })
                  }
                  aria-describedby="site-settings-page-seo-note"
                />
              </SettingsField>

              <SettingsField
                id="settings-seo-description"
                label={t('siteSettings.seo.metaDescription')}
                hint={t('siteSettings.seo.descriptionHint', {
                  min: SEO_LENGTHS.description.min,
                  max: SEO_LENGTHS.description.max,
                })}
                counter={`${descriptionLength.length} / ${SEO_LENGTHS.description.max}`}
                error={
                  descriptionLength.isOverLimit ? t('siteSettings.seo.descriptionTooLong') : null
                }
              >
                <textarea
                  id="settings-seo-description"
                  className="editor-input editor-textarea"
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(event) =>
                    patchSection('seo', { metaDescription: event.target.value })
                  }
                />
              </SettingsField>

              <SettingsField
                id="settings-canonical"
                label={t('siteSettings.seo.canonical')}
                hint={t('siteSettings.seo.canonicalHint')}
              >
                <input
                  id="settings-canonical"
                  type="url"
                  className="editor-input"
                  placeholder="https://example.com"
                  value={settings.seo.canonicalUrl}
                  maxLength={CANONICAL_URL_MAX}
                  onChange={(event) =>
                    patchSection('seo', { canonicalUrl: event.target.value })
                  }
                />
              </SettingsField>

              <div className="settings-toggle" id="settings-index-toggle">
                <input
                  id="settings-index-in-search"
                  type="checkbox"
                  className="settings-toggle__input"
                  checked={settings.seo.indexInSearch}
                  onChange={(event) =>
                    patchSection('seo', { indexInSearch: event.target.checked })
                  }
                />
                <label
                  className="settings-toggle__label"
                  htmlFor="settings-index-in-search"
                >
                  {t('siteSettings.seo.indexInSearch')}
                </label>
                <p className="editor-field__hint">{t('siteSettings.seo.indexInSearchHint')}</p>
              </div>

              {/*
                Page-level overrides are edited where the page lives, in the
                editor's page panel. Repeating the same fields here would mean two
                places writing one value, and the two would eventually disagree.
              */}
              <p className="settings-note" id="site-settings-page-seo-note">
                <Link2 size={14} aria-hidden="true" />
                {t('siteSettings.seo.pageOverrideNote')}{' '}
                <Link to={SITE_EDITOR_PATH(siteId)}>{t('siteSettings.seo.openEditor')}</Link>
              </p>
            </div>
          </SettingsCard>

          {/* ---------------- Social ---------------- */}
          <SettingsCard
            id="settings-social"
            title={t('siteSettings.social.title')}
            description={t('siteSettings.social.description')}
            icon={Share2}
          >
            <div className="settings-grid">
              <SettingsMediaField
                id="settings-social-image"
                variant="image"
                label={t('siteSettings.social.image')}
                hint={t('siteSettings.social.imageHint')}
                media={settings.seo.socialImage}
                onPick={() => setMediaField('socialImage')}
                onClear={() => setMedia('socialImage', null)}
              />

              <SocialPreviewCard settings={settings} />
            </div>
          </SettingsCard>

          {/* ---------------- Branding ---------------- */}
          <SettingsCard
            id="settings-branding"
            title={t('siteSettings.branding.title')}
            description={t('siteSettings.branding.description')}
            icon={Palette}
          >
            <div className="settings-grid">
              <SettingsColorField
                id="settings-brand-color"
                label={t('siteSettings.branding.primaryColor')}
                hint={t('siteSettings.branding.primaryColorHint')}
                value={settings.branding.primaryColor}
                onChange={(value) => patchSection('branding', { primaryColor: value })}
                onClear={() => patchSection('branding', { primaryColor: '' })}
              />

              <SettingsField
                id="settings-brand-font"
                label={t('siteSettings.branding.font')}
                hint={t('siteSettings.branding.fontHint')}
              >
                <select
                  id="settings-brand-font"
                  className="editor-input"
                  value={settings.branding.fontId}
                  onChange={(event) =>
                    patchSection('branding', { fontId: event.target.value })
                  }
                >
                  {SITE_FONTS.map(({ id, labelKey }) => (
                    <option key={id} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </SettingsField>

              <p className="settings-note">
                <Sparkles size={14} aria-hidden="true" />
                {t('siteSettings.branding.independentNote')}
              </p>
            </div>
          </SettingsCard>

          {/* ---------------- Domain ---------------- */}
          <SettingsCard
            id="settings-domain"
            title={t('siteSettings.domain.title')}
            description={t('siteSettings.domain.description')}
            icon={Globe}
          >
            <div className="settings-grid">
              <SettingsField
                id="settings-domain-hostname"
                label={t('siteSettings.domain.hostname')}
                hint={t('siteSettings.domain.hostnameHint')}
                error={
                  domainState.isConfigured && !domainState.isValid
                    ? t('siteSettings.domain.invalid')
                    : null
                }
              >
                <input
                  id="settings-domain-hostname"
                  type="text"
                  className="editor-input"
                  placeholder="example.com"
                  value={settings.domain.hostname}
                  onChange={(event) =>
                    patchSection('domain', { hostname: event.target.value })
                  }
                />
              </SettingsField>

              <p className="settings-note settings-note--muted">
                {t('siteSettings.domain.notConnectedNote')}
              </p>
            </div>
            <DomainFoundation />
          </SettingsCard>

          {/* ---------------- Privacy ---------------- */}
          <SettingsCard
            id="settings-privacy"
            title={t('siteSettings.privacy.title')}
            description={t('siteSettings.privacy.description')}
            icon={ShieldCheck}
          >
            <div className="settings-grid">
              <SettingsField id="settings-visibility" label={t('siteSettings.privacy.visibility')}>
                <select
                  id="settings-visibility"
                  className="editor-input"
                  value={settings.general.visibility}
                  onChange={(event) =>
                    patchSection('general', { visibility: event.target.value })
                  }
                >
                  {SITE_VISIBILITIES.map(({ id, labelKey }) => (
                    <option key={id} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </SettingsField>

              <p className="settings-note settings-note--muted">
                {t('siteSettings.privacy.notEnforcedNote')}
              </p>
            </div>
          </SettingsCard>
        </div>
      </div>

      <MediaLibraryDialog
        isOpen={mediaField !== null}
        onClose={() => setMediaField(null)}
        onPickLocalFile={handlePickLocalFile}
        onPickUrl={handlePickUrl}
      />
    </div>
  )
}

export default function SiteSettingsRoute() {
  const { siteId } = useParams()
  return <SiteSettingsPage key={siteId} />
}
