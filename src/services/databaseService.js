import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'
import {
  buildModelDraft,
  normalizeDatabaseModel,
} from '@/models/database'
import { normalizeRecord } from '@/models/record'

/**
 * Database / schema service.
 *
 * Follows exactly the same contract as workspaceService and siteService:
 *  - Read operations return a safe empty value ([] / null) when the backend is
 *    not connected, so the schema pages show an honest empty state instead of
 *    placeholder models.
 *  - Every write operation calls requireBackend() first, which throws
 *    BackendNotConnectedError when no API is configured, so no action can report
 *    a model, field or relation that was never persisted.
 *
 * There is no separate relation call: relations are part of a field payload and
 * are stored with the model. Until the backend owns that shape, a relation is
 * only ever a frontend declaration.
 */

const isBackendConnected = () => Boolean(config.api.baseUrl)

const requireBackend = (message) => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError(message)
  }
}

const DATABASE_API_PATH = (workspaceId) => `/workspaces/${workspaceId}/database`
const MODELS_API_PATH = (workspaceId) => `${DATABASE_API_PATH(workspaceId)}/models`

const toModelList = (response) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map(normalizeDatabaseModel).filter(Boolean)
}

/** Every model in a workspace's schema. Empty while the API is absent. */
const getModels = async (workspaceId) => {
  if (!isBackendConnected() || !workspaceId) {
    return []
  }
  return toModelList(await httpClient.get(MODELS_API_PATH(workspaceId)))
}

/** A single model, or null when absent or the API is not connected. */
const getModel = async (workspaceId, modelId) => {
  if (!isBackendConnected() || !workspaceId || !modelId) {
    return null
  }
  return normalizeDatabaseModel(
    await httpClient.get(`${MODELS_API_PATH(workspaceId)}/${modelId}`)
  )
}

/**
 * Creates a model. Refused until a backend is available.
 * The duplicate action reuses this call with a copied draft, so there is only
 * one code path that can ever create a model.
 */
const createModel = async (workspaceId, payload) => {
  requireBackend(
    'Creating a model is unavailable until the backend is connected.'
  )
  return normalizeDatabaseModel(
    await httpClient.post(MODELS_API_PATH(workspaceId), buildModelDraft(payload))
  )
}

/**
 * Updates a model — rename, description, and its fields.
 * Field add/remove/edit and the relation foundation all travel through here, so
 * the model stays the single unit of persistence.
 */
const updateModel = async (workspaceId, modelId, payload) => {
  requireBackend(
    'Saving model changes is unavailable until the backend is connected.'
  )
  return normalizeDatabaseModel(
    await httpClient.put(`${MODELS_API_PATH(workspaceId)}/${modelId}`, payload)
  )
}

/** Deletes a model permanently. Refused until a backend is available. */
const deleteModel = async (workspaceId, modelId) => {
  requireBackend(
    'Deleting a model is unavailable until the backend is connected.'
  )
  await httpClient.delete(`${MODELS_API_PATH(workspaceId)}/${modelId}`)
}

const RECORDS_API_PATH = (workspaceId, modelId) =>
  `${MODELS_API_PATH(workspaceId)}/${modelId}/records`

const toRecordList = (response, fields) => {
  const items = Array.isArray(response) ? response : (response?.data ?? [])
  return items.map((item) => normalizeRecord(item, fields)).filter(Boolean)
}

/**
 * Records of one model.
 *
 * `fields` is the model's field list and is required: a record is normalized
 * against the schema, so the caller can never receive columns the model does not
 * declare. Returns [] while the API is absent.
 *
 * Narrowing is not done here. Search, filter and sort run over the rows that were
 * actually read, so the table, the toolbar counts and the empty states can never
 * disagree with each other.
 */
const getRecords = async (workspaceId, modelId, fields = []) => {
  if (!isBackendConnected() || !workspaceId || !modelId) {
    return []
  }

  return toRecordList(
    await httpClient.get(RECORDS_API_PATH(workspaceId, modelId)),
    fields
  )
}

/**
 * A single record, or null when absent or the API is not connected.
 * `fields` has the same purpose as in getRecords.
 */
const getRecord = async (workspaceId, modelId, recordId, fields = []) => {
  if (!isBackendConnected() || !workspaceId || !modelId || !recordId) {
    return null
  }
  return normalizeRecord(
    await httpClient.get(`${RECORDS_API_PATH(workspaceId, modelId)}/${recordId}`),
    fields
  )
}

/**
 * Creates a record. Refused until a backend is available.
 *
 * `values` is already validated against the model schema by buildRecordDraft, so
 * this layer only forwards it — it never re-types a value the user approved.
 * `fields` is passed through to normalization for the same reason as in
 * getRecords: the schema decides which columns exist.
 */
const createRecord = async (workspaceId, modelId, values, fields = []) => {
  requireBackend(
    'Creating a record is unavailable until the backend is connected.'
  )
  return normalizeRecord(
    await httpClient.post(RECORDS_API_PATH(workspaceId, modelId), { values }),
    fields
  )
}

/** Updates a record's values. Refused until a backend is available. */
const updateRecord = async (workspaceId, modelId, recordId, values, fields = []) => {
  requireBackend(
    'Saving record changes is unavailable until the backend is connected.'
  )
  return normalizeRecord(
    await httpClient.put(`${RECORDS_API_PATH(workspaceId, modelId)}/${recordId}`, { values }),
    fields
  )
}

/** Deletes a record permanently. Refused until a backend is available. */
const deleteRecord = async (workspaceId, modelId, recordId) => {
  requireBackend(
    'Deleting a record is unavailable until the backend is connected.'
  )
  await httpClient.delete(`${RECORDS_API_PATH(workspaceId, modelId)}/${recordId}`)
}

const databaseService = {
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
}

export default databaseService
