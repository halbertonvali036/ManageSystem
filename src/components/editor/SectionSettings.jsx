import { Copy, Trash2 } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import BackgroundImageSettings from '@/components/editor/BackgroundImageSettings'
import {
  ColorField,
  DeviceOverrideBar,
  VisibilityToggle,
} from '@/components/editor/EditorSettingsControls'
import {
  SECTION_STYLE_BOUNDS,
  TEXT_ALIGNMENTS,
  WIDTH_BOUNDS,
} from '@/models/siteEditor'
import { SECTION_LAYOUTS } from '@/models/siteSection'

export default function SectionSettings({
  section,
  sectionEdit,
  device,
  onUpdateSection,
  onDuplicateSection,
  onDeleteSection,
  onResetDeviceOverrides,
  onOpenMedia,
  field,
  select,
  rangeField,
}) {
  const { t } = useTranslation()

  return (
    <>
      <EditorPanelGroup title={t('editor.section.settingsTitle')} defaultOpen>

        <DeviceOverrideBar
          device={device}
          node={section}
          onReset={() => onResetDeviceOverrides('section', section.id)}
        />

        <VisibilityToggle
          device={device}
          isVisible={sectionEdit.isVisible}
          onChange={sectionEdit.setVisible}
        />

        {field(
          t('editor.settings.align'),
          select(
            'editor-section-align',
            sectionEdit.effective.align,
            (value) => sectionEdit.set('align', value),
            TEXT_ALIGNMENTS,
            (option) => t(option.labelKey),
          ),
        )}

        {/*
         * Layout is how the blocks inside the band are arranged, not what they
         * look like, so it sits with the structural settings rather than the
         * paint ones. It is offered for every section: a user who wants a grid
         * of their own blocks can choose one here.
        */}
        {field(
          t('editor.layout.label'),
          select(
            'editor-section-layout',
            section.layout,
            (value) => onUpdateSection(section.id, { layout: value }),
            SECTION_LAYOUTS.map((value) => ({ value })),
            (option) => t(`editor.layout.${option.value}`),
          ),
        )}

        <ColorField
          id="editor-section-background"
          value={sectionEdit.effective.background}
          onChange={(value) => onUpdateSection(section.id, { style: { background: value } })}
          labelKey="editor.settings.background"
        />

        {rangeField(
          'editor-section-padding',
          'editor.settings.padding',
          sectionEdit.effective.padding,
          (value) => sectionEdit.set('padding', value),
          SECTION_STYLE_BOUNDS.padding,
        )}

        {rangeField(
          'editor-section-width',
          'editor.settings.width',
          sectionEdit.effective.width,
          (value) => sectionEdit.set('width', value),
          WIDTH_BOUNDS.width,
        )}

        {rangeField(
          'editor-section-max-width',
          'editor.section.maxWidth',
          sectionEdit.effective.maxWidth,
          (value) => sectionEdit.set('maxWidth', value),
          SECTION_STYLE_BOUNDS.maxWidth,
        )}

        {rangeField(
          'editor-section-radius',
          'editor.settings.radius',
          sectionEdit.effective.radius,
          (value) => onUpdateSection(section.id, { style: { radius: value } }),
          SECTION_STYLE_BOUNDS.radius,
        )}

        <div className="editor-row-actions editor-row-actions--end">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => onDuplicateSection(section.id)}
          >
            <Copy size={14} aria-hidden="true" />
            {t('editor.settings.duplicateAction')}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => onDeleteSection(section.id)}
          >
            <Trash2 size={14} aria-hidden="true" />
            {t('editor.settings.deleteAction')}
          </button>
        </div>
      </EditorPanelGroup>

      <EditorPanelGroup title={t('editor.background.title')}>
        <BackgroundImageSettings
          section={section}
          onUpdate={(patch) => onUpdateSection(section.id, patch)}
          onOpenMedia={onOpenMedia}
        />
      </EditorPanelGroup>
    </>
  )
}
