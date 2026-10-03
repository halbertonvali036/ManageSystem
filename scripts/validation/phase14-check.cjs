// Dependency-free Chromium/CDP visual checks. Screenshots go to the OS temp folder.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'phase14-browser-'))
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9334', `--user-data-dir=${profile}`], { windowsHide: true, stdio: 'ignore' })
browser.on('error', error => { console.error(error); process.exitCode = 1 })
;(async () => {
  let socket
  try {
    let pages
    for (let i = 0; i < 40; i++) {
      try { pages = await (await fetch('http://127.0.0.1:9334/json')).json(); if (pages.length) break } catch {}
      await wait(250)
    }
    socket = new WebSocket(pages[0].webSocketDebuggerUrl)
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
    let id = 0
    const pending = new Map()
    const errors = []
    socket.addEventListener('message', event => {
      const data = JSON.parse(event.data)
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
    for (const route of ['/', '/login', '/register']) {
      for (const width of [1440, 1024, 768, 375]) {
        await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
        await call('Page.navigate', { url: `http://localhost:5173${route}` })
        for (let i = 0; i < 50; i++) {
          if (await evaluate(`Boolean(document.querySelector('${route === '/' ? '.landing-hero' : '.auth-card'}'))`)) break
          await wait(100)
        }
        await wait(800)
        const result = await evaluate(`(() => ({
          width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth,
          visual: Boolean(document.querySelector('.builder-visual')),
          missingCopy: document.body.innerText.includes('builderVisual.'),
          hiddenAuth: !document.querySelector('.auth-visual') || getComputedStyle(document.querySelector('.auth-visual')).display === 'none',
          decorativeControls: document.querySelectorAll('.builder-visual a, .builder-visual button, .builder-visual input, .builder-visual [tabindex]').length,
          adminLinks: document.querySelectorAll('a[href^="/admin"]').length,
          lang: document.documentElement.lang,
        }))()`)
        assert.equal(result.overflow, false, `${route} ${width}: overflow`)
        assert.equal(result.visual, true)
        assert.equal(result.missingCopy, false)
        assert.equal(result.decorativeControls, 0)
        assert.equal(result.adminLinks, 0)
        assert.equal(result.lang, 'az')
        if (width <= 768) assert.equal(result.hiddenAuth, true)
        const screenshot = await call('Page.captureScreenshot', { format: 'png' })
        fs.writeFileSync(path.join(os.tmpdir(), `phase14-${route === '/' ? 'landing' : route.slice(1)}-${width}.png`), Buffer.from(screenshot.data, 'base64'))
        console.log(`PASS ${route} ${width}px: no overflow, localized artwork, no decorative controls or public admin links`)
      }
    }
    await evaluate(`document.querySelector('.language-switcher').click()`)
    await wait(150)
    assert.equal(await evaluate(`document.documentElement.lang`), 'en')
    assert.equal(await evaluate(`document.querySelector('.builder-visual__flow').textContent.includes('Template')`), true)
    await evaluate(`document.querySelector('input').focus()`)
    assert.equal(await evaluate(`document.activeElement.tagName`), 'INPUT')
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    assert.equal(await evaluate(`[...document.querySelectorAll('.builder-visual *')].every(el => getComputedStyle(el).animationName === 'none')`), true)
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
    await evaluate(`document.querySelector('.theme-toggle')?.click()`)
    const shot = await call('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(os.tmpdir(), 'phase14-register-light-en.png'), Buffer.from(shot.data, 'base64'))
    assert.deepEqual(errors, [])
    console.log('PASS English translation, form focus, reduced motion, no uncaught browser errors')
  } finally {
    socket?.close()
    browser.kill()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
