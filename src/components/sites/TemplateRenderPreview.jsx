import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import EditorCanvas from '@/components/editor/EditorCanvas'
import {
  createLocalDraftDocument,
  EDITOR_DEVICE,
  EDITOR_DEVICE_WIDTHS,
} from '@/models/siteEditor'
import { getSiteTheme, normalizeSiteTheme } from '@/models/siteTheme'
import { getTemplatePageSkeletons } from '@/models/siteTemplate'

const PREVIEW_DEVICE = EDITOR_DEVICE.DESKTOP
const PREVIEW_WIDTH = EDITOR_DEVICE_WIDTHS[PREVIEW_DEVICE]

/**
 * The gallery card thumbnail that shows the template's actual first page.
 *
 * The card builds the same local draft the preview dialog builds and renders it
 * with the same `EditorCanvas` in preview mode, then scales the whole stage down
 * to the card's width. The picture therefore cannot go stale: it is the page the
 * template really creates, painted in the template's own theme, rather than a
 * schematic of it.
 *
 * The stage keeps its natural desktop width and is scaled from the top-left, so
 * the hero reads as a hero. Everything below the card's crop is clipped, which
 * reads as "there is more page" the same way the schematic's fade does. The
 * thumbnail is decorative — the card's name, category and counts carry the same
 * information — so the wrapper is `aria-hidden` and never takes pointer
 * events.
 */
function TemplateRenderPreview({ template }) {
  const { t } = useTranslation()
  const theme = getSiteTheme(template.themePreset)
  const hostRef = useRef(null)
  const [scale, setScale] = useState(0)

  // The same draft shape as the preview dialog, so the thumbnail and the dialog
  // can never disagree about what the template contains.
  const draft = useMemo(() => ({
    ...createLocalDraftDocument({
      t,
      pageSkeletons: getTemplatePageSkeletons(template.id).map((page) => ({
        ...page,
        name: t(page.nameKey),
      })),
    }),
    theme: normalizeSiteTheme(template.themePreset),
  }), [template, t])

  const activePage = draft.pages.find((page) => page.isHome) ?? draft.pages[0]

  // Fit before paint so the stage never flashes at full size, then follow the
  // card as the grid reflows between breakpoints.
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const fit = () => setScale(host.clientWidth / PREVIEW_WIDTH)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="template-render"
      ref={hostRef}
      style={{
        '--template-bg': theme.tokens.background,
        background: theme.tokens.background,
      }}
      aria-hidden="true"
    >
      <div
        className="template-render__stage"
        style={{
          width: `${PREVIEW_WIDTH}px`,
          transform: `scale(${scale || 1})`,
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <EditorCanvas
          document={{ ...draft, activePageId: activePage?.id }}
          activePage={activePage}
          device={PREVIEW_DEVICE}
          isPreview
        />
      </div>
    </div>
  )
}

export default TemplateRenderPreview
