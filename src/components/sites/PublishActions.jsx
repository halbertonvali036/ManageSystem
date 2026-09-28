import { useEffect, useState } from 'react'
import siteEditorService from '@/services/siteEditorService'
import useTranslation from '@/hooks/useTranslation'
import PublishDialog from './PublishDialog'

export default function PublishActions(props) {
  const { t } = useTranslation()
  const [action, setAction] = useState(null)
  const [storedDraft, setStoredDraft] = useState(null)
  useEffect(() => {
    if (!action || props.document) return undefined
    let active = true
    siteEditorService.getSiteDraft(props.siteId).then((document) => {
      if (active) setStoredDraft({ siteId: props.siteId, document })
    }).catch(() => {})
    return () => { active = false }
  }, [action, props.document, props.siteId])
  return <>
    <button type="button" className="btn btn--primary" onClick={() => setAction('publish')}>{t('publishing.publish')}</button>
    <button type="button" className="btn btn--outline" onClick={() => setAction('unpublish')}>{t('publishing.unpublish')}</button>
    {action && <PublishDialog {...props} document={props.document ?? (storedDraft?.siteId === props.siteId ? storedDraft.document : null)} action={action} onClose={() => setAction(null)} />}
  </>
}
