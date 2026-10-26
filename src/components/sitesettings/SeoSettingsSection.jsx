import { Link2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import SettingsCard from '@/components/sitesettings/SettingsCard'
import SettingsField from '@/components/sitesettings/SettingsField'
import {
  CANONICAL_URL_MAX,
  SEO_LENGTHS,
  getSeoLengthState,
} from '@/models/siteSettings'
import useTranslation from '@/hooks/useTranslation'
import { SITE_EDITOR_PATH } from '@/utils/constants'

/**
 * Site-wide SEO defaults.
 *
 * Page-level overrides live in the editor's page panel, so this section links
 * there instead of duplicating the fields. The two character counters come from
 * the model's length rules, not from a local copy of the maximums.
 */
export default function SeoSettingsSection({ settings, patchSection, siteId }) {
  const { t } = useTranslation()

  const titleLength = getSeoLengthState(settings.seo.defaultTitle, 'title')
  const descriptionLength = getSeoLengthState(settings.seo.metaDescription, 'description')

  return (
    <SettingsCard
      id="settings-seo"
      title={t('siteSettings.seo.title')}
      description={t('siteSettings.seo.description')}
      icon={Search}
    >
      <div className="settings-grid">
        <SettingsField
          id="settings-default-seo-title"
          label={t('siteSettings.seo.defaultTitle')}
          hint={t('siteSettings.seo.titleHint', {
            min: SEO_LENGTHS.title.min,
            max: SEO_LENGTHS.title.max,
          })}
          counter={`${titleLength.length} / ${SEO_LENGTHS.title.max}`}
          error={titleLength.isOverLimit ? t('siteSettings.seo.titleTooLong') : null}
        >
          <input
            id="settings-default-seo-title"
            type="text"
            className="editor-input"
            value={settings.seo.defaultTitle}
            onChange={(event) =>
              patchSection('seo', { defaultTitle: event.target.value })
            }
            aria-describedby="site-settings-page-seo-note"
          />
        </SettingsField>

        <SettingsField
          id="settings-seo-description"
          label={t('siteSettings.seo.metaDescription')}
          hint={t('siteSettings.seo.descriptionHint', {
            min: SEO_LENGTHS.description.min,
            max: SEO_LENGTHS.description.max,
          })}
          counter={`${descriptionLength.length} / ${SEO_LENGTHS.description.max}`}
          error={
            descriptionLength.isOverLimit ? t('siteSettings.seo.descriptionTooLong') : null
          }
        >
          <textarea
            id="settings-seo-description"
            className="editor-input editor-textarea"
            rows={3}
            value={settings.seo.metaDescription}
            onChange={(event) =>
              patchSection('seo', { metaDescription: event.target.value })
            }
          />
        </SettingsField>

        <SettingsField
          id="settings-canonical"
          label={t('siteSettings.seo.canonical')}
          hint={t('siteSettings.seo.canonicalHint')}
        >
          <input
            id="settings-canonical"
            type="url"
            className="editor-input"
            placeholder="https://example.com"
            value={settings.seo.canonicalUrl}
            maxLength={CANONICAL_URL_MAX}
            onChange={(event) =>
              patchSection('seo', { canonicalUrl: event.target.value })
            }
          />
        </SettingsField>

        <div className="settings-toggle" id="settings-index-toggle">
          <input
            id="settings-index-in-search"
            type="checkbox"
            className="settings-toggle__input"
            checked={settings.seo.indexInSearch}
            onChange={(event) =>
              patchSection('seo', { indexInSearch: event.target.checked })
            }
          />
          <label
            className="settings-toggle__label"
            htmlFor="settings-index-in-search"
          >
            {t('siteSettings.seo.indexInSearch')}
          </label>
          <p className="editor-field__hint">{t('siteSettings.seo.indexInSearchHint')}</p>
        </div>

        {/*
          Page-level overrides are edited where the page lives, in the
          editor's page panel. Repeating the same fields here would mean two
          places writing one value, and the two would eventually disagree.
        */}
        <p className="settings-note" id="site-settings-page-seo-note">
          <Link2 size={14} aria-hidden="true" />
          {t('siteSettings.seo.pageOverrideNote')}{' '}
          <Link to={SITE_EDITOR_PATH(siteId)}>{t('siteSettings.seo.openEditor')}</Link>
        </p>
      </div>
    </SettingsCard>
  )
}
