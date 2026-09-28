// Dependency-free Chromium/CDP visual checks. Screenshots go to the OS temp folder.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'phase15-browser-'))
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9335', `--user-data-dir=${profile}`], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
;(async () => {
  let socket
  try {
    let pages
    for (let i = 0; i < 40; i++) {
      try { pages = await (await fetch('http://127.0.0.1:9335/json')).json(); if (pages.length) break } catch {}
      await wait(250)
    }
    socket = new WebSocket(pages[0].webSocketDebuggerUrl)
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
    let id = 0
    const pending = new Map()
    const errors = []
    socket.addEventListener('message', event => {
      const data = JSON.parse(event.data)
      if (data.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(data.params.type)) errors.push(data.params.args.map(arg => arg.value || arg.description).join(' '))
      if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text)
      const request = pending.get(data.id)
      if (request) {
        pending.delete(data.id)
        if (data.error) request.reject(data.error)
        else request.resolve(data.result)
      }
    })
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params }))
    })
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
      return result.result.value
    }
    await call('Runtime.enable')
    await call('Page.enable')
    const until = async expression => {
      for (let i = 0; i < 70; i++) {
        if (await evaluate(expression)) return
        await wait(100)
      }
      console.log('TIMEOUT PAGE', await evaluate('document.body.innerText'), errors)
      throw Error(`Timed out: ${expression}`)
    }
    const open = async route => {
      await call('Page.navigate', { url: `http://127.0.0.1:5173${route}` })
      await until(`Boolean(document.querySelector('main, .editor, .site-settings')) && !document.querySelector('.page-status .spinner')`)
      await wait(400)
    }
    const click = async selector => {
      await until(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
      await wait(100)
    }
    const translatedClick = async (key, scope = 'body') => {
      await until(`Boolean(document.querySelector(${JSON.stringify(scope)}))`)
      const result = await evaluate(`(async () => {
        const { translate } = await import('/src/i18n/dictionary.js');
        const label = translate(${JSON.stringify(key)}, document.documentElement.lang);
        const target = [...document.querySelector(${JSON.stringify(scope)}).querySelectorAll('button')].find(el => el.textContent.trim() === label || el.getAttribute('aria-label') === label);
        if (!target) return label; target.click(); return true;
      })()`)
      assert.equal(result, true, `Missing button: ${key} (${result})`)
      await wait(100)
    }
    const fill = async (selector, value) => {
      await evaluate(`(() => {const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`)
    }
    const escape = async () => {
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
      await wait(100)
    }
    const viewport = width => call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    const findings = []
    const scan = async (name, screenshot = false) => {
      await wait(250)
      const result = await evaluate(`(() => ({
        route: location.pathname, width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        missing: document.body.innerText.match(/\\b(?:editor|siteSettings|siteDesign|audit|createSite|auth|workspace|forms)\\.[a-zA-Z][\\w.]+/g),
        anonymous: [...document.querySelectorAll('button')].filter(el => el.getClientRects().length && !el.closest('[inert]') && !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title')).map(el => el.className),
        unnamedInputs: [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(el => el.getClientRects().length && !el.closest('[inert]') && !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title')).map(el => el.outerHTML),
        clippedDialogs: [...document.querySelectorAll('dialog, [role=dialog]')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) }).map(el => el.className),
        text: document.body.innerText,
      }))()`)
      if (result.overflow || result.missing || result.anonymous.length || result.unnamedInputs.length || result.clippedDialogs.length) findings.push({ name, ...result })
      fs.writeFileSync(path.join(os.tmpdir(), `phase15-${name}-${result.width}.txt`), result.text)
      if (screenshot) {
        const shot = await call('Page.captureScreenshot', { format: 'png' })
        fs.writeFileSync(path.join(os.tmpdir(), `phase15-${name}-${result.width}.png`), Buffer.from(shot.data, 'base64'))
      }
      console.log(`CHECK ${name} ${result.width}px ${JSON.stringify({ overflow: result.overflow, missing: result.missing, buttons: result.anonymous, inputs: result.unnamedInputs, dialogs: result.clippedDialogs })}`)
    }
    await viewport(1440)
    await open('/')
    assert.equal(await evaluate(`document.documentElement.lang`), 'az')
    await scan('landing', true)
    await click('a[href="/register"]')
    await until(`Boolean(document.querySelector('input[name=firstName]'))`)
    await fill('input[name=firstName]', 'Audit')
    await fill('input[name=lastName]', 'User')
    await fill('input[name=email]', 'audit@example.com')
    await click('button[type=submit]')
    await fill('input[name=password]', 'Audit123!')
    await fill('input[name=confirmPassword]', 'Audit123!')
    await click('button[type=submit]')
    await until(`Boolean(document.querySelector('[role=alert]'))`)
    await scan('register', true)
    await click('a[href="/login"]')
    await until(`Boolean(document.querySelector('#login-email'))`)
    assert.equal(await evaluate(`document.querySelector('#login-email').value`), '')
    await fill('#login-email', 'user@demo.com')
    await fill('#login-password', 'user123')
    await click('button[type=submit]')
    await until(`location.pathname === '/sites'`)
    await scan('sites', true)
    for (const route of ['/dashboard', '/students', '/courses', '/admin', '/student/dashboard', '/teacher/dashboard']) {
      await open(route)
      assert.equal(await evaluate('location.pathname'), '/sites', route)
    }
    await open('/templates')
    await scan('templates', true)
    await click('a[href="/sites/new?template=business"]')
    await translatedClick('common.back')
    await until(`Boolean(document.querySelector('#create-site-name'))`)
    await fill('#create-site-name', 'Audit Website')
    await translatedClick('common.continue')
    await translatedClick('common.continue')
    await translatedClick('common.continue')
    await translatedClick('createSite.submit')
    await scan('create', true)
    await translatedClick('audit.localEditor')
    await until(`Boolean(document.querySelector('#editor-preview-toggle'))`)
    await scan('editor', true)
    await translatedClick('editor.page.createAction', '#editor-left-panel')
    await fill('#editor-page-dialog-name', 'Audit Page')
    await translatedClick('editor.page.createAction', 'dialog, [role=dialog]')
    await translatedClick('editor.nav.buildAction')
    await click('.editor-page-list__select')
    await click('.site-design summary')
    await translatedClick('siteDesign.presets.bold', '.site-design')
    await translatedClick('editor.media.open')
    await scan('media', true)
    await escape()
    await translatedClick('forms.title', '#editor-left-panel')
    await click('#editor-preview-toggle')
    await until(`Boolean(document.querySelector('.preview-bar'))`)
    await scan('preview', true)
    await translatedClick('editor.topBar.exitPreview', '.preview-bar')
    await until(`!document.querySelector('.preview-bar')`)
    await translatedClick('publishing.publish')
    await until(`Boolean(document.querySelector('dialog, [role=dialog]'))`)
    await translatedClick('publishing.checkIntegration', 'dialog, [role=dialog]')
    await scan('publish', true)
    await escape()
    for (const width of [1440, 1024, 768, 375]) {
      await viewport(width)
      for (const route of ['/sites', '/sites/new', '/templates', '/sites/local-draft/editor', '/sites/local-draft/settings', '/billing', '/security', '/account/profile', '/notifications']) {
        await open(route)
        await scan(route.split('/').filter(Boolean).join('-'), true)
      }
    }
    await open('/sites')
    await click('.app-header__menu')
    await scan('mobile-drawer', true)
    await escape()
    assert.equal(await evaluate(`document.querySelector('.app-sidebar').hasAttribute('inert')`), true)
    await click('.user-menu__action--logout')
    await until(`location.pathname === '/login'`)
    for (const width of [1440, 1024, 768, 375]) {
      await viewport(width)
      for (const route of ['/', '/register', '/login']) {
        await open(route)
        await scan(route.slice(1) || 'landing', true)
        assert.equal(await evaluate(`document.querySelectorAll('a[href^="/admin"]').length`), 0)
      }
    }
    console.log('FINDINGS', JSON.stringify(findings.map(({ text: _text, ...result }) => result), null, 2))
    console.log('CONSOLE', JSON.stringify(errors))
    fs.writeFileSync(path.join(os.tmpdir(), 'phase15-results.json'), JSON.stringify({ findings, errors }, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(findings, [])
  } finally {
    socket?.close()
    browser.kill()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
