// Real React routes + HTTP adapters, deterministic mock backend; no account writes.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '../..')
const temp = path.join(os.homedir(), 'AppData/Local/Temp/opencode')
fs.mkdirSync(temp, { recursive: true })
const profile = fs.mkdtempSync(path.join(temp, 'activity-deploy-browser-'))
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const origin = 'http://127.0.0.1:5197'
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5197', '--strictPort'], {
  cwd: root, stdio: 'pipe',
  env: { ...process.env, VITE_API_BASE_URL: 'https://mock.invalid', VITE_PUBLIC_SITE_MODE: '' },
})
let logs = ''
vite.stdout.on('data', chunk => { logs += chunk })
vite.stderr.on('data', chunk => { logs += chunk })
let browser, socket
;(async () => {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break } } catch {}
    await pause(100)
  }
  assert.ok(ready, logs)
  const chrome = process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe')
  browser = spawn(chrome, ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9350', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  let pages
  for (let i = 0; i < 80; i++) {
    try { pages = await (await fetch('http://127.0.0.1:9350/json')).json(); if (pages.length) break } catch {}
    await pause(100)
  }
  socket = new WebSocket(pages[0].webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
  let id = 0
  const pending = new Map(), exceptions = []
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
    for (let i = 0; i < 150; i++) {
      if (await evaluate(`(() => {try {return Boolean(${expression})} catch {return false}})()`)) return
      await pause(100)
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate('document.body.innerText')}`)
  }
  await call('Page.enable')
  await call('Runtime.enable')
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('sms.locale', 'en');
    sessionStorage.setItem('managesystem-auth-session', JSON.stringify({token:'test-session',user:{id:'7',name:'Smoke',email:'smoke@example.test',role:'user'}}));
    window.calls=[]; window.usageStatus=500; window.activityStatus=200; window.polls=0; window.detailPolls=0;
    window.publication={status:'published',available:true,pending:false};
    const now='2026-11-17T10:00:00Z';
    const row=(id,version,status)=>({id,siteId:'42',version,status,createdAt:now,finishedAt:status==='queued'?null:now});
    window.rows=[row('10',2,'live'),row('9',1,'superseded'),row('8',3,'failed')];
    window.site={id:'42',projectName:'Contract site',slug:'contract-site',status:'DRAFT',content:{pages:[{id:'home',name:'Home',slug:'',isHome:true,sections:[]}]}};
    const realFetch=window.fetch;
    window.fetch=async(input,options={})=>{
      const url=new URL(String(input),location.href);
      if(url.origin!=='https://mock.invalid')return realFetch(input,options);
      const p=url.pathname,m=options.method||'GET';
      calls.push({path:p,search:url.search,method:m,body:options.body});
      const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
      if(p==='/notifications')return json([]);
      if(p==='/api/activity')return json([{id:'a1',type:'site.created',summary:'Persisted creation',createdAt:now,actor:{id:'7',name:'Smoke'},target:{id:'42',type:'site',label:'Contract site'}}],activityStatus);
      if(p==='/api/usage')return json({websites:2,deployments:4},usageStatus);
      if(p==='/api/usage/limits')return json({websites:5});
      if(p==='/api/sites')return url.search?json([site]):json({message:'Legacy null-search failure'},500);
      if(p==='/api/sites/42')return json(site);
      if(p==='/api/sites/42/publication'){
        if(m==='DELETE'){publication={...publication,status:'unpublished'};return new Response(null,{status:204})}
        if(m==='POST'){publication={...publication,pending:true};return json(row('11',4,'queued'),202)}
        return json(publication);
      }
      if(p==='/api/deployments'){
        if(m==='POST'){rows.unshift(row('11',4,'queued'));return json(rows[0],201)}
        if(rows[0].status==='queued' && ++polls>1){rows[0].status='live';rows[0].finishedAt=now;rows[1].status='superseded'}
        return json(rows);
      }
      if(p==='/api/deployments/11')return json(++detailPolls>3?row('11',4,'live'):row('11',4,'queued'));
      if(p.endsWith('/rollback'))return json({message:'A deployment is already in progress for this site.'},409);
      return json({message:'Not found'},404);
    };
  ` })
  const open = async route => call('Page.navigate', { url: origin + route })
  await open('/activity')
  await until(`document.body.innerText.includes('Persisted creation')`)
  assert.equal(await evaluate(`document.body.innerText.includes('Some usage or limit figures could not be loaded.')`), true)
  assert.equal(await evaluate(`calls.some(c=>c.path==='/api/activity' && c.search.includes('size=100'))`), true)
  await evaluate(`usageStatus=200; Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Try again').click()`)
  await until(`!document.body.innerText.includes('Some usage or limit figures could not be loaded.')`)
  assert.equal(await evaluate(`document.body.innerText.includes('Persisted creation')`), true)
  // A forbidden read must reject, never masquerade as an empty activity log.
  assert.equal(await evaluate(`(async()=>{activityStatus=403;const {default:service}=await import('/src/services/activityService.js');try{await service.getActivity({scope:'account'});return 0}catch(e){return e.status}finally{activityStatus=200}})()`), 403)

  await open('/deployments')
  await until(`document.querySelectorAll('.dep-card').length===3 && document.querySelector('#dep-site-select option[value="42"]')`)
  assert.equal(await evaluate(`document.querySelector('#dep-site-select option[value="42"]').textContent`), 'Contract site')
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.dep-card__link')).map(e=>e.textContent)`), ['2','1','3'])
  assert.equal(await evaluate(`document.body.innerText.includes('Superseded')`), true)
  const rollbackLabel = await evaluate(`(async()=>(await import('/src/i18n/locales/en.js')).default.workspaceDeployments.card.rollbackCta)()`)
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.dep-card button')).filter(b=>b.textContent.trim()===${JSON.stringify(rollbackLabel)}).length`), 1)
  await evaluate(`(()=>{const e=document.querySelector('#dep-site-select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,'42');e.dispatchEvent(new Event('change',{bubbles:true}))})()`)
  await until(`!document.querySelector('.dep-deploy__submit').disabled`)
  await evaluate(`document.querySelector('.dep-deploy').requestSubmit()`)
  await until(`Array.from(document.querySelectorAll('.dep-card')).some(e=>e.innerText.includes('Queued'))`)
  await until(`document.querySelector('.dep-card .dep-chip').textContent.trim()==='Live' && document.querySelector('.dep-card__link').textContent==='4'`)
  assert.equal(await evaluate(`calls.some(c=>c.method==='POST' && c.path==='/api/deployments' && JSON.parse(c.body).siteId==='42')`), true)
  await evaluate(`Array.from(document.querySelectorAll('.dep-card button')).find(b=>b.textContent.trim()===${JSON.stringify(rollbackLabel)}).click()`)
  await until(`document.body.innerText.includes('A deployment is already in progress for this site.')`)

  await open('/deployments/11')
  await until(`document.querySelector('.sites-page__headline .dep-chip').textContent.trim()==='Queued'`)
  await until(`document.querySelector('.sites-page__headline .dep-chip').textContent.trim()==='Live'`)
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.dep-page__actions button')).some(b=>b.textContent.trim()===${JSON.stringify(rollbackLabel)})`), false)

  await open('/sites/42')
  await until(`document.body.innerText.includes('Contract site') && Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Unpublish')`)
  await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Unpublish').click()`)
  await until(`document.querySelector('dialog[open] .btn--primary') && !document.querySelector('dialog[open] .btn--primary').disabled`)
  await evaluate(`document.querySelector('dialog[open] .btn--primary').click()`)
  await until(`document.body.innerText.includes('The site has been unpublished.')`)
  assert.equal(await evaluate(`calls.some(c=>c.path==='/api/sites/42/publication'&&c.method==='DELETE')`), true)
  assert.deepEqual(exceptions, [])
  console.log('PASS: activity survives usage failure; API errors propagate; site-list fallback; numeric versions; superseded/rollback rules; create + list/detail polling; backend conflict messages; unpublish API.')
})().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => {
  socket?.close()
  browser?.kill()
  vite.kill()
})
