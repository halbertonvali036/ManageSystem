import { useEffect, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { getPublishReadiness } from '@/models/sitePublishing'
import sitePublishService from '@/services/sitePublishService'

export default function PublishDialog({ siteId, siteName, document, onClose, action = 'publish' }) {
  const { t } = useTranslation()
  const dialog = useRef(null)
  const [notice, setNotice] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const trigger = window.document.activeElement
    const element = dialog.current
    element.showModal()
    return () => { element.close(); trigger?.focus() }
  }, [])
  const readiness = getPublishReadiness(siteName, document)
  const home = document?.pages?.find((page) => page.isHome)
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return
    const buttons = dialog.current.querySelectorAll('button:not(:disabled)')
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && window.document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && window.document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  const confirm = async () => {
    setBusy(true)
    try {
      await sitePublishService[action === 'publish' ? 'publishSite' : 'unpublishSite'](siteId)
    } catch {
      setNotice(true)
    } finally { setBusy(false) }
  }
  return (
    <dialog ref={dialog} className="publish-dialog" aria-labelledby="publish-title" aria-describedby="publish-description" onCancel={onClose} onKeyDown={trapFocus}>
      <h2 id="publish-title">{t(`publishing.${action}`)}</h2>
      <p id="publish-description">{t('publishing.pending')}</p>
      <dl className="publish-facts">
        <div><dt>{t('publishing.name')}</dt><dd>{siteName || t('publishing.missing')}</dd></div>
        <div><dt>{t('publishing.home')}</dt><dd>{home?.name || t(document ? 'publishing.missing' : 'publishing.unknown')}</dd></div>
        <div><dt>{t('publishing.domain')}</dt><dd>{t('publishing.unknown')}</dd></div>
      </dl>
      {action === 'publish' ? <>
        <h3>{t('publishing.localChecks')}</h3>
        <ul className="publish-checks">{readiness.map(({ key, ready }) => <li key={key}><span>{t(`publishing.${key}`)}</span><strong>{t(`publishing.${ready === null ? 'unknown' : ready ? 'ready' : 'missing'}`)}</strong></li>)}</ul>
        <p>{t('publishing.remoteChecks')}</p>
      </> : <p>{t('publishing.unpublishConfirm')}</p>}
      <p role="status">{notice ? t('publishing.noChange') : t('publishing.notLive')}</p>
      <div className="publish-actions">
        <button autoFocus type="button" className="btn btn--outline" onClick={onClose}>{t('common.close')}</button>
        <button type="button" className="btn btn--primary" disabled={busy} onClick={confirm}>{t('publishing.checkIntegration')}</button>
      </div>
    </dialog>
  )
}
