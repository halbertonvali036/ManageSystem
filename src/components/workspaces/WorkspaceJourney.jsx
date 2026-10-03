import { FolderOpen, PanelsTopLeft, Rocket } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

const steps = [['organize', FolderOpen], ['design', PanelsTopLeft], ['launch', Rocket]]

/** Product guidance, not sample records or account progress. */
export default function WorkspaceJourney() {
  const { t } = useTranslation()
  return <ol className="workspace-journey" aria-label={t('dashboardPolish.journey')}>
    {steps.map(([key, Icon], index) => <li key={key}>
      <span className="workspace-journey__icon" aria-hidden="true"><Icon size={19} /></span>
      <div><span className="workspace-journey__step" aria-hidden="true">0{index + 1}</span>
        <h2>{t(`dashboardPolish.${key}`)}</h2><p>{t(`dashboardPolish.${key}Text`)}</p>
      </div>
    </li>)}
  </ol>
}
