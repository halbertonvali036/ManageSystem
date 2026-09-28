import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { CanvasDragHandle } from '@/components/editor/CanvasDrag'
import { getMotionProps } from '@/models/siteMotion'
import { EyeOff } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  BLOCK_TYPE_LABELS,
  EDITOR_DEVICE,
  getSectionCssStyle,
  getSectionOverlayCssStyle,
  isVisibleAtDevice,
  isResponsiveDevice,
} from '@/models/siteEditor'
import { SECTION_TYPE_LABELS } from '@/models/siteSection'
import BlockRenderer from '@/components/editor/BlockRenderer'

/**
 * One selectable block inside a section.
 *
 * In the editor the wrapper is a real button so it is reachable by keyboard and
 * reports its selected state. In preview mode it degrades to a plain container,
 * so the composed page reads as a page rather than a control surface.
 */
function CanvasBlock({ siteMotion, index, sectionId, block, isSelected, isPreview, device, onSelect }) {
  const { t } = useTranslation()
  const dragItem = { kind: 'block', id: block.id, sectionId, index }
  const dropProps = useCanvasDrop(dragItem, !isPreview)

  const handleSelect = (event) => {
    if (isPreview) {
      return
    }
    // Cancel any default action from the rendered content, so selecting a block
    // that contains a link can never navigate away from an unsaved draft.
    event.preventDefault()
    // A block click must not also select the section it lives in.
    event.stopPropagation()
    onSelect(block.id)
  }

  const handleKeyDown = (event) => {
    if (isPreview) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(block.id)
    }
  }

  const isInteractive = !isPreview
  const label = t(BLOCK_TYPE_LABELS[block.type])

  /*
   * A block hidden on the device being previewed still has to appear in the editor.
   *
   * Rendering nothing would remove the block from the canvas, so the user would
   * have to switch back to desktop to find the thing they had just hidden. The
   * editor shows a dimmed stand-in instead: the block's slot is still there, its
   * position in the section is still visible, and it stays selectable. Preview
   * mode is the only place it is genuinely absent, because that is where the
   * visitor would not see it.
   */
  if (isPreview && !isVisibleAtDevice(block, device)) {
    return null
  }

  const isHiddenOnDevice = isResponsiveDevice(device) && !isVisibleAtDevice(block, device)

  return (
    <>
    {!isPreview && <CanvasDragHandle item={dragItem} />}
    <div
      className={`editor-canvas__block${isSelected ? ' is-selected' : ''}${
        isHiddenOnDevice ? ' is-device-hidden' : ''
      }`}
      {...getMotionProps(block.animation, siteMotion, device, isPreview)}
      {...dropProps}
      data-block-id={block.id}
      data-selected={isSelected ? 'true' : undefined}
      data-hidden-on-device={isHiddenOnDevice ? 'true' : undefined}
      onClick={isInteractive ? handleSelect : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isSelected : undefined}
      /* The type is the useful name here: the block's own text is read from the
         settings panel, and a badge alone would be silent. */
      aria-label={isInteractive ? label : undefined}
    >
      {isSelected ? (
        <span className="editor-canvas__badge" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {isHiddenOnDevice ? (
        <span className="editor-canvas__device-hidden-badge">
          <EyeOff size={12} aria-hidden="true" />
          {t('editor.block.hiddenOnDevice', { device: t(`editor.device.${device}`) })}
        </span>
      ) : null}
      {isHiddenOnDevice ? null : <BlockRenderer block={block} isPreview={isPreview} device={device} />}
    </div>
    </>
  )
}

/**
 * The marker shown in the gap above a block.
 *
 * Insertion has a control of its own, alongside optional native drag reordering.
 * Rendering it as a real button means the position is reachable by keyboard and
 * announced, and the neon line is the visible feedback for it. The button is
 * only added to the tab order for the section currently being worked on, which
 * keeps a long page from turning into a wall of identical controls.
 */
function InsertMarker({ sectionId, index, isFocusable, label, onInsert }) {
  return (
    <div className="editor-canvas__insert-slot">
      <button
        type="button"
        className="editor-canvas__insert"
        tabIndex={isFocusable ? 0 : -1}
        onClick={(event) => {
          // The marker sits inside the section, so its click is a block action.
          event.stopPropagation()
          onInsert(sectionId, index)
        }}
        aria-label={label}
      >
        <span className="editor-canvas__insert-line" aria-hidden="true" />
        <span className="editor-canvas__insert-plus" aria-hidden="true">
          +
        </span>
      </button>
    </div>
  )
}

/**
 * A single section: a styled band with the section's blocks inside.
 *
 * The section's own background spans the full width while its content stays
 * inside `maxWidth`, which is why the style object carries both. That is what a
 * full-bleed band with an inner container does, without two extra elements here.
 *
 * A hidden section is not rendered at all in preview, but in the editor it stays
 * visible and dimmed: hiding a section is a choice the user made, and it must
 * stay easy to find and switch back.
 */
function SectionRenderer({
  section,
  index,
  siteMotion,
  isSectionSelected,
  isFocused,
  selectedBlockId,
  isPreview,
  device,
  onSelectSection,
  onSelectBlock,
  onInsertBlockAt,
}) {
  const { t } = useTranslation()

  const dragItem = { kind: 'section', id: section.id, index }
  const dropProps = useCanvasDrop(dragItem, !isPreview)
  const { section: sectionCss, inner } = getSectionCssStyle(section, device)
  const overlayCss = getSectionOverlayCssStyle(section.backgroundImage)
  const label = t(SECTION_TYPE_LABELS[section.type] ?? 'editor.section.custom')

  /*
   * "Hidden" is decided per device, not once.
   *
   * A section hidden only on mobile is still the page as far as desktop is
   * concerned, so the band stays in the desktop canvas and the mobile canvas
   * simply has a gap. Collapsing the whole section in the editor instead would
   * hide it from the device frame the user is not even looking at.
   */
  const isHiddenHere = !isVisibleAtDevice(section, device)
  const isHiddenOnlyHere =
    isResponsiveDevice(device) && isHiddenHere && isVisibleAtDevice(section, EDITOR_DEVICE.DESKTOP)

  if (isPreview && isHiddenHere) {
    return null
  }

  if (!isPreview && section.isVisible === false) {
    return (
      <div
        className="editor-canvas__section is-hidden"
        data-section-id={section.id}
        data-hidden="true"
      >
        <span className="editor-canvas__hidden-badge">
          <EyeOff size={12} aria-hidden="true" />
          {t('editor.section.hidden')}
        </span>
      </div>
    )
  }

  const handleSectionClick = (event) => {
    if (isPreview) {
      return
    }
    /*
     * Anything that reaches this handler is a click on the band's own chrome or
     * on the padding around the blocks, because a block click calls
     * `stopPropagation`. Selecting the section is the right response here, so
     * this deliberately does not guard on `event.target`: doing so would make a
     * click on a section's empty area do nothing at all.
     */
    event.preventDefault()
    onSelectSection(section.id)
  }

  const handleKeyDown = (event) => {
    if (isPreview) {
      return
    }
    if (event.target !== event.currentTarget) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectSection(section.id)
    }
  }

  return (
    <div
      className={`editor-canvas__section${isSectionSelected ? ' is-selected' : ''}${
        isHiddenOnlyHere ? ' is-device-hidden' : ''
      }`}
      data-section-id={section.id}
      data-selected={isSectionSelected ? 'true' : undefined}
      {...getMotionProps(section.animation, siteMotion, device, isPreview)}
      {...dropProps}
      data-focused={isFocused ? 'true' : undefined}
      data-hidden-on-device={isHiddenOnlyHere ? 'true' : undefined}
    >
      {!isPreview && <CanvasDragHandle item={dragItem} />}
      <div
        className="editor-canvas__section-band"
        style={sectionCss}
        onClick={isPreview ? undefined : handleSectionClick}
        onKeyDown={isPreview ? undefined : handleKeyDown}
        role={isPreview ? undefined : 'button'}
        /*
         * Reachable by Tab. The band carries a button role, an `aria-pressed`
         * state and an Enter/Space handler, so taking it out of the tab order
         * with -1 would leave all three unreachable and strand a keyboard user
         * on the canvas. The outline in the sidebar selects a section too, but
         * that is a shortcut, not a replacement for the control being operable.
         */
        tabIndex={isPreview ? undefined : 0}
        aria-pressed={isPreview ? undefined : isSectionSelected}
        aria-label={isPreview ? undefined : label}
      >
        {isSectionSelected ? (
          <span className="editor-canvas__section-badge" aria-hidden="true">
            {label}
          </span>
        ) : null}

        {isHiddenOnlyHere ? (
          <span className="editor-canvas__hidden-badge">
            <EyeOff size={12} aria-hidden="true" />
            {t('editor.section.hiddenOnDevice', { device: t(`editor.device.${device}`) })}
          </span>
        ) : null}

        {/*
         * The tint sits in its own layer above the background so it can dim the
         * photo without altering it, and is inert markup: it is decoration over
         * a decorative image, and the band above already carries the label.
         */}
        {overlayCss ? <span className="editor-canvas__section-overlay" style={overlayCss} aria-hidden="true" /> : null}

        <div className="editor-canvas__section-inner" style={inner}>
          {isPreview ? null : (
            <InsertMarker
              sectionId={section.id}
              index={0}
              isFocusable={isFocused}
              label={t('editor.section.insertBlockAt', { position: 1 })}
              onInsert={onInsertBlockAt}
            />
          )}

          {section.blocks.map((block, index) => (
            <div key={block.id} className="editor-canvas__block-slot">
              <CanvasBlock
                block={block}
                siteMotion={siteMotion}
                sectionId={section.id}
                index={index}
                isSelected={!isPreview && block.id === selectedBlockId}
                isPreview={isPreview}
                device={device}
                onSelect={onSelectBlock}
              />
              {isPreview ? null : (
                <InsertMarker
                  sectionId={section.id}
                  index={index + 1}
                  isFocusable={isFocused}
                  label={t('editor.section.insertBlockAt', { position: index + 2 })}
                  onInsert={onInsertBlockAt}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionRenderer
