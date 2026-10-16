const {launch}=require('./audit-browser.cjs')
const fs=require('node:fs')
const assert=require('node:assert/strict')
;(async()=>{const b=await launch();const results=[];try{
 await b.login();await b.viewport(1440,900);await b.open('/templates')
 const ids=await b.evaluate(`import('/src/models/siteTemplate.js').then(m=>m.SITE_TEMPLATES.map(t=>t.id))`)
 for(const id of ids){
  await b.click(`.template-card:has(a[href$="template=${id}"]) button`)
  const audit=await b.evaluate(`(()=>{const root=document.querySelector('.template-preview');const lum=color=>{const a=color.match(/[\\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};return {title:root.querySelector('h2').innerText,buttons:[...root.querySelectorAll('.editor-block__button')].map(e=>{const s=getComputedStyle(e);const a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}),rows:[...root.querySelectorAll('[data-layout="row"] .editor-canvas__section-inner')].map(e=>getComputedStyle(e).flexDirection),splitHeights:[...root.querySelectorAll('[data-layout="split"]')].map(e=>e.getBoundingClientRect().height),studioEdge:getComputedStyle(root).getPropertyValue('--studio-edge').trim()}})()`)
  if(!audit.buttons.every(r=>r>=4.5)) console.log(id,audit)
  assert.ok(audit.buttons.every(r=>r>=4.5),id+' contrast');assert.ok(audit.rows.every(r=>r==='row'),id+' rows');assert.ok(audit.studioEdge)
  results.push({id,...audit})
  if(['maison','atlas-dashboard','aurelia-wellness'].includes(id))await b.screenshot(`final-dialog-${id}-1440`)
  await b.click('.template-preview__close')
 }
 for(const [w,h] of [[1440,900],[1920,1080],[834,1112],[390,844]]){
  await b.viewport(w,h);assert.equal(await b.evaluate('document.documentElement.scrollWidth>innerWidth+1'),false)
  await b.click('.template-card:has(a[href$="template=atlas-dashboard"]) button')
  await b.click('.template-preview__device:nth-child(3)')
  assert.equal(await b.evaluate('document.documentElement.scrollWidth>innerWidth+1'),false)
  await b.screenshot('final-gallery-dialog-'+w);await b.click('.template-preview__close')
 }
 assert.deepEqual(b.errors,[]);console.log('Final current-code audit: '+results.length+' templates, 0 errors')
}finally{fs.writeFileSync('artifacts/frontend-audit/template-final.json',JSON.stringify({results,errors:b.errors},null,2));b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
