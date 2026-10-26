const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const acorn = require('acorn');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist/brewdocs.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'dist/brewdocs.js'), 'utf8');
// Parse code, not text searches: the documentation contains modern code examples.
acorn.parse(js, { ecmaVersion: 5 });
assert.equal((html.match(/<script\b/g) || []).length, 1);
assert(html.includes('src="./brewdocs.js"'));
assert(!/<(?:script|style)\b/i.test(js), 'Generated pages must not add runtime code/styles');
assert(!/var\(--|\bgap\s*:|\binset\s*:|scrollbar-(?:width|color)\s*:/.test(html));
assert(!/\.(?:scrollBy|scrollIntoView)\s*\(/.test(js));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/manifest.json')));
const pagesSource = js.slice(js.indexOf('  var pages = ['), js.indexOf('  // PAGES_END'));
const pages = vm.runInNewContext(pagesSource + '\npages');
assert.equal(pages.length, manifest.length);
assert.equal(pages.length, new Set(pages.map(p => p.id)).size);
for (const page of pages) {
  for (const link of page.html.matchAll(/href="#([^"]+)" class="int-link"/g)) {
    assert(pages.some(p => p.id === link[1].split('#')[0]), link[1]);
  }
}
const bounds = { top: 0, bottom: 100, left: 0, right: 100 };
const content = { scrollTop: 0, scrollLeft: 0, contains: el => el.panel === 'content', getBoundingClientRect: () => bounds };
const nav = { ...content, contains: el => el.panel === 'nav' };
const source = js.slice(js.indexOf('    function revealInPanel'), js.indexOf('    // ── init.js'));
const reveal = vm.runInNewContext(source + '\nrevealInPanel', { document: { getElementById: id => id === 'bd-content' ? content : nav } });
function element(panel, rect) { return { panel, getBoundingClientRect: () => rect }; }
reveal(element('content', { top: 150, bottom: 170, left: 0, right: 80 }));
assert.equal(content.scrollTop, 70);
reveal(element('content', { top: -20, bottom: 0, left: 0, right: 80 }));
assert.equal(content.scrollTop, 50);
reveal(element('content', { top: 10, bottom: 30, left: 0, right: 80 }));
assert.equal(content.scrollTop, 50);
reveal(element('nav', { top: 150, bottom: 170, left: 120, right: 140 }));
assert.equal(nav.scrollTop, 70);
assert.equal(nav.scrollLeft, 40);
assert.equal(content.scrollTop, 50);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
assert.equal(pkg.packageType, 'app');
assert(fs.existsSync(path.join(root, pkg.appPath)));
console.log(`PASS: ES5 runtime, CSS/API regressions, ${pages.length} pages/links, panel scrolling, module entry`);
