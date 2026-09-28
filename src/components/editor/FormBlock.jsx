import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import { getBlockCssStyle, getEffectiveStyle } from '@/models/siteEditor'
import { buildFormSubmissionPayload, validateFormValues } from '@/models/siteForm'
import { submitSiteForm } from '@/services/siteFormService'

export default function FormBlock({ block, device, isPreview }) {
  const { t } = useTranslation()
  const { siteId } = useParams()
  const prefix = useId()
  const element = useRef(null)
  const pendingFocus = useRef(null)
  const form = block.content.form
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [unavailable, setUnavailable] = useState(false)
  const [busy, setBusy] = useState(false)
  useLayoutEffect(() => {
    if (pendingFocus.current) {
      element.current?.elements.namedItem(pendingFocus.current)?.focus()
      pendingFocus.current = null
    }
  }, [errors])
  const submit = async (event) => {
    event.preventDefault()
    if (!isPreview || busy) return
    const nextErrors = validateFormValues(form, values)
    const first = form.fields.find((field) => nextErrors[field.id])
    pendingFocus.current = first?.name ?? null
    setErrors(nextErrors)
    setUnavailable(false)
    if (first) {
      return
    }
    setBusy(true)
    try {
      await submitSiteForm(siteId, form.id, buildFormSubmissionPayload(form, values))
    } catch {
      setUnavailable(true)
    } finally { setBusy(false) }
  }
  const update = (field, value) => {
    setValues((current) => ({ ...current, [field.id]: value }))
    setErrors((current) => { const next = { ...current }; delete next[field.id]; return next })
    setUnavailable(false)
  }
  return <div className="site-form-block" style={getBlockCssStyle(block, device)} inert={!isPreview}>
    <form ref={element} className="site-form" noValidate onSubmit={submit} aria-label={form.name || t('forms.title')} aria-describedby={`${prefix}-note`}>
      {form.fields.map((field) => {
        const inputId = `${prefix}-${field.id}`
        const error = errors[field.id]
        const props = {
          id: inputId, name: field.name, required: field.required, placeholder: field.placeholder,
          'aria-invalid': Boolean(error), 'aria-describedby': error ? `${inputId}-error` : undefined,
          onChange: (event) => update(field, field.type === 'checkbox' ? event.target.checked : event.target.value),
        }
        const label = <label htmlFor={inputId}>{field.label || t('forms.unnamed')}{field.required && <span aria-hidden="true"> *</span>}</label>
        return <div className={`site-form__field${field.type === 'checkbox' ? ' site-form__field--checkbox' : ''}`} key={field.id}>
          {field.type !== 'checkbox' && label}
          {field.type === 'textarea' ? <textarea {...props} rows={4} value={values[field.id] ?? ''} />
            : field.type === 'select' ? <select {...props} value={values[field.id] ?? ''}><option value="">{field.placeholder || t('forms.choose')}</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
              : field.type === 'checkbox' ? <input {...props} type="checkbox" checked={values[field.id] === true} />
                : <input {...props} type={field.type} step={field.type === 'number' ? 'any' : undefined} value={values[field.id] ?? ''} />}
          {field.type === 'checkbox' && label}
          {error && <p className="site-form__error" id={`${inputId}-error`}>{t(`forms.${error}`)}</p>}
        </div>
      })}
      {!form.fields.length && <p>{t('forms.empty')}</p>}
      <div className="site-form__submit-row" style={{ textAlign: getEffectiveStyle(block, device).align }}>
        <button className="site-form__submit" data-style={form.buttonStyle} type="submit" disabled={busy || !form.fields.length}>{form.submitLabel || t('forms.starter.submit')}</button>
      </div>
      <p className="site-form__note" id={`${prefix}-note`}>{t('forms.previewNote')}</p>
      <p className="site-form__notice" role="status">{unavailable ? t('forms.integration') : ''}</p>
    </form>
  </div>
}
