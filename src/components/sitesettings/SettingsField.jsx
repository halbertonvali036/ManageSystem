import { cloneElement, isValidElement } from 'react'

/**
 * One labelled control with its helper text, counter and error message.
 *
 * The helper text is not decoration, so it is wired to the control with
 * `aria-describedby` instead of merely sitting underneath it. A screen-reader
 * user hears the guidance when they reach the field rather than having to go
 * looking for it, and the same wiring carries the character counter and the error
 * message.
 *
 * `cloneElement` is used rather than asking every caller to thread ids through.
 * The alternative is a render prop that hands ids back to each field, which puts
 * `aria-describedby` bookkeeping in twenty call sites instead of one. A child that
 * is not a single element falls through untouched rather than crashing, because a
 * field wrapping a fragment is a reasonable thing for a future caller to write.
 */
function SettingsField({
  id,
  label,
  hint,
  error,
  counter,
  children,
  className = '',
  labelHidden = false,
}) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    counter ? `${id}-counter` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  let control = children
  if (isValidElement(children) && describedBy) {
    control = cloneElement(children, {
      'aria-describedby': [children.props['aria-describedby'], describedBy]
        .filter(Boolean)
        .join(' '),
    })
  }

  return (
    <div className={`settings-field${className ? ` ${className}` : ''}`}>
      <label
        className={labelHidden ? 'editor-visually-hidden' : 'editor-field__label'}
        htmlFor={id}
      >
        {label}
      </label>
      {control}
      {counter ? (
        <span className="settings-field__counter" id={`${id}-counter`}>
          {counter}
        </span>
      ) : null}
      {hint ? (
        <p className="editor-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="settings-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default SettingsField
