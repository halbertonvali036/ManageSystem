/**
 * Media model for the website builder.
 *
 * This file deliberately stops short of storage. There is no upload, no CDN, no
 * image optimisation and no persistence here, because none of that exists yet and
 * pretending otherwise would be worse than leaving it out. What it does provide
 * is the shape a real media service will fill in later, so that adding one is a
 * change of implementation rather than a change of model.
 *
 * A media item is a small record:
 *
 *   { id, type, source, url, alt, width, height, fileName, isLocalPreview }
 *
 * `url` is what the canvas renders and `alt` is what a screen reader announces,
 * so those two are the ones that matter for accessibility.
 *
 * `source` records where the bytes actually came from:
 *
 *   - `localPreview` a file the visitor picked in this browser session. The url is
 *     an Object URL that dies with the tab. It is never uploaded, and every place
 *     it can be seen says so.
 *   - `url`         a direct address the visitor typed. No bytes pass through us.
 *   - `library`     reserved for the future backend media library.
 */

import { SITE_COLOR_TOKENS } from '@/models/siteTheme'

/** Where a media item's bytes come from. */
export const MEDIA_SOURCE = Object.freeze({
  LOCAL_PREVIEW: 'localPreview',
  URL: 'url',
  LIBRARY: 'library',
})

export const MEDIA_SOURCES = Object.freeze(Object.values(MEDIA_SOURCE))

/** Only images exist today. The type is on the record so a future video or
 *  document asset does not need a second model. */
export const MEDIA_TYPE = Object.freeze({
  IMAGE: 'image',
})

/** The image types a local file picker will accept. */
export const MEDIA_ACCEPTED_MIME = Object.freeze({
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  AVIF: 'image/avif',
})

/**
 * `accept` for the file input.
 *
 * Listing the types rather than a bare `image/*` keeps the picker honest about
 * what the canvas can show, and `isAcceptedImageFile` applies the same list when
 * a file arrives some other way, such as a drop.
 */
export const MEDIA_FILE_ACCEPT = Object.freeze(
  Object.values(MEDIA_ACCEPTED_MIME).join(','),
)

export const isAcceptedImageFile = (file) =>
  Boolean(file) && Object.values(MEDIA_ACCEPTED_MIME).includes(file.type)

/** How an image fills the box it is given. */
export const IMAGE_FIT = Object.freeze({
  COVER: 'cover',
  CONTAIN: 'contain',
  FILL: 'fill',
})

export const IMAGE_FITS = Object.freeze(Object.values(IMAGE_FIT))

/**
 * `IMAGE_FITS` with labels, for a `<select>`.
 *
 * The plain array above is the set of legal values and is what the model validates
 * against; this is the same set with a key per label, so the UI does not have to
 * build a label out of the value's own text.
 */
export const IMAGE_FIT_OPTIONS = Object.freeze([
  { value: IMAGE_FIT.COVER, labelKey: 'editor.image.fitCover' },
  { value: IMAGE_FIT.CONTAIN, labelKey: 'editor.image.fitContain' },
  { value: IMAGE_FIT.FILL, labelKey: 'editor.image.fitFill' },
])

/** Where a background image sits inside its section. */
export const BACKGROUND_POSITION = Object.freeze({
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
})

export const BACKGROUND_POSITIONS = Object.freeze(Object.values(BACKGROUND_POSITION))

/** `BACKGROUND_POSITIONS` with labels, for a `<select>`. */
export const BACKGROUND_POSITION_OPTIONS = Object.freeze([
  { value: BACKGROUND_POSITION.CENTER, labelKey: 'editor.background.positionCenter' },
  { value: BACKGROUND_POSITION.TOP, labelKey: 'editor.background.positionTop' },
  { value: BACKGROUND_POSITION.BOTTOM, labelKey: 'editor.background.positionBottom' },
  { value: BACKGROUND_POSITION.LEFT, labelKey: 'editor.background.positionLeft' },
  { value: BACKGROUND_POSITION.RIGHT, labelKey: 'editor.background.positionRight' },
])

export const OVERLAY_BOUNDS = Object.freeze({ min: 0, max: 90, step: 5 })

/* ------------------------------------------------------------------ *
 * URL safety
 * ------------------------------------------------------------------ */

/**
 * Whether `url` is something the canvas may load.
 *
 * An image url reaches a `src` attribute, so an allowlist is the only safe
 * answer: `javascript:` and `data:` are refused outright. `data:` is refused
 * even for images, because a base64 payload in a saved draft is a payload in
 * everyone's database and the file picker already offers a real alternative.
 *
 * Root-relative paths are allowed so a future same-origin media service works
 * without changing this rule.
 */
export const isSafeMediaUrl = (url) => {
  if (typeof url !== 'string') {
    return false
  }
  const candidate = url.trim()
  if (candidate === '') {
    return false
  }
  if (/^blob:/i.test(candidate)) {
    return true
  }
  if (/^https?:\/\//i.test(candidate)) {
    return true
  }
  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    return true
  }
  return false
}

/** A safe image url, or `null`. The single gate every `src` goes through. */
export const safeMediaUrl = (url) => (isSafeMediaUrl(url) ? url.trim() : null)

/* ------------------------------------------------------------------ *
 * Object URL lifetime
 *
 * An Object URL pins the whole file in memory until it is revoked, so leaking
 * one per picked file is a real leak and not a tidy-up nicety. Every URL created
 * here is recorded against the media id that owns it, so replacing or removing an
 * item can release exactly its own URL and nothing else.
 * ------------------------------------------------------------------ */

const objectUrls = new Map()

/**
 * Records a freshly created Object URL against a media id.
 *
 * `createObjectURL` is called by the caller rather than here, because this module
 * must stay usable where `URL` is absent, such as a model test.
 */
export const trackObjectUrl = (mediaId, objectUrl) => {
  if (!mediaId || typeof objectUrl !== 'string' || !objectUrl.startsWith('blob:')) {
    return null
  }
  // A new url for the same id means the old one is finished with.
  const previous = objectUrls.get(mediaId)
  if (previous && previous !== objectUrl) {
    revokeMediaUrl(mediaId)
  }
  objectUrls.set(mediaId, objectUrl)
  return objectUrl
}

/** Releases the Object URL owned by `mediaId`, if there is one. */
export const revokeMediaUrl = (mediaId) => {
  const objectUrl = objectUrls.get(mediaId)
  if (!objectUrl) {
    return false
  }
  objectUrls.delete(mediaId)
  // `revokeObjectURL` is harmless when called twice, but guarding keeps a missing
  // URL implementation from turning a cleanup into a crash.
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(objectUrl)
  }
  return true
}

/** Releases every tracked Object URL. Used when the editor unmounts. */
export const revokeAllMediaUrls = () => {
  const ids = [...objectUrls.keys()]
  ids.forEach(revokeMediaUrl)
  return ids.length
}

/**
 * Releases every tracked Object URL whose media id is not in `keepIds`.
 *
 * Duplicating a block copies its media record, so two blocks can legitimately
 * share one id and therefore one Object URL. Revoking on removal of either copy
 * would blank the image in the other, so the decision to revoke is taken from
 * what the document still references rather than from which block was deleted.
 *
 * Returns the ids that were released, which makes the behaviour testable.
 */
export const revokeMediaUrlsExcept = (keepIds) => {
  const keep = keepIds instanceof Set ? keepIds : new Set(keepIds ?? [])
  const released = []
  for (const mediaId of [...objectUrls.keys()]) {
    if (!keep.has(mediaId)) {
      revokeMediaUrl(mediaId)
      released.push(mediaId)
    }
  }
  return released
}

export const isTrackedObjectUrl = (mediaId) => objectUrls.has(mediaId)

/* ------------------------------------------------------------------ *
 * Media items
 * ------------------------------------------------------------------ */

let mediaCounter = 0

/** Monotonic id, for the same reproducibility reason blocks use one. */
export const createMediaId = () => {
  mediaCounter += 1
  return `media-${mediaCounter}`
}

export const createMediaItem = ({
  id,
  source = MEDIA_SOURCE.URL,
  url,
  alt = '',
  width,
  height,
  fileName = '',
} = {}) => ({
  id: typeof id === 'string' && id ? id : createMediaId(),
  /* Images are the only kind today. The field exists so a later video or
     document asset is a value rather than a second model. */
  type: MEDIA_TYPE.IMAGE,
  source: MEDIA_SOURCES.includes(source) ? source : MEDIA_SOURCE.URL,
  url: safeMediaUrl(url) ?? '',
  alt: typeof alt === 'string' ? alt : '',
  width: Number.isFinite(Number(width)) ? Number(width) : null,
  height: Number.isFinite(Number(height)) ? Number(height) : null,
  fileName: typeof fileName === 'string' ? fileName : '',
  /* Derived, never stored: it is a fact about where the bytes came from, and
     storing it would let a saved draft claim a library image is a local one. */
  isLocalPreview: source === MEDIA_SOURCE.LOCAL_PREVIEW,
})

/**
 * Builds an item for a file the visitor just picked.
 *
 * `objectUrl` must already have been produced by `URL.createObjectURL` and handed
 * to `trackObjectUrl`. The item is explicitly a local preview: it is marked as
 * such, and nothing in the UI may describe it as uploaded or stored.
 */
export const createLocalPreviewMediaItem = ({ file, objectUrl, width, height } = {}) => {
  const id = createMediaId()
  if (typeof objectUrl === 'string' && objectUrl) {
    trackObjectUrl(id, objectUrl)
  }
  return {
    id,
    type: MEDIA_TYPE.IMAGE,
    source: MEDIA_SOURCE.LOCAL_PREVIEW,
    url: safeMediaUrl(objectUrl) ?? '',
    alt: '',
    width: Number.isFinite(Number(width)) ? Number(width) : null,
    height: Number.isFinite(Number(height)) ? Number(height) : null,
    fileName: typeof file?.name === 'string' ? file.name : '',
    isLocalPreview: true,
  }
}

/**
 * Coerces anything into a valid media item.
 *
 * A url the canvas may not load becomes an empty url rather than being dropped,
 * so a block referencing a rejected address renders its placeholder instead of
 * losing the rest of its configuration.
 */
export const normalizeMediaItem = (raw) => {
  const isLocal = raw?.source === MEDIA_SOURCE.LOCAL_PREVIEW || raw?.isLocalPreview === true
  const url = safeMediaUrl(raw?.url) ?? ''
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : createMediaId(),
    type: MEDIA_TYPE.IMAGE,
    source: isLocal ? MEDIA_SOURCE.LOCAL_PREVIEW : MEDIA_SOURCES.includes(raw?.source) ? raw.source : MEDIA_SOURCE.URL,
    url,
    alt: typeof raw?.alt === 'string' ? raw.alt : '',
    width: Number.isFinite(Number(raw?.width)) ? Number(raw.width) : null,
    height: Number.isFinite(Number(raw?.height)) ? Number(raw.height) : null,
    fileName: typeof raw?.fileName === 'string' ? raw.fileName : '',
    isLocalPreview: isLocal,
  }
}

/** The url to render, or `null` when there is nothing safe to show. */
export const getMediaPreviewUrl = (media) => safeMediaUrl(media?.url)

/** Whether a media item can actually be drawn on the canvas. */
export const hasRenderableMedia = (media) => getMediaPreviewUrl(media) !== null

/**
 * A short dimension summary, or `null` when the size is unknown.
 *
 * A missing intrinsic size is normal for a local preview that has not finished
 * decoding, so this is written to be shown conditionally rather than to stand in
 * for a zero.
 */
export const formatMediaDimensions = (media) => {
  const { width, height } = media ?? {}
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null
  }
  return `${Math.round(width)} × ${Math.round(height)}`
}

/** An object-fit value, falling back to `cover` for anything unrecognised. */
export const normalizeImageFit = (fit) => (IMAGE_FITS.includes(fit) ? fit : IMAGE_FIT.COVER)

/** A background-position value, falling back to `center`. */
export const normalizeBackgroundPosition = (position) =>
  BACKGROUND_POSITIONS.includes(position) ? position : BACKGROUND_POSITION.CENTER

/**
 * An overlay colour.
 *
 * The overlay is one tint plus one opacity rather than a stack of filters: it is
 * the minimum needed to keep text readable over a photograph, and it cannot drift
 * into pretending to be an image editor.
 */
export const normalizeOverlayColor = (color) =>
  typeof color === 'string' &&
  (SITE_COLOR_TOKENS.includes(color) || /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color))
    ? color
    : 'text'

export const clampOverlayOpacity = (value) =>
  Math.min(Math.max(Number(value) || 0, OVERLAY_BOUNDS.min), OVERLAY_BOUNDS.max)

/**
 * Reads a picked image's intrinsic size.
 *
 * Best effort on purpose: a local preview that has not decoded yet is still worth
 * showing, so a failure resolves to `null` instead of rejecting. Nothing waits on
 * this before the image appears.
 */
export const readImageSize = (url) =>
  new Promise((resolve) => {
    if (typeof Image === 'undefined' || !url) {
      resolve(null)
      return
    }
    const probe = new Image()
    probe.onload = () =>
      resolve(
        probe.naturalWidth > 0 && probe.naturalHeight > 0
          ? { width: probe.naturalWidth, height: probe.naturalHeight }
          : null,
      )
    probe.onerror = () => resolve(null)
    probe.src = url
  })
