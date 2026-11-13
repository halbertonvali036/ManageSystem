// Dependency-free check of the create-site error routing. Run against `npm run dev`.
// The backend contract for a plan-limit refusal is not published yet, so the
// limit cases below cover every shape the router accepts (code, nested code and
// message) rather than a single confirmed body.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const browserPath =
  process.env.CHROMIUM_PATH ||
  path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const appUrl = process.env.APP_URL || 'http://localhost:5173'
const cdpPort = Number(process.env.CDP_PORT || 9337)
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'create-wizard-errors-'))
const browser = spawn(
  browserPath,
  [
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
browser.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})

;(async () => {
  let socket
  try {
    /*
     * Static guard: StrictMode mounts effects twice but not event handlers, so
     * one submit must mean one POST. The lock is set synchronously before the
     * request and checked at the top of the handler.
     */
    const pageSource = fs.readFileSync(
      path.join(__dirname, '../../src/pages/CreateWebsitePage.jsx'),
      'utf8',
    )
    const mainSource = fs.readFileSync(path.join(__dirname, '../../src/main.jsx'), 'utf8')
    assert.match(mainSource, /<StrictMode>/, 'StrictMode is expected in main.jsx')
    assert.match(
      pageSource,
      /if \(isSubmitting \|\| submitLockRef\.current\) return/,
      'the submit handler must check the lock',
    )
    const lockIndex = pageSource.indexOf('submitLockRef.current = true')
    const callIndex = pageSource.indexOf('await siteService.createSite')
    assert.ok(
      lockIndex > 0 && callIndex > lockIndex,
      'the lock must be set before the create request',
    )

    let pages
    for (let i = 0; i < 40; i++) {
      try {
        pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json()
        if (pages.length) break
      } catch {}
      await wait(250)
    }
    if (!pages?.length) {
      throw Error('Chromium did not expose a page; is another harness using the port?')
    }

    socket = new WebSocket(pages[0].webSocketDebuggerUrl)
    await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))
    let id = 0
    const pending = new Map()
    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      const request = pending.get(data.id)
      if (!request) return
      pending.delete(data.id)
      if (data.error) request.reject(data.error)
      else request.resolve(data.result)
    })
    const call = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const requestId = ++id
        pending.set(requestId, { resolve, reject })
        socket.send(JSON.stringify({ id: requestId, method, params }))
      })
    const evaluate = async (expression) => {
      const result = await call('Runtime.evaluate', {
        expression: `globalThis.__errorRouting = (${expression})`,
        returnByValue: true,
        awaitPromise: true,
      })
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
      return result.result.value
    }

    await call('Runtime.enable')
    await call('Page.enable')

    // Vite compiles the modules on demand; the app page is the module host.
    await call('Page.navigate', { url: `${appUrl}/` })
    for (let i = 0; i < 100; i++) {
      if (await evaluate('document.readyState === "complete"')) break
      await wait(100)
    }

    const results = await evaluate(`(async () => {
      const {
        isDuplicateSlugError,
        isDuplicateNameError,
        isSiteLimitError,
        planCreateFailure,
      } = await import('/src/services/createWizardErrors.js')
      const { RequestError } = await import('/src/services/httpClient.js')

      const t = (key) => key
      const requestError = (status, data) =>
        new RequestError(data?.message || 'Request failed', { status, data, code: 'TEST' })

      const scenarios = {
        // A bare 409 carries no slug indication: it must not become a URL error.
        bare409: requestError(409, { message: 'Conflict', errors: {} }),
        // Other 409s keep the backend message and stay on the current step.
        other409: requestError(409, {
          message: 'The project cannot be created right now.',
          errors: {},
        }),
        slug422: requestError(422, {
          message: 'Validation failed',
          errors: { slug: ['This URL is already taken.'] },
        }),
        slugMessage: requestError(409, {
          message: 'This subdomain is already in use.',
          errors: {},
        }),
        limitCode: requestError(409, {
          code: 'SITE_LIMIT_REACHED',
          message: 'Site limit reached',
        }),
        limitNestedCode: requestError(403, {
          error: { code: 'SITE_LIMIT_REACHED' },
          message: 'Forbidden',
        }),
        limitMessage: requestError(403, {
          message: "Your plan's site limit is reached. Upgrade to continue.",
          errors: {},
        }),
        name422: requestError(422, {
          message: 'Validation failed',
          errors: { projectName: ['A project with this name already exists.'] },
        }),
        nameRequired422: requestError(422, {
          message: 'Validation failed',
          errors: { name: ['The name is required.'] },
        }),
      }

      const out = {}
      for (const [name, error] of Object.entries(scenarios)) {
        out[name] = {
          duplicateSlug: isDuplicateSlugError(error),
          duplicateName: isDuplicateNameError(error),
          siteLimit: isSiteLimitError(error),
          plan: planCreateFailure(error, t),
        }
      }
      return out
    })()`)

    const plan = (name) => results[name].plan

    // 1. A bare 409 is not a duplicate slug, and is not moved to the Project step.
    assert.equal(results.bare409.duplicateSlug, false)
    assert.equal(plan('bare409').step, null)
    assert.equal(plan('bare409').fieldErrors, null)
    assert.equal(plan('bare409').formError, 'Conflict')
    assert.equal(plan('bare409').formErrorAction, undefined)

    // 3. Any other 409 shows the backend message and keeps the current step.
    assert.equal(results.other409.duplicateSlug, false)
    assert.equal(plan('other409').step, null)
    assert.equal(plan('other409').fieldErrors, null)
    assert.equal(
      plan('other409').formError,
      'The project cannot be created right now.',
    )

    // 1. A slug field error returns to Project with the slug focused.
    assert.equal(results.slug422.duplicateSlug, true)
    assert.equal(plan('slug422').step, 1)
    assert.equal(plan('slug422').focus, 'slug')
    assert.equal(plan('slug422').fieldErrors.slug, 'This URL is already taken.')

    // 1. A message that names the subdomain as taken is also a slug error.
    assert.equal(results.slugMessage.duplicateSlug, true)
    assert.equal(plan('slugMessage').step, 1)
    assert.equal(plan('slugMessage').focus, 'slug')

    // 2. Plan-limit refusals: formError + upgrade link, no step or field change.
    const limitNames = ['limitCode', 'limitNestedCode', 'limitMessage']
    for (const name of limitNames) {
      assert.equal(results[name].siteLimit, true, `${name} should be a site-limit error`)
      assert.equal(results[name].duplicateSlug, false, `${name} is not a URL error`)
      assert.equal(plan(name).step, null, `${name} must not change the step`)
      assert.equal(plan(name).fieldErrors, null, `${name} must not clear a field`)
      assert.equal(plan(name).formError, 'createSite.siteLimitReached')
      assert.deepEqual(plan(name).formErrorAction, {
        to: '/billing',
        labelKey: 'createSite.siteLimitUpgrade',
      })
    }

    // 4. A duplicate project name goes to the name field, never the slug.
    assert.equal(results.name422.duplicateSlug, false)
    assert.equal(results.name422.duplicateName, true)
    assert.equal(plan('name422').step, 1)
    assert.equal(plan('name422').focus, 'name')
    assert.equal(plan('name422').fieldErrors.name, 'A project with this name already exists.')

    // A non-duplicate name error still maps to the name field through the
    // generic field routing, with its own message.
    assert.equal(results.nameRequired422.duplicateName, false)
    assert.equal(plan('nameRequired422').step, 1)
    assert.equal(plan('nameRequired422').focus, 'name')
    assert.equal(plan('nameRequired422').fieldErrors.name, 'The name is required.')

    console.log('PASS create-site error routing')
    console.log(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(results).map(([name, result]) => [
            name,
            {
              duplicateSlug: result.duplicateSlug,
              duplicateName: result.duplicateName,
              siteLimit: result.siteLimit,
              step: result.plan.step,
              focus: result.plan.focus,
              formError: result.plan.formError,
              action: result.plan.formErrorAction?.to ?? null,
            },
          ]),
        ),
        null,
        2,
      ),
    )
  } finally {
    socket?.close()
    browser.kill()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
