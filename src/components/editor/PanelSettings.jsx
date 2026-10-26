import useTranslation from '@/hooks/useTranslation'
import ImageSettings from '@/components/editor/ImageSettings'

/**
 * Card settings.
 *
 * The text fields are the card's own. The image controls reuse the image
 * settings with the link field hidden, because on a card the link belongs to the
 * action button rather than to the picture. `imageSlot` keeps the media area
 * reserved, so a portfolio or property card still reads as a card before a
 * picture is chosen.
 */
export default function PanelSettings({ block, onUpdate, onOpenMedia }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const textField = (id, labelKey, name, rows) => (
    <div className="editor-field">
      <label className="editor-field__label" htmlFor={id}>
        {t(labelKey)}
      </label>
      {rows ? (
        <textarea
          id={id}
          className="editor-textarea"
          rows={rows}
          value={content[name]}
          onChange={(event) => setField({ [name]: event.target.value })}
        />
      ) : (
        <input
          id={id}
          className="editor-input"
          value={content[name]}
          onChange={(event) => setField({ [name]: event.target.value })}
        />
      )}
    </div>
  )

  return (
    <>
      {textField('editor-panel-eyebrow', 'editor.panel.eyebrow', 'eyebrow')}
      {textField('editor-panel-title', 'editor.panel.title', 'title')}
      {textField('editor-panel-body', 'editor.panel.body', 'body', 4)}
      {textField('editor-panel-action', 'editor.panel.action', 'action')}
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-panel-href">
          {t('editor.panel.link')}
        </label>
        <input
          id="editor-panel-href"
          className="editor-input"
          type="text"
          placeholder="https://"
          value={content.href}
          onChange={(event) => setField({ href: event.target.value })}
        />
        <p className="editor-field__hint">{t('editor.panel.linkHint')}</p>
      </div>
      <ImageSettings block={block} onUpdate={onUpdate} onOpenMedia={onOpenMedia} showLink={false} />
      <label className="editor-field editor-field--inline">
        <input
          type="checkbox"
          checked={content.imageSlot === true}
          onChange={(event) => setField({ imageSlot: event.target.checked })}
        />
        {t('editor.panel.image')}
      </label>
    </>
  )
}
