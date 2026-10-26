import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import FormSettings from '@/components/editor/FormSettings'
import ChartSettings from '@/components/editor/ChartSettings'
import ImageSettings from '@/components/editor/ImageSettings'
import PanelSettings from '@/components/editor/PanelSettings'
import StatSettings from '@/components/editor/StatSettings'
import StatusListSettings from '@/components/editor/StatusListSettings'
import TableSettings from '@/components/editor/TableSettings'
import ToolbarSettings from '@/components/editor/ToolbarSettings'
import { BLOCK_TYPE } from '@/models/siteEditor'

export default function BlockContentSettings({ block, onUpdateBlock, onOpenMedia, field }) {
  const { t } = useTranslation()

  return (
    <EditorPanelGroup title={t('editor.settings.content')} defaultOpen>

      {block.type === BLOCK_TYPE.FORM && <FormSettings key={block.id} form={block.content.form} onChange={(form) => onUpdateBlock(block.id, { content: { form } })} />}

      {block.type === BLOCK_TYPE.HEADING || block.type === BLOCK_TYPE.TEXT ? (
        field(
          t('editor.settings.text'),
          <>
            <label className="editor-visually-hidden" htmlFor="editor-content-text">
              {t('editor.settings.text')}
            </label>
            <textarea
              id="editor-content-text"
              className="editor-textarea"
              rows={block.type === BLOCK_TYPE.TEXT ? 5 : 2}
              value={block.content.text}
              onChange={(event) =>
                onUpdateBlock(block.id, { content: { text: event.target.value } })
              }
            />
          </>,
        )
      ) : null}

      {block.type === BLOCK_TYPE.PANEL ? (
        <PanelSettings
          block={block}
          onUpdate={(patch) => onUpdateBlock(block.id, patch)}
          onOpenMedia={() => onOpenMedia({ kind: 'block', id: block.id })}
        />
      ) : null}

      {block.type === BLOCK_TYPE.BUTTON ? (
        <>
          <label className="editor-field">{t('siteDesign.variant')}<select className="editor-input" value={block.content.variant} onChange={(event) => onUpdateBlock(block.id, { content: { variant: event.target.value } })}><option value="primary">{t('siteDesign.primaryButton')}</option><option value="secondary">{t('siteDesign.secondaryButton')}</option></select></label>
          {field(
            t('editor.settings.buttonLabel'),
            <>
              <label className="editor-visually-hidden" htmlFor="editor-content-label">
                {t('editor.settings.buttonLabel')}
              </label>
              <input
                id="editor-content-label"
                className="editor-input"
                value={block.content.label}
                onChange={(event) =>
                  onUpdateBlock(block.id, { content: { label: event.target.value } })
                }
              />
            </>,
          )}
          {field(
            t('editor.settings.buttonLink'),
            <>
              <label className="editor-visually-hidden" htmlFor="editor-content-href">
                {t('editor.settings.buttonLink')}
              </label>
              <input
                id="editor-content-href"
                className="editor-input"
                type="text"
                placeholder="https://"
                value={block.content.href}
                onChange={(event) =>
                  onUpdateBlock(block.id, { content: { href: event.target.value } })
                }
              />
            </>,
            'editor.settings.buttonLinkHint',
          )}
        </>
      ) : null}

      {block.type === BLOCK_TYPE.IMAGE ? (
        <ImageSettings
          block={block}
          onUpdate={(patch) => onUpdateBlock(block.id, patch)}
          onOpenMedia={onOpenMedia}
        />
      ) : null}

      {block.type === BLOCK_TYPE.STAT ? (
        <StatSettings block={block} onUpdate={(patch) => onUpdateBlock(block.id, patch)} />
      ) : null}

      {block.type === BLOCK_TYPE.CHART ? (
        <ChartSettings block={block} onUpdate={(patch) => onUpdateBlock(block.id, patch)} />
      ) : null}

      {block.type === BLOCK_TYPE.TABLE ? (
        <TableSettings block={block} onUpdate={(patch) => onUpdateBlock(block.id, patch)} />
      ) : null}

      {block.type === BLOCK_TYPE.STATUS_LIST ? (
        <StatusListSettings block={block} onUpdate={(patch) => onUpdateBlock(block.id, patch)} />
      ) : null}

      {block.type === BLOCK_TYPE.TOOLBAR ? (
        <ToolbarSettings block={block} onUpdate={(patch) => onUpdateBlock(block.id, patch)} />
      ) : null}
    </EditorPanelGroup>
  )
}
