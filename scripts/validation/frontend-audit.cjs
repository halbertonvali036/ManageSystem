const {launch}=require('./audit-browser.cjs')
const fs=require('node:fs')
;(async()=>{const b=await launch();const results=[];try{
 await b.viewport(1440,900)
 const inspect=async(route,width)=>{await b.open(route);const info=await b.evaluate(`({url:location.pathname,title:document.querySelector('h1')?.innerText,text:document.querySelector('main')?.innerText.slice(0,1200),overflow:document.documentElement.scrollWidth>innerWidth+1,offenders:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left<-2)&&getComputedStyle(e).position!=='fixed'}).slice(0,6).map(e=>e.className)})`);results.push({route,width,...info});console.log(route,width,info.overflow?'OVERFLOW':'OK',info.title||'')}
 for(const route of ['/','/login','/register','/forgot-password','/reset-password','/login/qr','/auth/callback','/session-expired','/not-found'])await inspect(route,1440)
 await b.login()
 const root='/workspaces/demo-workspace'
 const routes=['/workspaces','/workspaces/new',root,...['settings','sites','sites/new','database','database/models/missing','database/models/missing/records','database/models/missing/records/missing','capabilities','capabilities/missing','integrations','integrations/missing','domains','domains/missing','deployments','deployments/missing','members','activity','ai'].map(p=>`${root}/${p}`),'/templates','/sites/new',`${root}/sites/demo-website`,`${root}/sites/demo-website/editor`,`${root}/sites/demo-website/settings`,'/account','/account/profile','/security','/billing','/notifications','/support','/admin']
 for(const route of routes)await inspect(route,1440)
 await b.open(`${root}/sites/demo-website/editor`);await b.screenshot('editor-desktop')
 await b.open(root+'/ai');await b.screenshot('ai-desktop')
 for(const [width,height] of [[1920,1080],[834,1112],[390,844]]){await b.viewport(width,height);for(const route of ['/workspaces',root+'/sites/demo-website/editor',root+'/ai','/billing','/account/profile','/templates'])await inspect(route,width);await b.open(root+'/ai');await b.screenshot('ai-'+width)}
 await b.viewport(1440,900);await b.open('/workspaces');await b.click('.sidebar__link--logout');await b.login(true)
 const admins=['/admin','/admin/users','/admin/websites','/admin/templates','/admin/billing','/admin/domains','/admin/notifications','/admin/support','/admin/audit','/admin/settings','/account/profile','/security']
 for(const route of admins)await inspect(route,1440)
 await b.open('/admin');await b.screenshot('admin-desktop')
 for(const [width,height] of [[1920,1080],[834,1112],[390,844]]){await b.viewport(width,height);for(const route of ['/admin','/admin/users','/admin/settings'])await inspect(route,width)}
 await b.viewport(1440,900);await b.open('/admin');await b.click('.sidebar__link--logout')
 for(const [width,height] of [[1920,1080],[834,1112],[390,844]]){await b.viewport(width,height);for(const route of ['/','/login','/register'])await inspect(route,width);await b.open('/');await b.screenshot('landing-'+width)}
 console.log('ERRORS',b.errors)
 }finally{fs.mkdirSync('artifacts/frontend-audit',{recursive:true});fs.writeFileSync('artifacts/frontend-audit/routes.json',JSON.stringify({results,errors:b.errors},null,2));b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
