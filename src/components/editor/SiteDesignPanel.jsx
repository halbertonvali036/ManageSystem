import { useId, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { getDocumentTheme } from '@/models/siteEditor'
import { isSiteHexColor, SITE_DESIGN_BOUNDS, SITE_DESIGN_COLORS, SITE_FONT_STACKS, SITE_THEME_PRESETS } from '@/models/siteTheme'

export function DesignColorControl({ label, value, onChange }) {
  const { t } = useTranslation()
  const id = useId()
  const [edit, setEdit] = useState({ source: value, text: value })
  const draft = edit.source === value ? edit.text : value
  const invalid = !isSiteHexColor(draft)
  const change = (next) => {
    const valid = isSiteHexColor(next)
    setEdit({ source: valid ? next : value, text: next })
    if (valid) onChange(next)
  }
  const pickerValue = value.length === 4 ? '#' + [...value.slice(1)].map(char => char + char).join('') : value
  return <div className="design-color">
    <label htmlFor={id}>{label}</label>
    <div className="design-color__inputs">
      <input type="color" value={pickerValue} onChange={(event) => change(event.target.value)} aria-label={`${label} — ${t('siteDesign.picker')}`} />
      <input id={id} className="editor-input" value={draft} maxLength={7} spellCheck={false} onChange={(event) => change(event.target.value)} onBlur={() => setEdit({ source: value, text: value })} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} />
    </div>
    {invalid && <p id={`${id}-error`} className="editor-form-note">{t('siteDesign.invalidColor')}</p>}
  </div>
}

export default function SiteDesignPanel({ document, onChange, onPreset }) {
  const { t } = useTranslation()
  const theme = getDocumentTheme(document)
  const { tokens } = theme
  const range = (key) => {
    const [min, max, step] = SITE_DESIGN_BOUNDS[key]
    const value = tokens[key] ?? tokens.radiusScale
    return <label className="design-range" key={key}>{t(`siteDesign.${key}`)}
      <div><input className="editor-range" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange({ [key]: Number(event.target.value) })} /><output>{Number(value.toFixed(2))}</output></div>
    </label>
  }
  return <details className="site-design editor-panel__section">
    <summary>{t('siteDesign.title')}</summary>
    <p className="editor-panel__hint">{t('siteDesign.local')}</p>
    <p className="editor-panel__hint">{t('siteDesign.presetHint')}</p>
    <div className="editor-theme-list">{SITE_THEME_PRESETS.filter((preset) => ['minimal', 'modern', 'bold', 'elegant'].includes(preset.id)).map((preset) => <button key={preset.id} className="editor-theme-list__item" type="button" aria-pressed={theme.themePresetId === preset.id} onClick={() => onPreset(preset.id)}><span className="editor-theme-list__swatch" style={{ background: preset.tokens.background, borderColor: preset.tokens.primary }} aria-hidden="true" />{t(preset.nameKey)}</button>)}</div>
    <button type="button" className="btn btn--outline btn--sm" onClick={() => onPreset(theme.themePresetId)}>{t('siteDesign.reset')}</button>
    <fieldset><legend>{t('siteDesign.colors')}</legend>
      {SITE_DESIGN_COLORS.map((key) => <DesignColorControl key={key} label={t(`siteDesign.${key}`)} value={tokens[key]} onChange={(value) => onChange({ [key]: value })} />)}
      <p className="editor-form-note">{t('siteDesign.guidance')}</p>
    </fieldset>
    <fieldset><legend>{t('siteDesign.typography')}</legend>
      {['fontHeading', 'fontBody'].map((key) => <label key={key}>{t(`siteDesign.${key}`)}<select className="editor-input" value={Object.keys(SITE_FONT_STACKS).find((id) => SITE_FONT_STACKS[id] === tokens[key])} onChange={(event) => onChange({ [key]: event.target.value })}>{Object.keys(SITE_FONT_STACKS).map((id) => <option key={id} value={id}>{t(`siteDesign.fonts.${id}`)}</option>)}</select></label>)}
      {['baseSize', 'headingScale', 'lineHeight', 'bodyWeight', 'headingWeight'].map(range)}
    </fieldset>
    <fieldset><legend>{t('siteDesign.layout')}</legend>
      {range('radiusScale')}
      <label>{t('siteDesign.spacingScale')}<select className="editor-input" value={tokens.spacingScale} onChange={(event) => onChange({ spacingScale: Number(event.target.value) })}>{[[.75, 'compact'], [1, 'standard'], [1.5, 'spacious']].map(([value, label]) => <option value={value} key={value}>{t(`siteDesign.${label}`)}</option>)}{![.75, 1, 1.5].includes(tokens.spacingScale) && <option value={tokens.spacingScale}>{tokens.spacingScale}</option>}</select></label>
      <label>{t('siteDesign.contentWidth')}<select className="editor-input" value={[800, 1120, 1440].includes(tokens.contentWidth) ? tokens.contentWidth : ''} onChange={(event) => onChange({ contentWidth: Number(event.target.value) })}><option value="" disabled>{t('siteDesign.custom')}</option>{[[800, 'narrow'], [1120, 'standard'], [1440, 'wide']].map(([value, label]) => <option key={value} value={value}>{t(`siteDesign.${label}`)} · {value}px</option>)}</select></label>
      {range('contentWidth')}
    </fieldset>
    <fieldset><legend>{t('siteDesign.buttons')}</legend>
      {['buttonRadius', 'buttonHeight', 'buttonPadding', 'buttonWeight'].map(range)}
      <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange({ buttonRadius: null })}>{t('siteDesign.buttonRadius')}: {t('siteDesign.reset')}</button>
    </fieldset>
  </details>
}
