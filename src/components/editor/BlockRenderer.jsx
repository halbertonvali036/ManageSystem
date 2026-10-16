import FormBlock from '@/components/editor/FormBlock'
import {
  BLOCK_TYPE,
  getBlockCssStyle,
  getBlockImageUrl,
  getEffectiveStyle,
  getImageBlockCssStyle,
} from '@/models/siteEditor'
import useTranslation from '@/hooks/useTranslation'

/**
 * Canvas renderers for the block types this phase supports.
 *
 * Each renderer is intentionally plain: it reads the block and returns markup.
 * Selection, reordering and every editor control live in the editor chrome, so
 * the same renderers are reused verbatim in preview mode.
 *
 * `device` is passed down rather than read from a context so a renderer stays a
 * pure function of its props, and so two device frames could be rendered at once
 * without the renderers disagreeing about which one is active.
 */

/** Shows the image, or a placeholder when there is no usable source. */
function ImageBlock({ block, isPreview, device }) {
  const { t } = useTranslation()
  const { alt, href } = block.content
  const src = getBlockImageUrl(block)
  const style = getImageBlockCssStyle(block, device)

  if (src) {
    const image = <img className="editor-block__image" src={src} alt={alt} style={style} />
    /*
     * A link is live only in preview and only when one was set, for the same
     * reason a button's link is: the wrapper around every block is already the
     * selectable control, so a real anchor inside it would nest interactive
     * elements and let a stray click navigate away from an unsaved draft.
     */
    if (isPreview && href) {
      return (
        <a className="editor-block__image-link" href={href} rel="noopener noreferrer">
          {image}
        </a>
      )
    }
    return image
  }

  return (
    <div
      className="editor-block__image-placeholder"
      style={style}
      data-preview={isPreview ? 'true' : undefined}
      role={isPreview ? undefined : 'img'}
      aria-label={alt || undefined}
    >
      <span className="editor-block__image-placeholder-label">
        {alt || t('editor.block.imagePlaceholder')}
      </span>
    </div>
  )
}

/**
 * The heading level follows the size the reader will actually see, so a heading
 * dropped below 30px on mobile becomes an `h2` there rather than staying an `h1`
 * that no longer matches the page outline.
 */
function HeadingBlock({ block, device }) {
  const { fontSize } = getEffectiveStyle(block, device)
  const Tag = fontSize >= 30 ? 'h1' : 'h2'
  return <Tag style={getBlockCssStyle(block, device)}>{block.content.text}</Tag>
}

function TextBlock({ block, device }) {
  return <p style={getBlockCssStyle(block, device)}>{block.content.text}</p>
}

/**
 * A button is a real link only in preview mode, and only once it has an href.
 *
 * While editing it stays a non-interactive element even when a link is set: the
 * wrapper around every block is already the selectable control, and a live
 * anchor inside it would both nest interactive elements and let a stray click
 * navigate away from an unsaved draft. The href is edited in the settings panel.
 */
function ButtonBlock({ block, isPreview, device }) {
  const { label, href } = block.content
  const shared = {
    className: 'editor-block__button',
    'data-variant': block.content.variant,
    style: getBlockCssStyle(block, device),
  }

  if (isPreview && href) {
    return (
      <div style={{ textAlign: getEffectiveStyle(block, device).align }}><a {...shared} href={href} rel="noopener noreferrer">
        {label}
      </a></div>
    )
  }
  return <div style={{ textAlign: getEffectiveStyle(block, device).align }}><span {...shared}>{label}</span></div>
}

function SpacerBlock({ block, device }) {
  return <div className="editor-block__spacer" style={getBlockCssStyle(block, device)} aria-hidden="true" />
}

/**
 * A card.
 *
 * One primitive covers a feature tile, a pricing column, a statistic, a
 * testimonial and a project card: an optional image, an optional label, a title,
 * body copy and an optional action. It reads as a card because the stylesheet
 * gives `.editor-block__panel` a surface, a border and a radius — not because the
 * block hard-codes a look, so a theme still decides the card's colours.
 *
 * `imageSlot` keeps the media area visible before a picture is chosen, which is
 * what a portfolio or property card needs; a plain text card sets it false.
 */
function PanelBlock({ block, isPreview, device }) {
  const { eyebrow, title, body, action, href, alt } = block.content
  const src = getBlockImageUrl(block)
  const hasMedia = Boolean(src) || block.content.imageSlot === true

  return (
    <div className="editor-block__panel" style={getBlockCssStyle(block, device)}>
      {hasMedia ? (
        <span className="editor-block__panel-media" data-placeholder={src ? undefined : 'true'}>
          {src ? <img className="editor-block__panel-image" src={src} alt={alt} /> : null}
        </span>
      ) : null}
      <span className="editor-block__panel-inner">
        {eyebrow ? <span className="editor-block__panel-eyebrow">{eyebrow}</span> : null}
        {title ? <span className="editor-block__panel-title">{title}</span> : null}
        {body ? <span className="editor-block__panel-text">{body}</span> : null}
        {action ? (
          isPreview && href ? (
            <a className="editor-block__panel-action" href={href} rel="noopener noreferrer">
              {action}
            </a>
          ) : (
            <span className="editor-block__panel-action">{action}</span>
          )
        ) : null}
      </span>
    </div>
  )
}

/**
 * A metric card.
 *
 * Separate from `panel` because a number is not a card title: it needs its own
 * type scale, and it carries a change and a direction. The tone of the change is
 * a `data-trend` attribute rather than a colour baked into the block, so a theme
 * still decides what "up" looks like.
 */
function StatBlock({ block, device }) {
  const { label, value, delta, caption, trend } = block.content
  return (
    <div className="editor-block__stat" style={getBlockCssStyle(block, device)} data-trend={trend}>
      {label ? <span className="editor-block__stat-label">{label}</span> : null}
      {value ? <span className="editor-block__stat-value">{value}</span> : null}
      {delta || caption ? (
        <span className="editor-block__stat-foot">
          {delta ? <span className="editor-block__stat-delta">{delta}</span> : null}
          {caption ? <span className="editor-block__stat-caption">{caption}</span> : null}
        </span>
      ) : null}
    </div>
  )
}

/** Bar heights are a fixed reading; the block never claims to plot real data. */
const CHART_BAR_HEIGHTS = [42, 68, 54, 80, 60, 92, 74]

function ChartFigure({ variant }) {
  if (variant === 'donut') {
    return (
      <svg className="editor-block__chart-svg editor-block__chart-svg--donut" viewBox="0 0 120 120" role="presentation">
        <circle className="editor-block__chart-donut-track" cx="60" cy="60" r="44" />
        <circle className="editor-block__chart-donut-value" cx="60" cy="60" r="44" strokeDasharray="180 96" />
      </svg>
    )
  }
  if (variant === 'line') {
    return (
      <svg className="editor-block__chart-svg" viewBox="0 0 220 100" preserveAspectRatio="none" role="presentation">
        <polyline className="editor-block__chart-line" points="6,74 40,54 74,64 108,34 142,46 176,20 210,30" />
      </svg>
    )
  }
  return (
    <svg className="editor-block__chart-svg" viewBox="0 0 220 100" preserveAspectRatio="none" role="presentation">
      {CHART_BAR_HEIGHTS.map((height, index) => (
        <rect
          key={index}
          className="editor-block__chart-bar"
          x={12 + index * 29}
          y={100 - height}
          width="16"
          height={height}
          rx="2"
        />
      ))}
    </svg>
  )
}

/**
 * A chart placeholder.
 *
 * An inline SVG rather than an image, so it inherits the theme's accent and no
 * charting library is added to the page. It shows a shape, not data: there is no
 * series, no axis value and no tooltip that would imply a backend answered.
 */
function ChartBlock({ block, device }) {
  const { title, caption, variant } = block.content
  return (
    <div className="editor-block__chart" style={getBlockCssStyle(block, device)} data-variant={variant}>
      {title ? <span className="editor-block__chart-title">{title}</span> : null}
      <span className="editor-block__chart-figure">
        <ChartFigure variant={variant} />
      </span>
      {caption ? <span className="editor-block__chart-caption">{caption}</span> : null}
    </div>
  )
}

/**
 * A data table.
 *
 * A real `<table>` so it stays accessible and reads as tabular data, wrapped in a
 * scroll container so a wide table scrolls inside its band instead of pushing the
 * whole page sideways on a narrow device.
 */
function TableBlock({ block, device }) {
  const { caption, columns, rows } = block.content
  return (
    <div className="editor-block__table" style={getBlockCssStyle(block, device)}>
      <span className="editor-block__table-scroll">
        <table className="editor-block__table-grid">
          {caption ? <caption className="editor-block__table-caption">{caption}</caption> : null}
          {columns.length ? (
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} scope="col">{column}</th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </span>
    </div>
  )
}

/**
 * A status list.
 *
 * A list of labelled states — service health, order statuses, plan tiers — where
 * the value reads as a badge. The tone is a `data-tone` attribute so the colour
 * comes from the stylesheet and a theme still owns the palette.
 */
function StatusListBlock({ block, device }) {
  const { title, items } = block.content
  return (
    <div className="editor-block__status" style={getBlockCssStyle(block, device)}>
      {title ? <span className="editor-block__status-title">{title}</span> : null}
      <ul className="editor-block__status-list">
        {items.map((item, index) => (
          <li className="editor-block__status-row" key={index}>
            <span className="editor-block__status-label">{item.label}</span>
            <span className="editor-block__status-value" data-tone={item.tone}>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A filter/action bar.
 *
 * Drawn as inert elements rather than live inputs: a search box that accepts text
 * but filters nothing would be dishonest, so this is a labelled placeholder for
 * the controls a page will later wire up.
 */
function ToolbarBlock({ block, device }) {
  const { search, filters, action } = block.content
  return (
    <div className="editor-block__toolbar" style={getBlockCssStyle(block, device)}>
      {search ? <span className="editor-block__toolbar-search">{search}</span> : null}
      {filters.map((filter, index) => (
        <span className="editor-block__toolbar-filter" key={index}>{filter}</span>
      ))}
      {action ? <span className="editor-block__toolbar-action">{action}</span> : null}
    </div>
  )
}

const RENDERERS = {
  [BLOCK_TYPE.FORM]: FormBlock,
  [BLOCK_TYPE.HEADING]: HeadingBlock,
  [BLOCK_TYPE.TEXT]: TextBlock,
  [BLOCK_TYPE.BUTTON]: ButtonBlock,
  [BLOCK_TYPE.IMAGE]: ImageBlock,
  [BLOCK_TYPE.PANEL]: PanelBlock,
  [BLOCK_TYPE.STAT]: StatBlock,
  [BLOCK_TYPE.CHART]: ChartBlock,
  [BLOCK_TYPE.TABLE]: TableBlock,
  [BLOCK_TYPE.STATUS_LIST]: StatusListBlock,
  [BLOCK_TYPE.TOOLBAR]: ToolbarBlock,
  [BLOCK_TYPE.SPACER]: SpacerBlock,
}

function BlockRenderer({ block, isPreview, device }) {
  const Renderer = RENDERERS[block.type] ?? TextBlock
  return <Renderer block={block} isPreview={isPreview} device={device} />
}

export default BlockRenderer
