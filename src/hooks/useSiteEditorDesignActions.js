import { useCallback } from 'react'
import {
  isResponsiveDevice,
  resetResponsiveOverride,
  updateSiteDesign,
  updateSiteTheme,
} from '@/models/siteEditor'

/** Site-wide design, theme and responsive-override mutations. */
export default function useSiteEditorDesignActions({ applyEdit, device }) {
  const handleUpdateSiteDesign = useCallback(
    (patch) => {
      applyEdit((current) => updateSiteDesign(current, patch))
    },
    [applyEdit],
  )

  const handleUpdateSiteTheme = useCallback(
    (themePresetId) => {
      applyEdit((current) => updateSiteTheme(current, themePresetId))
    },
    [applyEdit],
  )

  const handleResetDeviceOverrides = useCallback(
    (kind, id) => {
      // Only a narrower device can have overrides, so desktop is never a target.
      if (!isResponsiveDevice(device)) {
        return
      }
      applyEdit((current) => resetResponsiveOverride(current, { kind, id }, device))
    },
    [applyEdit, device],
  )

  return {
    handleUpdateSiteDesign,
    handleUpdateSiteTheme,
    handleResetDeviceOverrides,
  }
}
