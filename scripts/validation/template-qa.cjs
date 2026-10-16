const { launch } = require('./audit-browser.cjs')
const fs = require('node:fs')
const assert = require('node:assert/strict')
;(async () => {
 const b = await launch(); const report = { templates: [], errors: [] }
 try {
  await b.viewport(1440,900); await b.login(); await b.open('/templates')
  const templates = await b.evaluate(`(async()=>{const m=await import('/src/models/siteTemplate.js');const e=await import('/src/models/siteEditor.js');const {translate}=await import('/src/i18n/dictionary.js');return m.SITE_TEMPLATES.map(x=>({...x, counts:['en','az'].map(locale=>{const missing=[];const t=k=>{const v=translate(k,locale);if(v===k)missing.push(k);return v};[x.nameKey,x.descriptionKey,...x.tags,...x.features].forEach(t);const d=e.createLocalDraftDocument({t,pageSkeletons:m.getTemplatePageSkeletons(x.id).map(p=>({...p,name:t(p.nameKey)}))});return {locale,missing,pages:d.pages.map(p=>({name:p.name,sections:p.sections.length,blocks:p.sections.reduce((n,s)=>n+s.blocks.length,0)})),empty:d.pages.flatMap(p=>p.sections.flatMap(s=>s.blocks.filter(b=>['heading','text'].includes(b.type)&&!b.content.text?.trim())))}})}))})()`)
  assert.equal(templates.length,13)
  for(const x of templates) for(const c of x.counts){assert.deepEqual(c.missing,[]);assert.deepEqual(c.empty,[])}
  for(const tier of ['free','pro','all']){
   await b.click(`.templates-tier__item[data-tier="${tier}"]`)
   assert.equal(await b.evaluate(`document.querySelectorAll('.template-card').length`),templates.filter(t=>tier==='all'||t.tier===tier).length)
  }
  const categories=await b.evaluate(`import('/src/models/siteTemplate.js').then(m=>m.TEMPLATE_CATEGORIES.map(c=>c.id))`)
  for(let i=0;i<categories.length;i++){
   await b.click(`.templates-filter__item:nth-child(${i+1})`)
   assert.equal(await b.evaluate(`document.querySelectorAll('.template-card').length`),templates.filter(t=>categories[i]==='all'||t.category===categories[i]).length)
  }
  await b.click('.templates-browse__reset');await b.fill('#templates-search','portfolio');await b.wait(250)
  assert.equal(await b.evaluate(`document.querySelectorAll('.template-card').length`),2)
  await b.click('.templates-tier__item[data-tier="pro"]')
  assert.equal(await b.evaluate(`document.querySelectorAll('.template-card').length`),1)
  await b.fill('#templates-search','zz-no-results-zz');await b.wait(250)
  assert.equal(await b.evaluate(`Boolean(document.querySelector('.templates-empty'))`),true)
  await b.click('.templates-browse__reset')
  report.gallery='All, Free, Pro, every category, search, combined, reset, no results passed'
  for(const template of templates){
   await b.open('/templates')
   await b.click(`.template-card:has(a[href$="template=${template.id}"]) button`)
   for(let i=0;i<template.pages.length;i++){
    await b.click(`.template-preview__page:nth-child(${i+1})`)
    assert.equal(await b.evaluate(`document.querySelectorAll('.template-preview .editor-canvas__section').length`),template.counts[0].pages[i].sections)
    assert.equal(await b.evaluate(`document.querySelectorAll('.template-preview .editor-canvas__block-slot').length`),template.counts[0].pages[i].blocks)
   }
   for(let i=1;i<=3;i++)await b.click(`.template-preview__device:nth-child(${i})`)
   await b.screenshot(`template-dialog-${template.id}`)
   await b.click('.template-preview__actions a')
   await b.click('button[type=submit]'); await b.click('button[type=submit]')
   await b.click('.local-draft-entry button')
   await b.fill('input[name=name]',`QA ${template.id}`)
   for(let i=0;i<3;i++) await b.click('button[type=submit]')
   await b.click('.local-draft-entry button')
   await b.until(`Boolean(document.querySelector('.editor-canvas__page'))`)
   const pages=[]
   for(let i=0;i<template.pages.length;i++){
    await b.click(`.editor-page-list > li:nth-child(${i+1}) .editor-page-list__select`)
    pages.push(await b.evaluate(`({sections:document.querySelectorAll('.editor-canvas__section').length,blocks:document.querySelectorAll('.editor-canvas__block-slot').length,text:document.querySelector('.editor-canvas__page').innerText})`))
    assert.equal(pages[i].sections,template.counts[0].pages[i].sections)
    assert.equal(pages[i].blocks,template.counts[0].pages[i].blocks)
   }
   await b.click('.editor-page-list__select')
   const sections=template.counts[0].pages[0].sections
   await b.click('.editor-section-list__select')
   assert.equal(await b.evaluate(`Boolean(document.querySelector('.editor-canvas__section.is-selected'))`),true)
   const textIndex=await b.evaluate(`[...document.querySelector('.editor-canvas__section').querySelectorAll('.editor-canvas__block-slot')].findIndex(e=>['heading','text'].includes(e.dataset.blockType))+1`)
   await b.click(`.editor-section-list__item .editor-block-list__item:nth-child(${textIndex}) .editor-block-list__select`)
   await b.fill('#editor-content-text','QA edited content')
   await b.until(`document.querySelector('.editor-canvas__page').innerText.includes('QA edited content')`)
   const blockCount=await b.evaluate(`document.querySelectorAll('.editor-canvas__block-slot').length`)
   await b.click('.editor-block-list__item .editor-row-actions button:nth-child(3)')
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__block-slot').length`),blockCount+1)
   await b.click('.editor-block-list__item .editor-row-actions button:nth-child(4)')
   if(await b.evaluate(`Boolean(document.querySelector('.editor-dialog--confirm'))`)) await b.click('.editor-dialog--confirm .btn--danger')
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__block-slot').length`),blockCount)
   const first=await b.evaluate(`document.querySelector('.editor-canvas__section').dataset.sectionId`)
   await b.click('.editor-section-list__head .editor-row-actions button:nth-child(2)')
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__section')[1].dataset.sectionId`),first)
   await b.click('.editor-section-list__head .editor-row-actions button:nth-child(4)')
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__section').length`),sections+1)
   await b.click('.editor-section-list__head .editor-row-actions button:nth-child(5)')
   if(await b.evaluate(`Boolean(document.querySelector('.editor-dialog--confirm'))`)) await b.click('.editor-dialog--confirm .btn--danger')
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__section').length`),sections)
   await b.click('.site-design summary'); await b.click('.editor-theme-list__item')
   assert.equal(await b.evaluate(`document.querySelector('.editor-theme-list__item').getAttribute('aria-pressed')`),'true')
   const themeIndex=await b.evaluate(`import('/src/models/siteTheme.js').then(m=>m.SITE_THEME_PRESETS.findIndex(t=>t.id===${JSON.stringify(template.themePreset)})+1)`)
   await b.click(`.editor-theme-list__item:nth-child(${themeIndex})`)
   assert.equal(await b.evaluate(`document.querySelectorAll('.editor-canvas__page [data-motion-state]').length`),0)
   // Re-enter the wizard to visually audit the pristine draft after destructive editing checks.
   await b.open('/sites/new?template='+template.id)
   await b.click('button[type=submit]');await b.click('button[type=submit]');await b.click('.local-draft-entry button')
   await b.fill('input[name=name]',`QA ${template.id}`)
   for(let i=0;i<3;i++)await b.click('button[type=submit]')
   await b.click('.local-draft-entry button');await b.click('#editor-preview-toggle')
   for(const [w,h] of [[1440,900],[1920,1080],[834,1112],[390,844]]){
    await b.viewport(w,h)
    await b.click(`.preview-devices button:nth-child(${w===390?3:w===834?2:1})`)
    assert.equal(await b.evaluate(`document.documentElement.scrollWidth>innerWidth+1`),false,template.id+' overflow '+w)
    assert.equal(await b.evaluate(`document.querySelectorAll('[data-motion-state]').length`),0)
    await b.screenshot(`template-${template.id}-${w}`)
   }
   await b.viewport(1440,900)
   report.templates.push({id:template.id,tier:template.tier,category:template.category,theme:template.themePreset,counts:template.counts,pages});console.log(template.id,'OK')
  }
  report.errors=b.errors;assert.deepEqual(b.errors,[])
 } finally {fs.writeFileSync('artifacts/frontend-audit/template-qa.json',JSON.stringify(report,null,2));b.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
