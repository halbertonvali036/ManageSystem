/**
 * Workspace model.
 *
 * A Workspace is the top-level container that groups one user's Applications /
 * Sites together. The frontend shape is declared here; the backend will own the
 * persistence. No sample workspace is defined on purpose — pages render honest
 * empty states until the API is connected.
 */

/**
 * @typedef {Object} Workspace
 * @property {string}      id        Backend identifier.
 * @property {string}      name      User-facing workspace name.
 * @property {string}      slug      URL segment for the workspace.
 * @property {string|null} ownerId   User id of the creator.
 * @property {string|null} createdAt ISO 8601 timestamp.
 * @property {string|null} updatedAt ISO 8601 timestamp.
 */

export const WORKSPACE_NAME_MAX_LENGTH = 80
export const WORKSPACE_SLUG_MAX_LENGTH = 63

/** Pattern that a valid workspace slug must match. */
export const WORKSPACE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isValidWorkspaceName = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= WORKSPACE_NAME_MAX_LENGTH

export const isValidWorkspaceSlug = (value) =>
  typeof value === 'string' &&
  WORKSPACE_SLUG_PATTERN.test(value) &&
  value.length <= WORKSPACE_SLUG_MAX_LENGTH

/**
 * Azerbaijani letters that don't decompose under NFD. Mirrors the table in
 * site.js so workspace slugs follow the same rules as site slugs.
 */
const SLUG_CHARACTER_FOLD = Object.freeze({
  ə: 'e', Ə: 'e',
  ı: 'i', I: 'i', İ: 'i',
  ş: 's', Ş: 's',
  ğ: 'g', Ğ: 'g',
  ç: 'c', Ç: 'c',
  ö: 'o', Ö: 'o',
  ü: 'u', Ü: 'u',
})

/** Suggests a workspace URL slug from the workspace name. */
export const slugifyWorkspaceName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[əƏıIİşŞğĞçÇöÖüÜ]/g, (char) => SLUG_CHARACTER_FOLD[char] ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, WORKSPACE_SLUG_MAX_LENGTH)

/**
 * Shape sent to the backend when creating a workspace.
 * Strips whitespace and lowercases the slug on the way out.
 */
export const buildWorkspaceDraft = ({
  name = '',
  slug = '',
} = {}) => ({
  name: name.trim(),
  slug: slug.trim().toLowerCase(),
})

/**
 * Maps a raw API response onto the Workspace typedef.
 * Every optional field stays null rather than becoming an empty string, so the
 * UI can distinguish "not set" from "set to blank".
 */
export const normalizeWorkspace = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    id: raw.id ?? null,
    name: raw.name ?? '',
    slug: raw.slug ?? '',
    ownerId: raw.ownerId ?? raw.owner_id ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  }
}

export const formatWorkspaceDate = (value, locale) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export default normalizeWorkspace
