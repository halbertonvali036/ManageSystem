import { useRef } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { createFormField, duplicateFormField, FORM_FIELD_TYPES, MAX_FORM_FIELDS, moveFormField } from '@/models/siteForm'

export default function FormSettings({ form, onChange }) {
  const { t } = useTranslation()
  const addButton = useRef(null)
  const patch = (changes) => onChange({ ...form, ...changes })
  const updateField = (id, changes) => patch({ fields: form.fields.map((field) => field.id === id ? { ...field, ...changes } : field) })
  const full = form.fields.length >= MAX_FORM_FIELDS
  return <div className="form-settings">
    <h4>{t('forms.settings')}</h4>
    <p className="editor-form-note">{t('forms.local')}</p>
    <label>{t('forms.name')}<input className="editor-input" value={form.name} maxLength={160} onChange={(event) => patch({ name: event.target.value })} /></label>
    <div className="form-settings__fields">
      {form.fields.map((field, index) => <fieldset className="form-field-editor" key={field.id}>
        <legend>{index + 1}. {field.label || t('forms.unnamed')}</legend>
        <label>{t('forms.label')}<input className="editor-input" value={field.label} maxLength={160} onChange={(event) => updateField(field.id, { label: event.target.value })} /></label>
        <label>{t('forms.key')}<input className="editor-input" value={field.name} readOnly /></label>
        <label>{t('forms.type')}<select className="editor-input" value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value })}>{FORM_FIELD_TYPES.map((type) => <option key={type} value={type}>{t(`forms.types.${type}`)}</option>)}</select></label>
        <label className="form-settings__check"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} />{t('forms.required')}</label>
        {field.type !== 'checkbox' && <label>{t('forms.placeholder')}<input className="editor-input" maxLength={160} value={field.placeholder} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} /></label>}
        {field.type === 'select' && <><label>{t('forms.options')}
          <textarea className="editor-textarea" rows={4} key={field.options.join('\n')} defaultValue={field.options.join('\n')} maxLength={6440} aria-describedby={`options-${field.id}`} onBlur={(event) => updateField(field.id, { options: event.target.value.split('\n') })} />
        </label><span className="editor-form-note" id={`options-${field.id}`}>{t('forms.optionsHint')}</span></>}
        <div className="form-field-editor__actions">
          <button type="button" className="btn btn--outline btn--sm" disabled={index === 0} onClick={() => onChange(moveFormField(form, field.id, -1))} aria-label={`${t('forms.up')}: ${field.label}`}>↑</button>
          <button type="button" className="btn btn--outline btn--sm" disabled={index === form.fields.length - 1} onClick={() => onChange(moveFormField(form, field.id, 1))} aria-label={`${t('forms.down')}: ${field.label}`}>↓</button>
          <button type="button" className="btn btn--outline btn--sm" disabled={full} onClick={() => onChange(duplicateFormField(form, field.id))}>{t('forms.duplicate')}</button>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => { patch({ fields: form.fields.filter((item) => item.id !== field.id) }); requestAnimationFrame(() => addButton.current?.focus()) }}>{t('forms.remove')}</button>
        </div>
      </fieldset>)}
    </div>
    <button ref={addButton} type="button" className="btn btn--outline" disabled={full} onClick={() => patch({ fields: [...form.fields, createFormField({ label: t('forms.field') })] })}>{t('forms.add')}</button>
    {full && <p className="editor-form-note" role="status">{t('forms.limit')}</p>}
    <label>{t('forms.submitLabel')}<input className="editor-input" value={form.submitLabel} maxLength={160} onChange={(event) => patch({ submitLabel: event.target.value })} /></label>
    <label>{t('forms.buttonStyle')}<select className="editor-input" value={form.buttonStyle} onChange={(event) => patch({ buttonStyle: event.target.value })}><option value="solid">{t('forms.solid')}</option><option value="outline">{t('forms.outline')}</option></select></label>
    <p className="editor-form-note">{t('forms.alignmentHint')}</p>
    <label>{t('forms.successMessage')}<textarea className="editor-textarea" rows={3} maxLength={1000} value={form.successMessage} onChange={(event) => patch({ successMessage: event.target.value })} aria-describedby="form-future-note" /></label>
    <p id="form-future-note" className="editor-form-note">{t('forms.future')}</p>
    <fieldset className="form-settings__future" disabled aria-describedby="form-future-note">
      {['redirect', 'notification', 'spam', 'storage'].map((key) => <label key={key}>{t(`forms.${key}`)}<input className="editor-input" value={t('forms.unavailable')} readOnly /></label>)}
    </fieldset>
  </div>
}
