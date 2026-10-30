import { useId, useMemo, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import EditorPanelGroup from '@/components/editor/EditorPanelGroup'
import { countDocumentTextMatches } from '@/models/siteText'

/**
 * Site-wide literal find and replace for visible copy.
 *
 * The live count is computed from the same options the button will use, so the
 * number the user reads is the number of changes that will be made — never a
 * separate estimate that can drift from the replacement.
 */
export default function EditorFindReplacePanel({ document, onReplace }) {
  const { t } = useTranslation()
  const baseId = useId()
  const scopeName = `${baseId}-scope`
  const [find, setFind] = useState('')
  const [replacement, setReplacement] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [scope, setScope] = useState('page')
  const [includePageMeta, setIncludePageMeta] = useState(false)

  const count = useMemo(
    () =>
      countDocumentTextMatches(document, {
        find,
        caseSensitive,
        scope,
        includePageMeta,
      }),
    [document, find, caseSensitive, scope, includePageMeta],
  )

  const canReplace = find.length > 0 && count > 0

  return (
    <EditorPanelGroup title={t('editor.findReplace.title')}>
      <p className="editor-panel__hint">{t('editor.findReplace.hint')}</p>

      <label className="editor-field" htmlFor={`${baseId}-find`}>
        <span className="editor-field__label">{t('editor.findReplace.findLabel')}</span>
        <input
          id={`${baseId}-find`}
          className="editor-input"
          value={find}
          placeholder={t('editor.findReplace.findPlaceholder')}
          onChange={(event) => setFind(event.target.value)}
        />
      </label>

      <label className="editor-field" htmlFor={`${baseId}-replace`}>
        <span className="editor-field__label">{t('editor.findReplace.replaceLabel')}</span>
        <input
          id={`${baseId}-replace`}
          className="editor-input"
          value={replacement}
          placeholder={t('editor.findReplace.replacePlaceholder')}
          onChange={(event) => setReplacement(event.target.value)}
        />
      </label>

      <label className="editor-checkbox">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(event) => setCaseSensitive(event.target.checked)}
        />
        <span>{t('editor.findReplace.caseSensitive')}</span>
      </label>

      <fieldset className="editor-find-replace__scope">
        <legend>{t('editor.findReplace.scope')}</legend>
        <label className="editor-checkbox">
          <input
            type="radio"
            name={scopeName}
            value="page"
            checked={scope === 'page'}
            onChange={() => setScope('page')}
          />
          <span>{t('editor.findReplace.scopePage')}</span>
        </label>
        <label className="editor-checkbox">
          <input
            type="radio"
            name={scopeName}
            value="all"
            checked={scope === 'all'}
            onChange={() => setScope('all')}
          />
          <span>{t('editor.findReplace.scopeAll')}</span>
        </label>
      </fieldset>

      <label className="editor-checkbox">
        <input
          type="checkbox"
          checked={includePageMeta}
          onChange={(event) => setIncludePageMeta(event.target.checked)}
        />
        <span>{t('editor.findReplace.includePageMeta')}</span>
      </label>

      <p className="editor-form-note" role="status" aria-live="polite">
        {find.length
          ? t('editor.findReplace.count', { count })
          : t('editor.findReplace.emptyFind')}
      </p>

      <button
        type="button"
        className="btn btn--accent btn--sm"
        disabled={!canReplace}
        onClick={() =>
          onReplace({ find, replacement, caseSensitive, scope, includePageMeta })
        }
      >
        {t('editor.findReplace.replaceAll')}
      </button>
    </EditorPanelGroup>
  )
}
