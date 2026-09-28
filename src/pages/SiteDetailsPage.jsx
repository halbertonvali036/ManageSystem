import PublishActions from '@/components/sites/PublishActions'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Globe,
  LayoutTemplate,
  Link2,
  Palette,
  Pencil,
  Settings,
} from 'lucide-react'
import Card from '@/components/common/Card'
import SiteStatusBadge from '@/components/sites/SiteStatusBadge'
import useTranslation from '@/hooks/useTranslation'
import siteService from '@/services/siteService'
import { SITES_PATH, SITE_EDITOR_PATH, SITE_SETTINGS_PATH } from '@/utils/constants'
import {
  formatSiteDate,
  getSiteAddress,
  getSiteAddressLabel,
  getSiteTemplate,
  getSiteTheme,
} from '@/models/site'

/**
 * Project overview — the project workspace entry.
 *
 * It is deliberately an overview, not the editor. The project identity, status
 * and address come from the API; "edit" hands off to the visual editor and the
 * remaining actions are declared but disabled, because each still needs a
 * backend. A missing project resolves to a real "not found" state rather than a
 * blank page.
 */
function SiteDetailsPage() {
  const { siteId } = useParams()
  const { t, locale } = useTranslation()

  /*
   * The resolved project is stored together with the id it belongs to, so the
   * loading state is derived rather than reset inside the effect. Changing the
   * route therefore shows the previous result only for the matching id, and the
   * effect never has to synchronously clear state on mount.
   */
  const [result, setResult] = useState({ siteId: null, site: null, isLoading: true })

  useEffect(() => {
    if (!siteId) {
      return undefined
    }

    let isActive = true

    siteService
      .getSite(siteId)
      .then((data) => {
        if (isActive) {
          setResult({ siteId, site: data, isLoading: false })
        }
      })
      .catch(() => {
        if (isActive) {
          setResult({ siteId, site: null, isLoading: false })
        }
      })

    return () => {
      isActive = false
    }
  }, [siteId])

  const isLoading = result.siteId !== siteId || result.isLoading
  const site = result.siteId === siteId ? result.site : null

  if (isLoading) {
    return (
      <div className="sites-page">
        <Card>
          <div className="page-status">
            <span className="spinner" aria-hidden="true" />
            {t('sites.loading')}
          </div>
        </Card>
      </div>
    )
  }

  if (!site) {
    return (
      <div className="sites-page">
        <Card>
          <div className="table-state table-state--error">
            <h2 className="table-state__title">{t('siteDetails.notFoundTitle')}</h2>
            <p className="table-state__text">{t('siteDetails.notFoundText')}</p>
            <Link to={SITES_PATH} className="btn btn--primary">
              {t('siteDetails.backToSites')}
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const address = getSiteAddress(site)
  const addressLabel = getSiteAddressLabel(site)
  const createdLabel = formatSiteDate(site.createdAt, locale)
  const updatedLabel = formatSiteDate(site.updatedAt, locale)

  const facts = [
    {
      key: 'status',
      icon: Globe,
      label: t('siteDetails.factStatus'),
      value: <SiteStatusBadge status={site.status} />,
    },
    {
      key: 'address',
      icon: Link2,
      label: t('siteDetails.factAddress'),
      value: address ? (
        <a href={address} target="_blank" rel="noreferrer noopener">
          {addressLabel}
        </a>
      ) : (
        <span className="site-details__muted">{addressLabel}</span>
      ),
    },
    {
      key: 'template',
      icon: LayoutTemplate,
      label: t('siteDetails.factTemplate'),
      value: <span>{t(getSiteTemplate(site.templateId).nameKey)}</span>,
    },
    {
      key: 'theme',
      icon: Palette,
      label: t('siteDetails.factTheme'),
      value: <span>{t(getSiteTheme(site.themePresetId).nameKey)}</span>,
    },
    {
      key: 'created',
      icon: CalendarDays,
      label: t('siteDetails.factCreated'),
      value: <span>{createdLabel ?? t('sites.notYet')}</span>,
    },
    {
      key: 'updated',
      icon: CalendarDays,
      label: t('siteDetails.factUpdated'),
      value: <span>{updatedLabel ?? t('sites.notYet')}</span>,
    },
  ]

  // The editor and settings both exist now, so both are real links. Preview stays
  // disabled and keeps pointing at the explanation below, so it reads as prepared
  // rather than broken.
  const pendingActions = [
    { key: 'preview', icon: ExternalLink, label: t('sites.action.preview') },
  ]

  return (
    <div className="sites-page site-details">
      <Link to={SITES_PATH} className="site-details__back">
        <ArrowLeft size={15} aria-hidden="true" />
        {t('siteDetails.backToSites')}
      </Link>

      <header className="site-details__head">
        <div className="site-details__identity">
          <h2 className="site-details__name">{site.name}</h2>
          <p className="site-details__slug">{addressLabel}</p>
        </div>
        <SiteStatusBadge status={site.status} className="site-details__badge" />
      </header>

      <div className="site-details__actions">
        <PublishActions siteId={siteId} siteName={site.name} />
        <Link to={SITE_EDITOR_PATH(siteId)} className="btn btn--primary">
          <Pencil size={16} aria-hidden="true" />
          {t('sites.action.edit')}
        </Link>
        <Link to={SITE_SETTINGS_PATH(siteId)} className="btn btn--outline">
          <Settings size={16} aria-hidden="true" />
          {t('sites.action.settings')}
        </Link>
        {pendingActions.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            className="btn btn--outline"
            disabled
            aria-describedby="site-details-next-note"
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <Card>
        <h3 className="site-details__section-title">
          {t('siteDetails.overviewTitle')}
        </h3>
        <dl className="site-details__facts">
          {facts.map(({ key, icon: Icon, label, value }) => (
            <div className="site-details__fact" key={key}>
              <dt>
                <Icon size={15} aria-hidden="true" />
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h3 className="site-details__section-title">
          {t('siteDetails.nextTitle')}
        </h3>
        <p className="workspace-panel-note" id="site-details-next-note">
          {t('siteDetails.nextText')}
        </p>
      </Card>
    </div>
  )
}

export default SiteDetailsPage
