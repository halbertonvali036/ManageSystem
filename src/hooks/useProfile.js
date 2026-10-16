import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import profileService from '@/services/profileService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { revokeMediaUrl, safeMediaUrl, trackObjectUrl } from '@/models/siteMedia'
import {
  PROFILE_DISPLAY_NAME_MAX_LENGTH,
  createProfileDraft,
  getAvatarErrorKey,
  getOptionalProfileKeys,
  hasProfileChanges,
  readProfileText,
  toProfilePayload,
  validateAvatarFile,
} from '@/models/profile'

/** The single media id the avatar preview URL is tracked under. */
const AVATAR_MEDIA_ID = 'profile-avatar'

/** Reads the avatar address the account record carries, if it carries one. */
const readAccountAvatarUrl = (user) => safeMediaUrl(user?.avatarUrl ?? user?.avatar)

/**
 * Account profile state.
 *
 * `saved` only ever holds values the backend has confirmed: it starts from the
 * session record the backend established, and is replaced only after a write
 * succeeds. The draft is local form state and is never presented as persistence.
 *
 * Saving is honest about the missing backend: `save()` calls the real service,
 * which throws `BackendNotConnectedError`, and the error is surfaced as an
 * "unavailable" state rather than a success. `isSaveUnavailable` is the flag the
 * view uses to tell that apart from an ordinary failure.
 *
 * The avatar is a local preview until a save actually uploads it. The Object URL
 * is held through the shared media helpers, so replacing the file or leaving the
 * page releases exactly one URL.
 */
function useProfile(user, { onSaved } = {}) {
  const optionalKeys = useMemo(() => getOptionalProfileKeys(user), [user])
  const savedRef = useRef(null)

  const [draft, setDraft] = useState(() => createProfileDraft(user))
  const [saved, setSaved] = useState(() => createProfileDraft(user))
  const [serverAvatarUrl, setServerAvatarUrl] = useState(() => readAccountAvatarUrl(user))
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [avatarErrorKey, setAvatarErrorKey] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const persistenceAvailable = profileService.isProfilePersistenceAvailable()
  const userId = user?.id ?? null

  useEffect(() => {
    savedRef.current = saved
  }, [saved])

  // The signed-in account changed: adopt its record and drop any draft in flight.
  useEffect(() => {
    const next = createProfileDraft(user)
    setDraft(next)
    setSaved(next)
    setServerAvatarUrl(readAccountAvatarUrl(user))
    setAvatarPreview(null)
    setAvatarRemoved(false)
    setAvatarErrorKey(null)
    setIsSaving(false)
    setIsSaved(false)
    setSaveError(null)
    revokeMediaUrl(AVATAR_MEDIA_ID)
    // Re-sync on the account identity alone; a new object for the same account
    // must not wipe a draft the person is still editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Release the preview URL when the page unmounts.
  useEffect(() => () => revokeMediaUrl(AVATAR_MEDIA_ID), [])

  const setField = useCallback((key, value) => {
    setIsSaved(false)
    setSaveError(null)
    setDraft((current) => ({ ...current, [key]: value }))
  }, [])

  const selectAvatarFile = useCallback((file) => {
    const errorCode = validateAvatarFile(file)
    if (errorCode) {
      setAvatarErrorKey(getAvatarErrorKey(errorCode))
      setIsSaved(false)
      return false
    }
    revokeMediaUrl(AVATAR_MEDIA_ID)
    let url = null
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      url = trackObjectUrl(AVATAR_MEDIA_ID, URL.createObjectURL(file))
    }
    setAvatarPreview({ url, fileName: file.name, file })
    setAvatarRemoved(false)
    setAvatarErrorKey(null)
    setIsSaved(false)
    setSaveError(null)
    return true
  }, [])

  const removePhoto = useCallback(() => {
    revokeMediaUrl(AVATAR_MEDIA_ID)
    setAvatarPreview(null)
    setAvatarRemoved(true)
    setAvatarErrorKey(null)
    setIsSaved(false)
    setSaveError(null)
  }, [])

  const displayAvatarUrl = avatarPreview?.url ?? (avatarRemoved ? null : serverAvatarUrl)
  const hasAvatarChange =
    Boolean(avatarPreview) || (avatarRemoved && Boolean(serverAvatarUrl))

  const dirty = useMemo(
    () => hasProfileChanges(draft, saved, optionalKeys) || hasAvatarChange,
    [draft, saved, optionalKeys, hasAvatarChange],
  )

  const displayNameErrorKey = useMemo(() => {
    const value = readProfileText(draft.displayName)
    if (value.length === 0) {
      return 'accountProfile.displayNameRequired'
    }
    if (value.length > PROFILE_DISPLAY_NAME_MAX_LENGTH) {
      return 'accountProfile.displayNameTooLong'
    }
    return null
  }, [draft.displayName])

  const isValid = !displayNameErrorKey

  const save = useCallback(async () => {
    if (isSaving || !isValid) {
      return { ok: false }
    }
    setIsSaving(true)
    setSaveError(null)
    setIsSaved(false)

    const currentSaved = savedRef.current ?? saved
    let nextSaved = currentSaved
    let nextAvatarUrl = serverAvatarUrl

    try {
      if (hasProfileChanges(draft, currentSaved, optionalKeys)) {
        await profileService.updateProfile(toProfilePayload(draft, optionalKeys))
        /* The backend accepted these values, so they are what is stored now.
           Only the fields this form owns are adopted — never a value read back
           from a response the model does not know about. */
        nextSaved = createProfileDraft({
          name: draft.displayName,
          bio: draft.bio,
          company: draft.company,
        })
        setSaved(nextSaved)
        setDraft(nextSaved)
      }

      if (avatarPreview?.file) {
        const result = await profileService.uploadAvatar(avatarPreview.file)
        const uploadedUrl = safeMediaUrl(result?.avatarUrl ?? result?.url)
        nextAvatarUrl = uploadedUrl ?? avatarPreview.url ?? null
        setServerAvatarUrl(nextAvatarUrl)
        setAvatarPreview(null)
        setAvatarRemoved(false)
      } else if (avatarRemoved && serverAvatarUrl) {
        await profileService.removeAvatar()
        nextAvatarUrl = null
        setServerAvatarUrl(null)
        setAvatarRemoved(false)
      }

      setIsSaved(true)

      if (onSaved) {
        const nextUser = { name: nextSaved.displayName }
        optionalKeys.forEach((key) => {
          nextUser[key] = nextSaved[key]
        })
        if (typeof nextAvatarUrl === 'string' && nextAvatarUrl) {
          nextUser.avatarUrl = nextAvatarUrl
        }
        onSaved(nextUser)
      }

      return { ok: true }
    } catch (error) {
      setSaveError(error)
      return { ok: false, error }
    } finally {
      setIsSaving(false)
    }
  }, [
    draft,
    saved,
    optionalKeys,
    avatarPreview,
    avatarRemoved,
    serverAvatarUrl,
    isSaving,
    isValid,
    onSaved,
  ])

  const reset = useCallback(() => {
    revokeMediaUrl(AVATAR_MEDIA_ID)
    setDraft({ ...(savedRef.current ?? saved) })
    setAvatarPreview(null)
    setAvatarRemoved(false)
    setAvatarErrorKey(null)
    setSaveError(null)
    setIsSaved(false)
  }, [saved])

  return {
    draft,
    saved,
    optionalKeys,
    avatarUrl: displayAvatarUrl,
    avatarFileName: avatarPreview?.fileName ?? '',
    isAvatarLocalPreview: Boolean(avatarPreview),
    avatarErrorKey,
    hasAvatarChange,
    displayNameErrorKey,
    isValid,
    dirty,
    canSave: dirty && isValid && !isSaving,
    isSaving,
    isSaved,
    saveError,
    isSaveUnavailable: saveError instanceof BackendNotConnectedError,
    persistenceAvailable,
    setField,
    selectAvatarFile,
    removePhoto,
    save,
    reset,
  }
}

export default useProfile
