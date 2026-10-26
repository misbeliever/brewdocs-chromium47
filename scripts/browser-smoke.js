() => {
  var assert = (ok, message) => { if (!ok) throw new Error(message); };
  window.brewdocsTestErrors = [];
  window.addEventListener('error', e => window.brewdocsTestErrors.push(e.message));
  // Modern Chrome with newer scrolling APIs deliberately unavailable.
  Element.prototype.scrollBy = undefined;
  Element.prototype.scrollIntoView = undefined;
  var nav = document.getElementById('bd-nav');
  var content = document.getElementById('bd-content');
  var key = code => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { keyCode: code, which: code, bubbles: true, cancelable: true }));
  var links = Array.from(nav.querySelectorAll('.nav-link'));
  assert(links.length === 22, '22 sidebar pages');
  links.forEach(link => {
    link.click();
    assert(location.hash === '#' + link.dataset.page, 'page hash ' + link.dataset.page);
    assert(content.querySelector('h1'), 'page heading ' + link.dataset.page);
  });
  links[0].focus(); key(40);
  assert(document.activeElement === links[1], 'D-pad down');
  key(13); assert(location.hash === '#home', 'Enter selects sidebar');
  key(404); assert(location.hash === '#tb-overview', 'green next');
  key(403); assert(location.hash === '#home', 'red previous');
  key(10009); assert(location.hash === '#tb-overview', 'Back history');
  key(405); assert(location.hash === '#brewdocs-overview', 'yellow home');
  key(428); assert(content.scrollTop > 0, 'channel down');
  key(427); assert(content.scrollTop === 0, 'channel up');
  key(428); key(406); assert(content.scrollTop === 0, 'blue top');
  assert(document.activeElement === links[0], 'blue sidebar focus');
  links[20].click();
  var details = content.querySelectorAll('details');
  var detail = details[1]; detail.querySelector('summary').click(); assert(detail.open, 'FAQ opens');
  detail.querySelector('summary').click(); assert(!detail.open, 'FAQ closes');
  // Content down at a heading exercises panel paging/navigation without new APIs.
  content.querySelector('h1').focus(); key(40);
  assert(window.brewdocsTestErrors.length === 0, window.brewdocsTestErrors.join('; '));
  assert(getComputedStyle(document.body).backgroundColor === 'rgb(13, 17, 23)', 'background');
  assert(document.getElementById('bd-sidebar').getBoundingClientRect().width === 340, 'sidebar width');
  links[0].click(); nav.scrollTop = 0; links[0].focus();
  return { pass: true, pages: links.length, details: details.length, errors: window.brewdocsTestErrors, viewport: [innerWidth, innerHeight], userAgent: navigator.userAgent };
}
