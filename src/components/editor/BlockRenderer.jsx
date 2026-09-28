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

const RENDERERS = {
  [BLOCK_TYPE.FORM]: FormBlock,
  [BLOCK_TYPE.HEADING]: HeadingBlock,
  [BLOCK_TYPE.TEXT]: TextBlock,
  [BLOCK_TYPE.BUTTON]: ButtonBlock,
  [BLOCK_TYPE.IMAGE]: ImageBlock,
  [BLOCK_TYPE.SPACER]: SpacerBlock,
}

function BlockRenderer({ block, isPreview, device }) {
  const Renderer = RENDERERS[block.type] ?? TextBlock
  return <Renderer block={block} isPreview={isPreview} device={device} />
}

export default BlockRenderer
