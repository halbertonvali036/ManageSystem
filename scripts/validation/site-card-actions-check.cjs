// Run against a Vite dev server with VITE_API_BASE_URL configured.
// All API requests are intercepted; no real account or website is changed.
const { launch } = require('./audit-browser.cjs')
const assert = require('node:assert/strict')

function fixture() {
  sessionStorage.setItem('managesystem-auth-session', JSON.stringify({
    token: 'fixture-only', user: { id: 1, role: 'user', name: 'QA', email: 'qa@example.test' },
  }))
  const site = { id: 101, projectName: 'Action test', slug: 'action-test', status: 'DRAFT',
    content: { pages: [{ id: 'home', name: 'Home', slug: '', isHome: true, sections: [] }] } }
  window.testSites = [site]
  window.testWrites = []
  const original = window.fetch.bind(window)
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href)
    if (!url.pathname.includes('/api/') && url.origin === location.origin) return original(input, options)
    const path = url.pathname.replace(/^\/api/, '')
    const method = options.method || 'GET'
    const body = options.body ? JSON.parse(options.body) : null
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
    if (method !== 'GET') window.testWrites.push({ path, method, body })
    if (window.failAction && method !== 'GET') return json({ message: 'Plan limit reached' }, 403)
    if (path === '/sites') return json(window.testSites)
    if (path.endsWith('/publication')) return json(method === 'GET' ? { available: true, pending: false } : { status: 'QUEUED' })
    if (path === '/sites/101/duplicate') {
      window.testSites.push({ ...structuredClone(site), id: 102, slug: 'action-test-copy' })
      return json(window.testSites[1])
    }
    if (path === '/sites/101') {
      if (method === 'PUT') Object.assign(site, body)
      if (method === 'DELETE') { window.testSites = window.testSites.filter(s => s.id !== 101); return new Response(null, { status: 204 }) }
      return json(site)
    }
    return json([])
  }
}

;(async () => {
  const b = await launch()
  try {
    await b.call('Page.addScriptToEvaluateOnNewDocument', { source: `(${fixture.toString()})()` })
    await b.open('/sites')
    await b.until(`document.querySelectorAll('.site-card').length === 1`)
    const action = async index => {
      await b.click('.site-card__menu-trigger')
      assert.equal(await b.evaluate(`document.querySelectorAll('.site-card__menu-item:disabled').length`), 0)
      await b.click(`.site-card__menu-item:nth-child(${index})`)
    }
    const confirm = () => b.click('.modal__actions button:last-child')
    await action(3)
    await b.fill('.modal input', '   ')
    await confirm()
    assert.equal(await b.evaluate('testWrites.length'), 0)
    await b.fill('.modal input', 'Renamed site')
    await confirm()
    await b.until(`document.querySelector('.site-card__name')?.textContent === 'Renamed site'`)
    const rename = await b.evaluate('testWrites[0].body')
    assert.equal(rename.slug, 'action-test')
    assert.equal(rename.content.pages[0].id, 'home')
    await action(4)
    await b.evaluate('window.failAction = true')
    await confirm()
    assert.match(await b.evaluate(`document.querySelector('.modal__error').textContent`), /Plan limit reached/)
    assert.equal(await b.evaluate('testSites.length'), 1)
    await b.evaluate('window.failAction = false')
    await confirm()
    await b.until(`document.querySelectorAll('.site-card').length === 2`)
    await action(5)
    await confirm()
    await b.until(`document.querySelector('.site-card').dataset.status === 'archived'`)
    assert.equal(await b.evaluate('testSites[0].status'), 'ARCHIVED')
    await action(6)
    await b.until(`document.querySelector('.publish-actions .btn--primary:not(:disabled)') !== null`)
    await b.click('.publish-actions .btn--primary')
    await b.until(`testWrites.some(w => w.path.endsWith('/publication') && w.method === 'POST')`)
    await b.until(`document.querySelector('.site-card') !== null`)
    await action(7)
    await b.click('.modal__actions button:first-child')
    assert.equal(await b.evaluate('testSites.length'), 2)
    await action(7)
    await confirm()
    await b.until(`document.querySelectorAll('.site-card').length === 1`)
    await b.open('/sites')
    await action(2)
    await b.until(`location.search === '?preview=1' && document.querySelector('.editor[data-preview="true"]') !== null`)
    assert.deepEqual(b.errors, [])
    console.log('PASS: rename validation/content preservation, duplicate/error/retry, archive, publish, delete/cancel/list refresh, preview navigation.')
  } finally { b.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
