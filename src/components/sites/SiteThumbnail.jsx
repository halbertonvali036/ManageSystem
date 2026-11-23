import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ImageOff, LayoutTemplate } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import siteEditorService from '@/services/siteEditorService'
import { EDITOR_DEVICE, EDITOR_DEVICE_WIDTHS, getCanvasCssStyle } from '@/models/siteEditor'

const EditorCanvas = lazy(() => import('@/components/editor/EditorCanvas'))
const WIDTH = EDITOR_DEVICE_WIDTHS[EDITOR_DEVICE.DESKTOP]
// Share only in-flight reads (including StrictMode mounts), never stale drafts.
const requests = new Map()
function loadDraft(id) {
  if (!requests.has(id)) {
    requests.set(id, siteEditorService.getSiteDraft(id).finally(() => requests.delete(id)))
  }
  return requests.get(id)
}

export default function SiteThumbnail({ site }) {
  const { t } = useTranslation()
  const hostRef = useRef(null)
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))
  const [scale, setScale] = useState(0)
  const [state, setState] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  useLayoutEffect(() => {
    const host = hostRef.current
    const fit = () => setScale(host.clientWidth / WIDTH)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      return undefined
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(hostRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    let active = true
    loadDraft(site.id)
      .then(({ document }) => { if (active) setState({ document }) })
      .catch(() => { if (active) setState({ error: true }) })
    return () => { active = false }
  }, [visible, site.id, attempt])

  const draft = state.document
  const home = draft?.pages.find(page => page.isHome) ?? draft?.pages[0]
  const loading = <div className="site-card__preview-state"><span className="spinner" aria-hidden="true" /><span>{t('sites.previewLoading')}</span></div>

  return (
    <div ref={hostRef} className="site-card__preview">
      {state.loading ? loading : home ? (
        <Suspense fallback={loading}>
          <div className="site-card__preview-stage" inert aria-hidden="true"
            style={{ width: WIDTH, transform: `scale(${scale})`, ...getCanvasCssStyle(draft) }}>
            <EditorCanvas document={draft} activePage={home} device={EDITOR_DEVICE.DESKTOP} isPreview isThumbnail />
          </div>
        </Suspense>
      ) : site.thumbnailUrl && !imageFailed ? (
        <img className="site-card__thumb" src={site.thumbnailUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />
      ) : (
        <div className="site-card__preview-state">
          {state.error ? <ImageOff size={24} aria-hidden="true" /> : <LayoutTemplate size={24} aria-hidden="true" />}
          <span>{t(state.error ? 'sites.previewFailed' : 'sites.previewEmpty')}</span>
          {state.error && <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
            setState({ loading: true })
            setAttempt(value => value + 1)
          }}>{t('common.retry')}</button>}
        </div>
      )}
    </div>
  )
}
