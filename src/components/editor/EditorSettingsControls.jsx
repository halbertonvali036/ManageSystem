import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import {
  isResponsiveDevice,
  isValidEditorColor,
  listOverriddenDevices,
} from '@/models/siteEditor'

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
 * Reports the device in view and what is overridden on it.
 *
 * This is the honest answer to "why does this look different on mobile?", and it
 * is the only place the reset action appears, so the single destructive control
 * for a device is in one predictable spot rather than repeated per property.
 *
 * Desktop says it is the base rather than showing an inactive reset: there is
 * nothing to reset, because desktop is where the value is edited.
 */
export function DeviceOverrideBar({ device, node, onReset }) {
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
export function VisibilityToggle({ device, isVisible, onChange }) {
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
 * One labelled control.
 *
 * Kept as a component at module scope so that `ColorField` can share the same
 * markup. A `ColorField` written as a plain function inside the panel could not
 * hold a draft with `useState`, because a hook may only be called from a
 * component or another hook.
 */
export function Field({ label, hint, children }) {
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
export function ColorField({ id, value, onChange, labelKey }) {
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
