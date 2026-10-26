import { getDemoSession, isDemoSession } from '@/services/demoSession'
import '@/styles/site-settings.css'
import { ArrowLeft, Palette } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MediaLibraryDialog from '@/components/editor/MediaLibraryDialog'
import BrandingSettingsSection from '@/components/sitesettings/BrandingSettingsSection'
import DomainSettingsSection from '@/components/sitesettings/DomainSettingsSection'
import GeneralSettingsSection from '@/components/sitesettings/GeneralSettingsSection'
import IdentitySettingsSection from '@/components/sitesettings/IdentitySettingsSection'
import PrivacySettingsSection from '@/components/sitesettings/PrivacySettingsSection'
import SeoSettingsSection from '@/components/sitesettings/SeoSettingsSection'
import SettingsSectionNav from '@/components/sitesettings/SettingsSectionNav'
import SocialSettingsSection from '@/components/sitesettings/SocialSettingsSection'
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
  createLocalSiteSettings,
  listSettingsMediaIdsInUse,
  normalizeSiteSettings,
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
 *
 * Each card is a section component under `components/sitesettings/`; they all
 * receive this same `settings` object and the same `patchSection` callback, so
 * there is still exactly one source of truth on the page.
 */
function SiteSettingsPage() {
  const { siteId } = useParams()
  const { t } = useTranslation()

  const [settings, setSettings] = useState(() =>
    getDemoSession()?.settings[siteId] ?? createLocalSiteSettings({ id: siteId, name: getDemoSession()?.sites.find(site => site.id === siteId)?.name ?? '', status: 'draft' }),
  )
  const [isLoading, setIsLoading] = useState(() => siteSettingsService.isBackendConnected())
  const [hasChanges, setHasChanges] = useState(false)
  const [saveNotice, setSaveNotice] = useState(null)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [mediaField, setMediaField] = useState(null)

  useEffect(() => {
    const demo = getDemoSession()
    if (demo?.sites.some(site => site.id === siteId)) demo.settings[siteId] = settings
  }, [siteId, settings])
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
    if (!isDemoSession()) revokeMediaUrlsExcept(listSettingsMediaIdsInUse(settings))
  }, [settings])

  // Nothing can keep an Object URL alive past this page.
  useEffect(() => () => { if (!isDemoSession()) revokeAllMediaUrls() }, [])

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
          <GeneralSettingsSection settings={settings} patchSection={patchSection} />

          {/* ---------------- Identity ---------------- */}
          <IdentitySettingsSection
            settings={settings}
            patchSection={patchSection}
            setMedia={setMedia}
            setMediaField={setMediaField}
          />

          {/* ---------------- SEO ---------------- */}
          <SeoSettingsSection
            settings={settings}
            patchSection={patchSection}
            siteId={siteId}
          />

          {/* ---------------- Social ---------------- */}
          <SocialSettingsSection
            settings={settings}
            setMedia={setMedia}
            setMediaField={setMediaField}
          />

          {/* ---------------- Branding ---------------- */}
          <BrandingSettingsSection settings={settings} patchSection={patchSection} />

          {/* ---------------- Domain ---------------- */}
          <DomainSettingsSection settings={settings} patchSection={patchSection} />

          {/* ---------------- Privacy ---------------- */}
          <PrivacySettingsSection settings={settings} patchSection={patchSection} />
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
