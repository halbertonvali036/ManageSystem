import config from '@/config'
import httpClient from '@/services/httpClient'

const path = siteId => `/api/sites/${encodeURIComponent(siteId)}/publication`
export const publishSite = siteId => httpClient.post(path(siteId), {})
export const unpublishSite = siteId => httpClient.delete(path(siteId))
export const getPublishStatus = siteId => config.api.baseUrl
  ? httpClient.get(path(siteId))
  : Promise.resolve({ status: 'unknown', available: false })
export const getPublishedUrl = async siteId => (await getPublishStatus(siteId))?.publishedUrl ?? null
export default { publishSite, unpublishSite, getPublishStatus, getPublishedUrl }
