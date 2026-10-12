const { launch } = require('./audit-browser.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')

;(async () => {
  const b = await launch()
  const checks = [], results = []
  const root = '/workspaces/demo-workspace'
  const follow = async (href) => {
    await b.click(`a[href="${href}"]`)
    await b.until(`location.pathname === ${JSON.stringify(href)} && !document.querySelector('.page-status .spinner')`)
  }
  try {
    await b.viewport(1440, 900)
    await b.login()
    await follow(root)
    await follow('/sites/demo-website')
    await follow('/sites/demo-website/editor')
    await b.until(`document.querySelectorAll('.editor-canvas__section').length >= 8`)
    await follow('/sites/demo-website')
    await follow(root + '/ai')
    await b.until(`Boolean(document.querySelector('#ai-prompt'))`)
    checks.push('Login → Demo Workspace → Demo Website → Editor → back to site → AI Builder, using UI links')
    const inspect = async (route, width) => {
      await b.open(route)
      const info = await b.evaluate(`({url:location.pathname, crash:Boolean(document.querySelector('.route-error')), overflow:document.documentElement.scrollWidth>innerWidth+1, rawKeys:(document.body.innerText.match(/\\b(?:editor|workspaces|capabilities|integrations|workspaceCapabilities|workspaceIntegrations|admin|ai|aiAssistant|common)\\.[a-zA-Z_]+(?:\\.[a-zA-Z_]+)+\\b/g)||[])})`)
      results.push({ route, width, ...info })
      assert.equal(info.crash, false, route)
      assert.equal(info.overflow, false, route + ' overflow at ' + width)
      assert.deepEqual(info.rawKeys, [], route + ' raw translation keys')
      await b.screenshot('current-' + route.replaceAll('/', '-') + '-' + width)
      console.log('PASS', route, width)
    }
    for (const [width, height] of [[1440,900],[1920,1080],[834,1112],[390,844]]) {
      await b.viewport(width,height)
      for (const route of [root,root+'/sites',root+'/capabilities',root+'/integrations',root+'/sites/demo-website',root+'/sites/demo-website/editor',root+'/ai']) await inspect(route,width)
    }
    await b.viewport(1440,900)
    for (const route of ['/sites/demo-website/editor','/sites/demo-website/settings','/workspace/demo-workspace']) await inspect(route,1440)
    checks.push('Legacy editor/settings work; singular /workspace/demo-workspace handled without crash (canonical route is /workspaces/demo-workspace)')
    await b.open('/workspaces')
    await b.click('.sidebar__link--logout')
    await b.login(true)
    for (const [width,height] of [[1440,900],[1920,1080],[834,1112],[390,844]]) {
      await b.viewport(width,height)
      for (const suffix of ['', '/users','/websites','/templates','/billing','/domains','/notifications','/support','/audit','/settings']) await inspect('/admin'+suffix,width)
    }
    checks.push('Admin login and all ten major Admin routes at four widths')
    assert.deepEqual(b.errors, [])
    console.log('PASS', checks, results.length, 'route/viewport checks; zero errors')
  } catch (error) {
    checks.push('FAILED: ' + error.message)
    throw error
  } finally {
    fs.writeFileSync('artifacts/frontend-audit/final.json', JSON.stringify({checks,results,errors:b.errors},null,2))
    b.close()
  }
})().catch(error => { console.error(error); process.exitCode=1 })
