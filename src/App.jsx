import AppRoutes from '@/routes/AppRoutes'
import CommandPalette from '@/components/commandPalette/CommandPalette'
import HashScroll from '@/components/common/HashScroll'
import { lazy, Suspense } from 'react'
import config from '@/config'
import useTranslation from '@/hooks/useTranslation'

const PublicSitePage = lazy(() => import('@/pages/PublicSitePage'))

function App() {
  const { t } = useTranslation()
  if (config.publishing.publicSiteMode) {
    return (
      <Suspense fallback={<p role="status">{t('common.loading')}</p>}>
        <PublicSitePage />
      </Suspense>
    )
  }
  return (
    <>
      <AppRoutes />
      <CommandPalette />
      <HashScroll />
    </>
  )
}

export default App
