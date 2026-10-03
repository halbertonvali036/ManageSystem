// Dependency-free Chromium/CDP visual checks. Screenshots go to the OS temp folder.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'phase16-runtime-browser-'))
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9338', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
;(async () => {
  let socket
  try {
    let pages
    for (let i = 0; i < 40; i++) {
      try { pages = await (await fetch('http://127.0.0.1:9338/json')).json(); if (pages.length) break } catch {}
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
      if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text)
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

    await open('/login')
    assert.equal(await evaluate('document.documentElement.lang'), 'az')
    // The switcher is a two-option group (AZ/EN), not one toggle button, so the
    // option itself has to be clicked.
    await click('.language-switcher__option[lang="en"]')
    await click('.theme-toggle')
    await open('/login')
    assert.equal(await evaluate('document.documentElement.lang'), 'en')
    assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light')
    assert.equal(await evaluate(`document.querySelector('meta[name="theme-color"]').content`), '#f4f7f4')
    await click('.language-switcher__option[lang="az"]')
    await click('.theme-toggle')
    assert.equal(await evaluate(`(async () => {
      const { default: config } = await import('/src/config/index.js')
      const { default: client } = await import('/src/services/httpClient.js')
      const savedFetch = window.fetch
      let called = false
      window.fetch = () => { called = true; throw Error('Unexpected network') }
      try { await client.get('/readiness-check'); return false }
      catch (error) { return error.name === 'BackendNotConnectedError' && !called && !config.api.baseUrl }
      finally { window.fetch = savedFetch }
    })()`), true)
    // Mount a controlled failure under the actual providers and error boundary.
    await evaluate(`(async () => {
      const { React, createRoot, BrowserRouter, useLocation } = await import('/scripts/validation/phase16-runtime-fixture.js')
      const { default: Boundary } = await import('/src/components/errors/RouteErrorBoundary.jsx')
      const { default: Auth } = await import('/src/context/AuthProvider.jsx')
      const { default: Locale } = await import('/src/context/LocaleProvider.jsx')
      const h = React.createElement
      const host = document.createElement('div'); host.id = 'runtime-test'; document.body.append(host)
      const root = createRoot(host); window.__runtimeRoot = root
      const Broken = () => { if (useLocation().pathname === '/runtime-error') throw Error('PHASE16_EXPECTED_ERROR'); return h('p', { id: 'recovered' }, 'Recovered') }
      history.pushState({}, '', '/runtime-error')
      root.render(h(BrowserRouter, null, h(Locale, null, h(Auth, null, h(Boundary, null, h(Broken))))))
    })()`)
    await until(`Boolean(document.querySelector('#runtime-test .route-error'))`)
    await click('#runtime-test a')
    await until(`Boolean(document.querySelector('#recovered'))`)
    assert.equal(await evaluate('location.pathname'), '/login')
    await evaluate(`window.__runtimeRoot.unmount()`)
    await evaluate(`(async () => {
      const { React, createRoot } = await import('/scripts/validation/phase16-runtime-fixture.js')
      const { default: Dialog } = await import('/src/components/common/ConfirmDialog.jsx')
      const h = React.createElement
      const trigger = document.createElement('button'); trigger.id = 'dialog-trigger'; trigger.textContent = 'Open'; document.body.append(trigger); trigger.focus()
      const host = document.querySelector('#runtime-test'); const root = createRoot(host); window.__runtimeRoot = root
      function Harness() { const [open, setOpen] = React.useState(true); return h(Dialog, { open, title: 'Focus test', onCancel: () => setOpen(false) }) }
      root.render(h(Harness))
    })()`)
    await until(`Boolean(document.querySelector('#runtime-test [role=dialog]'))`)
    assert.equal(await evaluate(`Boolean(document.activeElement.closest('[role=dialog]'))`), true)
    await evaluate(`document.querySelector('#runtime-test .modal__actions button:last-child').focus()`)
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    assert.equal(await evaluate(`document.activeElement.className`), 'modal__close')
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await until(`!document.querySelector('#runtime-test [role=dialog]')`)
    assert.equal(await evaluate(`document.activeElement.id`), 'dialog-trigger')
    await evaluate(`window.__runtimeRoot.unmount()`)
    const unexpected = errors.filter(error => !error.includes('PHASE16_EXPECTED_ERROR') && !error.includes('An error occurred in the <Broken> component'))
    assert.deepEqual(unexpected, [])
    await evaluate(`(async () => {
      const { default: auth } = await import('/src/services/authService.js')
      await auth.login({email:'user@demo.com',password:'user123'})
    })()`)
    for (const width of [1440, 1024, 768, 375]) {
      await call('Emulation.setDeviceMetricsOverride', {width, height:1000, deviceScaleFactor:1, mobile:false})
      await open('/sites/local-draft/settings')
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.site-settings__layout')).display`), 'grid')
      assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 2`), true)
      const shot = await call('Page.captureScreenshot', {format:'png'})
      fs.writeFileSync(path.join(os.tmpdir(), `phase16-settings-final-${width}.png`), Buffer.from(shot.data,'base64'))
    }
    console.log('Runtime checks PASS: no-backend guard, error boundary recovery, dialog focus trap, Escape and focus restoration.')
  } finally { socket?.close(); browser.kill() }
})().catch(error => { console.error(error); process.exitCode = 1 })

