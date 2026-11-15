// Mock API browser regression: no production account or network writes.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const root = path.resolve(__dirname, '../..')
const temp = path.join(os.homedir(), 'AppData/Local/Temp/opencode')
fs.mkdirSync(temp, { recursive: true })
const profile = fs.mkdtempSync(path.join(temp, 'domain-public-browser-'))
const browserPath = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const origin = 'http://127.0.0.1:5198'
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5198', '--strictPort'], {
  cwd: root, stdio: 'pipe',
  env: { ...process.env, VITE_API_BASE_URL: 'https://mock.invalid', VITE_PUBLIC_SITE_MODE: 'host', VITE_PLATFORM_BASE_DOMAIN: 'sites.example.com' },
})
let viteLog = ''
vite.stdout.on('data', chunk => { viteLog += chunk })
vite.stderr.on('data', chunk => { viteLog += chunk })
let browser
let socket

;(async () => {
  const { publicSiteEndpoint, publicPageForPath } = await import(pathToFileURL(path.join(root, 'src/models/publicSite.js')))
  assert.equal(publicSiteEndpoint('Demo.sites.example.com', 'sites.example.com'), '/api/public/sites/demo')
  assert.equal(publicSiteEndpoint('customer.com', 'sites.example.com'), '/api/public/sites/by-domain?host=customer.com')
  assert.match(publicSiteEndpoint('sites.example.com', 'sites.example.com'), /by-domain/)
  assert.match(publicSiteEndpoint('a.b.sites.example.com', 'sites.example.com'), /by-domain/)
  assert.match(publicSiteEndpoint('sites.example.com.evil.test', 'sites.example.com'), /by-domain/)
  assert.equal(publicPageForPath([{ slug: 'əlaqə' }], '/%C9%99laq%C9%99/').slug, 'əlaqə')
  assert.equal(publicPageForPath([], '/%invalid'), null)

  let ready = false
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break } } catch {}
    await pause(100)
  }
  assert.ok(ready, viteLog)
  browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9349', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  browser.on('error', error => { console.error(error); process.exitCode = 1 })
  let pages
  for (let i = 0; i < 80; i++) {
    try { pages = await (await fetch('http://127.0.0.1:9349/json')).json(); if (pages.length) break } catch {}
    await pause(100)
  }
  socket = new WebSocket(pages[0].webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
  let id = 0
  const pending = new Map()
  const exceptions = []
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails)
    const request = pending.get(message.id)
    if (request) {
      pending.delete(message.id)
      if (message.error) request.reject(message.error)
      else request.resolve(message.result)
    }
  })
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id
    pending.set(requestId, { resolve, reject })
    socket.send(JSON.stringify({ id: requestId, method, params }))
  })
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const until = async expression => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(`(() => { try { return Boolean(${expression}) } catch { return false } })()`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}`)
  }
  await call('Runtime.enable')
  await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('sms.locale', 'en');
    sessionStorage.setItem('managesystem-auth-session', JSON.stringify({ token: 'stale-test-token', user: {role: 'USER'} }));
    window.calls = [];
    window.domainReadStatus = 403;
    window.planLocked = true;
    window.domain = { status: 'unconfigured', ssl: 'unconfigured', hostname: '', records: [] };
    window.site = { id: '42', projectName: 'Saved project', slug: 'original', status: 'DRAFT', content: { sentinel: 'preserve-content', pages: [] } };
    const page = (id, name, home) => ({ id, name, slug: home ? '' : id, isHome: home, sections: [
      { id: id + '-section', type: 'custom', blocks: [{ id: id + '-heading', type: 'heading', content: { text: name + ' published content' } }] }
    ]});
    window.snapshot = { projectName: 'Published project', snapshot: { site: { content: {
      pages: [page('home', 'Home', true), page('about', 'About', false)],
      navigation: { items: [
        {id:'nav-home',type:'page',pageId:'home'},
        {id:'nav-about',type:'page',pageId:'about'},
        {id:'nav-external',type:'external',url:'https://example.com',label:'External'}
      ]}
    }}}};
    const originalFetch = window.fetch;
    window.fetch = async (input, options = {}) => {
      const url = String(input);
      if (!url.startsWith('https://mock.invalid')) return originalFetch(input, options);
      const pathname = new URL(url).pathname;
      const method = options.method || 'GET';
      window.calls.push({ url, method, headers: options.headers, body: options.body });
      const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type':'application/json' } });
      if (pathname.startsWith('/api/public/sites/')) {
        const status = Number(sessionStorage.getItem('publicStatus') || 200);
        return json(status === 200 ? window.snapshot : {message:'Unavailable'}, status);
      }
      if (pathname === '/api/sites/42/domain') {
        if (method === 'GET') return json(window.domain, window.domainReadStatus);
        if (method === 'PUT') {
          if (window.planLocked) return json({message:'Plan locked', errors:{code:['CUSTOM_DOMAIN_NOT_ALLOWED']}}, 403);
          window.domain = {hostname: JSON.parse(options.body).hostname, status:'pending', ssl:'pending', records:[]};
          return json(window.domain);
        }
        if (method === 'DELETE') {
          window.domain = {status:'unconfigured',ssl:'unconfigured',hostname:'',records:[]};
          return new Response(null, {status:204});
        }
      }
      if (pathname.endsWith('/domain/verify')) {
        window.domain = {...window.domain, status:'connected', ssl:'pending'};
        return json(window.domain);
      }
      if (pathname === '/api/sites/42') {
        if (method === 'PUT') window.site = {...window.site, ...JSON.parse(options.body)};
        return json(window.site);
      }
      throw new Error('Unexpected mock API request: ' + url);
    };
  ` })
  const open = async route => {
    await call('Page.navigate', { url: origin + route })
  }
  await open('/')
  await until(`document.body.innerText.includes('Home published content')`)
  assert.equal(await evaluate(`Boolean(document.querySelector('.editor-topbar, .sidebar, .command-palette'))`), false)
  assert.equal(await evaluate(`calls.filter(c => c.url.includes('/api/public/')).every(c => !c.headers.Authorization)`), true)
  await evaluate(`document.querySelector('a[href="/about"]').click()`)
  await until(`location.pathname === '/about' && document.body.innerText.includes('About published content')`)
  assert.equal(await evaluate(`document.querySelector('a[href="/about"]').getAttribute('aria-current')`), 'page')
  // Public external links must not be cancelled by the preview-only handler.
  assert.equal(await evaluate(`(() => {
    let prevented;
    window.addEventListener('click', e => { prevented = e.defaultPrevented; e.preventDefault(); }, {once:true});
    document.querySelector('a[href="https://example.com"]').click();
    return prevented;
  })()`), false)
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await until(`Boolean(document.querySelector('.editor-site-header__toggle'))`)
  await evaluate(`document.querySelector('.editor-site-header__toggle').click()`)
  await until(`document.querySelector('#editor-site-menu')`)
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), true)
  await open('/missing')
  await until(`document.body.innerText.includes('The published site or page was not found.')`)
  await evaluate(`sessionStorage.setItem('publicStatus', '500')`)
  await open('/')
  await until(`document.body.innerText.includes('The published site could not be loaded.')`)
  await evaluate(`sessionStorage.removeItem('publicStatus'); document.querySelector('main button').click()`)
  await until(`document.body.innerText.includes('Home published content')`)

  // Mount the real settings card against the same mocked API.
  await evaluate(`(async () => {
    const {default: React} = await import('/node_modules/.vite/deps/react.js');
    const {default: ReactDOM} = await import('/node_modules/.vite/deps/react-dom_client.js');
    const {default: LocaleProvider} = await import('/src/context/LocaleProvider.jsx');
    const {default: DomainSettingsSection} = await import('/src/components/sitesettings/DomainSettingsSection.jsx');
    const element = document.createElement('div'); element.id = 'domain-test'; document.body.append(element);
    const root = ReactDOM.createRoot(element);
    const render = site => root.render(React.createElement(LocaleProvider, null,
      React.createElement(DomainSettingsSection, {siteId:'42', site, onSiteChange: updated => {window.updatedSite = updated; render(updated)}})));
    render({id:'42', name:'Saved project', slug:'original', content:window.site.content});
  })()`)
  await until(`document.querySelector('#domain-test').innerText.includes('The domain state could not be read.')`)
  assert.equal(await evaluate(`document.querySelector('#domain-status strong').textContent`), 'Not confirmed')
  const button = label => `Array.from(document.querySelectorAll('#domain-test button')).find(b => b.textContent.trim() === ${JSON.stringify(label)})`
  const click = async label => {
    await until(`${button(label)} && !${button(label)}.disabled`)
    await evaluate(`${button(label)}.click()`)
  }
  assert.equal(await evaluate(`${button('Add domain')}.disabled`), true)
  await evaluate(`window.domainReadStatus = 200`)
  await click('Try again')
  await until(`!document.querySelector('#settings-domain-hostname').disabled`)
  const fill = async (selector, value) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', {bubbles:true}));
  })()`)
  await fill('#settings-domain-hostname', 'example.com')
  await click('Add domain')
  await until(`document.querySelector('#domain-test').innerText.includes('This plan does not include custom domains.')`)
  await evaluate(`window.planLocked = false`)
  await click('Add domain')
  await until(`document.querySelector('#domain-status').innerText.includes('example.com')`)
  await click('Verify')
  await until(`document.querySelector('#domain-test').innerText.includes('Domain ownership is verified, but active SSL has not been confirmed.')`)
  await click('Remove domain')
  await until(`document.querySelector('#settings-domain-hostname').value === '' && document.querySelector('#domain-status strong').textContent === 'Not connected'`)
  await fill('#platform-subdomain', 'new-slug')
  await click('Save')
  await until(`window.updatedSite?.slug === 'new-slug'`)
  const update = await evaluate(`JSON.parse(calls.find(c => c.method === 'PUT' && c.url.endsWith('/api/sites/42')).body)`)
  assert.equal(update.projectName, 'Saved project')
  assert.equal(update.content.sentinel, 'preserve-content')
  assert.equal(update.slug, 'new-slug')
  assert.deepEqual(exceptions, [])
  console.log('PASS: host routing, anonymous snapshot rendering, page navigation, mobile layout, 404/500 + retry, domain read failure + retry, plan gate, add/verify/remove, SSL messaging, slug save preserves content.')
})().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(() => {
  socket?.close()
  browser?.kill()
  vite.kill()
})
