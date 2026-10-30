import { useEffect, useRef } from 'react'

/**
 * An inline editable piece of canvas copy.
 *
 * While idle it renders the same tag and style the block would render anyway, so
 * an old draft looks identical. While editing it becomes a `contentEditable`
 * element holding plain text only: paste is intercepted, formatting is never
 * inserted, and the block's own style stays in place so the user edits the copy
 * in its real typeface and size.
 *
 * It is deliberately uncontrolled while editing. React keeps its last rendered
 * text, the browser owns the caret, and only blur or Enter commits — which is
 * what makes typing feel native rather than fighting a controlled field.
 */
const normalizeInlineText = (value) =>
  String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\r\n]+/g, ' ')

export default function InlineEditableText({
  as: Tag = 'span',
  value,
  isEditing = false,
  className,
  style,
  ariaLabel,
  placeholder,
  onCommit,
  onCancel,
  ...rest
}) {
  const ref = useRef(null)
  const canceledRef = useRef(false)

  useEffect(() => {
    if (!isEditing) {
      return
    }
    const element = ref.current
    if (!element) {
      return
    }
    canceledRef.current = false
    element.focus()
    const selection = window.getSelection()
    if (!selection) {
      return
    }
    const range = window.document.createRange()
    range.selectNodeContents(element)
    selection.removeAllRanges()
    selection.addRange(range)
  }, [isEditing])

  if (!isEditing) {
    return (
      <Tag key="inline-reading" className={className} style={style} {...rest}>
        {value}
      </Tag>
    )
  }

  const commit = () => {
    if (canceledRef.current) {
      return
    }
    onCommit?.(normalizeInlineText(ref.current?.textContent))
  }

  const handleKeyDown = (event) => {
    // The block wrapper is no longer a control while editing, but the section
    // band behind it still is. Keep every key inside the editable field.
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      canceledRef.current = true
      ref.current?.blur()
      onCancel?.()
      return
    }
    if (event.key === 'Enter') {
      // A canvas text block is a single piece of copy; a new visual paragraph is
      // a new block. Enter therefore commits instead of inserting a line break.
      event.preventDefault()
      ref.current?.blur()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const text = normalizeInlineText(event.clipboardData?.getData('text/plain'))
    if (!text) {
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return
    }
    selection.deleteFromDocument()
    const range = selection.getRangeAt(0)
    range.insertNode(window.document.createTextNode(text))
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  return (
    <Tag
      key="inline-editing"
      ref={ref}
      className={`${className ? `${className} ` : ''}is-inline-editing`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel}
      aria-multiline="false"
      data-placeholder={placeholder}
      {...rest}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {value}
    </Tag>
  )
}
