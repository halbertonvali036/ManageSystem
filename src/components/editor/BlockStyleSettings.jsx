import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { ColorField, DeviceOverrideBar, VisibilityToggle } from '@/components/editor/EditorSettingsControls'
import {
  BLOCK_TYPE,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHTS,
  STYLE_BOUNDS,
  TEXT_ALIGNMENTS,
  WIDTH_BOUNDS,
} from '@/models/siteEditor'
import { SITE_FONT_STACK_IDS } from '@/models/siteTheme'
import { INLINE_EDITABLE_BLOCK_TYPES } from '@/models/siteText'

const FONT_FAMILY_OPTIONS = [
  { value: '', labelKey: 'editor.settings.fontDefault' },
  ...SITE_FONT_STACK_IDS.map((id) => ({ value: id, labelKey: `siteDesign.fonts.${id}` })),
]

const APPLY_TARGETS = [
  [BLOCK_TYPE.HEADING, 'editor.settings.applyToHeadings'],
  [BLOCK_TYPE.TEXT, 'editor.settings.applyToParagraphs'],
  [BLOCK_TYPE.BUTTON, 'editor.settings.applyToButtons'],
]

export default function BlockStyleSettings({
  block,
  blockEdit,
  device,
  onUpdateBlock,
  onResetDeviceOverrides,
  onApplyTypography,
  field,
  select,
  rangeField,
}) {
  const { t } = useTranslation()
  const [applyScope, setApplyScope] = useState('page')
  const canTypography = INLINE_EDITABLE_BLOCK_TYPES.includes(block.type)

  return (
    <EditorPanelGroup title={t('editor.settings.style')}>

      <DeviceOverrideBar
        device={device}
        node={block}
        onReset={() => onResetDeviceOverrides('block', block.id)}
      />

      <VisibilityToggle
        device={device}
        isVisible={blockEdit.isVisible}
        onChange={blockEdit.setVisible}
      />

      {field(
        t('editor.settings.align'),
        select(
          'editor-style-align',
          blockEdit.effective.align,
          (value) => blockEdit.set('align', value),
          TEXT_ALIGNMENTS,
          (option) => t(option.labelKey),
        ),
      )}

      {block.type !== BLOCK_TYPE.SPACER && block.type !== BLOCK_TYPE.IMAGE ? (
        field(
          t('editor.settings.fontSize'),
          select(
            'editor-style-font-size',
            String(blockEdit.effective.fontSize),
            (value) => blockEdit.set('fontSize', Number(value)),
            FONT_SIZE_OPTIONS.map((size) => ({ value: String(size), size })),
            (option) => `${option.size}px`,
          ),
        )
      ) : null}

      {block.type !== BLOCK_TYPE.SPACER && block.type !== BLOCK_TYPE.IMAGE ? (
        field(
          t('editor.settings.fontWeight'),
          select(
            'editor-style-font-weight',
            String(blockEdit.effective.fontWeight),
            (value) => onUpdateBlock(block.id, { style: { fontWeight: Number(value) } }),
            FONT_WEIGHTS,
            (option) => t(option.labelKey),
          ),
        )
      ) : null}

      {canTypography ? (
        field(
          t('editor.settings.fontFamily'),
          select(
            'editor-style-font-family',
            blockEdit.effective.fontFamily ?? '',
            (value) => onUpdateBlock(block.id, { style: { fontFamily: value || null } }),
            FONT_FAMILY_OPTIONS,
            (option) => t(option.labelKey),
          ),
        )
      ) : null}

      {block.type !== BLOCK_TYPE.SPACER && block.type !== BLOCK_TYPE.IMAGE ? (
        <ColorField
          id="editor-style-text-color"
          value={blockEdit.effective.textColor}
          onChange={(value) => onUpdateBlock(block.id, { style: { textColor: value } })}
          labelKey="editor.settings.textColor"
        />
      ) : null}

      {block.type !== BLOCK_TYPE.SPACER ? (
        <ColorField
          id="editor-style-background"
          value={blockEdit.effective.background}
          onChange={(value) => onUpdateBlock(block.id, { style: { background: value } })}
          labelKey="editor.settings.background"
        />
      ) : null}

      {block.type === BLOCK_TYPE.IMAGE || block.type === BLOCK_TYPE.SPACER ? (
        rangeField(
          'editor-style-height',
          'editor.settings.height',
          blockEdit.effective.height,
          (value) => onUpdateBlock(block.id, { style: { height: value } }),
          STYLE_BOUNDS.height,
        )
      ) : null}

      {rangeField(
        'editor-style-width',
        'editor.settings.width',
        blockEdit.effective.width,
        (value) => blockEdit.set('width', value),
        WIDTH_BOUNDS.width,
      )}

      {block.type === BLOCK_TYPE.IMAGE ? (
        rangeField(
          'editor-style-max-width',
          'editor.settings.maxWidth',
          blockEdit.effective.maxWidth,
          (value) => blockEdit.set('maxWidth', value),
          WIDTH_BOUNDS.maxWidth,
        )
      ) : null}

      {block.type !== BLOCK_TYPE.SPACER ? (
        rangeField(
          'editor-style-padding',
          'editor.settings.padding',
          blockEdit.effective.padding,
          (value) => blockEdit.set('padding', value),
          STYLE_BOUNDS.padding,
        )
      ) : null}

      {block.type !== BLOCK_TYPE.SPACER ? (
        rangeField(
          'editor-style-radius',
          'editor.settings.radius',
          blockEdit.effective.radius,
          (value) => onUpdateBlock(block.id, { style: { radius: value } }),
          STYLE_BOUNDS.radius,
        )
      ) : null}

      {canTypography ? (
        <fieldset className="editor-apply-typography">
          <legend>{t('editor.settings.applyTypography')}</legend>
          <p className="editor-field__hint">
            {t('editor.settings.applyTypographyHint')}
          </p>
          {field(
            t('editor.settings.applyScope'),
            <select
              id="editor-apply-typography-scope"
              className="editor-select"
              value={applyScope}
              onChange={(event) => setApplyScope(event.target.value)}
            >
              <option value="page">{t('editor.settings.applyScopePage')}</option>
              <option value="all">{t('editor.settings.applyScopeAll')}</option>
            </select>,
          )}
          <div className="editor-row-actions editor-apply-typography__actions">
            {APPLY_TARGETS.map(([type, labelKey]) => (
              <button
                key={type}
                type="button"
                className="btn btn--outline btn--sm"
                disabled={block.type !== type}
                onClick={() => onApplyTypography?.(type, applyScope)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
    </EditorPanelGroup>
  )
}
