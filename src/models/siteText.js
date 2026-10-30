import {
  BLOCK_TYPE,
  EDITOR_DEVICE,
  getActivePage,
  getBlockById,
  getResolvedEditorStyle,
  normalizeBlock,
  SEO_MAX,
} from '@/models/siteEditor'

/**
 * Text utilities for the site editor.
 *
 * This module owns the three text-specific operations that do not belong in the
 * document model itself: listing the editable copy of a page, counting and
 * replacing literal text across the document, and copying one block's resolved
 * typography to every block of a chosen type. Everything here is a pure function
 * over plain document data; the caller decides when to write the result.
 */

/** Text-bearing blocks that may be edited inline and listed in "Page texts". */
export const INLINE_EDITABLE_BLOCK_TYPES = Object.freeze([
  BLOCK_TYPE.HEADING,
  BLOCK_TYPE.TEXT,
  BLOCK_TYPE.BUTTON,
])

/** The typography properties "apply to all" copies between blocks. */
export const TYPOGRAPHY_PROPERTIES = Object.freeze([
  'fontFamily',
  'fontSize',
  'fontWeight',
  'align',
])

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const asString = (value) => (typeof value === 'string' ? value : '')

/**
 * Counts non-overlapping literal matches of `find` in `value`.
 *
 * The pattern is always escaped, so a search for "a+b" matches the characters
 * the user typed rather than becoming a regular expression.
 */
export const countTextMatches = (value, find, caseSensitive = false) => {
  if (!find || typeof value !== 'string') {
    return 0
  }
  const pattern = new RegExp(escapeRegExp(find), caseSensitive ? 'g' : 'gi')
  return (value.match(pattern) ?? []).length
}

/**
 * Replaces every literal occurrence of `find`.
 *
 * The replacement is inserted through a callback so `$&` and similar sequences
 * in the replacement text stay literal instead of becoming regex backreferences.
 */
export const replaceTextLiteral = (value, find, replacement = '', caseSensitive = false) => {
  if (!find || typeof value !== 'string') {
    return value
  }
  const pattern = new RegExp(escapeRegExp(find), caseSensitive ? 'g' : 'gi')
  return value.replace(pattern, () => replacement)
}

/**
 * Every plain-text value a block can show to a visitor.
 *
 * Deliberately limited to visible copy: ids, links, image sources, style values
 * and structural fields are never included, so find/replace cannot silently
 * change behaviour or markup.
 */
export const getBlockTextValues = (block) => {
  const content = block?.content ?? {}
  switch (block?.type) {
    case BLOCK_TYPE.HEADING:
    case BLOCK_TYPE.TEXT:
      return [content.text]
    case BLOCK_TYPE.BUTTON:
      return [content.label]
    case BLOCK_TYPE.PANEL:
      return [content.eyebrow, content.title, content.body, content.action]
    case BLOCK_TYPE.STAT:
      return [content.label, content.value, content.delta, content.caption]
    case BLOCK_TYPE.CHART:
      return [content.title, content.caption]
    case BLOCK_TYPE.TABLE:
      return [
        content.caption,
        ...(content.columns ?? []),
        ...(content.rows ?? []).flat(),
      ]
    case BLOCK_TYPE.STATUS_LIST:
      return [
        content.title,
        ...(content.items ?? []).flatMap((item) => [item?.label, item?.value]),
      ]
    case BLOCK_TYPE.TOOLBAR:
      return [content.search, ...(content.filters ?? []), content.action]
    case BLOCK_TYPE.FORM: {
      const form = content.form
      if (!form) {
        return []
      }
      return [
        form.submitLabel,
        ...(form.fields ?? []).flatMap((field) => [
          field?.label,
          field?.placeholder,
          ...(field?.options ?? []),
        ]),
      ]
    }
    default:
      return []
  }
}

const mapBlockText = (block, transform) => {
  const content = block.content ?? {}
  switch (block.type) {
    case BLOCK_TYPE.HEADING:
    case BLOCK_TYPE.TEXT:
      return { ...block, content: { ...content, text: transform(content.text) } }
    case BLOCK_TYPE.BUTTON:
      return { ...block, content: { ...content, label: transform(content.label) } }
    case BLOCK_TYPE.PANEL:
      return {
        ...block,
        content: {
          ...content,
          eyebrow: transform(content.eyebrow),
          title: transform(content.title),
          body: transform(content.body),
          action: transform(content.action),
        },
      }
    case BLOCK_TYPE.STAT:
      return {
        ...block,
        content: {
          ...content,
          label: transform(content.label),
          value: transform(content.value),
          delta: transform(content.delta),
          caption: transform(content.caption),
        },
      }
    case BLOCK_TYPE.CHART:
      return {
        ...block,
        content: {
          ...content,
          title: transform(content.title),
          caption: transform(content.caption),
        },
      }
    case BLOCK_TYPE.TABLE:
      return {
        ...block,
        content: {
          ...content,
          caption: transform(content.caption),
          columns: (content.columns ?? []).map(transform),
          rows: (content.rows ?? []).map((row) => (row ?? []).map(transform)),
        },
      }
    case BLOCK_TYPE.STATUS_LIST:
      return {
        ...block,
        content: {
          ...content,
          title: transform(content.title),
          items: (content.items ?? []).map((item) => ({
            ...item,
            label: transform(item?.label),
            value: transform(item?.value),
          })),
        },
      }
    case BLOCK_TYPE.TOOLBAR:
      return {
        ...block,
        content: {
          ...content,
          search: transform(content.search),
          filters: (content.filters ?? []).map(transform),
          action: transform(content.action),
        },
      }
    case BLOCK_TYPE.FORM: {
      const form = content.form
      if (!form) {
        return block
      }
      return {
        ...block,
        content: {
          ...content,
          form: {
            ...form,
            submitLabel: transform(form.submitLabel),
            fields: (form.fields ?? []).map((field) => ({
              ...field,
              label: transform(field?.label),
              placeholder: transform(field?.placeholder),
              options: (field?.options ?? []).map(transform),
            })),
          },
        },
      }
    }
    default:
      return block
  }
}

const countBlockMatches = (block, find, caseSensitive) =>
  getBlockTextValues(block).reduce(
    (total, value) => total + countTextMatches(value, find, caseSensitive),
    0,
  )

const getScopePages = (document, scope) =>
  scope === 'all'
    ? document?.pages ?? []
    : [getActivePage(document)].filter(Boolean)

/**
 * The headings, paragraphs and button labels of a page, grouped by section.
 *
 * Rows are returned in reading order: section order first, block order second,
 * which is exactly the order they appear in the canvas.
 */
export const getPageTextGroups = (page) =>
  (page?.sections ?? [])
    .map((section, sectionIndex) => ({
      sectionId: section.id,
      sectionIndex,
      sectionType: section.type,
      items: section.blocks
        .filter((block) => INLINE_EDITABLE_BLOCK_TYPES.includes(block.type))
        .map((block) => ({
          id: `${block.id}:${block.type === BLOCK_TYPE.BUTTON ? 'label' : 'text'}`,
          blockId: block.id,
          blockType: block.type,
          field: block.type === BLOCK_TYPE.BUTTON ? 'label' : 'text',
          value:
            block.type === BLOCK_TYPE.BUTTON
              ? asString(block.content?.label)
              : asString(block.content?.text),
        })),
    }))
    .filter((group) => group.items.length > 0)

/**
 * Counts every match the find/replace panel would replace.
 *
 * The count answers the same options the replacement uses, so the number shown
 * next to the button is the number of changes that button will make.
 */
export const countDocumentTextMatches = (
  document,
  { find, caseSensitive = false, scope = 'page', includePageMeta = false } = {},
) => {
  if (!document || !find) {
    return 0
  }

  let total = 0
  for (const page of getScopePages(document, scope)) {
    for (const section of page.sections ?? []) {
      for (const block of section.blocks ?? []) {
        total += countBlockMatches(block, find, caseSensitive)
      }
    }
    if (includePageMeta) {
      total += countTextMatches(page.name, find, caseSensitive)
      total += countTextMatches(page.seoTitle, find, caseSensitive)
      total += countTextMatches(page.seoDescription, find, caseSensitive)
    }
  }
  return total
}

/**
 * Replaces literal text across one page or every page in one document update.
 *
 * Only the explicitly enumerated visible-copy fields are touched. Links, media,
 * ids, styles and structure are copied through untouched, and page metadata is
 * included only when the caller opts in.
 */
export const applyFindReplace = (
  document,
  { find, replacement = '', caseSensitive = false, scope = 'page', includePageMeta = false } = {},
) => {
  if (!document || !find) {
    return { document, count: 0 }
  }

  const pageIds =
    scope === 'all' ? null : new Set([document.activePageId])
  const transform = (value) => replaceTextLiteral(value, find, replacement, caseSensitive)
  let count = 0

  const pages = document.pages.map((page) => {
    if (pageIds && !pageIds.has(page.id)) {
      return page
    }

    let pageChanged = false
    const sections = page.sections.map((section) => {
      let sectionCount = 0
      const blocks = section.blocks.map((block) => {
        const matches = countBlockMatches(block, find, caseSensitive)
        if (!matches) {
          return block
        }
        sectionCount += matches
        return normalizeBlock(mapBlockText(block, transform))
      })
      if (!sectionCount) {
        return section
      }
      pageChanged = true
      count += sectionCount
      return { ...section, blocks }
    })

    let nextPage = pageChanged ? { ...page, sections } : page

    if (includePageMeta) {
      const replaceField = (value, limit) => {
        const matches = countTextMatches(value, find, caseSensitive)
        if (!matches) {
          return value
        }
        count += matches
        pageChanged = true
        return transform(value).slice(0, limit)
      }
      const name = replaceField(nextPage.name, Infinity)
      const seoTitle = replaceField(nextPage.seoTitle, SEO_MAX.title)
      const seoDescription = replaceField(nextPage.seoDescription, SEO_MAX.description)
      if (pageChanged) {
        nextPage = { ...nextPage, name, seoTitle, seoDescription }
      }
    }

    return nextPage
  })

  if (!pageChangedAnywhere(pages, document.pages)) {
    return { document, count: 0 }
  }

  return {
    document: { ...document, pages, updatedAt: new Date().toISOString() },
    count,
  }
}

/** Identity comparison is enough: every changed page is a new object. */
const pageChangedAnywhere = (pages, previous) =>
  pages.some((page, index) => page !== previous[index])

/**
 * Copies one block's resolved desktop typography to every block of a type.
 *
 * Resolved values are used on purpose: a heading that visually inherits the
 * theme's size and weight is copied with those numbers, so applying its style
 * to another heading produces the same look rather than the other block's own
 * defaults. The result is a single new document, never a sequence of edits.
 */
export const applyTypographyToType = (
  document,
  { sourceBlockId, targetType, scope = 'page' } = {},
) => {
  if (!document || !INLINE_EDITABLE_BLOCK_TYPES.includes(targetType)) {
    return { document, count: 0 }
  }

  const source = getBlockById(getActivePage(document), sourceBlockId)
  if (!source) {
    return { document, count: 0 }
  }

  const resolved = getResolvedEditorStyle(document, source, EDITOR_DEVICE.DESKTOP)
  const fontFamily = resolved.fontFamily || ''
  const typography = {
    fontFamily,
    fontSize: resolved.fontSize,
    fontWeight: resolved.fontWeight,
    align: resolved.align,
  }

  const pageIds = scope === 'all' ? null : new Set([document.activePageId])
  let count = 0

  const pages = document.pages.map((page) => {
    if (pageIds && !pageIds.has(page.id)) {
      return page
    }

    let pageCount = 0
    const sections = page.sections.map((section) => {
      let sectionCount = 0
      const blocks = section.blocks.map((block) => {
        if (block.id === sourceBlockId || block.type !== targetType) {
          return block
        }
        sectionCount += 1
        const style = {
          ...block.style,
          fontSize: typography.fontSize,
          fontWeight: typography.fontWeight,
          align: typography.align,
        }
        if (typography.fontFamily) {
          style.fontFamily = typography.fontFamily
        } else {
          delete style.fontFamily
        }
        return normalizeBlock({ ...block, style })
      })
      if (!sectionCount) {
        return section
      }
      pageCount += sectionCount
      return { ...section, blocks }
    })

    if (!pageCount) {
      return page
    }
    count += pageCount
    return { ...page, sections }
  })

  if (!count) {
    return { document, count: 0 }
  }

  return {
    document: { ...document, pages, updatedAt: new Date().toISOString() },
    count,
  }
}
