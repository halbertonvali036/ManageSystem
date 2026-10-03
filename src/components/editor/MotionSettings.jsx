import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { MOTION_TYPES, MOTION_PRESETS, normalizeAnimation, normalizeSiteMotion, resolveAnimation } from '@/models/siteMotion'

export default function MotionSettings({ node, siteMotion, onChange, onSiteChange }) {
  const { t } = useTranslation()
  const animation = normalizeAnimation(node?.animation)
  const resolved = resolveAnimation(animation, siteMotion)
  const update = (patch) => onChange({ animation: { ...animation, ...patch } })
  return <EditorPanelGroup title={t('motion.title')}>
    <label className="editor-field">{t('motion.preset')}
      <select className="editor-input" value={normalizeSiteMotion(siteMotion).preset} onChange={(event) => onSiteChange({ preset: event.target.value })}>
        {Object.keys(MOTION_PRESETS).map((preset) => <option key={preset} value={preset}>{t(`motion.${preset}`)}</option>)}
      </select>
    </label>
    <p className="editor-panel__hint">{t('motion.presetHint')}</p>
    {node && <>
      <label className="editor-field">{t('motion.effect')}
        <select className="editor-input" value={animation.type} onChange={(event) => update({ type: event.target.value })}>
          {MOTION_TYPES.map((type) => <option key={type} value={type}>{t(`motion.effects.${type}`)}</option>)}
        </select>
      </label>
      {animation.type !== 'none' && <>
        <label className="editor-field">{t('motion.duration')} ({resolved.duration} {t('motion.ms')})
          <input className="editor-input" type="range" min="100" max="1200" step="10" value={resolved.duration} onChange={(event) => update({ duration: Number(event.target.value) })} />
        </label>
        <label className="editor-field">{t('motion.delay')} ({resolved.delay} {t('motion.ms')})
          <input className="editor-input" type="range" min="0" max="2000" step="10" value={resolved.delay} onChange={(event) => update({ delay: Number(event.target.value) })} />
        </label>
        <label className="editor-field">{t('motion.trigger')}
          <select className="editor-input" value={animation.trigger} onChange={(event) => update({ trigger: event.target.value })}>
            <option value="load">{t('motion.load')}</option><option value="scroll">{t('motion.scroll')}</option>
          </select>
        </label>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => update({ duration: null, delay: null })}>{t('motion.inherit')}</button>
      </>}
    </>}
    <p className="editor-panel__hint">{t('motion.previewHint')}</p>
  </EditorPanelGroup>
}
