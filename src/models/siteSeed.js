import { createLocalDraftDocument } from '@/models/siteEditor'
import { getTemplatePageSkeletons } from '@/models/siteTemplate'
import { normalizeSiteTheme } from '@/models/siteTheme'

/**
 * Builds the first draft for a newly created project.
 *
 * The builder is the same one the editor uses when it has no server draft:
 * template skeletons become real sections, the selected theme is applied, and
 * the visitor's content is written into the resulting document. Keeping this in
 * one place means the create flow and the editor cannot disagree about what a
 * template starts with.
 */
export const buildSiteSeedDocument = ({
  siteId = null,
  name = '',
  templateId = '',
  themePresetId = '',
  content,
  t,
} = {}) => {
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  const translate = typeof t === 'function' ? t : (key) => key
  const pageSkeletons = templateId
    ? getTemplatePageSkeletons(templateId).map((page) => ({
        ...page,
        name: translate(page.nameKey),
      }))
    : undefined

  const document = createLocalDraftDocument({
    name: trimmedName || translate('editor.draftPageName'),
    t: translate,
    pageSkeletons,
    copy: {
      heading: translate('editor.draftCopy.heading'),
      text: translate('editor.draftCopy.text'),
      button: translate('editor.draftCopy.button'),
    },
    content,
  })

  return {
    ...document,
    ...(siteId ? { siteId } : {}),
    ...(themePresetId ? { theme: normalizeSiteTheme(themePresetId) } : {}),
  }
}

export default buildSiteSeedDocument
