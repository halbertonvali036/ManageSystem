import { useId, useRef, useState } from 'react'
import { AlertCircle, ImagePlus, Trash2, Upload } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { PROFILE_AVATAR_ACCEPT, PROFILE_AVATAR_MAX_MB } from '@/models/profile'

/**
 * Profile photo picker and preview.
 *
 * The picture shown is either the account's stored avatar or a local preview of
 * a file the person just picked. The preview is an Object URL and is never
 * described as uploaded: while the account service is not connected the hint
 * says so, and the badge on the frame reads "Preview only". Validation happens
 * before a preview exists, so an unsupported or oversized file can never stall
 * the tab.
 */
function AvatarUploader({
  url,
  initials,
  name,
  fileName,
  isLocalPreview,
  errorKey,
  canRemove,
  disabled,
  persistenceAvailable,
  onSelect,
  onRemove,
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const openPicker = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0] ?? null
    // Reset so picking the same file again still fires a change event.
    event.target.value = ''
    if (file) {
      onSelect(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event) => {
    // Moving onto a child still counts as inside the drop area.
    if (event.currentTarget.contains(event.relatedTarget)) {
      return
    }
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) {
      return
    }
    const file = event.dataTransfer?.files?.[0] ?? null
    if (file) {
      onSelect(file)
    }
  }

  return (
    <div
      className={`profile-photo${isDragging ? ' profile-photo--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="profile-photo__frame-wrap">
        <button
          type="button"
          className="profile-photo__frame"
          onClick={openPicker}
          disabled={disabled}
          aria-label={t('accountProfile.profilePhotoChange')}
        >
          {url ? (
            <img
              className="profile-photo__image"
              src={url}
              alt={t('accountProfile.profilePhotoAlt', { name })}
            />
          ) : (
            <span className="profile-photo__initials" aria-hidden="true">
              {initials || '?'}
            </span>
          )}
          <span className="profile-photo__overlay" aria-hidden="true">
            <ImagePlus size={20} />
          </span>
        </button>
        {isLocalPreview ? (
          <span className="profile-photo__preview-badge">
            {t('accountProfile.profilePhotoLocalPreview')}
          </span>
        ) : null}
      </div>

      <div className="profile-photo__body">
        <p className="profile-photo__title">{t('accountProfile.profilePhotoTitle')}</p>
        <p className="profile-photo__hint">
          {t('accountProfile.profilePhotoHint', { size: PROFILE_AVATAR_MAX_MB })}
        </p>
        <p className="profile-photo__drop">{t('accountProfile.profilePhotoDropHint')}</p>
        {fileName ? (
          <p className="profile-photo__file" title={fileName}>
            {fileName}
          </p>
        ) : null}

        <div className="profile-photo__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm btn--icon-left"
            onClick={openPicker}
            disabled={disabled}
          >
            <Upload size={15} aria-hidden="true" />
            {t('accountProfile.profilePhotoChange')}
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm btn--icon-left"
            onClick={onRemove}
            disabled={disabled || !canRemove}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('accountProfile.profilePhotoRemove')}
          </button>
        </div>

        {errorKey ? (
          <div className="form__error-area" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{t(errorKey)}</span>
          </div>
        ) : null}

        {!persistenceAvailable ? (
          <p className="profile-photo__notice">
            {t('accountProfile.profilePhotoUnavailable')}
          </p>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="profile-photo__input"
        type="file"
        accept={PROFILE_AVATAR_ACCEPT}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

export default AvatarUploader
