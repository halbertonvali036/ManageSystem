import PublishActions from '@/components/sites/PublishActions'
import {
  ArrowLeft,
  Eye,
  Monitor,
  Pencil,
  Settings,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { EDITOR_DEVICE, EDITOR_DEVICES } from '@/models/siteEditor'
import { SITES_PATH, SITE_DETAILS_PATH, SITE_SETTINGS_PATH } from '@/utils/constants'

const DEVICE_ICONS = {
  [EDITOR_DEVICE.DESKTOP]: Monitor,
  [EDITOR_DEVICE.TABLET]: Tablet,
  [EDITOR_DEVICE.MOBILE]: Smartphone,
}

const SAVE_STATUS_KEYS = {
  clean: 'editor.save.clean',
  unsaved: 'editor.save.unsaved',
  unavailable: 'editor.save.unavailable',
  error: 'editor.save.error',
}

/**
 * Editor top bar: identity, save state, device preview and preview mode.
 *
 * Publishing opens a readiness review; the integration cannot mutate status.
 */
function EditorTopBar({
  siteId,
  siteName,
  document,
  saveStatus,
  device,
  onDeviceChange,
  isPreview,
  onTogglePreview,
}) {
  const { t } = useTranslation()

  return (
    <header className="editor-topbar">
      <div className="editor-topbar__left">
        <Link
          to={siteId === 'local-draft' ? SITES_PATH : SITE_DETAILS_PATH(siteId)}
          className="editor-topbar__icon-button"
          aria-label={t('editor.topBar.backToSite')}
        >
          <ArrowLeft size={17} aria-hidden="true" />
        </Link>

        <Link
          to={SITE_SETTINGS_PATH(siteId)}
          className="editor-topbar__icon-button"
          aria-label={t('editor.topBar.openSettings')}
        >
          <Settings size={17} aria-hidden="true" />
        </Link>

        <div className="editor-topbar__identity">
          <span className="editor-topbar__name">{siteName || t('editor.topBar.untitled')}</span>
          <span
            className={`editor-topbar__save editor-topbar__save--${saveStatus}`}
            role="status"
            aria-live="polite"
          >
            {t(SAVE_STATUS_KEYS[saveStatus] ?? SAVE_STATUS_KEYS.unsaved)}
          </span>
        </div>
      </div>

      <div
        className="editor-topbar__devices"
        role="group"
        aria-label={t('editor.topBar.deviceGroup')}
      >
        {EDITOR_DEVICES.map(({ id, labelKey }) => {
          const Icon = DEVICE_ICONS[id]
          const isActive = id === device
          return (
            <button
              key={id}
              type="button"
              className={`editor-topbar__icon-button${isActive ? ' is-active' : ''}`}
              aria-label={t(labelKey)}
              aria-pressed={isActive}
              onClick={() => onDeviceChange(id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="editor-topbar__device-label">{t(labelKey)}</span>
            </button>
          )
        })}
      </div>

      <div className="editor-topbar__actions">
        <button
          type="button"
          className={`btn ${isPreview ? 'btn--primary' : 'btn--outline'}`}
          id="editor-preview-toggle"
          aria-pressed={isPreview}
          onClick={onTogglePreview}
        >
          {isPreview ? (
            <Pencil size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
          {t(isPreview ? 'editor.topBar.exitPreview' : 'editor.topBar.preview')}
        </button>

        <PublishActions siteId={siteId} siteName={siteName} document={document} />
      </div>
    </header>
  )
}

export default EditorTopBar
