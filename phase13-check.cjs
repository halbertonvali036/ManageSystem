// Existing external Playwright installation; no runtime dependency added.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const errors = []
  const findings = []
  const watch = page => {
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()) })
  }
  const open = async (page, route) => {
    await page.goto(`http://127.0.0.1:5173${route}`)
    await page.waitForLoadState('networkidle')
    assert.equal(await page.locator('.route-error').count(), 0, route)
  }
  const text = (page, key) => page.evaluate(async key => {
    const { translate } = await import('/src/i18n/dictionary.js')
    return translate(key, document.documentElement.lang)
  }, key)
  const button = async (page, key, scope = page) => scope.getByRole('button', { name: await text(page, key), exact: true })
  const click = async (page, key, scope) => (await button(page, key, scope)).click()
  const screenshot = (page, name) => page.screenshot({ path: path.join(os.tmpdir(), `phase13-${name}.png`) })
  const scan = async (page, name) => {
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      width: innerWidth,
      missing: document.body.innerText.match(/\b(?:editor|siteSettings|siteDesign|audit|createSite|auth|workspace)\.[a-zA-Z][\w.]+/g),
      anonymousButtons: [...document.querySelectorAll('button')].filter(node => node.getClientRects().length && !node.closest('[inert]') && !node.innerText.trim() && !node.getAttribute('aria-label') && !node.getAttribute('title')).map(node => node.className),
    }))
    if (result.overflow || result.missing || result.anonymousButtons.length) findings.push({ page: name, ...result })
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    watch(page)
    await open(page, '/')
    assert.equal(await page.locator('html').getAttribute('lang'), 'az')
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 })
      await scan(page, 'landing')
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.locator('.language-switcher').first().click()
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    await open(page, '/register')
    await page.locator('input[name="firstName"]').fill('Audit')
    await page.locator('input[name="lastName"]').fill('User')
    await page.locator('input[name="email"]').fill('audit@example.com')
    await page.locator('button[type="submit"]').click()
    await page.locator('input[name="password"]').fill('Audit123!')
    await page.locator('input[name="confirmPassword"]').fill('Audit123!')
    await page.locator('button[type="submit"]').click()
    await page.locator('[role="alert"]').last().waitFor()
    assert.equal(await page.evaluate(() => sessionStorage.getItem('managesystem-auth-session')), null)
    console.log('PASS Landing → Register: AZ/dark defaults, EN switch, registration blocked honestly without a backend')

    await open(page, '/login')
    await page.locator('#login-email').fill('user@demo.com')
    await page.locator('#login-password').fill('user123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/sites')
    await page.locator('.page-header__title').waitFor()
    assert.equal(await page.locator('.sidebar__link[href="/students"]').count(), 0)
    await scan(page, 'sites')
    await open(page, '/account/profile')
    assert.equal(new URL(page.url()).pathname, '/account/profile')
    for (const route of ['/students', '/courses', '/admin', '/student/dashboard', '/teacher/dashboard']) {
      await open(page, route)
      assert.equal(new URL(page.url()).pathname, '/sites', route)
    }
    const commands = await page.evaluate(async () => {
      const c = await import('/src/components/commandPalette/commands.js')
      const n = await import('/src/models/notification.js')
      return { paths: c.getCommandsForRole('user').map(x => x.path),
        blocked: n.resolveNotificationTarget({ target: { path: '/grades' } }, 'user'),
        external: n.resolveNotificationTarget({ target: { path: '//example.com' } }, 'user') }
    })
    assert.equal(new Set(commands.paths).size, commands.paths.length)
    assert.equal(commands.blocked, null)
    assert.equal(commands.external, null)
    console.log('PASS Login → My Websites/Profile; public users excluded from internal and retired routes; unique commands and scoped notification links')

    await open(page, '/templates')
    await page.locator('a[href="/sites/new?template=business"]').first().click()
    await click(page, 'common.continue')
    await click(page, 'common.continue')
    await click(page, 'audit.localEditor')
    await page.locator('#create-site-name').fill('Audit Website')
    await click(page, 'common.continue')
    await click(page, 'common.continue')
    await click(page, 'common.continue')
    await click(page, 'createSite.submit')
    await page.getByText(await text(page, 'createSite.unavailableNotice'), { exact: true }).waitFor()
    await click(page, 'audit.localEditor')
    await page.waitForURL('**/sites/local-draft/editor')
    await page.locator('#editor-preview-toggle').waitFor()
    assert.ok(await page.locator('.editor-canvas__section').count() >= 4, 'business template is applied')
    await click(page, 'editor.page.createAction', page.locator('#editor-left-panel'))
    const dialog = page.getByRole('dialog')
    await dialog.locator('#editor-page-dialog-name').fill('Audit Page')
    await click(page, 'editor.page.createAction', dialog)
    await click(page, 'editor.nav.buildAction')
    assert.ok(await page.locator('.editor-nav-list__item').count() >= 3)
    // Return to the template home page.
    await page.locator('.editor-page-list__select').first().click()
    await page.locator('.site-design summary').click()
    await click(page, 'siteDesign.presets.bold', page.locator('.site-design'))
    await click(page, 'editor.media.open')
    await page.getByRole('dialog').waitFor()
    await page.locator('input[type="file"]').setInputFiles({ name: 'audit.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>') })
    await page.keyboard.press('Escape')
    await page.locator('#editor-left-panel').getByRole('button', { name: await text(page, 'forms.title'), exact: true }).click()
    assert.ok(await page.locator('.site-form').count() > 0)
    await page.locator('#editor-preview-toggle').click()
    await page.locator('.preview-bar').waitFor()
    assert.equal(await page.locator('.canvas-drag-handle').count(), 0)
    await page.keyboard.press('Escape')
    await click(page, 'publishing.publish')
    await click(page, 'publishing.checkIntegration', page.getByRole('dialog'))
    await page.getByText(await text(page, 'publishing.noChange'), { exact: true }).waitFor()
    await page.keyboard.press('Escape')
    await scan(page, 'editor')
    console.log('PASS Templates → Create → local Editor → Pages → Navigation → Theme → Media → Forms → Preview → Publish UI')

    for (const width of [1440, 1024, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const route of ['/sites', '/sites/new', '/templates', '/sites/local-draft/editor', '/sites/local-draft/settings', '/billing', '/security', '/account/profile']) {
        await open(page, route)
        await scan(page, route)
        if (width === 375 && ['/sites', '/sites/local-draft/editor', '/security'].includes(route)) await screenshot(page, route.split('/').filter(Boolean).join('-'))
      }
    }
    await open(page, '/sites')
    await page.locator('.app-header__menu').click()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.app-sidebar').getAttribute('inert'), '')
    await page.locator('.user-menu__action--logout').click()
    await page.waitForURL('**/login')
    assert.equal(await page.evaluate(() => sessionStorage.getItem('managesystem-auth-session')), null)
    console.log('PASS Settings/Billing/Security/account routes at 1440/1024/768/375; mobile drawer and Logout')

    const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    watch(admin)
    await open(admin, '/admin/login')
    assert.equal(await admin.locator('#login-email').inputValue(), 'admin@demo.com')
    assert.equal(await admin.locator('#login-password').inputValue(), 'admin123')
    await admin.locator('#login-email').fill('user@demo.com')
    await admin.locator('#login-password').fill('user123')
    await admin.locator('button[type="submit"]').click()
    await admin.locator('[role="alert"]').waitFor()
    assert.equal(await admin.evaluate(() => sessionStorage.getItem('managesystem-auth-session')), null)
    await admin.locator('#login-email').fill('admin@demo.com')
    await admin.locator('#login-password').fill('admin123')
    await admin.locator('button[type="submit"]').click()
    await admin.waitForURL('**/users')
    await admin.locator('a[href="/students"]').waitFor()
    for (const route of ['/students', '/courses', '/classes', '/attendance', '/grades', '/assessments', '/academic-years', '/roles', '/settings']) await open(admin, route)
    console.log('PASS admin@demo.com / admin123 → internal Admin tools; user account rejected at admin login')
    console.log('RESPONSIVE/A11Y FINDINGS', JSON.stringify(findings, null, 2))
    console.log('CONSOLE', JSON.stringify([...new Set(errors)], null, 2))
    fs.writeFileSync(path.join(os.tmpdir(), 'phase13-browser-results.json'), JSON.stringify({ findings, errors: [...new Set(errors)] }, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(findings, [])
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
