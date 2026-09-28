// Run against Vite with PLAYWRIGHT_MODULE pointing to an available playwright-core.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => sessionStorage.setItem('managesystem-auth-session', JSON.stringify({ token: 'local-ui-check', user: { id: 'local-ui-check', role: 'user', name: 'UI check' } })))
    await page.goto('http://127.0.0.1:5173/sites/local-check/editor')
    await page.locator('#editor-preview-toggle').waitFor()
    const model = await page.evaluate(async () => {
      const e = await import('/src/models/siteEditor.js')
      const m = await import('/src/models/siteMotion.js')
      const { translate } = await import('/src/i18n/dictionary.js')
      let doc = e.createLocalDraftDocument()
      const section = e.getActivePage(doc).sections[0]
      const block = section.blocks[0]
      const originalContent = JSON.stringify(block.content)
      doc = e.updateSection(doc, section.id, { animation: { type: 'slide-up', duration: 700, trigger: 'load' } })
      doc = e.updateBlock(doc, block.id, { animation: { type: 'fade', delay: 250 } })
      doc = e.updateSiteMotion(doc, { preset: 'expressive' })
      doc = e.updateBlock(doc, block.id, { style: { fontSize: 32 } })
      const roundtrip = e.normalizeEditorDocument(e.buildEditorDraftPayload(doc))
      const currentSection = e.getActivePage(roundtrip).sections[0]
      const currentBlock = currentSection.blocks[0]
      const duplicate = e.duplicateSection(doc, section.id)
      const copied = e.getSectionById(e.getActivePage(duplicate.document), duplicate.insertedId)
      const invalid = m.normalizeAnimation({ type: 'url(x)', duration: Infinity, delay: -10, easing: 'steps(9)', trigger: 'timeline' })
      const mobile = m.resolveAnimation({ type: 'slide-up', duration: 1200, delay: 2000 }, doc.motion, 'mobile')
      return {
        roundtrip: currentSection.animation.type === 'slide-up' && currentSection.animation.duration === 700 && currentBlock.animation.delay === 250 && roundtrip.motion.preset === 'expressive',
        independent: JSON.stringify(currentBlock.content) === originalContent && currentBlock.style.fontSize === 32,
        duplicated: copied.id !== section.id && copied.animation.duration === 700 && copied.blocks[0].animation.delay === 250,
        defaults: m.resolveAnimation(currentBlock.animation, doc.motion).duration === 580 && m.resolveAnimation(currentSection.animation, doc.motion).duration === 700,
        invalid: invalid.type === 'none' && invalid.duration === null && invalid.delay === 0 && invalid.easing === 'ease-out' && invalid.trigger === 'scroll',
        mobile: mobile.distance === 8 && mobile.duration === 300 && mobile.delay === 200,
        legacy: e.normalizeEditorDocument({ pages: [{ sections: [{ blocks: [{}] }] }] }).pages[0].sections[0].animation.type === 'none',
        translations: ['az', 'en'].every(locale => m.MOTION_TYPES.every(type => !translate(`motion.effects.${type}`, locale).startsWith('motion.'))),
      }
    })
    for (const [key, value] of Object.entries(model)) assert.equal(value, true, key)
    console.log('PASS model: legacy defaults, validation, partial edits, roundtrip, duplication, content isolation, preset inheritance, mobile bounds, localization')

    const togglePreview = async () => {
      if (await page.locator('#editor-preview-toggle').count()) await page.locator('#editor-preview-toggle').click()
      else await page.keyboard.press('Escape')
    }
    const section = page.locator('.editor-canvas__section').first()
    const sectionId = await section.getAttribute('data-section-id')
    await section.locator('.editor-canvas__section-band').focus()
    await page.keyboard.press('Enter')
    const settings = page.locator('.motion-settings')
    await settings.getByLabel(/^Effekt/).selectOption('slide-up')
    await settings.getByLabel(/^Başlama anı/).selectOption('load')
    await settings.getByLabel(/^Saytın hərəkət üslubu/).selectOption('expressive')
    assert.equal(await page.locator('[data-motion-state]').count(), 0, 'editor stays static')
    await togglePreview()
    const previewSection = page.locator(`[data-section-id="${sectionId}"]`)
    assert.equal(await previewSection.getAttribute('data-site-motion'), 'slide-up')
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).getPropertyValue('--site-motion-duration').trim()), '580ms')
    await page.waitForFunction(() => !document.querySelector('[data-motion-state]'))
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).opacity), '1')
    assert.equal(await page.locator('.canvas-drag-handle').count(), 0)
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).outlineStyle), 'none')
    await togglePreview()

    // Reorder a block with a grip keyboard shortcut, then native drag back.
    const blocks = section.locator('[data-block-id]')
    const firstId = await blocks.first().getAttribute('data-block-id')
    const secondId = await blocks.nth(1).getAttribute('data-block-id')
    const grip = section.locator('.editor-canvas__block-slot > .canvas-drag-handle').first()
    await grip.focus()
    await page.keyboard.press('ArrowDown')
    assert.equal(await blocks.first().getAttribute('data-block-id'), secondId)
    const source = section.locator('.editor-canvas__block-slot').filter({ has: page.locator(`[data-block-id="${firstId}"]`) }).locator(':scope > .canvas-drag-handle')
    await source.dragTo(page.locator(`[data-block-id="${secondId}"]`))
    assert.equal(await blocks.first().getAttribute('data-block-id'), firstId)
    await page.screenshot({ path: require('node:path').join(require('node:os').tmpdir(), 'phase12-editor.png') })
    console.log('PASS builder: local controls, static editing, preview inheritance, clean preview chrome, keyboard and native drag reorder')

    // Exercise the reusable runtime in an isolated scroll viewport, including a
    // tall target and a delayed focusable child. No backend is involved.
    await page.evaluate(async () => {
      const reactModule = await import('/node_modules/.vite/deps/react.js')
      const React = reactModule.default ?? reactModule
      const clientModule = await import('/node_modules/.vite/deps/react-dom_client.js')
      const { createRoot } = clientModule.default ?? clientModule
      const { default: useSiteMotion } = await import('/src/hooks/useSiteMotion.js')
      const { getMotionProps } = await import('/src/models/siteMotion.js')
      const h = React.createElement
      function Fixture() {
        const ref = useSiteMotion(true, 'fixture')
        return h('div', { ref, id: 'motion-fixture', style: { position: 'fixed', inset: 0, overflow: 'auto', zIndex: 999, background: 'white' } },
          h('div', { style: { height: '1400px' } }, 'Scroll'),
          h('div', { id: 'scroll-target', ...getMotionProps({ type: 'fade', duration: 100, trigger: 'scroll' }, {}, 'desktop', true) }, h('div', { style: { height: '1200px' } }, 'Tall target')),
          h('div', { id: 'focus-target', ...getMotionProps({ type: 'slide-up', delay: 2000, trigger: 'scroll' }, {}, 'desktop', true) }, h('button', { id: 'focus-button' }, 'Focus')))
      }
      const host = document.createElement('div')
      document.body.append(host)
      window.motionFixtureRoot = createRoot(host)
      window.motionFixtureRoot.render(h(Fixture))
    })
    await page.waitForSelector('#scroll-target[data-motion-state="pending"]', { state: 'attached' })
    await page.locator('#motion-fixture').evaluate(node => { node.scrollTop = 1450 })
    await page.waitForFunction(() => !document.querySelector('#scroll-target').hasAttribute('data-motion-state'))
    await page.locator('#motion-fixture').evaluate(node => { node.scrollTop = 0 })
    await page.locator('#motion-fixture').evaluate(node => { node.scrollTop = 1450 })
    assert.equal(await page.locator('#scroll-target').getAttribute('data-motion-state'), null)
    await page.locator('#focus-button').focus()
    assert.equal(await page.locator('#focus-target').evaluate(node => getComputedStyle(node).opacity), '1')
    await page.evaluate(() => window.motionFixtureRoot.unmount())

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await togglePreview()
    assert.equal(await page.locator('[data-motion-state]').count(), 0)
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).animationName), 'none')
    await togglePreview()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.getByRole('button', { name: 'Mobil', exact: true }).click()
    await togglePreview()
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).getPropertyValue('--site-motion-duration').trim()), '300ms')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).opacity), '1')
    await page.waitForFunction(() => !document.querySelector('[data-motion-state]'))
    console.log('PASS runtime: scroll once, tall targets, focus visibility, initial/live reduced motion, mobile timing')
    await togglePreview()
    await page.setViewportSize({ width: 390, height: 844 })
    for (const button of await page.locator('.editor-panel.is-open .editor-panel__close').all()) await button.click()
    assert.equal(await page.locator('.editor-panel--left').evaluate(node => getComputedStyle(node).visibility), 'hidden')
    assert.equal(await page.locator('.editor-panel--right').evaluate(node => getComputedStyle(node).visibility), 'hidden')
    await togglePreview()
    assert.equal(await previewSection.evaluate(node => getComputedStyle(node).opacity), '1')
    const publicPage = await browser.newPage({ reducedMotion: 'reduce' })
    publicPage.on('pageerror', error => errors.push(error.message))
    await publicPage.goto('http://127.0.0.1:5173/')
    await publicPage.locator('.ambient-visual svg').waitFor({ state: 'attached' })
    assert.equal(await publicPage.locator('.ambient-visual').getAttribute('aria-hidden'), 'true')
    assert.equal(await publicPage.locator('.ambient-visual__nodes').evaluate(node => getComputedStyle(node).animationName), 'none')
    await publicPage.goto('http://127.0.0.1:5173/login')
    await publicPage.locator('.auth-visual .ambient-visual svg').waitFor({ state: 'attached' })
    console.log('PASS narrow viewport, closed drawer focus protection and reduced-motion landing foundation')
    assert.deepEqual(errors, [])
    console.log('PASS no browser runtime errors')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
