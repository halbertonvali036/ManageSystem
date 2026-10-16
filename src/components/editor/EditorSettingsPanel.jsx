import MotionSettings from '@/components/editor/MotionSettings'
import SiteDesignPanel from '@/components/editor/SiteDesignPanel'
import FormSettings from '@/components/editor/FormSettings'
import { Copy, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import {
  BLOCK_TYPE,
  BLOCK_TYPE_LABELS,
  CHART_VARIANTS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHTS,
  getResolvedEditorStyle,
  isResponsiveDevice,
  isVisibleAtDevice,
  isValidEditorColor,
  listOverriddenDevices,
  MAX_STATUS_ITEMS,
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS,
  MAX_TOOLBAR_FILTERS,
  SECTION_STYLE_BOUNDS,
  STAT_TRENDS,
  STATUS_TONES,
  STYLE_BOUNDS,
  TEXT_ALIGNMENTS,
  WIDTH_BOUNDS,
} from '@/models/siteEditor'
import {
  BACKGROUND_POSITION_OPTIONS,
  IMAGE_FIT_OPTIONS,
  OVERLAY_BOUNDS,
  getMediaPreviewUrl,
} from '@/models/siteMedia'
import { SECTION_TYPE_LABELS, SECTION_LAYOUTS } from '@/models/siteSection'

/**
 * A colour the canvas accepts. `HEX_COLOR` narrows it to the subset a native
 * colour swatch can actually display.
 */
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/** `#abc` and `#abcd` have no alpha the swatch can show, so expand them. */
const expandHex = (hex) => {
  const body = hex.trim().replace(/^#/, '')
  if (!HEX_COLOR.test(hex)) {
    return ''
  }
  const full = body.length <= 4 ? [...body].map((digit) => digit + digit).join('') : body
  return `#${full.slice(0, 6)}`
}


/**
 * Image settings for an image block.
 *
 * The source row shows what is actually going to render, including whether it is
 * an unsaved local preview. That marker is the point: a file chosen from this
 * device looks identical to a real image on the canvas, so the one honest signal
 * that it will disappear when the tab closes is written next to it.
 */
function ImageSettings({ block, onUpdate, onOpenMedia, showLink = true }) {
  const { t } = useTranslation()
  const { alt, src, media, href } = block.content
  const previewUrl = getMediaPreviewUrl(media)
  const displayUrl = previewUrl ?? src
  const isLocalPreview = media?.isLocalPreview === true

  const setField = (patch) => onUpdate({ content: { ...patch } })

  return (
    <>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.image.source')}</span>
        {displayUrl ? (
          <div className="editor-image-source">
            <span className="editor-image-source__thumb">
              <img
                src={displayUrl}
                alt=""
                aria-hidden="true"
                /* The thumbnail is decorative here: the address and the alt field
                   below are what the user needs to read. */
              />
            </span>
            <span className="editor-image-source__copy">
              <span className="editor-image-source__name">
                {media?.fileName ?? t('editor.image.fromUrl')}
              </span>
              {isLocalPreview ? (
                <span className="editor-media-badge">
                  {t('editor.image.localPreviewBadge')}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onOpenMedia()}
            >
              {t('editor.image.choose')}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setField({ media: null, src: '' })}
            >
              {t('editor.image.remove')}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
            <ImageIcon size={16} aria-hidden="true" />
            {t('editor.image.choose')}
          </button>
        )}
        {isLocalPreview ? (
          <p className="editor-field__hint">{t('editor.image.localPreviewHint')}</p>
        ) : null}
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-content-alt">
          {t('editor.image.alt')}
        </label>
        <input
          id="editor-content-alt"
          className="editor-input"
          value={alt}
          onChange={(event) => setField({ alt: event.target.value })}
        />
        <p className="editor-field__hint">{t('editor.image.altHint')}</p>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-image-fit">
          {t('editor.image.fit')}
        </label>
        <select
          id="editor-image-fit"
          className="editor-select"
          value={block.content.fit}
          onChange={(event) => setField({ fit: event.target.value })}
        >
          {IMAGE_FIT_OPTIONS.map((fit) => (
            <option key={fit.value} value={fit.value}>
              {t(fit.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {showLink ? (
        <div className="editor-field">
          <label className="editor-field__label" htmlFor="editor-image-href">
            {t('editor.image.link')}
          </label>
          <input
            id="editor-image-href"
            className="editor-input"
            type="text"
            placeholder="https://"
            value={href}
            onChange={(event) => setField({ href: event.target.value })}
          />
          <p className="editor-field__hint">{t('editor.image.linkHint')}</p>
        </div>
      ) : null}
    </>
  )
}

/**
 * Card settings.
 *
 * The text fields are the card's own. The image controls reuse the image
 * settings with the link field hidden, because on a card the link belongs to the
 * action button rather than to the picture. `imageSlot` keeps the media area
 * reserved, so a portfolio or property card still reads as a card before a
 * picture is chosen.
 */
function PanelSettings({ block, onUpdate, onOpenMedia }) {
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

/**
 * A metric card's content.
 *
 * The value and the change are plain text: the editor never parses a number, so
 * a user can write "1.2M", "€48,300" or "99.98%" and it stays exactly as typed.
 */
function StatSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const textField = (id, labelKey, name) => (
    <div className="editor-field">
      <label className="editor-field__label" htmlFor={id}>
        {t(labelKey)}
      </label>
      <input
        id={id}
        className="editor-input"
        value={content[name]}
        onChange={(event) => setField({ [name]: event.target.value })}
      />
    </div>
  )

  return (
    <>
      {textField('editor-stat-label', 'editor.stat.label', 'label')}
      {textField('editor-stat-value', 'editor.stat.value', 'value')}
      {textField('editor-stat-delta', 'editor.stat.delta', 'delta')}
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-stat-trend">
          {t('editor.stat.trend')}
        </label>
        <select
          id="editor-stat-trend"
          className="editor-input"
          value={content.trend}
          onChange={(event) => setField({ trend: event.target.value })}
        >
          {STAT_TRENDS.map((trend) => (
            <option key={trend} value={trend}>
              {t(`editor.stat.trend_${trend}`)}
            </option>
          ))}
        </select>
      </div>
      {textField('editor-stat-caption', 'editor.stat.caption', 'caption')}
    </>
  )
}

/** A chart placeholder: a title, a shape and a caption. There is no data to edit. */
function ChartSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-title">
          {t('editor.chart.title')}
        </label>
        <input
          id="editor-chart-title"
          className="editor-input"
          value={content.title}
          onChange={(event) => setField({ title: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-variant">
          {t('editor.chart.variant')}
        </label>
        <select
          id="editor-chart-variant"
          className="editor-input"
          value={content.variant}
          onChange={(event) => setField({ variant: event.target.value })}
        >
          {CHART_VARIANTS.map((variant) => (
            <option key={variant} value={variant}>
              {t(`editor.chart.variant_${variant}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-chart-caption">
          {t('editor.chart.caption')}
        </label>
        <input
          id="editor-chart-caption"
          className="editor-input"
          value={content.caption}
          onChange={(event) => setField({ caption: event.target.value })}
        />
      </div>
    </>
  )
}

/**
 * A data table's content.
 *
 * Columns and rows are edited independently: the model pads or trims a row to the
 * header width on save, so adding or removing a column never needs a separate
 * pass over every row here.
 */
function TableSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const setColumn = (index, value) =>
    setField({ columns: content.columns.map((column, i) => (i === index ? value : column)) })

  const setCell = (rowIndex, columnIndex, value) =>
    setField({
      rows: content.rows.map((row, index) =>
        index === rowIndex ? row.map((cell, cellIndex) => (cellIndex === columnIndex ? value : cell)) : row,
      ),
    })

  const addColumn = () => {
    if (content.columns.length >= MAX_TABLE_COLUMNS) return
    setField({ columns: [...content.columns, ''] })
  }

  const removeColumn = (index) => {
    if (content.columns.length <= 1) return
    setField({ columns: content.columns.filter((_, column) => column !== index) })
  }

  const addRow = () => {
    if (content.rows.length >= MAX_TABLE_ROWS) return
    setField({ rows: [...content.rows, content.columns.map(() => '')] })
  }

  const removeRow = (index) => setField({ rows: content.rows.filter((_, row) => row !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-table-caption">
          {t('editor.table.caption')}
        </label>
        <input
          id="editor-table-caption"
          className="editor-input"
          value={content.caption}
          onChange={(event) => setField({ caption: event.target.value })}
        />
      </div>

      <div className="editor-field">
        <span className="editor-field__label">{t('editor.table.columns')}</span>
        {content.columns.map((column, index) => (
          <div className="editor-repeat-row" key={index}>
            <input
              className="editor-input"
              value={column}
              aria-label={t('editor.table.column')}
              onChange={(event) => setColumn(index, event.target.value)}
            />
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.table.removeColumn')}
              disabled={content.columns.length <= 1}
              onClick={() => removeColumn(index)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.columns.length >= MAX_TABLE_COLUMNS}
          onClick={addColumn}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.table.addColumn')}
        </button>
      </div>

      <div className="editor-field">
        <span className="editor-field__label">{t('editor.table.rows')}</span>
        {content.rows.map((row, rowIndex) => (
          <div className="editor-table-row" key={rowIndex}>
            <span className="editor-table-row__index">{rowIndex + 1}</span>
            <div className="editor-table-row__cells">
              {row.map((cell, columnIndex) => (
                <input
                  key={columnIndex}
                  className="editor-input"
                  value={cell}
                  aria-label={t('editor.table.cell', { row: rowIndex + 1, column: columnIndex + 1 })}
                  onChange={(event) => setCell(rowIndex, columnIndex, event.target.value)}
                />
              ))}
            </div>
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.table.removeRow')}
              onClick={() => removeRow(rowIndex)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.rows.length >= MAX_TABLE_ROWS}
          onClick={addRow}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.table.addRow')}
        </button>
      </div>
    </>
  )
}

/** A status list: a heading and rows of a label, a value and a tone. */
function StatusListSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })
  const setItem = (index, patch) =>
    setField({
      items: content.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    })

  const addItem = () => {
    if (content.items.length >= MAX_STATUS_ITEMS) return
    setField({ items: [...content.items, { label: '', value: '', tone: 'neutral' }] })
  }

  const removeItem = (index) =>
    setField({ items: content.items.filter((_, itemIndex) => itemIndex !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-status-title">
          {t('editor.status.title')}
        </label>
        <input
          id="editor-status-title"
          className="editor-input"
          value={content.title}
          onChange={(event) => setField({ title: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.status.items')}</span>
        {content.items.map((item, index) => (
          <div className="editor-status-item" key={index}>
            <div className="editor-status-item__fields">
              <input
                className="editor-input"
                value={item.label}
                aria-label={t('editor.status.label')}
                onChange={(event) => setItem(index, { label: event.target.value })}
              />
              <input
                className="editor-input"
                value={item.value}
                aria-label={t('editor.status.value')}
                onChange={(event) => setItem(index, { value: event.target.value })}
              />
            </div>
            <div className="editor-status-item__row">
              <select
                className="editor-input"
                value={item.tone}
                aria-label={t('editor.status.tone')}
                onChange={(event) => setItem(index, { tone: event.target.value })}
              >
                {STATUS_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {t(`editor.status.tone_${tone}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="editor-icon-button"
                aria-label={t('editor.status.removeItem')}
                onClick={() => removeItem(index)}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.items.length >= MAX_STATUS_ITEMS}
          onClick={addItem}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.status.addItem')}
        </button>
      </div>
    </>
  )
}

/**
 * A filter/action bar.
 *
 * The fields are labels, not live controls: on the page the bar is drawn inert,
 * so what a user edits here is the text a later integration would wire up.
 */
function ToolbarSettings({ block, onUpdate }) {
  const { t } = useTranslation()
  const { content } = block
  const setField = (patch) => onUpdate({ content: { ...patch } })

  const addFilter = () => {
    if (content.filters.length >= MAX_TOOLBAR_FILTERS) return
    setField({ filters: [...content.filters, ''] })
  }

  const removeFilter = (index) =>
    setField({ filters: content.filters.filter((_, filterIndex) => filterIndex !== index) })

  return (
    <>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-toolbar-search">
          {t('editor.toolbar.search')}
        </label>
        <input
          id="editor-toolbar-search"
          className="editor-input"
          value={content.search}
          onChange={(event) => setField({ search: event.target.value })}
        />
      </div>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.toolbar.filters')}</span>
        {content.filters.map((filter, index) => (
          <div className="editor-repeat-row" key={index}>
            <input
              className="editor-input"
              value={filter}
              aria-label={t('editor.toolbar.filter')}
              onChange={(event) =>
                setField({
                  filters: content.filters.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item,
                  ),
                })
              }
            />
            <button
              type="button"
              className="editor-icon-button"
              aria-label={t('editor.toolbar.removeFilter')}
              onClick={() => removeFilter(index)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={content.filters.length >= MAX_TOOLBAR_FILTERS}
          onClick={addFilter}
        >
          <Plus size={14} aria-hidden="true" />
          {t('editor.toolbar.addFilter')}
        </button>
      </div>
      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-toolbar-action">
          {t('editor.toolbar.action')}
        </label>
        <input
          id="editor-toolbar-action"
          className="editor-input"
          value={content.action}
          onChange={(event) => setField({ action: event.target.value })}
        />
      </div>
    </>
  )
}

/**
 * Background image settings for a section.
 *
 * The overlay is only offered once there is an image, and the whole group is
 * optional: a section with no background image carries no background keys, so
 * there is nothing to misread as "set but blank".
 */
function BackgroundImageSettings({ section, onUpdate, onOpenMedia }) {
  const { t } = useTranslation()
  const background = section.backgroundImage
  const isLocalPreview = background?.media?.isLocalPreview === true

  if (!background) {
    return (
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.background.image')}</span>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
          <ImageIcon size={16} aria-hidden="true" />
          {t('editor.background.choose')}
        </button>
        <p className="editor-field__hint">{t('editor.background.none')}</p>
      </div>
    )
  }

  const setField = (patch) => onUpdate({ backgroundImage: { ...background, ...patch } })

  return (
    <>
      <div className="editor-field">
        <span className="editor-field__label">{t('editor.background.image')}</span>
        <div className="editor-image-source">
          <span className="editor-image-source__thumb">
            <img src={getMediaPreviewUrl(background.media)} alt="" aria-hidden="true" />
          </span>
          <span className="editor-image-source__copy">
            <span className="editor-image-source__name">
              {background.media.fileName ?? t('editor.image.fromUrl')}
            </span>
            {isLocalPreview ? (
              <span className="editor-media-badge">
                {t('editor.image.localPreviewBadge')}
              </span>
            ) : null}
          </span>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenMedia()}>
            {t('editor.image.choose')}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => onUpdate({ backgroundImage: null })}
          >
            {t('editor.image.remove')}
          </button>
        </div>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-fit">
          {t('editor.image.fit')}
        </label>
        <select
          id="editor-background-fit"
          className="editor-select"
          value={background.fit}
          onChange={(event) => setField({ fit: event.target.value })}
        >
          {IMAGE_FITS.map((fit) => (
            <option key={fit.value} value={fit.value}>
              {t(fit.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-position">
          {t('editor.background.position')}
        </label>
        <select
          id="editor-background-position"
          className="editor-select"
          value={background.position}
          onChange={(event) => setField({ position: event.target.value })}
        >
          {BACKGROUND_POSITION_OPTIONS.map((position) => (
            <option key={position.value} value={position.value}>
              {t(position.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="editor-field">
        <label className="editor-field__label" htmlFor="editor-background-overlay">
          {t('editor.background.overlay')}
        </label>
        <input
          id="editor-background-overlay"
          className="editor-input"
          value={background.overlayColor}
          onChange={(event) => setField({ overlayColor: event.target.value })}
        />
        <p className="editor-field__hint">{t('editor.background.overlayHint')}</p>
      </div>

      <div className="editor-field">
        <div className="editor-number">
          <label className="editor-visually-hidden" htmlFor="editor-background-opacity">
            {t('editor.background.opacity')}
          </label>
          <input
            id="editor-background-opacity"
            type="range"
            className="editor-range"
            min={OVERLAY_BOUNDS.min}
            max={OVERLAY_BOUNDS.max}
            step={OVERLAY_BOUNDS.step}
            value={background.overlayOpacity}
            onChange={(event) => setField({ overlayOpacity: Number(event.target.value) })}
          />
          <output className="editor-number__value" htmlFor="editor-background-opacity">
            {background.overlayOpacity}%
          </output>
        </div>
        <p className="editor-field__hint">{t('editor.background.opacityHint')}</p>
      </div>
    </>
  )
}

/**
 * Reports the device in view and what is overridden on it.
 *
 * This is the honest answer to "why does this look different on mobile?", and it
 * is the only place the reset action appears, so the single destructive control
 * for a device is in one predictable spot rather than repeated per property.
 *
 * Desktop says it is the base rather than showing an inactive reset: there is
 * nothing to reset, because desktop is where the value is edited.
 */
function DeviceOverrideBar({ device, node, onReset }) {
  const { t } = useTranslation()

  if (!isResponsiveDevice(device)) {
    return (
      <p className="editor-device-note" data-tone="base">
        {t('editor.responsive.desktopIsBase')}
      </p>
    )
  }

  const overridden = listOverriddenDevices(node)

  return (
    <div
      className="editor-device-override"
      data-has-overrides={overridden.length > 0 ? 'true' : undefined}
    >
      <p className="editor-device-note">
        {overridden.length > 0
          ? t('editor.responsive.overridden', {
              count: overridden.length,
              device: t(`editor.device.${device}`),
            })
          : t('editor.responsive.inherits', { device: t(`editor.device.${device}`) })}
      </p>
      <button
        type="button"
        className="btn btn--outline btn--sm"
        disabled={overridden.length === 0}
        onClick={onReset}
      >
        {t('editor.responsive.reset')}
      </button>
    </div>
  )
}

/**
 * A switch for showing the selection on the device in view.
 *
 * On desktop this is the block's own visibility, so it turns the block off
 * everywhere. On a narrower device it is an override, so the block can be gone
 * from the phone and still present on the desktop — which is the whole reason
 * the two are not the same control.
 */
function VisibilityToggle({ device, isVisible, onChange }) {
  const { t } = useTranslation()
  const id = `editor-visibility-${device}`

  return (
    <div className="editor-field">
      <label className="editor-checkbox-row" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={isVisible}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          {isResponsiveDevice(device)
            ? t('editor.responsive.showOnDevice', { device: t(`editor.device.${device}`) })
            : t('editor.settings.show')}
        </span>
      </label>
      {isResponsiveDevice(device) ? (
        <p className="editor-field__hint">{t('editor.responsive.showOnDeviceHint')}</p>
      ) : null}
    </div>
  )
}

/**
 * Right panel: settings for the current selection.
 *
 * Only the controls that mean something for the selected thing are rendered, so
 * the panel stays short and never offers a setting that is ignored. An empty
 * colour means "inherit from the theme", which is why the swatches include a
 * reset option instead of forcing a colour.
 */
/**
 * One labelled control.
 *
 * Kept as a component at module scope so that `ColorField` can share the same
 * markup. A `ColorField` written as a plain function inside the panel could not
 * hold a draft with `useState`, because a hook may only be called from a
 * component or another hook.
 */
function Field({ label, hint, children }) {
  return (
    <div className="editor-field">
      {children?.props?.id ? (
        <label className="editor-field__label" htmlFor={children.props.id}>{label}</label>
      ) : <span className="editor-field__label">{label}</span>}
      {children}
      {hint ? <p className="editor-field__hint">{hint}</p> : null}
    </div>
  )
}

/**
 * A colour control with a native swatch and a text field.
 *
 * The swatch can only represent a plain hex. A theme token name or an
 * rgb()/hsl() value is still valid, but handing it to <input type="color"> would
 * render it as black and invite the user to "fix" a colour that was never black.
 * In that case the swatch is disabled and the text field stays the single source
 * of truth.
 *
 * The text field keeps its own draft. A colour is typed one character at a time
 * and every intermediate value ("#", "#1", "#12") is not yet a colour the model
 * will accept, so a field bound straight to the stored value would reject each
 * keystroke and be rewritten, making a hex code impossible to type. The draft is
 * committed as soon as it becomes valid, and reverted if it is still invalid
 * when the field is left.
 */
function ColorField({ id, value, onChange, labelKey }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(value ?? '')

  const hex = HEX_COLOR.test(value ?? '') ? value : ''
  const hexValue = hex.length === 4 || hex.length === 8 ? hex : hex ? expandHex(hex) : ''

  // A colour that changed elsewhere (theme switch, reset, another block) should
  // not overwrite what is being typed, so the draft is only seeded on mount and
  // reverted on blur, never pushed down from props.
  const commitDraft = (next) => {
    setDraft(next)
    if (next === '' || isValidEditorColor(next)) {
      onChange(next)
    }
  }

  return (
    <Field label={t(labelKey)}>
      <div className="editor-color">
        <label className="editor-visually-hidden" htmlFor={id}>
          {t(labelKey)}
        </label>
        <input
          id={id}
          type="color"
          className="editor-color__input"
          value={hexValue}
          disabled={!hexValue}
          onChange={(event) => commitDraft(event.target.value)}
        />
        <label className="editor-visually-hidden" htmlFor={`${id}-text`}>
          {t('editor.settings.colorValue')}
        </label>
        <input
          id={`${id}-text`}
          type="text"
          className="editor-input editor-input--compact"
          value={draft}
          placeholder={t('editor.settings.colorInherit')}
          aria-invalid={draft !== '' && !isValidEditorColor(draft)}
          onChange={(event) => commitDraft(event.target.value)}
          onBlur={() => setDraft(value ?? '')}
        />
        <button
          type="button"
          className="editor-icon-button"
          aria-label={t('editor.settings.resetColor')}
          /* `null` is the model's explicit "inherit the theme colour". */
          onClick={() => {
            setDraft('')
            onChange(null)
          }}
        >
          {t('editor.settings.reset')}
        </button>
      </div>
    </Field>
  )
}

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
  ) : null

  /* ---------------------------------------------------------------- *
   * Block settings
   * ---------------------------------------------------------------- */

  const blockSettings = block ? (
    <>
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
      </EditorPanelGroup>
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
