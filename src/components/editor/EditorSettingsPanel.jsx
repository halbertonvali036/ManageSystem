import MotionSettings from '@/components/editor/MotionSettings'
import SiteDesignPanel from '@/components/editor/SiteDesignPanel'
import BlockContentSettings from '@/components/editor/BlockContentSettings'
import BlockStyleSettings from '@/components/editor/BlockStyleSettings'
import SectionSettings from '@/components/editor/SectionSettings'
import { Copy, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { Field } from '@/components/editor/EditorSettingsControls'
import {
  BLOCK_TYPE_LABELS,
  getResolvedEditorStyle,
  isResponsiveDevice,
  isVisibleAtDevice,
} from '@/models/siteEditor'
import { SECTION_TYPE_LABELS } from '@/models/siteSection'

/**
 * Right panel: settings for the current selection.
 *
 * Only the controls that mean something for the selected thing are rendered, so
 * the panel stays short and never offers a setting that is ignored. An empty
 * colour means "inherit from the theme", which is why the swatches include a
 * reset option instead of forcing a colour.
 */
function EditorSettingsPanel({
  block,
  section,
  document,
  device,
  onUpdateBlock,
  onUpdateSection,
  onUpdateSiteMotion,
  onUpdateSiteDesign,
  onResetLocalStyles,
  onUpdateSiteTheme,
  onDuplicateBlock,
  onDeleteBlock,
  onDuplicateSection,
  onDeleteSection,
  onResetDeviceOverrides,
  onApplyTypography,
  onOpenMedia,
  onClearSelection,
  isMobileOpen,
  onCloseMobile,
}) {
  const { t } = useTranslation()

  /*
   * Every control below reads and writes the value for the device in view.
   *
   * On desktop that is the base style, so the change is the real value. On a
   * narrower device the same control writes an override, which is why the user
   * never has to choose between "change it" and "change it here only" — the
   * device switcher already said which one they meant.
   */
  const responsiveEdit = (node, update) => {
    const set = (property, value) => {
      if (isResponsiveDevice(device)) {
        update({ overrides: { [device]: { [property]: value } } })
      } else {
        update({ style: { [property]: value } })
      }
    }
    const setVisible = (isVisible) => {
      if (isResponsiveDevice(device)) {
        update({ overrides: { [device]: { isVisible } } })
      } else {
        update({ isVisible })
      }
    }
  /*
   * Visibility is read from `isVisibleAtDevice`, not from the effective style.
   *
   * The base flag lives on the block/section itself and the per-device flag lives
   * in the override, so only the helper that consults both can answer "is this
   * shown here?". Reading the effective style would see the override alone and
   * report a block that is hidden on every device as visible.
   */
  return { set, setVisible, effective: getResolvedEditorStyle(document, node, device, node === section ? 'section' : 'block'), isVisible: isVisibleAtDevice(node, device) }
}

  const blockEdit = block
    ? responsiveEdit(block, (patch) => onUpdateBlock(block.id, patch))
    : null
  const sectionEdit = section
    ? responsiveEdit(section, (patch) => onUpdateSection(section.id, patch))
    : null

  const field = (label, control, hintKey) => (
    <Field label={label} hint={hintKey ? t(hintKey) : null}>
      {control}
    </Field>
  )

  const select = (id, value, onChange, options, renderOption) => (
    <select
      id={id}
      className="editor-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {!options.some((option) => String(option.value) === String(value)) && <option value={value}>{value}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {renderOption(option)}
        </option>
      ))}
    </select>
  )

  /** A labelled range with a live value, used for every numeric style. */
  const rangeField = (id, labelKey, value, onChange, bounds) =>
    field(
      t(labelKey),
      <div className="editor-number">
        <label className="editor-visually-hidden" htmlFor={id}>
          {t(labelKey)}
        </label>
        <input
          id={id}
          type="range"
          className="editor-range"
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output className="editor-number__value" htmlFor={id}>
          {value}
        </output>
      </div>,
    )

  /* ---------------------------------------------------------------- *
   * Section settings
   * ---------------------------------------------------------------- */

  const sectionSettings = section ? (
    <SectionSettings
      section={section}
      sectionEdit={sectionEdit}
      device={device}
      onUpdateSection={onUpdateSection}
      onDuplicateSection={onDuplicateSection}
      onDeleteSection={onDeleteSection}
      onResetDeviceOverrides={onResetDeviceOverrides}
      onOpenMedia={onOpenMedia}
      field={field}
      select={select}
      rangeField={rangeField}
    />
  ) : null

  /* ---------------------------------------------------------------- *
   * Block settings
   * ---------------------------------------------------------------- */

  const blockSettings = block ? (
    <>
      <BlockContentSettings
        block={block}
        onUpdateBlock={onUpdateBlock}
        onOpenMedia={onOpenMedia}
        field={field}
      />
      <BlockStyleSettings
        block={block}
        blockEdit={blockEdit}
        device={device}
        onUpdateBlock={onUpdateBlock}
        onResetDeviceOverrides={onResetDeviceOverrides}
        onApplyTypography={onApplyTypography}
        field={field}
        select={select}
        rangeField={rangeField}
      />
    </>
  ) : null

  /* ---------------------------------------------------------------- */

  const selectionName = block
    ? t(BLOCK_TYPE_LABELS[block.type])
    : section
      ? t(SECTION_TYPE_LABELS[section.type] ?? 'editor.section.custom')
      : null

  return (
    <aside
      id="editor-right-panel"
      className={`editor-panel editor-panel--right${isMobileOpen ? ' is-open' : ''}`}
      aria-label={t('editor.settings.panelLabel')}
    >
      <section className="editor-panel__section">
        <h2 className="editor-panel__title">{t('editor.settings.title')}</h2>

        {selectionName ? (
          <>
            <p className="editor-settings__type">{selectionName}</p>
            <p className="editor-settings__kind">
              {t(
                block
                  ? 'editor.settings.kindBlock'
                  : 'editor.settings.kindSection',
              )}
            </p>
            {block ? (
              <div className="editor-row-actions editor-row-actions--end">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => onDuplicateBlock(block.id)}
                >
                  <Copy size={14} aria-hidden="true" />
                  {t('editor.settings.duplicateAction')}
                </button>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => onDeleteBlock(block.id)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  {t('editor.settings.deleteAction')}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="editor-panel__empty">{t('editor.settings.noSelection')}</p>
        )}
      </section>

      {sectionSettings}
      {blockSettings}
      <SiteDesignPanel document={document} onChange={onUpdateSiteDesign} onPreset={onUpdateSiteTheme} />
      {(block || section) && <section className="editor-panel__section">
        <p className="editor-panel__hint">{t('siteDesign.inheritance')}</p>
        <button type="button" className="btn btn--outline btn--sm" aria-describedby="local-style-reset-hint" onClick={() => onResetLocalStyles(block ? 'block' : 'section', (block || section).id)}>{t('siteDesign.resetLocal')}</button>
        <p id="local-style-reset-hint" className="editor-panel__hint">{t('siteDesign.resetHint')}</p>
        <button type="button" className="btn btn--outline btn--sm" onClick={onClearSelection}>{t('editor.settings.clearSelection')}</button>
      </section>}
      <MotionSettings node={block || section} siteMotion={document.motion} onSiteChange={onUpdateSiteMotion}
        onChange={(patch) => block ? onUpdateBlock(block.id, patch) : onUpdateSection(section.id, patch)} />

      <button
        type="button"
        className="editor-panel__close"
        onClick={onCloseMobile}
        aria-label={t('editor.settings.close')}
      >
        {t('common.close')}
      </button>
    </aside>
  )
}

export default EditorSettingsPanel
