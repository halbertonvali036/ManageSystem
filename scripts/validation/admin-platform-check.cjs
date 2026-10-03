// Dependency-free Chromium/CDP visual checks. Screenshots go to the OS temp folder.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-platform-browser-'))
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9340', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
;(async () => {
  let socket
  try {
    let pages
    for (let i = 0; i < 40; i++) {
      try { pages = await (await fetch('http://127.0.0.1:9340/json')).json(); if (pages.length) break } catch {}
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
      await call('Page.navigate', { url: `http://localhost:5173${route}` })
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
    const escape = async () => {
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
      await wait(100)
    }
    const viewport = width => call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    const findings = []
    const scan = async (name, screenshot = false) => {
      name = name.replaceAll('/', '-')
      await wait(250)
      const result = await evaluate(`(() => ({
        route: location.pathname, width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
        missing: document.body.innerText.match(/\\b(?:admin|editor|siteSettings|siteDesign|audit|createSite|auth|workspace|forms)\\.[a-zA-Z][\\w.]+/g),
        anonymous: [...document.querySelectorAll('button')].filter(el => el.getClientRects().length && !el.closest('[inert]') && !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title')).map(el => el.className),
        unnamedInputs: [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(el => el.getClientRects().length && !el.closest('[inert]') && !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title')).map(el => el.outerHTML),
        clippedDialogs: [...document.querySelectorAll('dialog, [role=dialog]')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) }).map(el => el.className),
        text: document.body.innerText,
      }))()`)
      if (result.overflow || result.missing || result.anonymous.length || result.unnamedInputs.length || result.clippedDialogs.length) findings.push({ name, ...result })
      fs.writeFileSync(path.join(os.tmpdir(), `admin-platform-${name}-${result.width}.txt`), result.text)
      if (screenshot) {
        const shot = await call('Page.captureScreenshot', { format: 'png' })
        fs.writeFileSync(path.join(os.tmpdir(), `admin-platform-${name}-${result.width}.png`), Buffer.from(shot.data, 'base64'))
      }
      console.log(`CHECK ${name} ${result.width}px ${JSON.stringify({ overflow: result.overflow, missing: result.missing, buttons: result.anonymous, inputs: result.unnamedInputs, dialogs: result.clippedDialogs })}`)
    }

    await viewport(1440)
    await open('/admin/login')
    await click('button[type=submit]')
    await until(`location.pathname === '/admin' && Boolean(document.querySelector('.admin-metrics'))`)
    assert.equal(await evaluate('document.documentElement.lang'), 'az')
    assert.equal(await evaluate(`document.querySelectorAll('.admin-metric').length`), 7)
    assert.equal(await evaluate(`[...document.querySelectorAll('.admin-metric dd')].every(el => el.textContent === String.fromCharCode(8212))`), true)
    const routes = ['/admin', ...['users','websites','templates','billing','domains','notifications','support','audit','settings'].map(x=>'/admin/'+x)]
    for (const width of [1440,1024,768,375]) {
      await viewport(width)
      for (const route of routes) {
        await open(route)
        await until(`Boolean(document.querySelector('.admin-platform')) && !document.querySelector('.admin-data-state--loading')`)
        await scan(route, true)
        assert.equal(await evaluate(`(/\b(?:Students?|Teachers?|Grades|Attendance|Classes|Assessments|Academic|Semesters?|Departments?|Courses?)\b/i).test(document.body.innerText)`),false)
        assert.equal(await evaluate(`document.querySelectorAll('a[href="/students"],a[href="/courses"],a[href="/roles"],a[href="/settings"]').length`),0)
      }
    }
    await click('.app-header__menu')
    assert.equal(await evaluate(`Boolean(document.activeElement.closest('.app-sidebar'))`),true)
    await escape()
    assert.equal(await evaluate(`document.activeElement.classList.contains('app-header__menu')`),true)
    await click('.language-switcher')
    await open('/admin')
    assert.equal(await evaluate('document.documentElement.lang'),'en')
    assert.equal(await evaluate(`document.querySelector('h1').textContent`),'Overview')
    await click('.theme-toggle')
    await open('/admin/users')
    assert.equal(await evaluate('document.documentElement.dataset.theme'),'light')
    await scan('admin-users-light',true)
    // Exercise service failures and empty results via test-local stubs only.
    await evaluate(`(async () => {
      const {default: config} = await import('/src/config/index.js')
      const {default: service} = await import('/src/services/adminPlatformService.js')
      window.__adminTest = {config, service, base:config.api.baseUrl, fetch:window.fetch}
      config.api.baseUrl = '/__admin_test'
      window.fetch = async () => new Response('{}',{status:503,headers:{'Content-Type':'application/json'}})
    })()`)
    await click('a[href="/admin/websites"]')
    await until(`Boolean(document.querySelector('.admin-data-state--error'))`)
    await evaluate(`window.fetch = async () => new Response('[]',{headers:{'Content-Type':'application/json'}})`)
    await click('.admin-data-state--error button')
    await until(`Boolean(document.querySelector('.admin-data-state--empty'))`)
    assert.equal(await evaluate(`(async () => {
      window.fetch = async () => new Response('{}',{headers:{'Content-Type':'application/json'}})
      try { await window.__adminTest.service.getCollection('domains'); return false } catch { return true }
    })()`),true)
    await evaluate(`(() => { window.fetch=window.__adminTest.fetch; window.__adminTest.config.api.baseUrl=window.__adminTest.base })()`)
    // Removed routes resolve to 404 instead of old pages or compatibility redirects.
    for (const route of ['/students','/teacher/dashboard','/student/dashboard','/classes','/departments','/subjects','/courses','/academic-years','/attendance','/assessments','/grades','/schedules','/reports','/announcements','/roles','/settings','/users']) {
      await open(route)
      assert.equal(await evaluate('location.pathname'),route)
      assert.equal(await evaluate(`document.querySelector('.status-page__code')?.textContent`),'404')
    }
    await open('/admin')
    await click('.user-menu__action--logout')
    await until(`location.pathname === '/login'`)
    await fill('#login-email','user@demo.com')
    await fill('#login-password','user123')
    await click('button[type=submit]')
    await until(`location.pathname === '/sites'`)
    for(const route of routes) {
      await open(route)
      assert.equal(await evaluate('location.pathname'),'/sites')
    }
    assert.equal(await evaluate(`document.querySelectorAll('a[href^="/admin"]').length`),0)
    assert.deepEqual(findings,[])
    assert.deepEqual(errors,[])
    console.log('Admin platform PASS: 40 viewport/route checks, AZ/EN, theme persistence, keyboard drawer, API error/empty handling, retired 404 routes and user isolation.')
  } finally {socket?.close();browser.kill()}
})().catch(error=>{console.error(error);process.exitCode=1})
