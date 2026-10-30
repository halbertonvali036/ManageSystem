import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { BLOCK_TYPE, BLOCK_TYPE_LABELS } from '@/models/siteEditor'
import { SECTION_TYPE_LABELS } from '@/models/siteSection'
import { getPageTextGroups } from '@/models/siteText'

const scrollToBlock = (blockId) => {
  const element = Array.from(
    window.document.querySelectorAll('[data-block-id]'),
  ).find((node) => node.dataset.blockId === blockId)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/**
 * A plain list of every heading, paragraph and button label on the page.
 *
 * The list follows the document's own order, grouped by the section that owns
 * each block, so it doubles as a readable copy deck. Focusing a row selects the
 * matching block and brings it into view; typing edits the same content the
 * canvas edits, through the same update path.
 */
export default function EditorPageTextsPanel({ page, onSelectBlock, onUpdateBlock }) {
  const { t } = useTranslation()
  const groups = getPageTextGroups(page)

  const handleFocus = (blockId) => {
    onSelectBlock(blockId)
    scrollToBlock(blockId)
  }

  return (
    <EditorPanelGroup title={t('editor.texts.title')}>
      <p className="editor-panel__hint">{t('editor.texts.hint')}</p>

      {groups.length ? (
        groups.map((group) => (
          <section className="editor-texts__group" key={group.sectionId}>
            <h3 className="editor-texts__group-title">
              {t('editor.texts.group', {
                position: group.sectionIndex + 1,
                name: t(SECTION_TYPE_LABELS[group.sectionType] ?? 'editor.section.custom'),
              })}
            </h3>
            <ul className="editor-texts__list">
              {group.items.map((item) => {
                const inputId = `editor-page-text-${item.id}`
                return (
                  <li className="editor-texts__item" key={item.id}>
                    <label className="editor-texts__label" htmlFor={inputId}>
                      {t(BLOCK_TYPE_LABELS[item.blockType])}
                    </label>
                    <textarea
                      id={inputId}
                      className="editor-textarea editor-texts__input"
                      rows={item.blockType === BLOCK_TYPE.TEXT ? 3 : 1}
                      value={item.value}
                      onFocus={() => handleFocus(item.blockId)}
                      onChange={(event) =>
                        onUpdateBlock(item.blockId, {
                          content: { [item.field]: event.target.value },
                        })
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      ) : (
        <p className="editor-panel__empty">{t('editor.texts.empty')}</p>
      )}
    </EditorPanelGroup>
  )
}
