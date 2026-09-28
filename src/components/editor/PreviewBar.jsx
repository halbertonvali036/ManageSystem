import { useEffect, useRef, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { EDITOR_DEVICES, EDITOR_DEVICE_WIDTHS } from '@/models/siteEditor'

export default function PreviewBar({ device, onDeviceChange, onClose }) {
  const { t } = useTranslation()
  const close = useRef(null)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    close.current?.focus()
    const escape = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('keydown', escape)
      requestAnimationFrame(() => window.document.getElementById('editor-preview-toggle')?.focus())
    }
  }, [onClose])
  return <header className={`preview-bar${hidden ? ' preview-bar--hidden' : ''}`}>
    {!hidden && <>
      <span>{t('publishing.previewDraft')}</span>
      <div role="group" aria-label={t('editor.topBar.deviceGroup')} className="preview-devices">
        {EDITOR_DEVICES.map(({ id, labelKey }) => <button type="button" className="editor-topbar__icon-button" key={id} aria-pressed={device === id} onClick={() => onDeviceChange(id)}>{t(labelKey)} <small>{EDITOR_DEVICE_WIDTHS[id]}px</small></button>)}
      </div>
      <button ref={close} type="button" className="btn btn--outline" onClick={onClose}>{t('editor.topBar.exitPreview')}</button>
    </>}
    <button type="button" className="btn btn--outline" aria-expanded={!hidden} onClick={() => setHidden(!hidden)}>{t(hidden ? 'publishing.showControls' : 'publishing.hideControls')}</button>
  </header>
}
