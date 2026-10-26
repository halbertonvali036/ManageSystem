import useTranslation from '@/hooks/useTranslation'

/**
 * The line under the top bar that states what the draft's publication status is.
 *
 * The remote status comes from the site record; "has changes" comes from the
 * local document. Showing both is what keeps a local edit from looking published.
 */
export default function EditorPublicationState({ publication }) {
  const { t } = useTranslation()

  return (
    <p className="publication-state" role="status">
      {t('publishing.draft')} · {t(`publishing.${publication.status}`)}
      {publication.hasChanges ? ` · ${t('publishing.changes')}` : ''}
    </p>
  )
}
