// Run against Vite with PLAYWRIGHT_MODULE pointing to an available playwright-core.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.addInitScript(() => sessionStorage.setItem('managesystem-auth-session', JSON.stringify({ token: 'local-ui-check', user: { id: 'local-ui-check', role: 'user', name: 'UI check' } })))
    await page.goto('http://localhost:5173/sites/local-check/editor')
    await page.locator('#editor-preview-toggle').waitFor()
    const model = await page.evaluate(async () => {
      const e = await import('/src/models/siteEditor.js')
      const t = await import('/src/models/siteTheme.js')
      let doc = e.createLocalDraftDocument()
      const section = e.getActivePage(doc).sections[0]
      const block = section.blocks[0]
      const sparse = section.blocks.every(block => !Object.keys(block.style).length) && !Object.keys(section.style).length
      doc = e.updateBlock(doc, block.id, { style: { fontSize: 42 }, overrides: { mobile: { fontSize: 28, isVisible: false } } })
      doc = e.updateSiteDesign(doc, { baseSize: 20, fontHeading: 'serif', fontBody: 'mono', primary: '#123456', headingScale: 2.5 })
      const before = e.getActivePage(doc).sections[0].blocks[0]
      const roundtrip = e.normalizeEditorDocument(e.buildEditorDraftPayload(doc))
      const reset = e.resetLocalStyles(doc, { kind: 'block', id: block.id })
      const after = e.getActivePage(reset).sections[0].blocks[0]
      const legacy = e.getDocumentTheme({ ...doc, globalStyles: { background: '#eeeeee', textColor: '#222222', contentWidth: 900 } })
      const invalid = t.normalizeSiteTheme({ themePresetId: 'minimal', tokens: { primary: 'url(https://invalid)', fontBody: 'remote-font', lineHeight: 99 } })
      return {
        sparse, override: before.style.fontSize === 42 && before.overrides.mobile.fontSize === 28,
        roundtrip: JSON.stringify(roundtrip.theme) === JSON.stringify(doc.theme),
        reset: !Object.keys(after.style).length && after.overrides.mobile.isVisible === false && !('fontSize' in after.overrides.mobile),
        content: JSON.stringify(after.content) === JSON.stringify(before.content),
        resolved: e.getResolvedEditorStyle(reset, after, 'desktop').fontSize,
        legacy: legacy.tokens.background === '#eeeeee' && legacy.tokens.contentWidth === 900,
        invalid: invalid.tokens.primary === '#202020' && invalid.tokens.fontBody === t.SITE_FONT_STACKS.sans && invalid.tokens.lineHeight === 2,
        idempotent: t.SITE_THEME_PRESETS.every(preset => { const theme = t.normalizeSiteTheme(preset.id); return JSON.stringify(t.normalizeSiteTheme(theme)) === JSON.stringify(theme) }),
      }
    })
    for (const key of ['sparse', 'override', 'roundtrip', 'reset', 'content', 'legacy', 'invalid', 'idempotent']) assert.equal(model[key], true, key)
    assert.equal(model.resolved, 50)
    console.log('PASS model: sparse inheritance, explicit/device overrides, reset/visibility, token roundtrip, legacy migration, sanitization and idempotent fonts')
    const setRange = async (name, value) => {
      await page.locator('.site-design').getByLabel(name).evaluate((input, value) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(value))
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }, value)
    }
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto('http://localhost:5173/sites/local-check/editor')
      await page.locator('#editor-preview-toggle').waitFor()
      const chrome = await page.locator('.editor-topbar').evaluate(element => getComputedStyle(element).backgroundColor)
      if (width <= 768) await page.locator('[aria-controls="editor-left-panel"]').click()
      await page.locator('.editor-block-palette button').filter({ hasText: 'Forma' }).click()
      if (width <= 768) await page.locator('[aria-controls="editor-right-panel"]').click()
      await page.locator('.site-design summary').click()
      const design = page.locator('.site-design')
      await design.getByRole('button', { name: 'Müasir', exact: true }).click()
      await design.getByLabel('Əsas rəng', { exact: true }).fill('#123456')
      await design.getByLabel('Fon', { exact: true }).fill('#fbfbfb')
      await design.getByLabel('Səth', { exact: true }).fill('#eeeeee')
      await design.getByLabel('Sərhəd rəngi', { exact: true }).fill('#aabbcc')
      await design.getByLabel('Mətn şrifti', { exact: true }).selectOption('serif')
      await design.getByLabel('Başlıq şrifti', { exact: true }).selectOption('mono')
      await setRange(/Əsas şrift ölçüsü/, 20)
      await setRange(/Başlıq miqyası/, 2.5)
      await setRange(/Mətn sətir hündürlüyü/, 1.8)
      await setRange(/Künc radiusu/, 14)
      await setRange(/^Düymə radiusu/, 18)
      await setRange(/Minimum düymə hündürlüyü/, 60)
      await design.getByLabel('Boşluq miqyası', { exact: true }).selectOption('1.5')
      await design.getByLabel('Məzmun eni', { exact: true }).selectOption('800')
      await design.getByLabel('Əsas rəng', { exact: true }).fill('#zzzzzz')
      assert.equal(await design.getByLabel('Əsas rəng', { exact: true }).getAttribute('aria-invalid'), 'true')
      await design.getByLabel('Əsas rəng', { exact: true }).blur()
      assert.equal(await design.getByLabel('Əsas rəng', { exact: true }).inputValue(), '#123456')
      assert.equal(await page.locator('.editor-topbar').evaluate(element => getComputedStyle(element).backgroundColor), chrome)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (width <= 768) await page.locator('.editor-panel--right .editor-panel__close').click()
      await page.locator('#editor-preview-toggle').click()
      for (let device = 0; device < 3; device++) {
        await page.locator('.preview-devices button').nth(device).click()
        const appearance = await page.locator('.editor-canvas__page').evaluate(site => {
          const button = getComputedStyle(site.querySelector('.editor-block__button'))
          const input = getComputedStyle(site.querySelector('.site-form input'))
          const heading = getComputedStyle(site.querySelector('h1,h2'))
          const body = getComputedStyle(site)
          return { background: body.backgroundColor, size: body.fontSize, line: body.lineHeight, font: body.fontFamily,
            heading: heading.fontSize, headingFont: heading.fontFamily, buttonRadius: button.borderRadius, buttonHeight: button.minHeight,
            buttonColor: button.backgroundColor, inputRadius: input.borderRadius, inputBorder: input.borderColor, inputSurface: input.backgroundColor,
            width: getComputedStyle(site.querySelector('.editor-canvas__section-inner')).maxWidth,
            space: getComputedStyle(site.querySelector('.editor-canvas__section-band')).paddingTop,
          }
        })
        assert.equal(appearance.background, 'rgb(251, 251, 251)')
        assert.equal(appearance.size, '20px')
        assert.equal(appearance.line, '36px')
        assert.ok(appearance.font.includes('Georgia'))
        assert.ok(appearance.headingFont.includes('monospace'))
        assert.equal(appearance.heading, '50px')
        assert.equal(appearance.buttonRadius, '18px')
        assert.equal(appearance.buttonHeight, '60px')
        assert.equal(appearance.buttonColor, 'rgb(18, 52, 86)')
        assert.equal(appearance.inputRadius, '14px')
        assert.equal(appearance.inputBorder, 'rgb(170, 187, 204)')
        assert.equal(appearance.inputSurface, 'rgb(238, 238, 238)')
        assert.equal(appearance.width, '800px')
        assert.equal(appearance.space, '72px')
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      }
      await page.keyboard.press('Escape')
      await page.locator('.editor-canvas__block').first().click()
      if (width <= 768) await page.locator('[aria-controls="editor-right-panel"]').click()
      await page.locator('#editor-style-font-size').selectOption('44')
      assert.equal(await page.locator('.editor-canvas__page h1,.editor-canvas__page h2').first().evaluate(element => getComputedStyle(element).fontSize), '44px')
      await page.getByRole('button', { name: 'Lokal üslubu sıfırla', exact: true }).click()
      assert.equal(await page.locator('.editor-canvas__page h1,.editor-canvas__page h2').first().evaluate(element => getComputedStyle(element).fontSize), '50px')
      console.log(`PASS ${width}: colors, typography, spacing/width, button/form inheritance, local reset, all previews, isolated chrome and no overflow`)
    }
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
