import { useEffect, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { getPublishReadiness } from '@/models/sitePublishing'
import sitePublishService from '@/services/sitePublishService'
import { getRequestErrorMessage } from '@/services/httpClient'
import { Link } from 'react-router-dom'
import { DEPLOYMENTS_PATH } from '@/utils/constants'

export default function PublishDialog({ siteId, siteName, document, onClose, action = 'publish' }) {
  const { t } = useTranslation()
  const dialog = useRef(null)
  const [notice, setNotice] = useState('')
  const [remote, setRemote] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const trigger = window.document.activeElement
    const element = dialog.current
    element.showModal()
    return () => { element.close(); trigger?.focus() }
  }, [])
  useEffect(() => {
    let active = true
    sitePublishService.getPublishStatus(siteId)
      .then(status => { if (active) setRemote(status) })
      .catch(error => { if (active) setNotice(getRequestErrorMessage(error)) })
    return () => { active = false }
  }, [siteId])
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
      setCompleted(true)
      setNotice(t(action === 'publish' ? 'publishing.queued' : 'publishing.unpublishedSuccess'))
      window.dispatchEvent(new Event('site-publication-changed'))
    } catch (error) {
      setNotice(getRequestErrorMessage(error))
    } finally { setBusy(false) }
  }
  return (
    <dialog ref={dialog} className="publish-dialog" aria-labelledby="publish-title" aria-describedby="publish-description" onCancel={onClose} onKeyDown={trapFocus}>
      <h2 id="publish-title">{t(`publishing.${action}`)}</h2>
      <p id="publish-description">{t('publishing.savedVersionNote')}</p>
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
      <p role="status">{notice || (remote?.pending ? t('publishing.queued') : t('publishing.notLive'))}</p>
      {completed && action === 'publish' ? <Link to={DEPLOYMENTS_PATH} onClick={onClose}>{t('publishing.openDeployments')}</Link> : null}
      <div className="publish-actions">
        <button autoFocus type="button" className="btn btn--outline" onClick={onClose}>{t('common.close')}</button>
        <button type="button" className="btn btn--primary" disabled={busy || completed || !remote?.available || (action === 'publish' && remote?.pending)} onClick={confirm}>{t(busy ? 'common.saving' : `publishing.${action}`)}</button>
      </div>
    </dialog>
  )
}
