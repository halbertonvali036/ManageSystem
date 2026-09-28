import { azForms } from '@/i18n/formLocales'

export const FORM_FIELD_TYPES = ['text', 'email', 'textarea', 'number', 'select', 'checkbox']
export const MAX_FORM_FIELDS = 30
const id = () => crypto.randomUUID()
const text = (value, limit = 160) => typeof value === 'string' ? value.slice(0, limit) : ''
const validId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value)
const key = (value) => text(value, 64).replace(/[^a-zA-Z0-9_]/g, '_') || 'field'

export const createFormField = (patch = {}) => ({
  id: id(), name: `field_${id().replaceAll('-', '').slice(0, 12)}`, label: '', type: 'text',
  placeholder: '', required: false, options: [], ...patch,
})

export const createStarterForm = (t) => {
  const copy = (name) => t ? t(`forms.starter.${name}`) : azForms.starter[name]
  return normalizeSiteForm({
    name: copy('name'), submitLabel: copy('submit'), successMessage: copy('success'),
    fields: [
      createFormField({ name: 'name', label: copy('person'), required: true }),
      createFormField({ name: 'email', label: copy('email'), type: 'email', required: true }),
      createFormField({ name: 'message', label: copy('message'), type: 'textarea', required: true }),
    ],
  })
}

export const normalizeSiteForm = (raw = {}) => {
  const ids = new Set()
  const names = new Set()
  return {
    id: validId(raw?.id) ? raw.id : id(),
    name: text(raw?.name), submitLabel: text(raw?.submitLabel), successMessage: text(raw?.successMessage, 1000),
    buttonStyle: raw?.buttonStyle === 'outline' ? 'outline' : 'solid',
    // Public draft metadata only. Destination credentials/config remain server-owned.
    config: { destinationId: null, redirectUrl: null, notificationEmail: null, spamProtection: null, storageMode: null },
    fields: (Array.isArray(raw?.fields) ? raw.fields : []).slice(0, MAX_FORM_FIELDS).map((field) => {
      let fieldId = validId(field?.id) ? field.id : id()
      if (ids.has(fieldId)) fieldId = id()
      ids.add(fieldId)
      const baseName = key(field?.name)
      let name = baseName
      let suffix = 2
      while (names.has(name)) name = `${baseName}_${suffix++}`
      names.add(name)
      const type = FORM_FIELD_TYPES.includes(field?.type) ? field.type : 'text'
      return {
        id: fieldId, name, type, label: text(field?.label), placeholder: text(field?.placeholder), required: field?.required === true,
        options: type === 'select' && Array.isArray(field?.options)
          ? [...new Set(field.options.filter((option) => typeof option === 'string').map((option) => option.trim().slice(0, 160)).filter(Boolean))].slice(0, 40)
          : [],
      }
    }),
  }
}

export const duplicateForm = (form) => normalizeSiteForm({ ...form, id: id(), fields: form.fields.map((field) => ({ ...field, id: id(), options: [...field.options] })) })

export const duplicateFormField = (form, fieldId) => {
  const index = form.fields.findIndex((field) => field.id === fieldId)
  if (index < 0 || form.fields.length >= MAX_FORM_FIELDS) return form
  const fields = [...form.fields]
  const source = fields[index]
  fields.splice(index + 1, 0, { ...source, id: id(), name: `${source.name}_copy`, options: [...source.options] })
  return normalizeSiteForm({ ...form, fields })
}

export const moveFormField = (form, fieldId, offset) => {
  const index = form.fields.findIndex((field) => field.id === fieldId)
  const target = index + offset
  if (index < 0 || target < 0 || target >= form.fields.length) return form
  const fields = [...form.fields]
  const [field] = fields.splice(index, 1)
  fields.splice(target, 0, field)
  return { ...form, fields }
}

// UX validation only; a backend must validate again before delivery or storage.
export const validateFormValues = (form, values) => Object.fromEntries(form.fields.flatMap((field) => {
  const value = values[field.id]
  const empty = field.type === 'checkbox' ? value !== true : !String(value ?? '').trim()
  let error = field.required && empty ? 'requiredError' : null
  if (!empty && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) error = 'emailError'
  if (!empty && field.type === 'number' && !Number.isFinite(Number(value))) error = 'numberError'
  if (!empty && field.type === 'select' && !field.options.includes(value)) error = 'optionError'
  return error ? [[field.id, error]] : []
}))

export const buildFormSubmissionPayload = (form, values) => ({
  fields: Object.fromEntries(form.fields.map((field) => [field.name, field.type === 'checkbox' ? values[field.id] === true : String(values[field.id] ?? '').trim()])),
})
