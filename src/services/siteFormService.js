import { BackendNotConnectedError } from '@/services/httpClient'

// No HTTP requests, local storage, queues or simulated responses. A reviewed
// backend adapter must implement validation, anti-spam and delivery/storage.
export const submitSiteForm = async (_siteId, _formId, _payload) => {
  throw new BackendNotConnectedError('Form submission integration is unavailable.')
}
export const getFormSubmissions = async (_siteId, _formId) => {
  throw new BackendNotConnectedError('Form submission storage integration is unavailable.')
}
export default { submitSiteForm, getFormSubmissions }
