// Vite-only visual check. API calls are intercepted; real websites are untouched.
const { launch } = require('./audit-browser.cjs')
const assert = require('node:assert/strict')

function fixture() {
  sessionStorage.setItem('managesystem-auth-session', JSON.stringify({
    token: 'fixture', user: { id: 1, role: 'user', name: 'QA' },
  }))
  window.previewReads = []
  window.previewRetry = false
  const original = fetch.bind(window)
  let records
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href)
    if (url.origin === location.origin && !url.pathname.includes('/api/')) return original(input, options)
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
    const path = url.pathname.replace(/^\/api/, '')
    if (!records) {
      const [{ createLocalDraftDocument }, { getTemplatePageSkeletons }, { normalizeSiteTheme }, { translate }] = await Promise.all([
        import('/src/models/siteEditor.js'), import('/src/models/siteTemplate.js'),
        import('/src/models/siteTheme.js'), import('/src/i18n/dictionary.js'),
      ])
      records = ['restaurant-simple', 'nova-ai', 'portfolio-minimal'].map((id, i) => {
        const content = createLocalDraftDocument({ t: key => translate(key, 'az'), pageSkeletons: getTemplatePageSkeletons(id) })
        content.theme = normalizeSiteTheme(['bistro', 'nova', 'atelier'][i])
        content.pages[0].sections[0].blocks.find(b => b.type === 'heading').content.text = `Saved custom heading ${i}`
        return { id: i + 101, projectName: ['Süfrə restoranı', 'Nova platforması', 'İmza portfolio'][i], slug: id, content, status: 'DRAFT', updatedAt: '2026-11-23T10:00:00Z' }
      })
    }
    if (path === '/sites') return json(records.map(({ content: _content, ...summary }) => summary))
    const match = path.match(/^\/sites\/(\d+)$/)
    if (match) {
      const id = Number(match[1])
      window.previewReads.push(id)
      if (id === 103 && !window.previewRetry) return json({ message: 'Preview unavailable' }, 500)
      return json(records.find(r => r.id === id))
    }
    return json([])
  }
}

;(async () => {
  const b = await launch()
  try {
    await b.call('Page.addScriptToEvaluateOnNewDocument', { source: `(${fixture.toString()})()` })
    await b.viewport(1440, 1000)
    await b.open('/sites')
    await b.until(`document.querySelectorAll('.site-card__preview-stage').length === 2`)
    const cards = await b.evaluate(`[...document.querySelectorAll('.site-card__preview-stage')].map(e => ({
      text:e.textContent, theme:e.querySelector('[data-site-theme]').dataset.siteTheme,
      color:getComputedStyle(e.querySelector('.editor-canvas__page')).backgroundColor,
      inert:e.inert, scale:e.getBoundingClientRect().width
    }))`)
    assert.match(cards[0].text, /Saved custom heading 0/)
    assert.match(cards[1].text, /Saved custom heading 1/)
    assert.equal(cards[0].theme, 'bistro')
    assert.equal(cards[1].theme, 'nova')
    assert.notEqual(cards[0].color, cards[1].color)
    assert(cards.every(c => c.inert && c.scale > 100 && c.scale < 600))
    await b.evaluate('window.previewRetry = true')
    await b.click('.site-card__preview-state button')
    await b.until(`document.querySelectorAll('.site-card__preview-stage').length === 3`)
    assert.equal(await b.evaluate(`document.querySelectorAll('.site-card__preview [data-motion-state]').length`), 0)
    await b.screenshot('site-thumbnails-desktop')
    await b.viewport(390, 844)
    assert.equal(await b.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false)
    await b.screenshot('site-thumbnails-mobile')
    await b.click('.site-card__menu-trigger')
    assert.equal(await b.evaluate(`document.querySelectorAll('.site-card__menu-item:disabled').length`), 0)
    assert.deepEqual(b.errors, [])
    console.log('PASS: saved custom text, distinct site colors/themes, inert thumbnails, resize, error/retry, no motion or overflow; menu remains usable.')
  } finally { b.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
