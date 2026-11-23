import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import PublishDialog from '@/components/sites/PublishDialog'
import useTranslation from '@/hooks/useTranslation'
import siteService from '@/services/siteService'
import siteEditorService from '@/services/siteEditorService'
import { getRequestErrorMessage } from '@/services/httpClient'

const METHODS = { rename: 'renameSite', duplicate: 'duplicateSite', archive: 'archiveSite', delete: 'deleteSite' }

export default function SiteActionDialog({ site, action, onClose, onChanged }) {
  const { t } = useTranslation()
  const [name, setName] = useState(site.name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [draft, setDraft] = useState(null)
  const pending = useRef(false)

  useEffect(() => {
    if (action !== 'publish') return undefined
    let active = true
    siteEditorService.getSiteDraft(site.id)
      .then(result => { if (active) setDraft(result.document) })
      .catch(() => {})
    return () => { active = false }
  }, [action, site.id])

  const confirm = async () => {
    if (pending.current) return
    if (action === 'rename' && (!name.trim() || name.trim().length > 150)) {
      setError(t('sites.actionNameInvalid'))
      return
    }
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      await siteService[METHODS[action]](site.id, name.trim())
      onChanged?.()
      onClose()
    } catch (failure) {
      setError(getRequestErrorMessage(failure))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return createPortal(action === 'publish' ? (
    <PublishDialog siteId={site.id} siteName={site.name} document={draft} onClose={onClose} />
  ) : (
    <ConfirmDialog
      open
      title={t(`sites.action.${action}`)}
      message={t(`sites.actionMessage.${action}`, { name: site.name })}
      confirmLabel={t(`sites.action.${action}`)}
      confirmingLabel={t('common.saving')}
      cancelLabel={t('common.cancel')}
      closeLabel={t('common.close')}
      confirmVariant={action === 'delete' ? 'danger' : 'primary'}
      isConfirming={busy}
      error={error}
      onCancel={onClose}
      onConfirm={confirm}
    >
      {action === 'rename' && (
        <label className="form-field">
          <span>{t('publishing.name')}</span>
          <input className="form-input" value={name} maxLength={150} disabled={busy}
            onChange={event => setName(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); confirm() } }}
          />
        </label>
      )}
    </ConfirmDialog>
  ), document.body)
}
