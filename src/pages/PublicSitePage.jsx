import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EditorCanvas from '@/components/editor/EditorCanvas'
import useTranslation from '@/hooks/useTranslation'
import { getPublicSite } from '@/services/publicSiteService'
import { publicPageForPath } from '@/models/publicSite'
import '@/styles/public-site.css'

const currentDevice = () => window.innerWidth < 600 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'

export default function PublicSitePage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [state, setState] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  const [device, setDevice] = useState(currentDevice)

  useEffect(() => {
    let current = true
    const controller = new AbortController()
    getPublicSite(window.location.hostname, { signal: controller.signal })
      .then((site) => { if (current) setState({ site }) })
      .catch((error) => { if (current) setState({ error: error.status === 404 ? 'notFound' : 'failed' }) })
    return () => {
      current = false
      controller.abort()
    }
  }, [attempt])

  useEffect(() => {
    const resize = () => setDevice(currentDevice())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const page = state.site ? publicPageForPath(state.site.document.pages, pathname) : null
  useEffect(() => {
    const previousTitle = document.title
    document.title = page ? `${page.name} — ${state.site.name}` : t('publishing.publicNotFound')
    return () => { document.title = previousTitle }
  }, [page, state.site, t])

  if (state.loading) return <main className="page-status" role="status">{t('common.loading')}</main>
  if (state.error || !page) {
    return (
      <main className="page-status" role="status">
        <p>{t(state.error === 'failed' ? 'publishing.publicLoadFailed' : 'publishing.publicNotFound')}</p>
        {state.error === 'failed' ? (
          <button type="button" className="btn btn--outline" onClick={() => {
            setState({ loading: true })
            setAttempt((value) => value + 1)
          }}>
            {t('common.retry')}
          </button>
        ) : null}
      </main>
    )
  }

  return (
    <main className="public-site">
      <EditorCanvas
        document={{ ...state.site.document, activePageId: page.id }}
        activePage={page}
        device={device}
        isPreview
        isPublished
      />
    </main>
  )
}
