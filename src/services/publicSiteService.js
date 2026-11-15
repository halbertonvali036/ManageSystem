import config from '@/config'
import httpClient from '@/services/httpClient'
import { normalizeEditorDocument } from '@/models/siteEditor'
import { publicSiteEndpoint } from '@/models/publicSite'

export const getPublicSite = async (hostname, options = {}) => {
  const response = await httpClient.get(
    publicSiteEndpoint(hostname, config.publishing.baseDomain),
    { ...options, anonymous: true },
  )
  const content = response?.snapshot?.site?.content
  // Never manufacture a draft/template when a live snapshot is missing.
  if (!content || !Array.isArray(content.pages) || !content.pages.length) {
    throw new Error('Published snapshot has no editor pages.')
  }
  return {
    name: response.projectName ?? '',
    document: normalizeEditorDocument(content),
  }
}
