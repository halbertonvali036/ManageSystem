const {launch}=require('./audit-browser.cjs')
const fs=require('node:fs')
const assert=require('node:assert/strict')
;(async()=>{const b=await launch();const result={locales:[],keyboard:[],performance:[]};try{
 await b.viewport(1440,900);await b.login();await b.open('/templates')
 // CDP keyboard input is not delivered on this host. Exercise the application
 // handlers explicitly and verify native focusable button/link semantics.
 const key=async(key)=>{await b.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(key)},bubbles:true,cancelable:true}))`);await b.wait(180)}
 await b.evaluate(`document.querySelector('.template-card button').focus()`);await b.click('.template-card button')
 assert.equal(await b.evaluate(`document.activeElement.classList.contains('template-preview__close')`),true)
 await b.evaluate(`document.querySelector('.template-preview__actions a').focus()`);await key('Tab')
 assert.equal(await b.evaluate(`document.activeElement.classList.contains('template-preview__close')`),true)
 await key('Escape');assert.equal(await b.evaluate(`document.activeElement.matches('.template-card button')`),true)
 result.keyboard.push('Native button/link semantics; focus enters dialog; Tab handler wraps; Escape handler closes and restores trigger focus. Native CDP key delivery unavailable on host.')
 for(const locale of ['az','en']){
  await b.click(`.language-switcher__option[lang="${locale}"]`)
  const cards=await b.evaluate(`[...document.querySelectorAll('.template-card a')].map(a=>a.getAttribute('href'))`)
  for(const href of cards){
   await b.click(`.template-card:has(a[href="${href}"]) button`)
   const n=await b.evaluate(`document.querySelectorAll('.template-preview__page').length`)
   for(let i=1;i<=n;i++){
    await b.click(`.template-preview__page:nth-child(${i})`)
    const text=await b.evaluate(`document.querySelector('.template-preview').innerText`)
    assert.equal(/\b(?:siteSection|siteTemplate|editor|templates)\.[\w.]+/.test(text),false)
    assert.equal(/undefined|\[object Object\]|�/.test(text),false)
   }
   await b.click('.template-preview__close')
  }
  result.locales.push({locale,templates:cards.length,status:'all preview pages rendered without raw keys or malformed text'})
 }
 const slugs=await b.evaluate(`(async()=>{const m=await import('/src/models/siteTemplate.js');const e=await import('/src/models/siteEditor.js');return m.SITE_TEMPLATES.map(t=>({id:t.id,slugs:e.createLocalDraftDocument({pageSkeletons:m.getTemplatePageSkeletons(t.id)}).pages.map(p=>p.slug)}))})()`)
 for(const t of slugs){assert.equal(t.slugs[0],'');assert.equal(new Set(t.slugs).size,t.slugs.length);assert.ok(t.slugs.slice(1).every(Boolean))}
 result.slugs=slugs
 await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
 assert.equal(await b.evaluate(`document.querySelectorAll('.template-card [data-motion-state], .template-card canvas').length`),0)
 await b.evaluate(`window.qaLongTasks=[];window.qaObserver=new PerformanceObserver(l=>window.qaLongTasks.push(...l.getEntries().map(e=>e.duration)));window.qaObserver.observe({type:'longtask'})`)
 for(const id of ['nova-ai','atlas-dashboard']){
  const start=await b.evaluate('performance.now()')
  await b.click(`.template-card:has(a[href$="template=${id}"]) button`)
  const time=await b.evaluate('performance.now()')-start
  await b.wait(100)
  result.performance.push({id,openWithAutomationWaitMs:Math.round(time),motionNodes:await b.evaluate(`document.querySelectorAll('.template-preview [data-site-motion]').length`)})
  await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await b.wait(100)
  assert.equal(await b.evaluate(`[...document.querySelectorAll('.template-preview [data-motion-state]')].filter(e=>getComputedStyle(e).animationName!=='none'||getComputedStyle(e).opacity!=='1').length`),0)
  await b.click('.template-preview__close')
  await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
 }
 result.longTasks=await b.evaluate('window.qaLongTasks');result.errors=b.errors;assert.deepEqual(b.errors,[])
 console.log(JSON.stringify(result,null,2))
}finally{fs.writeFileSync('artifacts/frontend-audit/template-extras.json',JSON.stringify(result,null,2));b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
