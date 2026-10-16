/**
 * Site theme presets — the theme of a *user-created website*.
 *
 * This is deliberately separate from the builder's own interface. The builder
 * chrome (editor panels, canvas frame, buttons) is our product design and always
 * uses the neon tokens in `theme.css`. The theme below paints only what a visitor
 * would see on the published site, inside the canvas.
 *
 * That separation is the point: a website created in this builder is never
 * forced to look like the product that built it. Every preset here is an
 * ordinary, non-neon design, and a user who wants a different accent picks their
 * own colour rather than inheriting ours.
 *
 * No preset is a "finished design". Each is a small token set — fonts, one
 * accent, a background/surface pair, a text colour and a radius scale — which
 * the canvas turns into CSS custom properties scoped to the canvas only.
 */

/** Font stacks are named so presets stay readable and no font is fetched. */
export const SITE_FONT_STACKS = Object.freeze({
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
})

export const SITE_FONT_STACK_IDS = Object.freeze(Object.keys(SITE_FONT_STACKS))

/**
 * Colours a block or section may reference by name.
 *
 * A style value may be a literal colour (`#0a140d`) or one of these tokens. Only
 * this exact list resolves to a `var()` reference, so a style value can never
 * smuggle an arbitrary CSS expression into the page.
 */
export const SITE_COLOR_TOKENS = Object.freeze([
  'primary',
  'border',
  'accent',
  'accent-soft',
  'background',
  'surface',
  'text',
  'muted',
])

const isSiteColorToken = (value) => SITE_COLOR_TOKENS.includes(value)

/**
 * Resolves a stored colour to a CSS value.
 *
 * Named tokens become canvas-scoped custom properties; anything else is already
 * a validated literal colour and is returned untouched. `var(...)` and any other
 * raw function are rejected upstream by the editor's colour validation, so this
 * function never has to sanitise a caller's CSS.
 */
export const resolveSiteColor = (value) => {
  if (typeof value !== 'string' || value === '') {
    return undefined
  }
  return isSiteColorToken(value) ? `var(--site-${value})` : value
}

/** The radius scale a preset applies, used as the default for new elements. */
export const SITE_RADIUS_MIN = 0
export const SITE_RADIUS_MAX = 32

/**
 * @typedef {Object} SiteThemeTokens
 * @property {string} fontHeading  Font stack for headings.
 * @property {string} fontBody     Font stack for body copy.
 * @property {string} accent       Primary accent colour.
 * @property {string} accentSoft   Tinted accent for quiet backgrounds.
 * @property {string} background   Page background.
 * @property {string} surface      Raised surface behind content.
 * @property {string} text         Body text colour.
 * @property {string} muted        Secondary text colour.
 * @property {number} radiusScale  Base corner radius in px.
 */

export const SITE_DESIGN_BOUNDS = Object.freeze({
  radiusScale: [0, 32, 1], baseSize: [12, 24, 1], headingScale: [1.25, 3, 0.05],
  lineHeight: [1.2, 2, 0.05], bodyWeight: [300, 700, 100], headingWeight: [400, 900, 100],
  contentWidth: [640, 1600, 20], spacingScale: [0.5, 2, 0.25],
  buttonRadius: [0, 32, 1], buttonHeight: [36, 64, 2], buttonPadding: [6, 24, 1], buttonWeight: [400, 800, 100],
})
export const SITE_DESIGN_COLORS = ['primary', 'accent', 'background', 'surface', 'text', 'muted', 'border']
export const isSiteHexColor = (value) => typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
const designDefaults = { baseSize: 16, headingScale: 2.25, lineHeight: 1.6, bodyWeight: 400, headingWeight: 700, contentWidth: 1120, spacingScale: 1, buttonRadius: null, buttonHeight: 44, buttonPadding: 12, buttonWeight: 600, border: '#c3cec8' }
const starter = (id, tokens) => ({ id, nameKey: `siteDesign.presets.${id}`, descriptionKey: 'siteDesign.presetHint', tokens: Object.freeze({
  fontHeading: SITE_FONT_STACKS.sans, fontBody: SITE_FONT_STACKS.sans,
  primary: '#243c32', accent: '#855134', accentSoft: '#edf1ee', background: '#ffffff', surface: '#f5f7f5', text: '#17231d', muted: '#536159', radiusScale: 8,
  ...designDefaults, ...tokens,
}) })

export const SITE_THEME_PRESETS = Object.freeze([
  starter('minimal', { primary: '#202020', accent: '#595959', background: '#ffffff', surface: '#f5f5f5', text: '#202020', muted: '#626262', border: '#bdbdbd', radiusScale: 4 }),
  starter('modern', { primary: '#285b89', accent: '#85482f', accentSoft: '#e8f0f8', background: '#fafcff', surface: '#eef3f8', text: '#152c40', muted: '#4d6275', border: '#afc0cf', radiusScale: 12 }),
  starter('bold', { primary: '#a02e32', accent: '#7a491b', accentSoft: '#f8e8e3', background: '#fff9f5', surface: '#fff0e7', text: '#251b18', muted: '#69544c', border: '#cab3a8', radiusScale: 0, headingScale: 2.7, headingWeight: 800, spacingScale: 1.25 }),
  starter('elegant', { primary: '#58436d', accent: '#7d5c2f', accentSoft: '#eee8f3', background: '#fcfaf6', surface: '#f3eee7', text: '#2d2631', muted: '#695d6c', border: '#c5b9c9', radiusScale: 6, fontHeading: SITE_FONT_STACKS.serif, headingWeight: 500, lineHeight: 1.75 }),
  {
    id: 'aurora',
    nameKey: 'siteTheme.aurora.name',
    descriptionKey: 'siteTheme.aurora.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      accent: '#2f7d5b',
      accentSoft: '#e3f1e9',
      background: '#f6faf7',
      surface: '#ffffff',
      text: '#12211a',
      muted: '#5b6f65',
      radiusScale: 12,
    }),
  },
  {
    id: 'ink',
    nameKey: 'siteTheme.ink.name',
    descriptionKey: 'siteTheme.ink.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.serif,
      fontBody: SITE_FONT_STACKS.serif,
      accent: '#3b4a7a',
      accentSoft: '#e6e9f2',
      background: '#fbfbfa',
      surface: '#ffffff',
      text: '#1a1a19',
      muted: '#61615c',
      radiusScale: 4,
    }),
  },
  {
    id: 'sand',
    nameKey: 'siteTheme.sand.name',
    descriptionKey: 'siteTheme.sand.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      accent: '#9a5b23',
      accentSoft: '#f6ead9',
      background: '#fdf9f3',
      surface: '#fffdfa',
      text: '#2b2118',
      muted: '#6f6154',
      radiusScale: 18,
    }),
  },
  {
    id: 'graphite',
    nameKey: 'siteTheme.graphite.name',
    descriptionKey: 'siteTheme.graphite.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      accent: '#4a5560',
      accentSoft: '#e9edf1',
      background: '#f4f6f8',
      surface: '#ffffff',
      text: '#161b21',
      muted: '#57606a',
      radiusScale: 8,
    }),
  },
  {
    id: 'midnight',
    nameKey: 'siteTheme.midnight.name',
    descriptionKey: 'siteTheme.midnight.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      accent: '#7cc4a0',
      accentSoft: '#1c2a26',
      background: '#0f1512',
      surface: '#161e1a',
      text: '#eef3f0',
      muted: '#a3b3ab',
      radiusScale: 10,
    }),
  },
  {
    id: 'saas',
    nameKey: 'siteTheme.saas.name',
    descriptionKey: 'siteTheme.saas.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#4338ca',
      accent: '#6366f1',
      accentSoft: '#eef2ff',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      radiusScale: 12,
      headingScale: 2.35,
      headingWeight: 800,
      buttonRadius: 10,
      spacingScale: 1.25,
    }),
  },
  {
    id: 'atelier',
    nameKey: 'siteTheme.atelier.name',
    descriptionKey: 'siteTheme.atelier.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.serif,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#1a1a1a',
      accent: '#8a5a2b',
      accentSoft: '#f1ede6',
      background: '#faf9f7',
      surface: '#f2f0ec',
      text: '#1a1a1a',
      muted: '#6b6b6b',
      border: '#dedbd4',
      radiusScale: 2,
      headingScale: 2.9,
      headingWeight: 500,
      lineHeight: 1.7,
    }),
  },
  {
    id: 'nova',
    nameKey: 'siteTheme.nova.name',
    descriptionKey: 'siteTheme.nova.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#3b82f6',
      accent: '#7c5cff',
      accentSoft: '#141c33',
      background: '#070b14',
      surface: '#0e1626',
      text: '#e8eefc',
      muted: '#93a2c4',
      border: '#1c2740',
      radiusScale: 14,
      headingScale: 2.6,
      headingWeight: 800,
    }),
  },
  {
    id: 'maison',
    nameKey: 'siteTheme.maison.name',
    descriptionKey: 'siteTheme.maison.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.serif,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#2f2a24',
      accent: '#8a6a3b',
      accentSoft: '#f0e9dd',
      background: '#f7f4ee',
      surface: '#ffffff',
      text: '#1f1b16',
      muted: '#6f665a',
      radiusScale: 0,
      headingScale: 2.8,
      headingWeight: 500,
      lineHeight: 1.7,
      spacingScale: 1.25,
    }),
  },
  {
    /*
     * Agency.
     *
     * A clean, professional studio palette: achromatic surfaces and type, with a
     * single bold signal colour. Bold sans headings and a modest radius keep it
     * contemporary without drifting into the futuristic end of the library.
     */
    id: 'agency',
    nameKey: 'siteTheme.agency.name',
    descriptionKey: 'siteTheme.agency.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#111319',
      accent: '#f4511e',
      accentSoft: '#fff0e8',
      background: '#ffffff',
      surface: '#f4f5f7',
      text: '#101114',
      muted: '#5b6069',
      border: '#dcdfe4',
      radiusScale: 10,
      headingScale: 2.5,
      headingWeight: 800,
      buttonRadius: 8,
      spacingScale: 1.25,
    }),
  },
  {
    id: 'bistro',
    nameKey: 'siteTheme.bistro.name',
    descriptionKey: 'siteTheme.bistro.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.serif,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#5a2f18',
      accent: '#a85423',
      accentSoft: '#f5e7d8',
      background: '#fbf6ef',
      surface: '#ffffff',
      text: '#2a211b',
      muted: '#71655a',
      border: '#e6dccf',
      radiusScale: 6,
      headingScale: 2.6,
      headingWeight: 600,
      lineHeight: 1.7,
      spacingScale: 1.25,
    }),
  },
  {
    id: 'vertex',
    nameKey: 'siteTheme.vertex.name',
    descriptionKey: 'siteTheme.vertex.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#111111',
      accent: '#2f3cff',
      accentSoft: '#eceafe',
      background: '#f2f1ee',
      surface: '#ffffff',
      text: '#0d0d0d',
      muted: '#6d6d6a',
      border: '#dcdcd6',
      radiusScale: 0,
      headingScale: 3,
      headingWeight: 700,
      lineHeight: 1.65,
      contentWidth: 1280,
      spacingScale: 1.5,
    }),
  },
  {
    id: 'noir',
    nameKey: 'siteTheme.noir.name',
    descriptionKey: 'siteTheme.noir.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#c9a227',
      accent: '#d8b26a',
      accentSoft: '#241f15',
      background: '#0a0a0b',
      surface: '#141416',
      text: '#f2f1ee',
      muted: '#9c9a95',
      border: '#232326',
      radiusScale: 2,
      headingScale: 2.9,
      headingWeight: 700,
      lineHeight: 1.65,
      spacingScale: 1.25,
    }),
  },
  {
    /*
     * Corporate.
     *
     * A trustworthy business palette: deep navy type, a single restrained teal
     * accent and cool grey surfaces. Sans headings, firm corners and an ordinary
     * scale keep it professional rather than fashionable.
     */
    id: 'corporate',
    nameKey: 'siteTheme.corporate.name',
    descriptionKey: 'siteTheme.corporate.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#16283d',
      accent: '#0f766e',
      accentSoft: '#e4f1ef',
      background: '#ffffff',
      surface: '#f4f7f9',
      text: '#101828',
      muted: '#5a6472',
      border: '#dbe2e8',
      radiusScale: 8,
      headingScale: 2.25,
      headingWeight: 700,
      buttonRadius: 6,
    }),
  },
  {
    /*
     * Forge.
     *
     * Industrial and structural: a concrete-grey page, near-black type, a single
     * safety-amber accent and almost no corner radius. Heavy headings and tight
     * line height give it the weight a construction or engineering firm wants,
     * and it shares none of the softness of the agency or corporate themes.
     */
    id: 'forge',
    nameKey: 'siteTheme.forge.name',
    descriptionKey: 'siteTheme.forge.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#1a1f24',
      accent: '#f59e0b',
      accentSoft: '#fdf3e0',
      background: '#eef0f1',
      surface: '#ffffff',
      text: '#14181d',
      muted: '#5c656d',
      border: '#d7dbdd',
      radiusScale: 2,
      headingScale: 2.75,
      headingWeight: 800,
      lineHeight: 1.55,
      contentWidth: 1200,
      spacingScale: 1.25,
    }),
  },
  {
    /*
     * Aurelia.
     *
     * A warm wellness palette: soft ivory, a muted clay accent and serif
     * headings, with very generous spacing and round corners. It is deliberately
     * quieter than Maison's brass-and-ivory formality and warmer than Bistro's
     * terracotta, so a spa does not read as a restaurant or an architecture firm.
     */
    id: 'aurelia',
    nameKey: 'siteTheme.aurelia.name',
    descriptionKey: 'siteTheme.aurelia.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.serif,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#3a2f29',
      accent: '#b07d62',
      accentSoft: '#f3e7de',
      background: '#faf6f1',
      surface: '#ffffff',
      text: '#2c2724',
      muted: '#796c64',
      border: '#e9ded4',
      radiusScale: 20,
      headingScale: 2.7,
      headingWeight: 500,
      lineHeight: 1.8,
      spacingScale: 1.5,
      buttonRadius: 24,
      buttonWeight: 500,
    }),
  },
  {
    /*
     * Ledger.
     *
     * A modern finance palette: a bright, cool page with a deep-ink counterpoint
     * and a single restrained cyan accent. Precise, medium-scale headings and
     * moderate corners keep it product-led without borrowing Nova's dark violet
     * world — the two templates should never read as the same site.
     */
    id: 'ledger',
    nameKey: 'siteTheme.ledger.name',
    descriptionKey: 'siteTheme.ledger.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#0b1f2a',
      accent: '#0e7490',
      accentSoft: '#e0f2fe',
      background: '#f7fafb',
      surface: '#ffffff',
      text: '#0b1f2a',
      muted: '#5b717a',
      border: '#dbe7ec',
      radiusScale: 14,
      headingScale: 2.35,
      headingWeight: 700,
      buttonRadius: 10,
    }),
  },
  {
    /*
     * Atlas.
     *
     * A dark slate application world: a deep slate page, a raised slate surface,
     * an emerald primary for actions and a sky-blue accent for labels and data.
     * Compact corners and a smaller heading scale keep it reading as a product
     * screen rather than a marketing page. It shares the dark family with Nova and
     * Noir but neither the navy/violet nor the near-black/gold palette, so the
     * three never read as the same site.
     */
    id: 'atlas',
    nameKey: 'siteTheme.atlas.name',
    descriptionKey: 'siteTheme.atlas.description',
    tokens: Object.freeze({
      fontHeading: SITE_FONT_STACKS.sans,
      fontBody: SITE_FONT_STACKS.sans,
      primary: '#10b981',
      accent: '#38bdf8',
      accentSoft: '#0c2536',
      background: '#0b1120',
      surface: '#141d30',
      text: '#e2e8f0',
      muted: '#94a3b8',
      border: '#26314a',
      radiusScale: 10,
      headingScale: 2.1,
      headingWeight: 700,
      lineHeight: 1.5,
      spacingScale: 0.9,
      buttonRadius: 8,
      buttonWeight: 600,
    }),
  },
])

export const SITE_THEME_IDS = Object.freeze(
  SITE_THEME_PRESETS.map((preset) => preset.id),
)

export const SITE_THEME_BY_ID = Object.freeze(
  Object.fromEntries(SITE_THEME_PRESETS.map((preset) => [preset.id, preset])),
)

export const DEFAULT_SITE_THEME_ID = 'aurora'

export const isValidSiteThemeId = (value) => SITE_THEME_IDS.includes(value)

export const getSiteTheme = (id) =>
  SITE_THEME_BY_ID[id] ?? SITE_THEME_BY_ID[DEFAULT_SITE_THEME_ID]

/** Strict, idempotent token normalization for local drafts and future API data. */
export const normalizeSiteTheme = (raw) => {
  const preset = getSiteTheme(typeof raw === 'string' ? raw : raw?.themePresetId)
  const base = { ...designDefaults, ...preset.tokens, primary: preset.tokens.primary ?? preset.tokens.accent }
  const tokens = raw && typeof raw === 'object' ? raw.tokens ?? {} : {}
  for (const key of ['fontHeading', 'fontBody']) {
    if (SITE_FONT_STACK_IDS.includes(tokens[key])) base[key] = SITE_FONT_STACKS[tokens[key]]
    else if (Object.values(SITE_FONT_STACKS).includes(tokens[key])) base[key] = tokens[key]
  }
  for (const key of [...SITE_DESIGN_COLORS, 'accentSoft']) {
    if (isSiteHexColor(tokens[key])) base[key] = tokens[key]
  }
  for (const [key, [min, max]] of Object.entries(SITE_DESIGN_BOUNDS)) {
    if (typeof tokens[key] === 'number' && Number.isFinite(tokens[key])) base[key] = Math.min(max, Math.max(min, tokens[key]))
  }
  if (tokens.buttonRadius === null) base.buttonRadius = null
  return { themePresetId: preset.id, tokens: base }
}

// Readability aid for solid button text only; never a WCAG compliance claim.
export const siteButtonTextColor = (hex) => {
  const full = hex.length === 4 ? '#' + [...hex.slice(1)].map(char => char + char).join('') : hex
  const rgb = [1, 3, 5].map(offset => parseInt(full.slice(offset, offset + 2), 16) / 255)
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
  return luminance > .179 ? '#000000' : '#ffffff'
}

/**
 * Turns theme tokens into CSS custom properties.
 *
 * The names are prefixed `--site-` on purpose: they only ever resolve inside the
 * canvas, so a user's website theme can never restyle the builder around it.
 */
export const getSiteThemeCssVars = (theme) => {
  const { tokens } = normalizeSiteTheme(theme)
  return {
    '--site-primary': tokens.primary,
    '--site-on-primary': siteButtonTextColor(tokens.primary),
    '--site-on-accent': siteButtonTextColor(tokens.accent),
    '--site-border': tokens.border,
    '--site-base-size': `${tokens.baseSize}px`,
    '--site-heading-size': `${tokens.baseSize * tokens.headingScale}px`,
    '--site-line-height': tokens.lineHeight,
    '--site-body-weight': tokens.bodyWeight,
    '--site-heading-weight': tokens.headingWeight,
    '--site-content-width': `${tokens.contentWidth}px`,
    '--site-space': `${8 * tokens.spacingScale}px`,
    '--site-section-space': `${48 * tokens.spacingScale}px`,
    '--site-gutter': `${20 * tokens.spacingScale}px`,
    '--site-button-radius': `${tokens.buttonRadius ?? tokens.radiusScale}px`,
    '--site-button-height': `${tokens.buttonHeight}px`,
    '--site-button-padding': `${tokens.buttonPadding}px`,
    '--site-button-weight': tokens.buttonWeight,
    '--site-font-heading': tokens.fontHeading,
    '--site-font-body': tokens.fontBody,
    '--site-accent': tokens.accent,
    '--site-accent-soft': tokens.accentSoft,
    '--site-background': tokens.background,
    '--site-surface': tokens.surface,
    '--site-text': tokens.text,
    '--site-muted': tokens.muted,
    '--site-radius': `${tokens.radiusScale}px`,
  }
}

export default SITE_THEME_PRESETS
