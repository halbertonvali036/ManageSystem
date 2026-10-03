import '@/styles/sidebar-ambient-mesh.css'

/* Geometry is declared, not generated. A fixed set of paths means the mesh is
   byte-identical on every mount, so nothing re-renders to animate it: the
   browser only ever composites `transform` and `opacity`, never re-laying out
   or re-rasterising path geometry. */

const LATTICE_COLUMNS = [
  'M15 -60 C70 130 -5 320 45 490 S90 730 20 1060',
  'M62 -60 C117 150 42 340 92 510 S137 760 67 1060',
  'M109 -60 C164 130 89 330 139 500 S184 750 114 1060',
  'M156 -60 C211 150 136 320 186 510 S231 760 161 1060',
  'M203 -60 C258 130 183 340 233 490 S278 730 208 1060',
  'M250 -60 C305 150 230 320 280 510 S325 760 255 1060',
]

const LATTICE_ROWS = [
  'M-60 60 C50 10 170 120 320 70',
  'M-60 165 C70 210 190 110 320 175',
  'M-60 270 C50 225 180 325 320 265',
  'M-60 375 C80 420 190 315 320 385',
  'M-60 480 C60 435 180 540 320 475',
  'M-60 585 C70 630 190 525 320 595',
  'M-60 690 C50 645 180 750 320 685',
  'M-60 795 C80 840 190 735 320 805',
  'M-60 900 C60 855 180 960 320 895',
  'M-60 995 C70 1040 190 940 320 1005',
]

/* Two weights, four layers. The wide soft band sits furthest back to give the
   rail depth; the thin bright line in front carries the neon accent so the
   effect reads clearly rather than as a wash. */
const RIBBONS = [
  {
    key: 'back',
    d: 'M-30 240 C60 320 200 380 140 500 C80 620 20 700 170 830',
    className: 'sidebar-ambient-mesh__ribbon--back',
  },
  {
    key: 'mid-a',
    d: 'M-20 70 C70 170 200 240 140 360 C80 480 30 540 140 650 C230 740 200 820 80 930',
    className: 'sidebar-ambient-mesh__ribbon--mid-a',
  },
  {
    key: 'mid-b',
    d: 'M280 30 C180 140 70 220 150 340 C230 470 180 550 80 650 C10 730 60 840 190 940',
    className: 'sidebar-ambient-mesh__ribbon--mid-b',
  },
  {
    key: 'front',
    d: 'M270 180 C170 280 100 320 160 430 C230 550 200 630 100 730 C40 790 80 860 200 930',
    className: 'sidebar-ambient-mesh__ribbon--front',
  },
]

/* Positions sit on or beside the ribbon crests, so the glow reads as the
   light travelling along the line rather than as loose confetti. Weighted
   towards the far edge of the rail, clear of the label column. */
const NODES = [
  { cx: 140, cy: 360, r: 6, size: 1.2, depth: 0 },
  { cx: 140, cy: 650, r: 7, size: 1.4, depth: 1 },
  { cx: 80, cy: 930, r: 5, size: 1, depth: 2 },
  { cx: 150, cy: 340, r: 5, size: 1.1, depth: 2 },
  { cx: 80, cy: 650, r: 6, size: 1.25, depth: 1 },
  { cx: 215, cy: 500, r: 4.4, size: 1, depth: 3 },
  { cx: 60, cy: 240, r: 5, size: 1.1, depth: 3 },
  { cx: 205, cy: 762, r: 5.6, size: 1.2, depth: 1 },
  { cx: 110, cy: 830, r: 4, size: 0.9, depth: 2 },
  { cx: 230, cy: 300, r: 4.2, size: 0.95, depth: 3 },
  { cx: 195, cy: 120, r: 3.6, size: 0.85, depth: 2 },
  { cx: 45, cy: 520, r: 3.4, size: 0.8, depth: 3 },
]

/**
 * Decorative emerald mesh that fills the navigation rail behind the menu.
 *
 * The rail is the one surface present in every signed-in screen and in both the
 * user and Admin shells, so the effect lives here once instead of per page. It
 * is intentionally loud enough to be noticed on arrival, then quiet enough that
 * a label is never hard to read: the ribbons drift and a highlight runs along
 * them, while a veil and a left-weighted scrim hold the text column down.
 *
 * Purely decorative, so it is hidden from assistive technology and carries no
 * interaction: `aria-hidden` plus `pointer-events: none` mean it can never take a
 * click or a focus away from the navigation.
 *
 * Rendered inside `.app-sidebar`, whose own reduced-motion rule already freezes
 * every animation in here; the explicit block at the end of the stylesheet keeps
 * that guarantee local and holds the composition still rather than collapsed.
 */
export default function SidebarAmbientMesh({ collapsed = false, variant = 'user' }) {
  return (
    <div
      className={`sidebar-ambient-mesh sidebar-ambient-mesh--${variant}`}
      data-collapsed={collapsed ? 'true' : undefined}
      aria-hidden="true"
    >
      <svg
        className="sidebar-ambient-mesh__canvas"
        viewBox="0 0 260 1000"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {/* Two counter-drifting lattices. Because the column and row sets move at
            different rates the grid never reads as a static grid: it appears to
            ripple and deform without a single path being re-tessellated. */}
        <g className="sidebar-ambient-mesh__lattice sidebar-ambient-mesh__lattice--columns">
          {LATTICE_COLUMNS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="sidebar-ambient-mesh__lattice sidebar-ambient-mesh__lattice--rows">
          {LATTICE_ROWS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        <g className="sidebar-ambient-mesh__ribbons">
          {RIBBONS.map((ribbon) => (
            <g key={ribbon.key} className={ribbon.className}>
              {/* The solid ribbon carries the body of the colour. */}
              <path className="sidebar-ambient-mesh__ribbon-body" d={ribbon.d} />
              {/* A dashed copy travels along the same line to read as flow. */}
              <path className="sidebar-ambient-mesh__ribbon-flow" d={ribbon.d} />
            </g>
          ))}
        </g>

        <g className="sidebar-ambient-mesh__nodes">
          {NODES.map((node, index) => (
            <circle
              key={`${node.cx}-${node.cy}`}
              className="sidebar-ambient-mesh__node"
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              style={{
                '--node-scale': node.size,
                '--node-depth': node.depth,
                '--node-duration': `${26 + node.depth * 9}s`,
                '--node-delay': `${-index * 3.4}s`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* Broad low bloom: warmth in the lower half where the menu runs out, so
          the glow never sits under the brand row. */}
      <span className="sidebar-ambient-mesh__bloom" />

      {/* Two gradients doing one job. The vertical one anchors the brand row and
          the identity footer; the horizontal one darkens the icon and label
          column. What survives between them is enough mesh to be clearly seen. */}
      <span className="sidebar-ambient-mesh__veil" />

      {/* A nav item that is selected is where the eye already is, so the rail
          answers with a little more light there. `:has()` keeps it attached to
          the real selection instead of tracking positions in script. */}
      <span className="sidebar-ambient-mesh__active-glow" />
    </div>
  )
}
