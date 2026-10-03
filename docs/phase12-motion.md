# Phase 12: motion and interactions

The frontend uses CSS entrances/transitions and one IntersectionObserver per preview page. No package, backend, persistence mechanism, or third-party source was added.

## Draft contract

`document.motion = { preset: 'minimal' | 'balanced' | 'expressive' }`

Sections and blocks each have their own `animation` metadata beside content/style:

```json
{ "type": "slide-up", "duration": null, "delay": null, "easing": "ease-out", "trigger": "scroll" }
```

Types: `none`, `fade`, `slide-up`, `slide-left`, `slide-right`, `scale`. Triggers: `load`, `scroll`. Duration is bounded to 100–1200 ms; delay to 0–2000 ms. Null timings inherit the site preset (180/380/580 ms, zero delay). Explicit timing survives preset changes. Easing is validated but is not exposed in the initial UI. Legacy nodes default to `none`; presets never enable effects or change content. Normalization, partial edits, duplication, and the future draft payload preserve motion fields. Payload preparation does not save anything.

## Rendering and accessibility

`getMotionProps` supplies colorless attributes and CSS variables to existing wrappers, and `useSiteMotion` observes those wrappers. Entering Preview or another page runs entrances once from current draft state. Editing, selecting, scrolling back, and changing device do not restart completed entrances. Re-enter Preview to replay. Device changes render new device-only content visibly, without forcing a page-wide replay.

No animation state is attached in Editor. Preview scroll entrances are unobserved as soon as they start, and animation state is removed on completion. Unsupported IntersectionObserver leaves scroll content visible. Focus immediately reveals every containing animated element. Reduced motion disables entrances and transitions in CSS and bypasses/disconnects observation in JavaScript, including live preference changes. At mobile sizes, travel is at most 8 px, duration 300 ms, delay 200 ms. No flashing, layout animation, permanent `will-change`, timers, scroll handlers, or animation frameworks are used.

Builder chrome includes restrained panel/dialog/disclosure entrances, device/control/card state transitions, grip tooltips, and neon-green selection/insertion/drop feedback. Native select menus retain browser behavior; role-based menu/tab motion primitives are available for custom controls. Native dragging moves sections within the page and blocks within their section. Arrow keys on grips and the existing outline buttons provide keyboard/touch alternatives. Closed narrow-screen drawers are hidden from keyboard navigation. User-site animation never applies neon colors.

`AmbientVisual` is a reusable, inert SVG grid/node/line layer with a CSS glow and a single short entrance. It is used in the auth visual and landing hero, inherits surface color, and respects reduced motion. No perpetual particle simulation, Canvas loop, or 3D dependency is needed.

## Files

- Model: `src/models/siteMotion.js`, `src/models/siteEditor.js`.
- Runtime: `src/hooks/useSiteMotion.js`, `src/hooks/useCanvasDrop.js`.
- Builder: `src/components/editor/MotionSettings.jsx`, `CanvasDrag.jsx`, `EditorCanvas.jsx`, `SectionRenderer.jsx`, `EditorSettingsPanel.jsx`; `src/pages/SiteEditorPage.jsx`.
- Visual foundation: `src/components/common/AmbientVisual.jsx`, `src/layouts/AuthLayout.jsx`, `src/pages/LandingPage.jsx`.
- Styles/imports: `src/styles/site-motion.css`, `src/styles/builder-motion.css`, `src/main.jsx`.
- Localization: `src/i18n/motionLocales.js`, `src/i18n/locales/az.js`, `src/i18n/locales/en.js`. Azerbaijani first, matching English translations.
- Checks: `scripts/validation/phase12-check.cjs`; this document.

## Verification

Run `npm run lint` and `npm run build`. Browser checks use an already available Playwright installation (no project dependency added): start Vite on port 5173, set `PLAYWRIGHT_MODULE` to the installed `playwright-core` module path, and run `node scripts/validation/phase12-check.cjs`.

The checks exercise metadata roundtrips and duplication, unchanged content, validation/defaults, Azerbaijani controls, local Preview behavior, keyboard/native drag reordering, one-time scroll entrances including tall targets, focus visibility, initial/live reduced motion, mobile timing, narrow drawers, and the landing decoration. This is targeted Chromium coverage, not a full cross-browser or assistive-technology audit.

Results: production build passed; all Phase 12 browser checks passed without browser runtime errors. Lint exits successfully with one pre-existing `react(set-state-in-effect)` warning at `src/pages/SiteSettingsPage.jsx:102`; no new warnings. The first sandboxed build encountered `spawn EPERM`; the permitted build completed successfully.
