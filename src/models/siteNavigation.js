/* ------------------------------------------------------------------ *
 * Navigation and menu items
 *
 * A site menu is a short, ordered list of links. That is all it is here.
 *
 * Two things are deliberately absent: a nested tree, and any notion of a
 * mega-menu. Both are easy to add later and very hard to remove once a draft
 * stores them, because every saved document then has to be understood as one or
 * the other. A flat list with an explicit order answers "what links does this
 * site have, and in what sequence" completely, which is the whole job right now.
 *
 * This module holds the model and the pure rules around it. The mutations that
 * change a document live in `siteEditor.js` alongside every other document
 * mutation, so there is exactly one place that knows how a document is edited.
 * ------------------------------------------------------------------ */

/** What a menu item points at. */
export const MENU_ITEM_TYPE = Object.freeze({
  /** A page in this site. Its href follows the page. */
  PAGE: 'page',
  /** An address the visitor types or an outside link. */
  EXTERNAL: 'external',
})

export const MENU_ITEM_TYPES = Object.freeze(Object.values(MENU_ITEM_TYPE))

/**
 * A menu item label is shown in the site's own chrome, so it is a real sentence
 * the user wrote, not a slug. A page item may fall back to the page name, which
 * is why an empty label is legal here and resolved later.
 */
export const MENU_LABEL_MAX = 80

/**
 * A link address.
 *
 * The same allowlist idea as a media url, for the same reason: this value becomes
 * an `href`. `mailto:` and `tel:` are allowed because a contact link is a normal
 * thing to put in a menu, and `javascript:` never is.
 */
export const isSafeLinkUrl = (value) => {
  if (typeof value !== 'string') {
    return false
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }
  // A root-relative path is this site's own address space, which a menu item is
  // allowed to use without knowing the domain.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true
  }
  return /^(?:https?:|mailto:|tel:)/i.test(trimmed)
}

export const safeLinkUrl = (value) => (isSafeLinkUrl(value) ? value.trim() : '')

/* ------------------------------------------------------------------ *
 * Slugs
 *
 * A slug is a path segment, not a display name. What matters is that it is one
 * segment: no slashes, no spaces, nothing that would make the address mean
 * something other than the one page the user picked.
 *
 * Azerbaijani letters are kept. "Ən yaxşı xidmət" has a perfectly good slug in
 * `ən-yaxşı-xidmət`, and transliterating it to `en-yaxsi-xidmet` would invent an
 * address the user never asked for. Percent-encoding is the browser's problem,
 * not a reason to rewrite someone's words.
 *
 * Uniqueness is *not* checked here beyond a soft warning in the UI. The backend
 * owns that decision, because only the backend knows about pages belonging to
 * other drafts and to a published site.
 * ------------------------------------------------------------------ */

export const SLUG_BOUNDS = Object.freeze({ min: 1, max: 80 })

/**
 * Characters that cannot appear in a path segment.
 *
 * This is the set of characters a URL parser treats as structure rather than as
 * part of the name: a slash starts a new segment, `#` a fragment, `?` a query,
 * and the rest are excluded by the URL standard. Separating on them means the
 * slug is a single segment by construction.
 */
const NON_SLUG_CHARACTER = /[^\p{L}\p{N}]+/gu

/**
 * Turns a page name into a slug suggestion.
 *
 * Everything that is not a letter or a digit becomes a single hyphen, so the slug
 * is one path segment by construction: no slashes to start a second segment, no
 * spaces, no trailing punctuation. Letters are matched by Unicode property, which
 * is what keeps `ə`, `ı` and `ş` intact instead of transliterating them.
 *
 * The result may be empty. A name made entirely of punctuation has no slug, and
 * the caller has to say so rather than being handed a placeholder.
 */
export const slugifyPageName = (name) => {
  if (typeof name !== 'string') {
    return ''
  }
  return name
    .trim()
    .toLowerCase()
    .replace(NON_SLUG_CHARACTER, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_BOUNDS.max)
    // The cut above can land on a hyphen, and a slug may not end in one.
    .replace(/-+$/g, '')
}

/** Whether a slug is usable at all. Empty is not usable; a placeholder is not the model's job. */
export const isValidSlug = (value) => {
  if (typeof value !== 'string') {
    return false
  }
  const trimmed = value.trim()
  if (trimmed.length < SLUG_BOUNDS.min || trimmed.length > SLUG_BOUNDS.max) {
    return false
  }
  return slugifyPageName(trimmed) === trimmed.toLowerCase()
}

/**
 * Normalises a stored slug.
 *
 * Existing drafts carry slugs like "About Us" from before slugs were editable, so
 * the stored value is cleaned rather than rejected. A slug that cleans down to
 * nothing is kept as an empty string, which the page panel reports rather than
 * hiding.
 */
export const normalizeSlug = (value) => {
  if (typeof value !== 'string') {
    return ''
  }
  return slugifyPageName(value)
}

/* ------------------------------------------------------------------ *
 * Menu items
 * ------------------------------------------------------------------ */

const createMenuItemId = () =>
  `menu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Coerces anything into a menu item.
 *
 * `type` decides which of `pageId` and `url` means anything, and the one that does
 * not is cleared rather than kept as a stale value. A half-populated item is the
 * kind of thing that renders as a dead link in a header for months.
 *
 * A page item pointing at a page that no longer exists is deliberately kept
 * rather than dropped. Deleting a page should not silently delete a menu entry
 * the user can see; it becomes an item the panel flags as unlinked, which
 * `isMenuItemLinked` reports at render time.
 */
export const normalizeMenuItem = (raw) => {
  const type = MENU_ITEM_TYPES.includes(raw?.type) ? raw.type : MENU_ITEM_TYPE.PAGE

  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : createMenuItemId(),
    label:
      typeof raw?.label === 'string' && raw.label.trim()
        ? raw.label.trim().slice(0, MENU_LABEL_MAX)
        : '',
    type,
    pageId: type === MENU_ITEM_TYPE.PAGE && typeof raw?.pageId === 'string' && raw.pageId ? raw.pageId : null,
    url: type === MENU_ITEM_TYPE.EXTERNAL ? safeLinkUrl(raw?.url) : '',
    order: Number.isFinite(Number(raw?.order)) ? Math.max(0, Math.trunc(Number(raw.order))) : 0,
    visible: raw?.visible !== false,
  }
}

/**
 * The shape a document's navigation takes.
 *
 * `items` is stored in display order and `order` mirrors the position, so a
 * backend response that carries an explicit order needs no translation step. See
 * `reindexMenuItems` for why the two cannot drift.
 */
export const DEFAULT_NAVIGATION = Object.freeze({ items: Object.freeze([]) })

/** Rewrites each item's `order` to its position. The only writer of that field. */
export const reindexMenuItems = (items) =>
  (items ?? []).map((item, index) => (item.order === index ? item : { ...item, order: index }))

export const normalizeNavigation = (raw) => {
  const rawItems = Array.isArray(raw?.items) ? raw.items : []
  return { items: reindexMenuItems(rawItems.map(normalizeMenuItem)) }
}

export const getMenuItemById = (navigation, itemId) =>
  navigation?.items?.find((item) => item.id === itemId) ?? null

/**
 * The text a menu item shows.
 *
 * A page item with no label of its own borrows the page name, because a menu with
 * a blank gap in it is worse than a slightly duplicated name.
 */
export const resolveMenuItemLabel = (item, pages) => {
  if (item?.label) {
    return item.label
  }
  if (item?.type === MENU_ITEM_TYPE.PAGE) {
    const page = pages?.find((candidate) => candidate.id === item.pageId)
    return page?.name ?? ''
  }
  return ''
}

/** Where a menu item points, for the header preview. */
export const resolveMenuItemHref = (item, pages) => {
  if (!item) {
    return null
  }
  if (item.type === MENU_ITEM_TYPE.PAGE) {
    const page = pages?.find((candidate) => candidate.id === item.pageId)
    if (!page) {
      return null
    }
    return page.slug ? `/${page.slug}` : '/'
  }
  return safeLinkUrl(item.url) || null
}

/** Whether a menu item can actually be followed. The panel uses this to flag dead links. */
export const isMenuItemLinked = (item, pages) => resolveMenuItemHref(item, pages) !== null

/**
 * A fresh navigation built from the current pages.
 *
 * This is the "start from the pages" action, not a rule that runs automatically:
 * once a user has arranged a menu, adding a page should not rearrange it behind
 * their back. The distinction is why this is a function someone calls rather than
 * a step inside normalisation.
 */
export const buildMenuFromPages = (pages) =>
  reindexMenuItems(
    (pages ?? []).map((page, index) => ({
      id: createMenuItemId(),
      label: '',
      type: MENU_ITEM_TYPE.PAGE,
      pageId: page.id,
      url: '',
      order: index,
      visible: true,
    })),
  )

export const createMenuItem = (patch = {}) => normalizeMenuItem(patch)
