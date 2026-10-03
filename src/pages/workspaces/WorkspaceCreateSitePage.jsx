import { useParams } from 'react-router-dom'
import WorkspaceBreadcrumb from '@/components/workspaces/WorkspaceBreadcrumb'
import useWorkspace from '@/hooks/useWorkspace'
import CreateWebsitePage from '@/pages/CreateWebsitePage'

/**
 * Workspace-scoped site creation.
 *
 * A thin adapter that renders the existing CreateWebsitePage wizard with a
 * workspaceId passed down as a prop. This keeps all wizard logic in one place
 * and scopes the resulting site to the workspace from creation time.
 */
function WorkspaceCreateSitePage() {
  const { workspaceId } = useParams()
  const { workspace } = useWorkspace(workspaceId)

  return (
    <div>
      <WorkspaceBreadcrumb workspace={workspace} section="sites" />
      <div style={{ marginTop: 'var(--space-4)' }}>
        <CreateWebsitePage workspaceId={workspaceId} />
      </div>
    </div>
  )
}

export default WorkspaceCreateSitePage
