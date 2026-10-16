import useTranslation from '@/hooks/useTranslation'
import { getSiteSection, SECTION_TYPE, SECTION_TYPE_LABELS } from '@/models/siteSection'
import { getSiteTheme } from '@/models/siteTheme'

/** Layouts that read as a row of cards rather than a column of text. */
const CARD_LAYOUTS = ['grid', 'bento', 'row']

/**
 * Sections that open a page.
 *
 * The preview draws these as a taller band with a button, so a template that
 * leads with a hero reads as one and a template that leads with a card grid does
 * not. The list is explicit rather than derived from height, because a statement
 * band is tall in the page and should not be drawn as if it were a hero.
 */
const HERO_SECTIONS = [
  SECTION_TYPE.AI_HERO,
  SECTION_TYPE.HERO,
  SECTION_TYPE.EDITORIAL_HERO,
  SECTION_TYPE.HERO_SPLIT,
  SECTION_TYPE.HERO_IMAGE,
  SECTION_TYPE.HERO_TYPE,
]

/**
 * A structural preview of one template page.
 *
 * It is drawn from the template's real page and section skeleton using the
 * template's own theme tokens, so it can never drift from what the template
 * creates: there is no screenshot to go stale. Two variants share the same
 * markup — `card` is the compact, fixed-ratio thumbnail on a gallery card, and
 * `page` is the larger labelled view inside the preview dialog.
 *
 * The `card` variant is `aria-hidden` because the card's name, category and
 * counts already say everything the picture shows. The `page` variant keeps its
 * section labels readable so the preview is not decoration-only.
 */
function TemplateStructurePreview({ template, pageIndex = 0, variant = 'card' }) {
  const { t } = useTranslation()
  const theme = getSiteTheme(template.themePreset)
  const page = template.pages[pageIndex] ?? template.pages[0]
  const showLabels = variant === 'page'

  return (
    <span
      className={`template-structure template-structure--${variant}`}
      style={{
        background: theme.tokens.background,
        color: theme.tokens.text,
        '--template-accent': theme.tokens.primary,
        '--template-bg': theme.tokens.background,
      }}
      data-theme={theme.id}
      aria-hidden={showLabels ? undefined : 'true'}
    >
      <span className="template-structure__browser">
        <i />
        <i />
        <i />
      </span>

      <span className="template-structure__bands">
        {page.sections.length ? (
          page.sections.map((sectionId, index) => {
            const section = getSiteSection(sectionId)
            const isHero = HERO_SECTIONS.includes(sectionId)
            const isCards = CARD_LAYOUTS.includes(section?.layout)

            return (
              <span
                className="template-structure__band"
                data-section={sectionId}
                data-layout={section?.layout}
                data-band={isHero ? 'hero' : isCards ? 'cards' : 'body'}
                key={`${page.id}-${sectionId}-${index}`}
                style={{
                  /* The band is tinted only when the section actually carries a
                     background, so the preview's bands match the real ones. */
                  background:
                    section?.style.background === 'surface'
                      ? theme.tokens.surface
                      : section?.style.background === 'accent-soft'
                        ? theme.tokens.accentSoft
                        : 'transparent',
                  borderRadius: section?.style.radius ? theme.tokens.radiusScale : 0,
                }}
              >
                <span className="template-structure__band-body">
                  <span className="template-structure__skeleton-heading" />
                  {CARD_LAYOUTS.includes(section?.layout) ? (
                    <span className="template-structure__skeleton-cards">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span className="template-structure__skeleton-line" />
                  )}
                  {HERO_SECTIONS.includes(sectionId) ||
                  sectionId === SECTION_TYPE.CTA ||
                  sectionId === SECTION_TYPE.CONTACT_CTA ? (
                    <span className="template-structure__skeleton-button" />
                  ) : null}
                </span>
                {showLabels ? (
                  <span className="template-structure__band-label">
                    {t(SECTION_TYPE_LABELS[sectionId] ?? 'editor.section.custom')}
                  </span>
                ) : null}
              </span>
            )
          })
        ) : (
          <span className="template-structure__band template-structure__band--empty" />
        )}
      </span>
    </span>
  )
}

export default TemplateStructurePreview
