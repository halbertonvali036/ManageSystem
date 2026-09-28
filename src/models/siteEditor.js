import { normalizeAnimation, normalizeSiteMotion } from '@/models/siteMotion'
import { createStarterForm, duplicateForm, normalizeSiteForm } from '@/models/siteForm'
/**
 * Site editor model.
 *
 * The editor works on a single document shaped as page -> section -> block:
 *
 *   document   { siteId, isLocalDraft, activePageId, navigation, theme, motion, globalStyles, pages }
 *   page       { id, name, slug, isHome, order, seoTitle, seoDescription, sections }
 *   navigation { items }
 *   menu item  { id, label, type, pageId, url, order, visible }
 *   section    { id, type, style, animation, isVisible, blocks }
 *   block      { id, type, isVisible, content, style, animation, overrides }
 *
 * Sections are real containers rather than a special block type, because a
 * section needs its own settings, its own place in the outline, and its own
 * children. Keeping one nesting level is deliberate: it stays trivially
 * serialisable for a future backend while giving the outline something to
 * organise around.
 *
 * `navigation` holds the site menu and belongs to the document rather than to a
 * page, because a menu is something a visitor sees from every page. The rules
 * about what a menu item may contain live in `siteNavigation.js`; the mutations
 * that change a document live here, with every other document mutation.
 *
 * Everything in this file is a pure function over plain data. There is no server
 * state here: when the backend has no draft the editor starts from
 * `createLocalDraftDocument`, which is clearly marked as a local, unsaved
 * working state. Persistence is the service's job and is refused until the
 * backend exists.
 */

import {
  buildSectionSpec,
  getSiteSection,
  SECTION_TYPE,
} from '@/models/siteSection'
import {
  MENU_ITEM_TYPE,
  buildMenuFromPages,
  createMenuItem,
  getMenuItemById,
  normalizeMenuItem,
  normalizeNavigation,
  normalizeSlug,
  reindexMenuItems,
  resolveMenuItemHref,
  resolveMenuItemLabel,
} from '@/models/siteNavigation'
import {
  BACKGROUND_POSITION,
  clampOverlayOpacity,
  getMediaPreviewUrl,
  IMAGE_FIT,
  isSafeMediaUrl,
  normalizeBackgroundPosition,
  normalizeImageFit,
  normalizeMediaItem,
  normalizeOverlayColor,
  safeMediaUrl,
} from '@/models/siteMedia'
import {
  DEFAULT_SITE_THEME_ID,
  getSiteThemeCssVars,
  normalizeSiteTheme,
  resolveSiteColor,
  SITE_COLOR_TOKENS,
} from '@/models/siteTheme'

/**
 * Canvas widths for the device preview. These change the canvas frame only;
 * the editor shell itself is never resized by them.
 */
export const EDITOR_DEVICE = Object.freeze({
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile',
})

export const EDITOR_DEVICE_WIDTHS = Object.freeze({
  [EDITOR_DEVICE.DESKTOP]: 1440,
  [EDITOR_DEVICE.TABLET]: 834,
  [EDITOR_DEVICE.MOBILE]: 390,
})

export const EDITOR_DEVICES = Object.freeze([
  { id: EDITOR_DEVICE.DESKTOP, labelKey: 'editor.device.desktop' },
  { id: EDITOR_DEVICE.TABLET, labelKey: 'editor.device.tablet' },
  { id: EDITOR_DEVICE.MOBILE, labelKey: 'editor.device.mobile' },
])

export const BLOCK_TYPE = Object.freeze({
  FORM: 'form',
  HEADING: 'heading',
  TEXT: 'text',
  BUTTON: 'button',
  IMAGE: 'image',
  SPACER: 'spacer',
})

/** The block types this phase supports, in the order the palette shows them. */
export const BLOCK_TYPES = Object.freeze([
  BLOCK_TYPE.FORM,
  BLOCK_TYPE.HEADING,
  BLOCK_TYPE.TEXT,
  BLOCK_TYPE.BUTTON,
  BLOCK_TYPE.IMAGE,
  BLOCK_TYPE.SPACER,
])

/** Label keys for the palette, the canvas badge and the settings panel title. */
export const BLOCK_TYPE_LABELS = Object.freeze({
  [BLOCK_TYPE.FORM]: 'forms.title',
  [BLOCK_TYPE.HEADING]: 'editor.block.heading',
  [BLOCK_TYPE.TEXT]: 'editor.block.text',
  [BLOCK_TYPE.BUTTON]: 'editor.block.button',
  [BLOCK_TYPE.IMAGE]: 'editor.block.image',
  [BLOCK_TYPE.SPACER]: 'editor.block.spacer',
})

/**
 * A section either came from the library or is a plain band.
 *
 * `CUSTOM` is what a migrated or empty band is: it has settings and children but
 * no library meaning, so it is never offered in the library picker.
 */
export const SECTION_KIND = Object.freeze({ ...SECTION_TYPE, CUSTOM: 'custom' })

export const SECTION_KINDS = Object.freeze(Object.values(SECTION_KIND))

/** How the editor reports what is selected. */
export const SELECTION_KIND = Object.freeze({
  BLOCK: 'block',
  SECTION: 'section',
})

export const createSelection = (kind, id) => ({ kind, id })
export const isSameSelection = (a, b) => a?.kind === b?.kind && a?.id === b?.id

export const TEXT_ALIGNMENTS = Object.freeze([
  { value: 'left', labelKey: 'editor.align.left' },
  { value: 'center', labelKey: 'editor.align.center' },
  { value: 'right', labelKey: 'editor.align.right' },
])

export const FONT_WEIGHTS = Object.freeze([
  { value: 400, labelKey: 'editor.weight.regular' },
  { value: 500, labelKey: 'editor.weight.medium' },
  { value: 700, labelKey: 'editor.weight.bold' },
  { value: 800, labelKey: 'editor.weight.extrabold' },
])

/**
 * Block style bounds. Padding and radius share one scale so a section band and
 * the block inside it stay visually related.
 */
export const STYLE_BOUNDS = Object.freeze({
  fontSize: Object.freeze({ min: 12, max: 72, step: 1 }),
  padding: Object.freeze({ min: 0, max: 96, step: 4 }),
  radius: Object.freeze({ min: 0, max: 48, step: 2 }),
  height: Object.freeze({ min: 24, max: 480, step: 8 }),
})

/** Section style bounds. Max width is capped below the widest device frame. */
export const SECTION_STYLE_BOUNDS = Object.freeze({
  padding: Object.freeze({ min: 0, max: 160, step: 4 }),
  radius: Object.freeze({ min: 0, max: 48, step: 2 }),
  maxWidth: Object.freeze({ min: 320, max: 1600, step: 20 }),
})

/**
 * Width bounds, shared by blocks and sections.
 *
 * `width` is a percentage of the parent and `maxWidth` is a pixel ceiling, which
 * is what "shrink the image but never past this size" needs. Both are on the
 * override list, so an image can be full width on desktop and half width on
 * mobile without a second block.
 */
export const WIDTH_BOUNDS = Object.freeze({
  width: Object.freeze({ min: 10, max: 100, step: 5 }),
  maxWidth: Object.freeze({ min: 80, max: 1600, step: 20 }),
})

/* ------------------------------------------------------------------ *
 * Responsive overrides
 *
 * One base style plus a sparse override per narrower device.
 *
 * Desktop is not an override: it *is* the base style. That is the whole reason
 * the document stays small — a block that differs on mobile stores only the keys
 * that differ, and switching the canvas between devices never copies or forks
 * anything. A property absent from an override means "same as the base", so
 * clearing one property never disturbs the others.
 *
 * Overrides are limited to the handful of properties that genuinely need to
 * differ per device. Layout-heavy properties are deliberately absent: a general
 * override system would let a mobile viewport end up with a different design,
 * and that is not something this editor should be able to express yet.
 * ------------------------------------------------------------------ */

/** The devices that may carry an override. Desktop is the base, not an entry. */
export const RESPONSIVE_DEVICES = Object.freeze([
  EDITOR_DEVICE.TABLET,
  EDITOR_DEVICE.MOBILE,
])

export const isResponsiveDevice = (device) => RESPONSIVE_DEVICES.includes(device)

/** The properties a per-device override may set. */
export const RESPONSIVE_PROPERTIES = Object.freeze([
  'fontSize',
  'padding',
  'align',
  'isVisible',
  'width',
  'maxWidth',
])

export const isResponsiveProperty = (property) => RESPONSIVE_PROPERTIES.includes(property)

/** An empty override set. Frozen so a caller cannot mutate the shared default. */
export const EMPTY_OVERRIDES = Object.freeze({})

/**
 * The override set for `device`.
 *
 * Desktop resolves to nothing because the base style is already the desktop
 * style; that single rule is what keeps a desktop edit from also appearing on
 * every other device.
 */
export const getResponsiveOverride = (node, device) => {
  if (!isResponsiveDevice(device)) {
    return EMPTY_OVERRIDES
  }
  const overrides = node?.overrides
  const value = overrides?.[device]
  return value && typeof value === 'object' ? value : EMPTY_OVERRIDES
}

/** Whether `device` has any override at all, which is what enables the reset. */
export const hasResponsiveOverride = (node, device) =>
  Object.keys(getResponsiveOverride(node, device)).length > 0

/** Which narrower devices `node` has been customised for. */
export const listOverriddenDevices = (node) =>
  RESPONSIVE_DEVICES.filter((device) => hasResponsiveOverride(node, device))

/**
 * The style `node` actually renders with on `device`.
 *
 * The override wins per key, and every other key falls through to the base. This
 * is the only place a device is allowed to change how a node looks.
 */
export const getEffectiveStyle = (node, device) => ({
  ...(node?.style ?? {}),
  ...getResponsiveOverride(node, device),
})

/**
 * Whether `node` should appear on `device`.
 *
 * A section or block hidden everywhere is hidden everywhere; one hidden only on
 * mobile is still shown on desktop. The two states are kept separate because
 * "hidden" and "hidden on this device" are different decisions with different
 * reasons, and conflating them loses the reason.
 */
export const isVisibleAtDevice = (node, device) => {
  if (node?.isVisible === false) {
    return false
  }
  return getResponsiveOverride(node, device).isVisible !== false
}

/** Options offered by the font-size select, clamped to the style bounds. */
export const FONT_SIZE_OPTIONS = Object.freeze(
  Array.from(
    { length: Math.floor((STYLE_BOUNDS.fontSize.max - STYLE_BOUNDS.fontSize.min) / 2) + 1 },
    (_, index) => STYLE_BOUNDS.fontSize.min + index * 2,
  ),
)

/* ------------------------------------------------------------------ *
 * Stable ids
 *
 * Ids are generated from monotonic counters rather than random values so a
 * draft is reproducible: reloading the editor with the same seed produces the
 * same ids, which keeps debugging and future API diffs sane.
 * ------------------------------------------------------------------ */

let blockCounter = 0
let pageCounter = 0
let sectionCounter = 0

export const createBlockId = () => {
  blockCounter += 1
  return `block-${blockCounter}`
}

export const createPageId = () => {
  pageCounter += 1
  return `page-${pageCounter}`
}

export const createSectionId = () => {
  sectionCounter += 1
  return `section-${sectionCounter}`
}

/* ------------------------------------------------------------------ *
 * Validation helpers
 * ------------------------------------------------------------------ */

const clamp = (value, { min, max }) => Math.min(Math.max(Number(value) || min, min), max)

const isTextAlign = (value) => TEXT_ALIGNMENTS.some((option) => option.value === value)

/**
 * Blocks and sections only accept CSS colours the canvas understands, or a theme
 * token name from `siteTheme.js`. `var(...)` is rejected on purpose: a style
 * value resolves tokens through a fixed allowlist instead, so a stored colour can
 * never smuggle arbitrary CSS into the page.
 */
const isSafeColor = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return false
  }
  const candidate = value.trim()
  return (
    /^(transparent|currentColor)$/i.test(candidate) ||
    /*
     * A bare word is only accepted if it is a real site colour token.
     *
     * Matching "any lowercase word" is what let a typo like `background:
     * 'background'` reach the canvas: it looked like a token, satisfied the
     * pattern, and then rendered as the invalid declaration `background:
     * background`, which the browser silently discards. Requiring membership of
     * the allowlist means an unknown name is rejected at the edge instead.
     */
    SITE_COLOR_TOKENS.includes(candidate) ||
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(candidate) ||
    /^(rgb|hsl)a?\(/i.test(candidate)
  )
}

/**
 * Whether `value` is a colour this editor can store.
 *
 * Exported so the settings panel can share the model's own rule rather than
 * keeping a second, drifting copy of it. The panel needs it because a colour is
 * typed one character at a time, and every intermediate value ("#", "#1",
 * "#12") is invalid; without this the controlled field would reject each
 * keystroke and snap back, making a hex code impossible to type.
 */
export const isValidEditorColor = isSafeColor

/**
 * Drops the style keys a user edit tried to set to an unusable value.
 *
 * `normalizeBlock`/`normalizeSection` and `normalizeGlobalStyles` deliberately
 * treat a rejected value as "fall back to the default", because they normalise
 * untrusted input such as an API response, where the default is the right
 * answer. That is the wrong answer for an edit: if the settings panel sends a
 * colour the canvas cannot use, the colour the user already chose should stay
 * put rather than being silently reset. So the edit path removes the bad key
 * first, which lets the merge below keep the current value.
 *
 * `null` is the one accepted way to clear a colour back to the theme default. An
 * empty string is not, because the same empty string arrives whenever the colour
 * text field is mid-edit, and treating that as a reset would wipe the colour out
 * from under the user while they type.
 */
const sanitizeStylePatch = (patch) => {
  if (!patch || typeof patch !== 'object') {
    return {}
  }

  const clean = {}
  for (const key of ['fontSize', 'fontWeight', 'padding', 'radius', 'height', 'contentWidth', 'width', 'maxWidth']) {
    if (Number.isFinite(Number(patch[key]))) {
      clean[key] = patch[key]
    }
  }
  if (isTextAlign(patch.align)) {
    clean.align = patch.align
  }
  for (const key of ['textColor', 'background']) {
    if (patch[key] === null) {
      clean[key] = ''
    } else if (isSafeColor(patch[key])) {
      clean[key] = patch[key]
    }
  }
  return clean
}

/**
 * Cleans one device override.
 *
 * Only the responsive properties are considered, so an override can never carry a
 * colour or a font stack and quietly become a second styling system. Values that
 * are unusable are dropped rather than replaced: a dropped key means "inherit the
 * base value for this device", which is the correct meaning for an override and
 * is what makes a partial override safe.
 */
export const sanitizeResponsivePatch = (patch) => {
  if (!patch || typeof patch !== 'object') {
    return {}
  }

  const clean = {}
  for (const [key, bounds] of [
    ['fontSize', STYLE_BOUNDS.fontSize],
    ['padding', STYLE_BOUNDS.padding],
    ['width', WIDTH_BOUNDS.width],
    ['maxWidth', WIDTH_BOUNDS.maxWidth],
  ]) {
    if (Number.isFinite(Number(patch[key]))) {
      clean[key] = clamp(patch[key], bounds)
    }
  }
  if (isTextAlign(patch.align)) {
    clean.align = patch.align
  }
  // Visibility is the one property where "not mentioned" and "show" must be
  // different values, so it is only written when a boolean is actually given.
  if (typeof patch.isVisible === 'boolean') {
    clean.isVisible = patch.isVisible
  }
  return clean
}

/**
 * Normalises a whole override map from untrusted input.
 *
 * A device whose entry is unusable is dropped instead of being kept as an empty
 * object, so `hasResponsiveOverride` stays an honest answer rather than reporting
 * a customisation that changes nothing.
 */
export const normalizeOverrides = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {}
  }

  const clean = {}
  for (const device of RESPONSIVE_DEVICES) {
    const patch = sanitizeResponsivePatch(raw[device])
    if (Object.keys(patch).length > 0) {
      clean[device] = patch
    }
  }
  return clean
}

/**
 * Merges a new override into a node's override map.
 *
 * An empty result deletes the device entry rather than storing `{}`, which is
 * what makes "reset to default" the same operation as editing the last override
 * away.
 */
const mergeOverride = (existing, device, patch) => {
  const next = { ...existing[device], ...patch }
  const result = { ...existing }
  if (Object.keys(next).length > 0) {
    result[device] = next
  } else {
    delete result[device]
  }
  return result
}

/**
 * Applies an override patch to a node's whole override map.
 *
 * One mechanism covers every case the settings panel needs, and the shape reads
 * the way the stored data does:
 *
 *   { mobile: { fontSize: 20 } }   set or change mobile values
 *   { mobile: null }               reset mobile to the base style
 *   { tablet: { isVisible: true } } restore a device-hidden section
 *
 * A device that is not mentioned is untouched.
 */
const applyOverridesPatch = (existing, patch) => {
  if (!patch || typeof patch !== 'object') {
    return normalizeOverrides(existing)
  }

  let result = { ...existing }
  for (const device of RESPONSIVE_DEVICES) {
    if (!(device in patch)) {
      continue
    }
    const value = patch[device]
    if (value === null) {
      const { [device]: _removed, ...rest } = result
      result = rest
      continue
    }
    result = mergeOverride(result, device, sanitizeResponsivePatch(value))
  }
  return normalizeOverrides(result)
}

/** Resets one device's override so the base style applies again. */
export const resetResponsiveOverride = (document, { kind, id }, device) => {
  if (!isResponsiveDevice(device)) {
    return document
  }
  const target = kind === 'section' ? updateSection : updateBlock
  return target(document, id, { overrides: { [device]: null } })
}

/* ------------------------------------------------------------------ *
 * Blocks
 * ------------------------------------------------------------------ */

/**
 * Per-type starting content and style.
 *
 * Text-ish blocks carry `fontSize`/`fontWeight`; images and spacers carry a
 * `height`. A block only ever reads the keys that are meaningful for it, which
 * is what lets the settings panel stay small.
 *
 * The default copy here is a last-resort fallback. The editor always supplies
 * translated copy, so a visitor never sees these strings.
 */
const BLOCK_PRESETS = Object.freeze({
  [BLOCK_TYPE.FORM]: Object.freeze({
    content: Object.freeze({}),
  }),
  [BLOCK_TYPE.HEADING]: Object.freeze({
    content: Object.freeze({ text: 'Səhifə başlığı' }),
  }),
  [BLOCK_TYPE.TEXT]: Object.freeze({
    content: Object.freeze({ text: 'Burada mətniniz yazılacaq.' }),
  }),
  [BLOCK_TYPE.BUTTON]: Object.freeze({
    content: Object.freeze({ label: 'Düymə', href: '' }),
  }),
  [BLOCK_TYPE.IMAGE]: Object.freeze({
    /*
     * `media` is the whole image record rather than a bare `src`, so switching
     * between a library item, a typed url and a local preview does not need three
     * different shapes. `src` is kept for the same reason a field is sometimes
     * kept: a typed url is a real source and a legacy draft still has one.
     */
    content: Object.freeze({ alt: '', src: '', media: null, fit: IMAGE_FIT.COVER, href: '' }),
  }),
  [BLOCK_TYPE.SPACER]: Object.freeze({
    content: Object.freeze({}),
  }),
})

export const getBlockPreset = (type) => BLOCK_PRESETS[type] ?? BLOCK_PRESETS[BLOCK_TYPE.TEXT]

/**
 * Normalises an image block's content.
 *
 * `media` and `src` are two doors into the same picture, kept in step rather than
 * independent: when a media record is present its url is mirrored into `src`, and
 * a bare `src` is left as `src` with no record invented for it. That matters
 * because inventing a record would mint a fresh id on every normalisation, so a
 * stored id would change each time the block was touched.
 *
 * The canvas reads whichever is set through `getBlockImageUrl`, so neither field
 * has to win.
 */
const normalizeImageContent = (rawContent) => {
  const media = rawContent?.media ? normalizeMediaItem(rawContent.media) : null
  const mediaUrl = getMediaPreviewUrl(media)
  const typedUrl = isSafeMediaUrl(rawContent?.src) ? rawContent.src.trim() : ''

  return {
    alt: typeof rawContent?.alt === 'string' ? rawContent.alt : media?.alt ?? '',
    src: mediaUrl ?? typedUrl,
    media,
    fit: normalizeImageFit(rawContent?.fit),
    href: typeof rawContent?.href === 'string' ? rawContent.href : '',
  }
}

/**
 * Coerces any incoming block into a valid editor block.
 *
 * This is the single place that trusts the outside world, so both a locally
 * created block and a future API response end up with the same guaranteed shape.
 */
export const normalizeBlock = (raw) => {
  const type = BLOCK_TYPES.includes(raw?.type) ? raw.type : BLOCK_TYPE.TEXT
  const preset = getBlockPreset(type)
  const rawContent = raw?.content ?? {}
  const rawStyle = raw?.style ?? {}

  const content =
    type === BLOCK_TYPE.FORM
      ? { form: rawContent.form ? normalizeSiteForm(rawContent.form) : createStarterForm() }
      : type === BLOCK_TYPE.IMAGE
      ? normalizeImageContent(rawContent)
      : (() => {
          const base = { ...preset.content }
          for (const key of Object.keys(base)) {
            if (typeof rawContent[key] === 'string') {
              base[key] = rawContent[key]
            }
          }
          return base
        })()

  if (type === BLOCK_TYPE.BUTTON) content.variant = rawContent.variant === 'secondary' ? 'secondary' : 'primary'

  const style = {}
  if (Number.isFinite(rawStyle.fontSize)) {
    style.fontSize = clamp(rawStyle.fontSize, STYLE_BOUNDS.fontSize)
  }
  if (Number.isFinite(rawStyle.fontWeight)) {
    style.fontWeight = clamp(rawStyle.fontWeight, { min: 100, max: 900 })
  }
  if (isTextAlign(rawStyle.align)) {
    style.align = rawStyle.align
  }
  if (isSafeColor(rawStyle.textColor)) {
    style.textColor = rawStyle.textColor
  }
  if (isSafeColor(rawStyle.background)) {
    style.background = rawStyle.background
  }
  if (Number.isFinite(rawStyle.padding)) {
    style.padding = clamp(rawStyle.padding, STYLE_BOUNDS.padding)
  }
  if (Number.isFinite(rawStyle.radius)) {
    style.radius = clamp(rawStyle.radius, STYLE_BOUNDS.radius)
  }
  if (Number.isFinite(rawStyle.height)) {
    style.height = clamp(rawStyle.height, STYLE_BOUNDS.height)
  }
  if (Number.isFinite(rawStyle.width)) {
    style.width = clamp(rawStyle.width, WIDTH_BOUNDS.width)
  }
  // `maxWidth: 0` means "no ceiling", so it is stored rather than treated as
  // missing. A block is not required to have a maximum size.
  if (Number.isFinite(rawStyle.maxWidth)) {
    style.maxWidth = clamp(rawStyle.maxWidth, { min: 0, max: WIDTH_BOUNDS.maxWidth.max })
  }

  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : createBlockId(),
    type,
    isVisible: raw?.isVisible !== false,
    content,
    style,
    animation: normalizeAnimation(raw?.animation),
    overrides: normalizeOverrides(raw?.overrides),
  }
}

/** Creates a new block of `type`, optionally overriding parts of the preset. */
export const createBlock = (type, { content, style } = {}) =>
  normalizeBlock({
    type,
    content: { ...getBlockPreset(type).content, ...(content ?? {}) },
    style: style ?? {},
  })

// All duplication paths must regenerate form and field identifiers as well.
const cloneBlock = (block) => normalizeBlock({
  ...block, id: createBlockId(),
  content: block.type === BLOCK_TYPE.FORM ? { form: duplicateForm(block.content.form) } : { ...block.content },
})

/* ------------------------------------------------------------------ *
 * Sections
 * ------------------------------------------------------------------ */

export const DEFAULT_SECTION_STYLE = Object.freeze({})

/**
 * The default look of a section background image.
 *
 * Kept beside the colour default rather than inside `style` so that a section with
 * no background image carries no background-image keys at all. A style object full
 * of unused image fields would make every section look customised.
 */
export const DEFAULT_BACKGROUND_IMAGE = Object.freeze({
  media: null,
  fit: IMAGE_FIT.COVER,
  position: BACKGROUND_POSITION.CENTER,
  overlayColor: 'text',
  overlayOpacity: 0,
})

/**
 * Normalises a section's background image.
 *
 * Returns `null` when there is no usable media, because "no background image" and
 * "a background image with nothing to show" are the same state and keeping an
 * empty object around would make the settings panel show controls for an image
 * that does not exist.
 */
export const normalizeBackgroundImage = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const media = raw.media ? normalizeMediaItem(raw.media) : null
  if (!media || getMediaPreviewUrl(media) === null) {
    return null
  }
  return {
    media,
    fit: normalizeImageFit(raw.fit),
    position: normalizeBackgroundPosition(raw.position),
    overlayColor: normalizeOverlayColor(raw.overlayColor),
    overlayOpacity: clampOverlayOpacity(raw.overlayOpacity),
  }
}

/**
 * Coerces any incoming section into a valid editor section.
 *
 * `isVisible` is a real field rather than a style, because hiding a section is a
 * structural decision, not a paint decision, and it has to survive a round trip
 * through storage without being confused with a transparent background. A
 * per-device `isVisible` override sits alongside it for the same reason.
 */
export const normalizeSection = (raw) => {
  const rawStyle = raw?.style ?? {}

  const style = {}
  if (isSafeColor(rawStyle.background)) {
    style.background = rawStyle.background
  }
  if (Number.isFinite(rawStyle.padding)) {
    style.padding = clamp(rawStyle.padding, SECTION_STYLE_BOUNDS.padding)
  }
  if (Number.isFinite(rawStyle.radius)) {
    style.radius = clamp(rawStyle.radius, SECTION_STYLE_BOUNDS.radius)
  }
  if (Number.isFinite(rawStyle.maxWidth)) {
    style.maxWidth = clamp(rawStyle.maxWidth, SECTION_STYLE_BOUNDS.maxWidth)
  }
  if (isTextAlign(rawStyle.align)) {
    style.align = rawStyle.align
  }
  if (Number.isFinite(rawStyle.width)) {
    style.width = clamp(rawStyle.width, WIDTH_BOUNDS.width)
  }

  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : createSectionId(),
    type: SECTION_KINDS.includes(raw?.type) ? raw.type : SECTION_KIND.CUSTOM,
    isVisible: raw?.isVisible !== false,
    style,
    backgroundImage: normalizeBackgroundImage(raw?.backgroundImage),
    animation: normalizeAnimation(raw?.animation),
    overrides: normalizeOverrides(raw?.overrides),
    blocks: Array.isArray(raw?.blocks) ? raw.blocks.map(normalizeBlock) : [],
  }
}

/** Creates an empty section of `type`. */
export const createSection = (type, { style, blocks = [] } = {}) =>
  normalizeSection({ type, style, blocks })

/**
 * Builds a section from the library.
 *
 * `t` is required: a section must never fall back to a hard-coded string that
 * would ignore the visitor's language. The preset contributes its style and its
 * placeholder copy, and the blocks are ordinary editor blocks the user can then
 * select, reorder and delete.
 */
export const createSectionFromLibrary = (type, t) => {
  const preset = getSiteSection(type)
  if (!preset || typeof t !== 'function') {
    return null
  }
  const spec = buildSectionSpec(preset, t)
  return normalizeSection({
    type: spec.type,
    style: {},
    blocks: spec.blocks.map((block) => createBlock(block.type, { content: block.content })),
  })
}

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

export const DEFAULT_PAGE_NAME = 'Ana səhifə'

/**
 * Search-engine text lengths.
 *
 * Sixty characters for a title and a hundred and sixty for a description are the
 * point past which the common engines truncate. The limits are the model's, not a
 * comment, so a pasted paragraph is cut instead of stored and then cut by
 * something else later.
 */
export const SEO_MAX = Object.freeze({ title: 60, description: 160 })

/**
 * Coerces a page into the page -> section -> block shape.
 *
 * A flat `blocks` array with no `sections` is wrapped into a single plain
 * section, so a draft written before sections existed still opens instead of
 * silently losing its content.
 */
export const normalizePage = (raw) => {
  const hasSections = Array.isArray(raw?.sections) && raw.sections.length
  const sections = hasSections
    ? raw.sections.map(normalizeSection)
    : Array.isArray(raw?.blocks) && raw.blocks.length
      ? [normalizeSection({ type: SECTION_KIND.CUSTOM, blocks: raw.blocks })]
      : []

  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : createPageId(),
    name: typeof raw?.name === 'string' && raw.name.trim() ? raw.name : DEFAULT_PAGE_NAME,
    /*
     * Slugs are cleaned rather than rejected. A draft written before slugs were
     * editable carries values like "About Us", and refusing to open it would be a
     * worse answer than quietly making it "about-us".
     */
    slug: normalizeSlug(raw?.slug),
    isHome: raw?.isHome === true,
    /*
     * `order` mirrors the page's position in `document.pages` and is rewritten by
     * `reindexPages` on every path that changes the list, so it cannot drift from
     * the array. It is stored rather than derived because a backend that orders by
     * a column should not need the local draft translated into a different shape
     * before it is sent.
     */
    order: Number.isFinite(Number(raw?.order)) ? Math.max(0, Math.trunc(Number(raw.order))) : 0,
    /*
     * Search-engine fields are plain strings on the page. They are stored empty by
     * default and shown as hints, because a builder that invents a title the user
     * did not write is making a claim about their site that they never made.
     */
    seoTitle: typeof raw?.seoTitle === 'string' ? raw.seoTitle.slice(0, SEO_MAX) : '',
    seoDescription: typeof raw?.seoDescription === 'string' ? raw.seoDescription.slice(0, SEO_MAX) : '',
    sections,
  }
}

/**
 * Rewrites each page's `order` to its position in the list.
 *
 * The single writer of that field, called by every mutation that reorders or adds
 * a page. Keeping it in one function is what makes storing `order` safe: there is
 * no other place that could set it inconsistently.
 */
export const reindexPages = (pages) =>
  (pages ?? []).map((page, index) => (page.order === index ? page : { ...page, order: index }))

/**
 * Marks one page as the home page and clears the flag on every other page.
 *
 * Done in a single pass so the document can never hold two home pages between
 * two writes, which is the only window where a reader would see a wrong one.
 */
const applySingleHomePage = (pages, homePageId) =>
  pages.map((page) => {
    if (page.id === homePageId) {
      return page.isHome ? page : { ...page, isHome: true }
    }
    return page.isHome ? { ...page, isHome: false } : page
  })

/**
 * Makes the home-page flag correct no matter what the list looked like on arrival.
 *
 * A draft that arrives with no home page gets the first one. A draft that somehow
 * arrives with two keeps the first, because that is the one the user put at the
 * top, and the other falls back to being an ordinary page. Both of these are
 * states a document should never be left in.
 *
 * Pages whose flag is already correct are returned as they are rather than
 * copied, so this does not defeat React's identity checks on every keystroke.
 */
const withGuaranteedHomePage = (pages) => {
  const homeIndex = pages.findIndex((page) => page.isHome)
  return pages.map((page, index) => {
    const shouldBeHome = homeIndex === -1 ? index === 0 : index === homeIndex
    return page.isHome === shouldBeHome ? page : { ...page, isHome: shouldBeHome }
  })
}

export const createPage = ({
  name = DEFAULT_PAGE_NAME,
  slug = '',
  isHome = false,
  seoTitle = '',
  seoDescription = '',
  sections = [],
} = {}) =>
  normalizePage({ name, slug, isHome, seoTitle, seoDescription, sections })

/* ------------------------------------------------------------------ *
 * Global styles + document
 * ------------------------------------------------------------------ */

export const DEFAULT_GLOBAL_STYLES = Object.freeze({})

export const normalizeGlobalStyles = (raw) => {
  const base = { ...DEFAULT_GLOBAL_STYLES }
  if (isSafeColor(raw?.background)) {
    base.background = raw.background
  }
  if (isSafeColor(raw?.textColor)) {
    base.textColor = raw.textColor
  }
  if (Number.isFinite(Number(raw?.contentWidth))) {
    base.contentWidth = clamp(raw.contentWidth, { min: 320, max: 1600 })
  }
  return base
}

/**
 * The starting working state when the backend has no draft.
 *
 * This is a local, unsaved document - not a project, not a page from the API and
 * not a published site. It exists so the canvas has something to edit, and
 * `isLocalDraft` stays true until a real draft is loaded or saved.
 *
 * `templateId` and `theme` are optional. Without them the draft starts as one
 * page with a few editable blocks, which is what a visitor who has not chosen a
 * template yet needs to see.
 *
 * The starter copy is passed in by the caller so it can be translated. The
 * fallback is only used when the editor is constructed outside the app.
 */
export const createLocalDraftDocument = ({ name = DEFAULT_PAGE_NAME, copy, t, pageSkeletons } = {}) => {
  const starter = {
    heading: 'Veb saytınızın başlığı',
    text: 'Bu mətni redaktorda dəyişə bilərsiniz.',
    button: 'Daha çox öyrənin',
    ...(copy ?? {}),
  }

  // A template skeleton wins when it has sections; otherwise fall back to a
  // single page holding the three starter blocks.
  const skeletons = Array.isArray(pageSkeletons) && pageSkeletons.length ? pageSkeletons : null

  const pages = skeletons
    ? skeletons.map((skeleton, index) =>
        createPage({
          name: skeleton?.name ? skeleton.name : index === 0 ? name : DEFAULT_PAGE_NAME,
          sections: (skeleton?.sections ?? [])
            .map((type) => createSectionFromLibrary(type, t))
            .filter(Boolean),
        }),
      )
    : [
        createPage({
          name,
          sections: [
            createSection(SECTION_KIND.CUSTOM, {
              blocks: [
                createBlock(BLOCK_TYPE.HEADING, { content: { text: starter.heading } }),
                createBlock(BLOCK_TYPE.TEXT, { content: { text: starter.text } }),
                createBlock(BLOCK_TYPE.BUTTON, { content: { label: starter.button, href: '' } }),
              ],
            }),
          ],
        }),
      ]

  return {
    siteId: null,
    /** A local working state, never a persisted or published document. */
    isLocalDraft: true,
    /*
     * The starter document gets no menu. An empty menu is the honest starting
     * point because the header is part of what the user is about to design, and
     * filling it with every page would be this code deciding their navigation for
     * them. `buildMenuFromPages` is offered as an explicit action instead.
     */
    pages: withGuaranteedHomePage(reindexPages(pages)),
    activePageId: pages[0].id,
    navigation: normalizeNavigation(null),
    motion: normalizeSiteMotion(),
    theme: normalizeSiteTheme(DEFAULT_SITE_THEME_ID),
    globalStyles: { ...DEFAULT_GLOBAL_STYLES },
    updatedAt: null,
  }
}

/**
 * Normalises a document from any source into the shape the editor renders.
 *
 * This is the one place the cross-page invariants are enforced, so a document from
 * a future API, a stored draft and a freshly built local draft all arrive with the
 * same guarantees: pages numbered from zero, exactly one home page, and a
 * navigation whose items are numbered from zero too.
 */
export const normalizeEditorDocument = (raw) => {
  const pages = Array.isArray(raw?.pages) && raw.pages.length
    ? reindexPages(raw.pages.map(normalizePage))
    : [createPage()]

  const activePageId = pages.some((page) => page.id === raw?.activePageId)
    ? raw.activePageId
    : pages[0].id

  return {
    siteId: typeof raw?.siteId === 'string' ? raw.siteId : null,
    isLocalDraft: raw?.isLocalDraft === true,
    pages: withGuaranteedHomePage(pages),
    activePageId,
    navigation: normalizeNavigation(raw?.navigation),
    motion: normalizeSiteMotion(raw?.motion),
    theme: normalizeSiteTheme(raw?.theme),
    globalStyles: normalizeGlobalStyles(raw?.globalStyles),
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

export const getActivePage = (document) =>
  document?.pages?.find((page) => page.id === document.activePageId) ?? document?.pages?.[0] ?? null

export const getPageById = (document, pageId) =>
  document?.pages?.find((page) => page.id === pageId) ?? null

export const getSectionById = (page, sectionId) =>
  page?.sections?.find((section) => section.id === sectionId) ?? null

export const getBlockById = (page, blockId) =>
  page?.sections?.flatMap((section) => section.blocks).find((block) => block.id === blockId) ?? null

/**
 * Locates a block and the section that owns it.
 *
 * The editor needs the owning section for almost every block action, so this is
 * the lookup those actions share instead of each one searching again.
 */
export const findBlock = (page, blockId) => {
  for (const section of page?.sections ?? []) {
    const index = section.blocks.findIndex((block) => block.id === blockId)
    if (index >= 0) {
      return { section, block: section.blocks[index], index }
    }
  }
  return null
}

/** The section a new block should land in: the requested one, else the last. */
export const resolveTargetSection = (page, sectionId) => {
  if (!page) {
    return null
  }
  if (sectionId) {
    return getSectionById(page, sectionId)
  }
  return page.sections[page.sections.length - 1] ?? null
}

/* ------------------------------------------------------------------ *
 * Document mutations
 *
 * Each helper returns a new document with `updatedAt` refreshed, so the editor
 * can mark itself unsaved without tracking timestamps by hand.
 * ------------------------------------------------------------------ */

const touch = (document, next) => ({
  ...next,
  updatedAt: new Date().toISOString(),
})

/** Applies `updater` to the active page and returns a new document. */
const withActivePage = (document, updater) => {
  const page = getActivePage(document)
  if (!page) {
    return document
  }
  const nextPage = updater(page)
  if (nextPage === page) {
    return document
  }
  return touch(document, {
    ...document,
    pages: document.pages.map((item) => (item.id === page.id ? nextPage : item)),
  })
}

/** Applies `updater` to one section of the active page. */
const withSection = (document, sectionId, updater) =>
  withActivePage(document, (page) => {
    if (!getSectionById(page, sectionId)) {
      return page
    }
    return {
      ...page,
      sections: page.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }
  })

/**
 * A page that ends up with no sections at all would have nowhere to add a block,
 * so a plain band is created on demand. This is what lets the user delete every
 * section and still keep working.
 */
const ensureSection = (page) =>
  page.sections.length > 0
    ? page
    : { ...page, sections: [createSection(SECTION_KIND.CUSTOM)] }

/* ---- Sections ---- */

export const insertSection = (document, type, { t, atIndex } = {}) => {
  const section = createSectionFromLibrary(type, t)
  if (!section) {
    return { document, sectionId: null }
  }

  const next = withActivePage(document, (page) => {
    const sections = [...page.sections]
    const index = Number.isInteger(atIndex) ? clamp(atIndex, { min: 0, max: sections.length }) : sections.length
    sections.splice(index, 0, section)
    return { ...page, sections }
  })

  return { document: next, sectionId: section.id }
}

export const updateSection = (document, sectionId, patch) =>
  withSection(document, sectionId, (section) =>
    normalizeSection({
      ...section,
      isVisible: typeof patch?.isVisible === 'boolean' ? patch.isVisible : section.isVisible,
      style: { ...section.style, ...sanitizeStylePatch(patch?.style) },
      // `undefined` means "not mentioned", so an unrelated style edit cannot drop
      // a background image the user already chose.
      backgroundImage:
        patch?.backgroundImage === undefined
          ? section.backgroundImage
          : normalizeBackgroundImage(patch.backgroundImage),
      animation: normalizeAnimation({ ...section.animation, ...patch?.animation }),
      overrides: applyOverridesPatch(section.overrides, patch?.overrides),
    }),
  )

export const removeSection = (document, sectionId) =>
  withActivePage(document, (page) => ({
    ...page,
    sections: page.sections.filter((section) => section.id !== sectionId),
  }))

/** Moves a section by `offset` positions, clamped to the page bounds. */
export const moveSection = (document, sectionId, offset) =>
  withActivePage(document, (page) => {
    const from = page.sections.findIndex((section) => section.id === sectionId)
    if (from < 0) {
      return page
    }
    const to = clamp(from + offset, { min: 0, max: page.sections.length - 1 })
    if (to === from) {
      return page
    }
    const sections = [...page.sections]
    const [moved] = sections.splice(from, 1)
    sections.splice(to, 0, moved)
    return { ...page, sections }
  })

/**
 * Copies a section and every block in it, each with a fresh id.
 *
 * The copy is taken from the stored blocks rather than re-resolved from the
 * library, so duplicating a section the user has edited duplicates *their* work.
 * The duplicate lands directly after the original and its id is returned so the
 * editor can select the copy straight away.
 */
export const duplicateSection = (document, sectionId) => {
  const page = getActivePage(document)
  const section = getSectionById(page, sectionId)
  if (!page || !section) {
    return { document, insertedId: null }
  }

  const copy = normalizeSection({
    ...section,
    id: createSectionId(),
    blocks: section.blocks.map(cloneBlock),
  })

  const sections = [...page.sections]
  sections.splice(page.sections.indexOf(section) + 1, 0, copy)

  return {
    document: touch(document, {
      ...document,
      pages: document.pages.map((item) => (item.id === page.id ? { ...item, sections } : item)),
    }),
    insertedId: copy.id,
  }
}

/* ---- Blocks ---- */

/**
 * Inserts a block. With no `sectionId` the block is appended to the last section
 * of the active page, which is what "add block" from the palette means.
 */
export const insertBlock = (document, type, { sectionId, atIndex, content } = {}) =>
  withActivePage(document, (page) => {
    const targetPage = ensureSection(page)
    const target = resolveTargetSection(targetPage, sectionId) ?? targetPage.sections[0]
    const block = createBlock(type, { content })
    const blocks = [...target.blocks]
    const index = Number.isInteger(atIndex) ? clamp(atIndex, { min: 0, max: blocks.length }) : blocks.length
    blocks.splice(index, 0, block)
    return {
      ...targetPage,
      sections: targetPage.sections.map((section) => (section.id === target.id ? { ...section, blocks } : section)),
    }
  })

export const updateBlock = (document, blockId, patch) =>
  withActivePage(document, (page) => {
    const found = findBlock(page, blockId)
    if (!found) {
      return page
    }
    return {
      ...page,
      sections: page.sections.map((section) =>
        section.id === found.section.id
          ? {
              ...section,
              blocks: section.blocks.map((block) =>
                block.id === blockId
                  ? normalizeBlock({
                      ...block,
                      // A block hides on every device when the base flag is false.
                      // Hiding one device only is an override, so the two never
                      // fight: the base can turn a block back on while its mobile
                      // override keeps it hidden there.
                      isVisible: typeof patch?.isVisible === 'boolean' ? patch.isVisible : block.isVisible,
                      content: { ...block.content, ...(patch?.content ?? {}) },
                      style: { ...block.style, ...sanitizeStylePatch(patch?.style) },
                      animation: normalizeAnimation({ ...block.animation, ...patch?.animation }),
                      overrides: applyOverridesPatch(block.overrides, patch?.overrides),
                    })
                  : block,
              ),
            }
          : section,
      ),
    }
  })

export const removeBlock = (document, blockId) =>
  withActivePage(document, (page) => {
    if (!findBlock(page, blockId)) {
      return page
    }
    return {
      ...page,
      sections: page.sections.map((section) => ({
        ...section,
        blocks: section.blocks.filter((block) => block.id !== blockId),
      })),
    }
  })

/**
 * Moves a block by `offset` positions *within its own section*, clamped to that
 * section's bounds. A block never jumps between sections: reordering is a local
 * operation, which keeps the keyboard controls predictable.
 */
export const moveBlock = (document, blockId, offset) =>
  withActivePage(document, (page) => {
    const found = findBlock(page, blockId)
    if (!found) {
      return page
    }
    const blocks = [...found.section.blocks]
    const to = clamp(found.index + offset, { min: 0, max: blocks.length - 1 })
    if (to === found.index) {
      return page
    }
    const [moved] = blocks.splice(found.index, 1)
    blocks.splice(to, 0, moved)
    return {
      ...page,
      sections: page.sections.map((section) =>
        section.id === found.section.id ? { ...section, blocks } : section,
      ),
    }
  })

/**
 * Copies a block, placing the duplicate directly after the original.
 *
 * Returns the new block id alongside the document so the editor can select the
 * copy straight away, which is what a user expects after duplicating.
 */
export const duplicateBlock = (document, blockId) => {
  const page = getActivePage(document)
  const found = findBlock(page, blockId)
  if (!page || !found) {
    return { document, insertedId: null }
  }

  const copy = cloneBlock(found.block)
  const blocks = [...found.section.blocks]
  blocks.splice(found.index + 1, 0, copy)

  return {
    document: touch(document, {
      ...document,
      pages: document.pages.map((item) =>
        item.id === page.id
          ? {
              ...item,
              sections: item.sections.map((section) =>
                section.id === found.section.id ? { ...section, blocks } : section,
              ),
            }
          : item,
      ),
    }),
    insertedId: copy.id,
  }
}

/* ---- Pages ---- */

/**
 * The rules every page list change goes through.
 *
 * Renumbering, home-page uniqueness and the "at least one page" floor are all
 * applied in one place. Doing them in each mutation instead would mean the
 * invariants hold only as long as nobody adds a sixth way to change the list,
 * and a document that briefly has two home pages is exactly the kind of state
 * that gets saved.
 */
const withPages = (document, nextPages, { activePageId } = {}) => {
  const reindexed = reindexPages(nextPages)
  const requested = activePageId ?? document.activePageId
  return touch(document, {
    ...document,
    pages: withGuaranteedHomePage(reindexed),
    // A caller can move the selection deliberately; otherwise it stays put unless
    // the page it pointed at is the one that just went away.
    activePageId: reindexed.some((page) => page.id === requested)
      ? requested
      : reindexed[0]?.id ?? null,
  })
}

/** Whether a page can be deleted right now. The last page is never deletable. */
export const canDeletePage = (document) => (document?.pages?.length ?? 0) > 1

/**
 * Adds a page and selects it.
 *
 * A new empty page is only useful if the editor is looking at it, so this is the
 * one page mutation that changes the selection on purpose.
 */
export const addPage = (document, { name, slug = '', seoTitle = '', seoDescription = '' } = {}) => {
  const page = createPage({
    name: name?.trim() || DEFAULT_PAGE_NAME,
    slug,
    seoTitle,
    seoDescription,
  })
  return {
    document: withPages(document, [...document.pages, page], { activePageId: page.id }),
    pageId: page.id,
  }
}

export const renamePage = (document, pageId, name) => {
  const trimmed = name?.trim()
  if (!trimmed) {
    return document
  }
  return withPages(
    document,
    document.pages.map((page) => (page.id === pageId ? { ...page, name: trimmed } : page)),
  )
}

/**
 * Changes a page's slug.
 *
 * A slug may be cleared, because "not set yet" is a real state a page can be in,
 * and a home page legitimately has no slug of its own. The empty string is
 * therefore accepted here while a blank *name* is not.
 */
export const setPageSlug = (document, pageId, slug) =>
  withPages(
    document,
    document.pages.map((page) =>
      page.id === pageId ? { ...page, slug: normalizeSlug(slug) } : page,
    ),
  )

/** Updates a page's search-engine text. Empty is allowed: an unset field is not an error. */
export const updatePageSeo = (document, pageId, patch) =>
  withPages(
    document,
    document.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            seoTitle:
              typeof patch?.seoTitle === 'string' ? patch.seoTitle.slice(0, SEO_MAX.title) : page.seoTitle,
            seoDescription:
              typeof patch?.seoDescription === 'string'
                ? patch.seoDescription.slice(0, SEO_MAX.description)
                : page.seoDescription,
          }
        : page,
    ),
  )

/**
 * Copies a page into the same document.
 *
 * The copy gets a new id, its own block ids and a name that says it is a copy.
 * Ids must be new: a duplicated section sharing a block id with the original
 * would make "which block did I click" ambiguous, and every mutation looks the
 * target up by id.
 *
 * The copy is not the home page, and nothing about it is saved anywhere. It exists
 * in this local draft until a backend does.
 */
export const duplicatePage = (document, pageId) => {
  const source = getPageById(document, pageId)
  if (!source) {
    return { document, pageId: null }
  }

  const copy = normalizePage({
    ...source,
    id: undefined,
    name: `${source.name} (kopya)`,
    // A copy that kept the slug would collide with the page it came from.
    slug: '',
    isHome: false,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
    sections: source.sections.map((section) => ({
      ...section,
      id: undefined,
      blocks: section.blocks.map(cloneBlock),
    })),
  })

  const index = document.pages.findIndex((page) => page.id === pageId)
  const nextPages = [...document.pages]
  // The copy lands directly after its original, which is where someone who just
  // duplicated a page expects to see it.
  nextPages.splice(index + 1, 0, copy)

  return { document: withPages(document, nextPages), pageId: copy.id }
}

/**
 * Deletes a page.
 *
 * The last page is never deletable, so the canvas can never have nothing to edit.
 * Deleting the home page promotes the first remaining page, and any menu item
 * that pointed at the deleted page goes with it, because a menu link to a page
 * that is not there is a dead link in every page header.
 */
export const removePage = (document, pageId) => {
  if (!canDeletePage(document)) {
    return document
  }

  const remaining = document.pages.filter((page) => page.id !== pageId)
  // If the deleted page was the home page, the first survivor takes the flag. The
  // check is on the survivors, so this promotes exactly one page.
  const promoted = remaining.some((page) => page.isHome)
    ? remaining
    : remaining.map((page, index) => (index === 0 ? { ...page, isHome: true } : page))

  return withNavigation(withPages(document, promoted), (navigation) =>
    reindexMenuItems(
      navigation.items.filter(
        (item) => !(item.type === MENU_ITEM_TYPE.PAGE && item.pageId === pageId),
      ),
    ),
  )
}

/** Marks one page as the home page and clears the flag everywhere else. */
export const setHomePage = (document, pageId) => {
  if (!getPageById(document, pageId)) {
    return document
  }
  return withPages(document, applySingleHomePage(document.pages, pageId))
}

export const getHomePage = (document) =>
  document?.pages?.find((page) => page.isHome) ?? document?.pages?.[0] ?? null

export const movePage = (document, pageId, offset) => {
  const from = document.pages.findIndex((page) => page.id === pageId)
  if (from < 0) {
    return document
  }
  const to = clamp(from + offset, { min: 0, max: document.pages.length - 1 })
  if (to === from) {
    return document
  }
  const pages = [...document.pages]
  const [moved] = pages.splice(from, 1)
  pages.splice(to, 0, moved)
  return withPages(document, pages)
}

export const setActivePage = (document, pageId) =>
  getPageById(document, pageId) ? { ...document, activePageId: pageId } : document

/* ---- Navigation ---- */

/**
 * Applies a change to a document's menu.
 *
 * `reindexMenuItems` runs on every write, so `order` cannot fall out of step with
 * the array no matter which mutation produced the new list. The item order is the
 * array order, and this is the only place that says so.
 *
 * An updater that hands back the same list it was given has nothing to write, and
 * the original document comes back untouched. That keeps "nothing changed"
 * comparisons honest for the callers that ask before acting.
 */
const withNavigation = (document, updater) => {
  const current = normalizeNavigation(document.navigation)
  const updated = updater(current)

  if (updated === current.items) {
    return document
  }
  return touch(document, {
    ...document,
    navigation: { items: reindexMenuItems(updated.filter(Boolean)) },
  })
}

export const getNavigationItems = (document) => document?.navigation?.items ?? []

/** The menu as a visitor would see it: ordered, and hidden items removed. */
export const getVisibleMenuItems = (document) =>
  getNavigationItems(document).filter((item) => item.visible)

export const getMenuItem = (document, itemId) => getMenuItemById(document?.navigation, itemId)

/** The label a menu item will actually show, falling back to its page name. */
export const getMenuItemText = (document, item) => resolveMenuItemLabel(item, document?.pages)

/** Where a menu item leads, or `null` when it leads nowhere usable. */
export const getMenuItemTarget = (document, item) => resolveMenuItemHref(item, document?.pages)

/**
 * Adds a menu item.
 *
 * A new item goes on the end. Position is then something the user arranges with
 * the move controls, which is one decision instead of two.
 */
export const addMenuItem = (document, patch = {}) => {
  const item = createMenuItem({ order: getNavigationItems(document).length, ...patch })
  const next = withNavigation(document, (navigation) => [...navigation.items, item])
  return { document: next, itemId: item.id }
}

export const updateMenuItem = (document, itemId, patch) =>
  withNavigation(document, (navigation) => {
    if (!getMenuItemById(navigation, itemId)) {
      return navigation.items
    }
    return navigation.items.map((item) => {
      if (item.id !== itemId) {
        return item
      }
      const merged = normalizeMenuItem({ ...item, ...patch })
      // A rename must not quietly retype the item: the type decides which of
      // `pageId` and `url` is kept, so a page item renamed to an external one
      // would lose its page unless the change is made deliberately.
      return normalizeMenuItem({ ...merged, type: patch?.type ?? item.type })
    })
  })

export const removeMenuItem = (document, itemId) =>
  withNavigation(document, (navigation) =>
    getMenuItemById(navigation, itemId)
      ? navigation.items.filter((item) => item.id !== itemId)
      : navigation.items,
  )

/**
 * Shows or hides a menu item.
 *
 * Hidden is not the same as deleted: a header link someone parked for a season
 * should come back with its label and its target intact.
 */
export const toggleMenuItem = (document, itemId, isVisible) =>
  withNavigation(document, (navigation) =>
    navigation.items.map((item) =>
      item.id === itemId ? { ...item, visible: isVisible === undefined ? !item.visible : isVisible === true } : item,
    ),
  )

export const moveMenuItem = (document, itemId, offset) =>
  withNavigation(document, (navigation) => {
    const from = navigation.items.findIndex((item) => item.id === itemId)
    if (from < 0) {
      return navigation.items
    }
    const to = clamp(from + offset, { min: 0, max: navigation.items.length - 1 })
    if (to === from) {
      return navigation.items
    }
    const items = [...navigation.items]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    return items
  })

/**
 * Replaces the menu with one item per page, in page order.
 *
 * An explicit action, and deliberately not something `addPage` does on its own.
 * Once a user has arranged a menu by hand, a new page appearing in the middle of
 * it would be the code editing their navigation without being asked.
 */
export const buildMenuFromDocumentPages = (document) =>
  withNavigation(document, () => buildMenuFromPages(document.pages))

/** Empties the menu. The pages are untouched; only the links between them are gone. */
export const clearNavigation = (document) =>
  withNavigation(document, () => [])

/* ---- Document-level settings ---- */

/**
 * Merges a settings-panel edit into the document's global styles.
 *
 * `sanitizeStylePatch` drops any colour the canvas cannot use, so an unusable
 * value leaves the current one alone instead of resetting it the way a fresh
 * normalisation would.
 */
export const updateGlobalStyles = (document, patch) =>
  touch(document, {
    ...document,
    globalStyles: normalizeGlobalStyles({
      ...document.globalStyles,
      ...sanitizeStylePatch(patch),
    }),
  })

/**
 * Switches the site's theme preset.
 *
 * Only a known preset id is accepted, so a stored draft cannot inject a theme.
 * Switching replaces the token set wholesale rather than merging, which is what
 * a user expects from choosing a named theme.
 */
export const updateSiteTheme = (document, themePresetId) =>
  touch(document, { ...document, theme: normalizeSiteTheme(themePresetId), globalStyles: {} })

/** Legacy global fields are read once as theme tokens, never competing layers. */
export const getDocumentTheme = (document) => {
  const theme = normalizeSiteTheme(document?.theme)
  const legacy = document?.globalStyles ?? {}
  return normalizeSiteTheme({ ...theme, tokens: {
    ...theme.tokens,
    ...(legacy.background ? { background: legacy.background } : {}),
    ...(legacy.textColor ? { text: legacy.textColor } : {}),
    ...(legacy.contentWidth ? { contentWidth: legacy.contentWidth } : {}),
  } })
}

export const updateSiteDesign = (document, patch) => {
  const theme = getDocumentTheme(document)
  return touch(document, { ...document, globalStyles: {}, theme: normalizeSiteTheme({ ...theme, tokens: { ...theme.tokens, ...patch } }) })
}

/** Reset paint/layout only. Content, media and responsive visibility survive. */
export const resetLocalStyles = (document, { kind, id }) => withActivePage(document, (page) => {
  const reset = (node) => ({ ...node, style: {}, overrides: Object.fromEntries(
    Object.entries(node.overrides ?? {}).map(([device, override]) => [device,
      typeof override.isVisible === 'boolean' ? { isVisible: override.isVisible } : {},
    ]),
  ) })
  return { ...page, sections: page.sections.map((section) => kind === 'section' && section.id === id
    ? reset(section)
    : { ...section, blocks: section.blocks.map((block) => kind === 'block' && block.id === id ? reset(block) : block) }) }
})

/** Numeric UI defaults are derived, not copied into each node's draft style. */
export const getResolvedEditorStyle = (document, node, device, kind = 'block') => {
  const { tokens } = getDocumentTheme(document)
  const button = node.type === BLOCK_TYPE.BUTTON
  const heading = node.type === BLOCK_TYPE.HEADING
  return {
    align: 'left', width: 100, maxWidth: kind === 'section' ? tokens.contentWidth : 0,
    fontSize: heading ? tokens.baseSize * tokens.headingScale : tokens.baseSize,
    fontWeight: button ? tokens.buttonWeight : heading ? tokens.headingWeight : tokens.bodyWeight,
    padding: kind === 'section' ? tokens.spacingScale * 48 : button ? tokens.buttonPadding : 0,
    radius: button ? tokens.buttonRadius ?? tokens.radiusScale : tokens.radiusScale,
    height: node.type === BLOCK_TYPE.SPACER ? tokens.spacingScale * 32 : 200,
    textColor: '', background: '', ...getEffectiveStyle(node, device),
  }
}

/* ------------------------------------------------------------------ *
 * Rendering helpers
 * ------------------------------------------------------------------ */

const px = (value) => `${value}px`

/**
 * The image url an image block should render, or `null`.
 *
 * A media record wins over a bare `src`, and both go through the same url check,
 * so an address that reached the model some other way still cannot become a
 * `src` attribute.
 */
export const getBlockImageUrl = (block) =>
  getMediaPreviewUrl(block?.content?.media) ?? safeMediaUrl(block?.content?.src)

/**
 * Maps an image block's style onto inline CSS.
 *
 * Separate from `getBlockCssStyle` for one reason: `object-fit` only crops
 * correctly inside a box of a definite height, so an image gets `height` where a
 * plain block gets `minHeight`. A full-width image at a 200px height is the
 * intended reading of that control, not a bug.
 */
export const getImageBlockCssStyle = (block, device) => {
  const css = getBlockCssStyle(block, device)
  const style = getEffectiveStyle(block, device)

  if (Number.isFinite(style.height)) {
    css.height = px(style.height)
    css.minHeight = px(style.height)
  }
  css.objectFit = normalizeImageFit(block?.content?.fit)

  return css
}

/**
 * Every media id the document still points at.
 *
 * Used to decide which Object URLs are still needed, because a duplicated block
 * shares its media record with the original.
 */
export const listMediaIdsInUse = (document) => {
  const ids = new Set()
  for (const page of document?.pages ?? []) {
    for (const section of page.sections ?? []) {
      const backgroundMedia = section.backgroundImage?.media
      if (backgroundMedia?.id) {
        ids.add(backgroundMedia.id)
      }
      for (const block of section.blocks ?? []) {
        const media = block.content?.media
        if (media?.id) {
          ids.add(media.id)
        }
      }
    }
  }
  return ids
}

/**
 * Maps a block's style object onto inline CSS for the canvas.
 *
 * Kept here rather than in the renderers so every block type reads its style the
 * same way, and so an empty style value always means "inherit from the document"
 * rather than "render nothing".
 *
 * The style is resolved for `device` first, so the canvas shows the same
 * overrides the settings panel is editing without the renderer knowing anything
 * about breakpoints.
 */
export const getBlockCssStyle = (block, device) => {
  const style = getEffectiveStyle(block, device)
  const css = { textAlign: style.align }

  if (Number.isFinite(style.fontSize)) {
    css.fontSize = px(style.fontSize)
  }
  if (Number.isFinite(style.fontWeight)) {
    css.fontWeight = style.fontWeight
  }
  const textColor = resolveSiteColor(style.textColor)
  if (textColor && style.textColor !== 'transparent') {
    css.color = textColor
  }
  const background = resolveSiteColor(style.background)
  if (background) {
    css.background = background
  }
  if (Number.isFinite(style.padding)) {
    css.padding = px(style.padding)
  }
  if (Number.isFinite(style.radius)) {
    css.borderRadius = px(style.radius)
  }
  if (Number.isFinite(style.height)) {
    css.minHeight = px(style.height)
  }
  if (Number.isFinite(style.width)) {
    css.width = `${style.width}%`
  }
  if (Number.isFinite(style.maxWidth) && style.maxWidth > 0) {
    css.maxWidth = px(style.maxWidth)
  }
  /*
   * A narrowed block is centred, because a 60%-wide block pinned to the left edge
   * reads as a mistake. `textAlign` is untouched, so the text inside can still be
   * left, right or centred.
   */
  if (Number.isFinite(style.width) && style.width < 100) {
    css.marginInline = 'auto'
  }

  return css
}

/**
 * Maps a section's style object onto inline CSS.
 *
 * Padding and max width are applied to an inner wrapper rather than the section
 * itself, so a section's background spans the full width while its content stays
 * inside a readable measure. That is the same thing a full-bleed band with an
 * inner container does, without needing two elements in the renderer.
 *
 * A background image goes on the band, with the overlay as a sibling layer rather
 * than a filter, so the tint's strength is a plain number the user controls and
 * the photograph is never modified.
 */
export const getSectionCssStyle = (section, device) => {
  const style = getEffectiveStyle(section, device)
  const css = { textAlign: style.align }

  const background = resolveSiteColor(style.background)
  if (background) {
    css.background = background
  }

  const backgroundImage = section.backgroundImage
  const backgroundUrl = getMediaPreviewUrl(backgroundImage?.media)
  if (backgroundUrl) {
    css.backgroundImage = `url("${backgroundUrl.replace(/"/g, '%22')}")`
    css.backgroundSize = backgroundImage.fit
    css.backgroundPosition = backgroundImage.position
    css.backgroundRepeat = 'no-repeat'
  }

  if (Number.isFinite(style.padding)) {
    css.padding = `${px(style.padding)} ${px(Math.min(style.padding, 32))}`
  }
  if (Number.isFinite(style.radius)) {
    css.borderRadius = px(style.radius)
  }

  const inner = {}
  if (Number.isFinite(style.maxWidth)) {
    inner.maxWidth = px(style.maxWidth)
  }
  // `width` and `maxWidth` together are the standard "share of the parent, never
  // wider than this" pattern, and both auto margins centre the result.
  inner.width = Number.isFinite(style.width) ? `${style.width}%` : '100%'
  inner.marginInline = 'auto'

  return { section: css, inner, backgroundImage }
}

/**
 * The tint drawn over a section's background image.
 *
 * A plain layer rather than a filter on the image, so the photo is untouched and
 * the strength is a number the user set. Opacity of zero produces no element at
 * all, so an unused overlay costs nothing in the DOM.
 */
export const getSectionOverlayCssStyle = (backgroundImage) => {
  const opacity = backgroundImage?.overlayOpacity ?? 0
  if (!backgroundImage || opacity <= 0) {
    return null
  }
  const color = resolveSiteColor(backgroundImage.overlayColor)
  if (!color) {
    return null
  }
  return { background: color, opacity: opacity / 100 }
}

/** Document-level canvas style, resolved from the global styles object. */
export const getGlobalCssStyle = (globalStyles) => {
  const css = {}
  const background = resolveSiteColor(globalStyles.background)
  if (background) {
    css.background = background
  }
  const textColor = resolveSiteColor(globalStyles.textColor)
  if (textColor) {
    css.color = textColor
  }
  if (Number.isFinite(globalStyles.contentWidth)) {
    css.maxWidth = px(globalStyles.contentWidth)
  }
  return css
}

/**
 * The full inline style for the canvas page: the site's own theme variables plus
 * any document-level override.
 *
 * The variables are the mechanism that keeps a user's site theme from touching
 * the builder. They are declared on the canvas element and nowhere else.
 */
export const getCanvasCssStyle = (document) => ({
  ...getSiteThemeCssVars(getDocumentTheme(document)),
})

export const countBlocks = (document) =>
  (document?.pages ?? []).reduce(
    (total, page) => total + page.sections.reduce((sum, section) => sum + section.blocks.length, 0),
    0,
  )

export const countSections = (document) =>
  (document?.pages ?? []).reduce((total, page) => total + page.sections.length, 0)

export const countPages = (document) => document?.pages?.length ?? 0

/* ------------------------------------------------------------------ *
 * Service payload
 * ------------------------------------------------------------------ */

/**
 * The shape `saveSiteDraft` will eventually send.
 *
 * It is deliberately narrow and already normalised, so the backend contract can
 * be reviewed before a single request is made. The nesting mirrors the editor
 * model exactly, which means the payload is already the storage shape.
 */
export const buildEditorDraftPayload = (document) => ({
  activePageId: document.activePageId,
  motion: normalizeSiteMotion(document.motion),
  theme: normalizeSiteTheme(document.theme),
  globalStyles: normalizeGlobalStyles(document.globalStyles),
  /*
   * The menu is document-level, not page-level, so it sits beside `pages` rather
   * than inside any of them. A page owns its own address; the menu is the list of
   * addresses the site chose to show.
   */
  navigation: {
    items: normalizeNavigation(document.navigation).items.map((item) => ({ ...item })),
  },
  pages: document.pages.map((page) => ({
    id: page.id,
    name: page.name,
    slug: page.slug,
    isHome: page.isHome,
    order: page.order,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    sections: page.sections.map((section) => ({
      id: section.id,
      type: section.type,
      isVisible: section.isVisible,
      style: { ...section.style },
      /*
       * A background image travels as the same small media record the canvas
       * reads, so a stored draft describes an image the same way whether it sits
       * behind a section or inside a block. A local preview keeps its marker here:
       * the backend must be able to tell a temporary preview from a real asset.
       */
      backgroundImage: section.backgroundImage ? { ...section.backgroundImage } : null,
      animation: normalizeAnimation(section.animation),
      overrides: normalizeOverrides(section.overrides),
      blocks: section.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        isVisible: block.isVisible,
        content: { ...block.content },
        style: { ...block.style },
        animation: normalizeAnimation(block.animation),
        overrides: normalizeOverrides(block.overrides),
      })),
    })),
  })),
})

export default BLOCK_TYPE

export const updateSiteMotion = (document, motion) => touch(document, { ...document, motion: normalizeSiteMotion(motion) })
