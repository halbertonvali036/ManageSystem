import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AI_CONTEXT_KEYS, buildAiContext, getMissingAiContext } from '@/models/ai'

/**
 * Where the user is, as far as the assistant is concerned.
 *
 * ── Why the URL is the source ──────────────────────────────────────────────────
 *
 * The assistant is asked questions from inside a workspace, but usually about something
 * that is open somewhere else — a page, a block, a theme. Rather than a shared global
 * store that every editor panel would have to write to, the editor links here with the
 * subject in the query string: `/workspaces/w1/ai?siteId=s1&pageId=p1&blockId=b1&theme=aurora`.
 *
 * The URL was chosen for three reasons. It is already shareable, so a user can send
 * someone "the AI, looking at this page" and have them arrive at the same question. It
 * survives a refresh, which a module-level context store would not. And it needs no
 * provider above the workspace, which means this page can be opened directly, deep-linked
 * from anywhere, without the whole tree agreeing to be initialised first.
 *
 * `workspaceId` comes from the route and the rest from the query, because only one of
 * them identifies *which* workspace this is; the others describe what is open inside it.
 *
 * ── What actually leaves the browser ───────────────────────────────────────────
 *
 * `buildAiContext` is an allowlist and it validates every value, so a hand-edited URL
 * cannot smuggle anything: an id that is not id-shaped is dropped, and a theme that is
 * not one of the site's real presets is dropped. What this hook returns is therefore
 * always a subset of five known-safe values, which is why nothing here needs to decide
 * what is sensitive — that decision already lives in the model, in one place.
 *
 * The object is frozen by `buildAiContext` and memoized here, so it is safe to use as an
 * effect dependency: a new identity per render would re-run every assistant read on every
 * keystroke elsewhere in the page.
 */
function useAiContext() {
  const { workspaceId } = useParams()
  const [searchParams] = useSearchParams()

  const context = useMemo(
    () =>
      buildAiContext({
        workspaceId,
        siteId: searchParams.get('siteId'),
        activePageId: searchParams.get('pageId'),
        selectedBlockId: searchParams.get('blockId'),
        currentTheme: searchParams.get('theme'),
      }),
    [workspaceId, searchParams],
  )

  /**
   * Context keys with nothing behind them.
   *
   * Derived rather than stored, so it cannot fall out of step with `context`. The panel
   * uses this to name the gap — "open a page" is far more use than a blank row would be.
   */
  const missingKeys = useMemo(
    () => AI_CONTEXT_KEYS.filter((key) => !context[key]),
    [context],
  )

  /**
   * Which context a given action still needs.
   *
   * Exposed so a prompt chip can show that a question cannot be answered yet — asking to
   * add a section with no page open produces a proposal about nothing, and saying so up
   * front beats a rejected request.
   */
  const getMissing = (action) => getMissingAiContext(action, context)

  return { workspaceId, context, missingKeys, getMissing }
}

export default useAiContext
