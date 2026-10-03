// Dependency-free Chromium/CDP visual checks. Screenshots go to the OS temp folder.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'phase16-production-browser-'))
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9337', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
;(async () => {
  let socket
  try {
    let pages
    for (let i = 0; i < 40; i++) {
      try { pages = await (await fetch('http://127.0.0.1:9337/json')).json(); if (pages.length) break } catch {}
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
      const result = await call('Runtime.evaluate', { expression: `globalThis.__smokeEvaluation = (${expression})`, returnByValue: true, awaitPromise: true })
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
      return result.result.value
    }
    await call('Runtime.enable')
    await call('Page.enable')
    // Keep smoke checks deterministic and verify the local font fallback.
    await call('Network.enable')
    await call('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] })
    const until = async expression => {
      for (let i = 0; i < 250; i++) {
        if (await evaluate(expression)) return
        await wait(100)
      }
      console.log('TIMEOUT PAGE', await evaluate('JSON.stringify({url:location.href,ready:document.readyState,html:document.documentElement.outerHTML.slice(0,5000)})'), errors)
      throw Error(`Timed out: ${expression}`)
    }
    const open = async route => {
      await call('Page.navigate', { url: `http://localhost:4173${route}` })
      await until(`Boolean(document.querySelector('main, .editor, .site-settings, .status-page')) && !document.querySelector('.page-status .spinner')`)
      await wait(400)
    }
    const click = async selector => {
      await until(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
      await wait(100)
    }
    const fill = async (selector, value) => {
      await evaluate(`(() => {const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`)
    }
    const viewport = width => call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    const findings = []
    const scan = async (name, screenshot = false) => {
      name = name.replaceAll('/', '-')
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
      fs.writeFileSync(path.join(os.tmpdir(), `phase16-production-${name}-${result.width}.txt`), result.text)
      if (screenshot) {
        const shot = await call('Page.captureScreenshot', { format: 'png' })
        fs.writeFileSync(path.join(os.tmpdir(), `phase16-production-${name}-${result.width}.png`), Buffer.from(shot.data, 'base64'))
      }
      console.log(`CHECK ${name} ${result.width}px ${JSON.stringify({ overflow: result.overflow, missing: result.missing, buttons: result.anonymous, inputs: result.unnamedInputs, dialogs: result.clippedDialogs })}`)
    }
    for (const width of [1440, 1024, 768, 375]) {
      await viewport(width)
      for (const route of ['/', '/login', '/register', '/admin/login', '/missing-page']) {
        await open(route)
        await scan(route.slice(1) || 'landing')
      }
    }
    for (const route of ['/sites', '/sites/new', '/sites/local-draft/editor', '/sites/local-draft/settings', '/admin']) {
      await open(route)
      assert.equal(await evaluate('location.pathname'), route === '/admin' ? '/admin/login' : '/login')
    }
    await open('/admin/login')
    assert.equal(await evaluate(`document.querySelector('#login-email').value`), '')
    await fill('#login-email', 'admin@demo.com')
    await fill('#login-password', 'admin123')
    await click('button[type=submit]')
    await until(`Boolean(document.querySelector('[role=alert]'))`)
    assert.equal(await evaluate('location.pathname'), '/admin/login')
    await evaluate(`sessionStorage.setItem('managesystem-auth-session', JSON.stringify({ token: 'mock-jwt-token', user: { id: 'admin-1', role: 'admin' } }))`)
    await open('/sites')
    assert.equal(await evaluate('location.pathname'), '/login')
    await evaluate(`(() => { localStorage.setItem('sms.locale', 'en'); localStorage.setItem('sms.theme', 'light') })()`)
    await open('/login')
    assert.equal(await evaluate('document.documentElement.lang'), 'en')
    assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light')
    assert.equal(await evaluate(`document.querySelector('meta[name="theme-color"]').content`), '#f4f7f4')
    assert.deepEqual(findings, [])
    assert.deepEqual(errors, [])
    console.log('Production checks PASS: direct routes, 404, controls, demo auth disabled, saved demo rejected, persisted locale/theme.')
  } finally {
    socket?.close()
    browser.kill()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
