const { spawn } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
async function launch() {
 const port=process.env.AUDIT_PORT || 9341
 const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'frontend-audit-'))
 const browser = spawn(process.env.CHROMIUM_PATH || path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe'), ['--headless', '--no-first-run', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
 browser.on('error', console.error)
 let pages
 for(let i=0;i<60;i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if(pages.length) break } catch {} await wait(200) }
 if(!pages?.length) { browser.kill(); throw Error('Browser unavailable') }
 const socket = new WebSocket(pages[0].webSocketDebuggerUrl)
 await new Promise(r=>socket.addEventListener('open',r,{once:true}))
 let id=0; const pending=new Map(); const errors=[]
 socket.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text); if(data.method==='Runtime.consoleAPICalled' && ['error','warning'].includes(data.params.type)) errors.push(data.params.args.map(a=>a.value||a.description).join(' '));const item=pending.get(data.id); if(item) {pending.delete(data.id);if(data.error) item.reject(data.error); else item.resolve(data.result)}})
 const call=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params}))})
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);return r.result.value}
 const until=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await wait(100)}throw Error('Timeout '+expression)}
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']})
 const open=async route=>{await call('Page.navigate',{url:`${process.env.AUDIT_URL || 'http://127.0.0.1:5173'}${route}`});await until(`document.readyState === 'complete' && Boolean(document.querySelector('main, .status-page')) && !document.querySelector('.page-status .spinner')`);await wait(250)}
 const click=async selector=>{await until(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(180)}
 const fill=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`)}
 const viewport=async(width,height)=>call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
 const screenshot=async name=>{fs.mkdirSync('artifacts/frontend-audit',{recursive:true});const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`artifacts/frontend-audit/${name}.png`,Buffer.from(r.data,'base64'))}
 const login=async(admin=false)=>{await open(admin?'/admin/login':'/login');await click('.language-switcher__option[lang="en"]');await fill('input[type=email]',admin?'admin001@gmail.com':'member@demo.com');await fill('input[type=password]',admin?'holb1234':'member123');await click('button[type=submit]');await until(`location.pathname === '${admin?'/admin':'/workspaces'}'`);await wait(250)}
 return {call,evaluate,until,open,click,fill,viewport,screenshot,login,errors,wait,close:()=>{socket.close();browser.kill()}}
}
module.exports={launch}
