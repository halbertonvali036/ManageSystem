import { BackendNotConnectedError } from '@/services/httpClient'

// No endpoint contract exists yet. Even configuring the general API must not
// accidentally enable deployment. Replace these stubs with a reviewed adapter.
export const publishSite = async (_siteId) => {
  throw new BackendNotConnectedError('Publishing integration is not available.')
}
export const unpublishSite = async (_siteId) => {
  throw new BackendNotConnectedError('Unpublishing integration is not available.')
}
export const getPublishStatus = async (_siteId) => ({ status: 'unknown', available: false })
export const getPublishedUrl = async (_siteId) => null

export default { publishSite, unpublishSite, getPublishStatus, getPublishedUrl }
