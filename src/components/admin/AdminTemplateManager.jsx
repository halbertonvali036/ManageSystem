import { useMemo, useState, useCallback } from 'react'
import useTranslation from '@/hooks/useTranslation'
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_TIERS,
  ALL_TEMPLATE_CATEGORIES,
  ALL_TEMPLATE_TIERS,
  TEMPLATE_TIER,
  filterTemplates,
  countTemplateSections,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_TIER_LABELS,
} from '@/models/siteTemplate'
import TemplatePreviewDialog from '@/components/sites/TemplatePreviewDialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import adminPlatformService from '@/services/adminPlatformService'
import { BackendNotConnectedError, RequestError } from '@/services/httpClient'
import '@/styles/admin-platform.css'

/* "all" is a filter value only: a template itself always has one real category
   and one real tier, so the metadata form never offers it as a choice. */
const EDITOR_CATEGORIES = TEMPLATE_CATEGORIES.filter(entry => entry.id !== ALL_TEMPLATE_CATEGORIES)
const EDITOR_TIERS = TEMPLATE_TIERS.filter(entry => entry.id !== ALL_TEMPLATE_TIERS)

const newMetadataValues = () => ({
  name: '',
  description: '',
  category: EDITOR_CATEGORIES[0].id,
  tier: TEMPLATE_TIER.FREE,
  published: true,
  tags: '',
  features: '',
})

const splitList = value => String(value).split(',').map(entry => entry.trim()).filter(Boolean)
const joinList = (values, t) => (values ?? []).map(entry => t(entry)).join(', ')

function AdminTemplateManager() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_TEMPLATE_CATEGORIES)
  const [tier, setTier] = useState(ALL_TEMPLATE_TIERS)
  const [publishedFilter, setPublishedFilter] = useState('all') // all|published|unpublished
  const [preview, setPreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)
  // Metadata editor: `mode` is create|edit, `values` mirrors the form fields.
  const [editor, setEditor] = useState(null)
  const [editorError, setEditorError] = useState(null)
  const [saving, setSaving] = useState(false)
  // Errors raised by an action opened from a dialog stay inside that dialog.
  const [dialogError, setDialogError] = useState(null)

  const templates = useMemo(() => {
    const filtered = filterTemplates({ category, tier, query, t })
    return filtered.map(tpl => ({ ...tpl, published: tpl.published !== false })) // default published
  }, [category, tier, query, t])

  const visible = useMemo(() => {
    if (publishedFilter === 'published') return templates.filter(t => t.published)
    if (publishedFilter === 'unpublished') return templates.filter(t => !t.published)
    return templates
  }, [templates, publishedFilter])

  const describeError = useCallback((err, fallbackKey) => {
    if (err instanceof BackendNotConnectedError) return t('admin.templateActionUnavailable')
    return err instanceof RequestError ? err.message : t(fallbackKey)
  }, [t])

  /** Tier toggle, publish toggle and delete: one honest path for all three. */
  const runAction = useCallback(async (action, template, patch) => {
    setBusyId(template.id)
    setMessage(null)
    setDialogError(null)
    try {
      if (action === 'delete') await adminPlatformService.deleteTemplate(template.id)
      else await adminPlatformService.updateTemplate(template.id, patch)
      setMessage({ type: 'done', text: t('admin.statusUpdated') })
      if (action === 'delete') setDeleteTarget(null)
    } catch (err) {
      const text = describeError(err, 'admin.templateActionFailed')
      if (action === 'delete') setDialogError(text)
      else setMessage({ type: err instanceof BackendNotConnectedError ? 'unavailable' : 'error', text })
    } finally {
      setBusyId(null)
    }
  }, [describeError, t])

  const openCreate = useCallback(() => {
    setMessage(null)
    setEditorError(null)
    setEditor({ mode: 'create', template: null, values: newMetadataValues() })
  }, [])

  const openEdit = useCallback(tpl => {
    setMessage(null)
    setEditorError(null)
    setEditor({
      mode: 'edit',
      template: tpl,
      values: {
        name: t(tpl.nameKey),
        description: t(tpl.descriptionKey),
        category: tpl.category,
        tier: tpl.tier,
        published: tpl.published,
        tags: joinList(tpl.tags, t),
        features: joinList(tpl.features, t),
      },
    })
  }, [t])

  const setField = (field, value) =>
    setEditor(prev => (prev ? { ...prev, values: { ...prev.values, [field]: value } } : prev))

  const closeEditor = () => {
    setEditor(null)
    setEditorError(null)
  }

  /**
   * Sends the metadata and states the outcome.
   *
   * A failed or unavailable request keeps the dialog open with the reason, and
   * the catalogue is never rewritten: nothing is shown as saved unless a real
   * service accepted it.
   */
  const saveEditor = async () => {
    if (!editor || saving) return
    const values = editor.values
    if (!values.name.trim()) {
      setEditorError(t('admin.metaNameRequired'))
      return
    }
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      tier: values.tier,
      published: values.published,
      tags: splitList(values.tags),
      features: splitList(values.features),
    }
    setSaving(true)
    setEditorError(null)
    try {
      if (editor.mode === 'create') await adminPlatformService.createTemplate(payload)
      else await adminPlatformService.updateTemplate(editor.template.id, payload)
      setMessage({ type: 'done', text: t('admin.metaSaved') })
      closeEditor()
    } catch (err) {
      setEditorError(
        err instanceof BackendNotConnectedError
          ? t('admin.metaUnavailable')
          : err instanceof RequestError
            ? err.message
            : t('admin.metaSaveFailed'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-foundation" aria-labelledby="admin-template-manager">
      <h2 id="admin-template-manager">{t('admin.templateManagement')}</h2>
      <div className="admin-filters">
        <label htmlFor="admin-tpl-search">{t('admin.templateSearch')}<input id="admin-tpl-search" className="editor-input" type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label htmlFor="admin-tpl-category">{t('templates.filterLabel')}<select id="admin-tpl-category" className="editor-input" value={category} onChange={e => setCategory(e.target.value)}>
          {TEMPLATE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.labelKey)}</option>)}
        </select></label>
        <label htmlFor="admin-tpl-tier">{t('templates.tierFilterLabel')}<select id="admin-tpl-tier" className="editor-input" value={tier} onChange={e => setTier(e.target.value)}>
          {TEMPLATE_TIERS.map(tierOpt => <option key={tierOpt.id} value={tierOpt.id}>{t(tierOpt.labelKey)}</option>)}
        </select></label>
        <label htmlFor="admin-tpl-published">{t('admin.publishedStatus')}<select id="admin-tpl-published" className="editor-input" value={publishedFilter} onChange={e => setPublishedFilter(e.target.value)}>
          <option value="all">{t('admin.allPublished')}</option>
          <option value="published">{t('admin.published')}</option>
          <option value="unpublished">{t('admin.unpublished')}</option>
        </select></label>
      </div>
      <p>{t('admin.mutationsPending')}</p>
      <div className="admin-pending-actions">
        <button type="button" className="btn btn--outline" onClick={openCreate}>{t('admin.newTemplate')}</button>
      </div>
      {message && <p className={`admin-hint admin-hint--${message.type}`} role="status">{message.text}</p>}
      <div className="admin-catalogue">
        {visible.map(tpl => (
          <article key={tpl.id}>
            <h3>{t(tpl.nameKey)}</h3>
            <p>{t(tpl.descriptionKey)}</p>
            <p><strong>{t('admin.fields.category')}:</strong> {t(TEMPLATE_CATEGORY_LABELS[tpl.category] ?? 'templates.categoryBasic')}</p>
            <p><strong>{t('admin.fields.status')}:</strong> {tpl.published ? t('admin.published') : t('admin.unpublished')}</p>
            <p><strong>{t('admin.metaTier')}:</strong> {t(TEMPLATE_TIER_LABELS[tpl.tier])}</p>
            <p><strong>{t('admin.pageCountLabel')}:</strong> {t('templates.pageCount', { count: tpl.pages.length })}, {t('templates.sectionCount', { count: countTemplateSections(tpl) })}</p>
            {tpl.tags?.length ? <p><strong>{t('admin.metaTags')}:</strong> {tpl.tags.map(k => t(k)).join(', ')}</p> : null}
            {tpl.features?.length ? <p><strong>{t('admin.metaFeatures')}:</strong> {tpl.features.map(k => t(k)).join(', ')}</p> : null}
            <div className="admin-pending-actions">
              <button type="button" className="btn btn--outline" onClick={() => setPreview(tpl)}>{t('templates.previewAction')}</button>
              <button type="button" className="btn btn--outline" disabled={busyId === tpl.id} onClick={() => openEdit(tpl)}>{t('admin.editTemplateMeta')}</button>
              <button type="button" className="btn btn--outline" disabled={busyId === tpl.id} onClick={() => runAction('updateTemplate', tpl, { tier: tpl.tier === TEMPLATE_TIER.FREE ? TEMPLATE_TIER.PRO : TEMPLATE_TIER.FREE })}>
                {tpl.tier === TEMPLATE_TIER.FREE ? t('admin.makePro') : t('admin.makeFree')}
              </button>
              <button type="button" className="btn btn--outline" disabled={busyId === tpl.id} onClick={() => runAction('updateTemplate', tpl, { published: !tpl.published })}>
                {tpl.published ? t('admin.unpublish') : t('admin.publish')}
              </button>
              <button type="button" className="btn btn--outline" disabled={busyId === tpl.id} onClick={() => { setDialogError(null); setDeleteTarget(tpl) }}>{t('admin.delete')}</button>
            </div>
          </article>
        ))}
      </div>
      {preview && <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />}

      {/* Metadata editor. Fields only: pages, sections and themes stay untouched. */}
      <ConfirmDialog
        open={Boolean(editor)}
        title={editor?.mode === 'edit' ? t('admin.metaEditTitle') : t('admin.metaNewTitle')}
        message={t('admin.metaHint')}
        confirmLabel={editor?.mode === 'edit' ? t('common.save') : t('admin.createTemplate')}
        confirmingLabel={t('common.saving')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        confirmVariant="primary"
        isConfirming={saving}
        error={editorError}
        onCancel={closeEditor}
        onConfirm={saveEditor}
      >
        {editor && (
          <div className="admin-settings-grid">
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-name">{t('admin.metaName')}</label>
              <input
                id="admin-tpl-meta-name"
                className="editor-input"
                type="text"
                value={editor.values.name}
                placeholder={t('admin.metaNamePlaceholder')}
                disabled={saving}
                onChange={e => setField('name', e.target.value)}
              />
            </div>
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-description">{t('admin.metaDescription')}</label>
              <textarea
                id="admin-tpl-meta-description"
                className="editor-textarea"
                value={editor.values.description}
                placeholder={t('admin.metaDescriptionPlaceholder')}
                disabled={saving}
                onChange={e => setField('description', e.target.value)}
              />
            </div>
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-category">{t('admin.fields.category')}</label>
              <select id="admin-tpl-meta-category" className="editor-input" value={editor.values.category} disabled={saving} onChange={e => setField('category', e.target.value)}>
                {EDITOR_CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.labelKey)}</option>)}
              </select>
            </div>
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-tier">{t('admin.metaTier')}</label>
              <select id="admin-tpl-meta-tier" className="editor-input" value={editor.values.tier} disabled={saving} onChange={e => setField('tier', e.target.value)}>
                {EDITOR_TIERS.map(tierOpt => <option key={tierOpt.id} value={tierOpt.id}>{t(tierOpt.labelKey)}</option>)}
              </select>
            </div>
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-published">{t('admin.fields.status')}</label>
              <select id="admin-tpl-meta-published" className="editor-input" value={editor.values.published ? 'published' : 'unpublished'} disabled={saving} onChange={e => setField('published', e.target.value === 'published')}>
                <option value="published">{t('admin.published')}</option>
                <option value="unpublished">{t('admin.unpublished')}</option>
              </select>
            </div>
            {editor.mode === 'edit' && editor.template ? (
              <div className="form__field">
                <span>{t('admin.metaReference')}</span>
                <p className="form__hint">{editor.template.slug} · {editor.template.layout}</p>
              </div>
            ) : null}
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-tags">{t('admin.metaTags')}</label>
              <input id="admin-tpl-meta-tags" className="editor-input" type="text" value={editor.values.tags} disabled={saving} onChange={e => setField('tags', e.target.value)} />
              <p className="form__hint">{t('admin.metaListHint')}</p>
            </div>
            <div className="form__field">
              <label htmlFor="admin-tpl-meta-features">{t('admin.metaFeatures')}</label>
              <input id="admin-tpl-meta-features" className="editor-input" type="text" value={editor.values.features} disabled={saving} onChange={e => setField('features', e.target.value)} />
              <p className="form__hint">{t('admin.metaListHint')}</p>
            </div>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.deleteTemplateTitle')}
        message={deleteTarget ? t('admin.deleteTemplateMessage', { name: t(deleteTarget.nameKey) }) : ''}
        confirmLabel={t('admin.delete')}
        confirmingLabel={t('common.saving')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        error={dialogError}
        isConfirming={Boolean(deleteTarget) && busyId === deleteTarget.id}
        onCancel={() => { setDeleteTarget(null); setDialogError(null) }}
        onConfirm={() => { if (deleteTarget) runAction('delete', deleteTarget) }}
      />
    </section>
  )
}

export default AdminTemplateManager
