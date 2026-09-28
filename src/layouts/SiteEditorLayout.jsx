import { Outlet } from 'react-router-dom'

/**
 * Site editor shell.
 *
 * The editor is a full-bleed workspace, so it deliberately does not reuse
 * MainLayout: the app sidebar, header and footer would compete with the canvas
 * for horizontal space. It still lives under the authenticated `/sites` prefix,
 * so portal authorisation is unchanged.
 */
function SiteEditorLayout() {
  return (
    <main className="editor-shell">
      <Outlet />
    </main>
  )
}

export default SiteEditorLayout
