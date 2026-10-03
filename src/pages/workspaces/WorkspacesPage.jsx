import { FolderPlus, LayoutTemplate } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/common/Card'
import WorkspaceCard from '@/components/workspaces/WorkspaceCard'
import WorkspacesEmptyState from '@/components/workspaces/WorkspacesEmptyState'
import WorkspaceJourney from '@/components/workspaces/WorkspaceJourney'
import useTranslation from '@/hooks/useTranslation'
import useWorkspaces from '@/hooks/useWorkspaces'
import { NEW_WORKSPACE_PATH, TEMPLATES_PATH } from '@/utils/constants'
import '@/styles/dashboard-polish.css'

/**
 * My Workspaces — the primary post-login home.
 *
 * Lists the account's real workspaces. Without a backend the list is empty and
 * the page shows a professional onboarding empty state. No sample workspace is
 * ever rendered.
 */
function WorkspacesPage() {
  const { t } = useTranslation()
  const { workspaces, total, isLoading, error, refetch } = useWorkspaces()

  return (
    <div className="workspaces-page premium-dashboard">
      <header className="workspaces-page__head platform-overview-hero">
        <div className="workspaces-page__headline">
          <p className="platform-overview-hero__eyebrow">{t('dashboardPolish.welcome')}</p>
          <h1 className="workspaces-page__title">{t('workspaces.pageTitle')}</h1>
          <p className="page-description">{t('workspaces.pageDescription')}</p>
        </div>

        <div className="platform-overview-hero__actions">
          <Link to={NEW_WORKSPACE_PATH} className="btn btn--primary workspaces-page__cta">
            <FolderPlus size={16} aria-hidden="true" />
            {t('workspaces.newCta')}
          </Link>
          <Link to={TEMPLATES_PATH} className="btn btn--ghost">
            <LayoutTemplate size={16} aria-hidden="true" />{t('dashboardPolish.templates')}
          </Link>
        </div>
      </header>

      <WorkspaceJourney />

      {error ? (
        <Card>
          <div className="table-state table-state--error">
            <h3 className="table-state__title">{t('workspaces.loadFailed')}</h3>
            <p className="table-state__text">{t('workspaces.loadFailedText')}</p>
            <button type="button" className="btn btn--primary" onClick={refetch}>
              {t('common.retry')}
            </button>
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('workspaces.loading')}
          </div>
        </Card>
      ) : total === 0 ? (
        <Card>
          <WorkspacesEmptyState />
        </Card>
      ) : (
        <>
          <div className="workspaces-page__listhead">
            <h3 className="workspace-section__title">{t('workspaces.listTitle')}</h3>
            <p className="workspaces-page__count" role="status">
              {t('workspaces.totalCount', { count: total })}
            </p>
          </div>

          <ul className="workspace-grid">
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <WorkspaceCard workspace={ws} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default WorkspacesPage
