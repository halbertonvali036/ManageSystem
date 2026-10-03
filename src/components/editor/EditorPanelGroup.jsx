/** Native disclosure keeps controls mounted and preserves their editing state. */
export default function EditorPanelGroup({ title, defaultOpen = false, children }) {
  return (
    <details className="editor-panel__section editor-panel-group" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="editor-panel-group__body">{children}</div>
    </details>
  )
}
