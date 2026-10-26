# BrewDocs C47 — UE65MU8002 / Tizen 3.0

Prepared 26 October 2026. Published source: https://github.com/misbeliever/brewdocs-chromium47

This is a compatibility patch, not a TV-certified release. No TV connection, TizenBrew reinstall, TizenTube update,
certificate change, or settings reset was performed.

Upstream: https://github.com/axelnanol/brewdocs

Exact baseline: `aaec74b3d8bf027622a040b9a379411890908817`.

Samsung maps **2017 / Tizen 3.0 to Chromium M47**:
[Samsung web-engine specifications](https://developer.samsung.com/smarttv/develop/specifications/web-engine-specifications.html).
Firmware updates should not be treated as a way to turn this model into a modern
Chromium TV. This patch targets its existing runtime.

## Files and audit coverage

All application runtime code is `dist/brewdocs.js`; the only runtime stylesheet is
inline in `dist/brewdocs.html`. The HTML loads one local script and no CDN library.
I read the complete navigation/renderer/remote/mobile/bootstrap code and stylesheet,
checked the generated HTML for executable scripts/styles, and rebuilt all 22 pages.
`docs/` and the manifest are build inputs. `scripts/build.js` and `marked` execute
on the development computer only; their modern JavaScript is not sent to the TV.
No service code exists in this module.

| Finding in upstream | Chromium 47 consequence | Patch |
| --- | --- | --- |
| CSS `:root` custom properties and `var()` | Lost backgrounds, text colours, borders, focus rings, and sidebar width | Replace every reference with its existing literal; remove unused variable declarations |
| `gap` in two flex layouts | Missing hint/menu spacing | Adjacent-sibling margins and menu-button margin |
| Mobile overlay `inset: 0` | Backdrop does not cover viewport | Explicit top/right/bottom/left |
| `scrollbar-width` / `scrollbar-color` | Unsupported decoration | Remove; use default scrollbars |
| Four `Element.scrollBy({…})` call sites | Missing method can throw on D-pad/channel scrolling | Assign `scrollTop` directly |
| Two `scrollIntoView({behavior, block, inline})` call sites | Options unsupported; old engines may coerce the object to a boolean and jump incorrectly | Small panel-local nearest-edge helper using rectangles and scroll offsets |
| Nested flex scrolling | Old layout differences can prevent a panel from shrinking/scrolling | Explicit `min-height: 0` on scrolling panels and `min-width: 0` on content wrapper |

Sources: [Chrome custom properties start in 49](https://developer.chrome.com/blog/css-variables-why-should-you-care),
[MDN Element compatibility data: element scrollBy/options start in 61](https://github.com/mdn/browser-compat-data/blob/main/api/Element.json),
[flex gap starts in 84](https://github.com/mdn/browser-compat-data/blob/main/css/properties/gap.json),
[inset starts in 87](https://github.com/mdn/browser-compat-data/blob/main/css/properties/inset.json).

The viewer's **existing JavaScript already parses as ES5**: there is no runtime
arrow syntax, let/const, destructuring, async/await, template literal, optional
chaining, module import, or spread requiring Babel. Modern syntax visible in wiki
code examples is inert text. No speculative transpiler or global polyfill was added.
The patch preserves array forEach, DOM query selectors, classList, closest,
getComputedStyle, bounding rectangles, history.replaceState, hashchange, click/key
listeners, focus, and native details/summary; these are available in desktop Chromium
47. Native details expansion and TV focus/key behaviour still require Samsung testing.
The stylesheet's remaining flexbox, viewport units, media queries, transforms,
transitions, pseudo-elements, nth-child, rgba, borders and outlines do not require a
post-47 desktop Chromium feature. This is a manual compatibility audit, not an
exhaustive Samsung implementation conformance test.

Scrolling is now immediate rather than animated. No theme switcher existed, so
literal theme values preserve the existing fixed appearance. Emoji glyphs depend
on TV fonts. A short notice distinguishes this edition from upstream; the source
wiki's third-party app descriptions are otherwise preserved, including historical
instructions that may now be outdated.

`package.json` keeps `packageType: app`, `appPath: dist/brewdocs.html`, and the same
six registered remote keys. It changes the visible name to **BrewDocs C47**, uses
version `1.0.0-c47.1`, and adds a distinct package name. `private: true` prevents
accidental npm publishing and does not prevent GitHub/CDN installation.
The Node engine requirement is for rebuilding, not the TV's Node service.

## What was actually tested

- `npm run build`: all 22 pages regenerated successfully; runtime edits survived.
- `npm test`: Acorn parses the entire generated runtime as ES5; checks the single
  script entry, absence of the removed CSS/API dependencies, page IDs/internal page
  targets, package entry point, and panel scrolling above/below/inside/outside a pane.
- Desktop **HeadlessChrome 156**, 1920×1080: all 22 sidebar pages render with headings;
  D-pad Down and sidebar Enter; red/green/yellow/blue and Back handlers; Channel
  Up/Down; FAQ click expand/collapse and native desktop Enter activation; content navigation. Zero captured script errors.
- The same desktop smoke run deliberately removes Element.scrollBy and
  Element.scrollIntoView so the patched paths cannot silently depend on them.
- Checked fixed background colour and 340px sidebar; visually inspected desktop
  screenshot. This is not a Chromium 47 emulator. A changed user agent would not
  emulate Chromium 47 either.
- Module `.tgz` contents inspected and source patch checked against the pinned base.

**Not tested:** an actual Chromium 47 binary, Samsung UE65MU8002 hardware, its
firmware-specific layout/fonts/remote registration/Return-to-launcher behaviour,
TV network/CDN delivery, or third-party app playback. No claim of hardware success.

## Rebuild or apply the patch

Use a current development Node version (22.18+; tested with 26.12.1) and npm.
The ready-built dist files do not require npm on the TV.

From the source ZIP, extract the `brewdocs-chromium47/` folder, then:

```sh
cd brewdocs-chromium47
npm ci --ignore-scripts
npm run build
npm test
```

Alternatively, from a folder containing the supplied patch:

```sh
git clone https://github.com/axelnanol/brewdocs.git brewdocs-chromium47
cd brewdocs-chromium47
git checkout -b chromium47 aaec74b3d8bf027622a040b9a379411890908817
git apply --check ../brewdocs-chromium47.patch
git apply ../brewdocs-chromium47.patch
npm ci --ignore-scripts
npm run build
npm test
```

For a desktop preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8765/brewdocs.html`. In a disposable test tab, evaluate the
function in `scripts/browser-smoke.js` (invoke it if pasting into DevTools). It
removes two DOM methods in that tab until reload and returns the assertion results.
Synthetic keys test application handlers; they do not prove TV key registration.

## Install through TizenBrew without replacing anything

**The public repository is `misbeliever/brewdocs-chromium47`.** In Add GitHub Module,
enter `misbeliever/brewdocs-chromium47@1.0.0-c47.1` and launch BrewDocs C47.
The ZIP and TGZ are artifacts, not directly installable WGTs. No npm package is
published. The following publishing instructions are retained for maintainers.
Do not enter the unpublished name `brewdocs-chromium47` as an npm module.

The loader was verified in a separate local reference checkout of TizenBrew at
`14760a371fa5132e6f93200f3045c5bbc5a9d1ca`:
[ModuleManager](https://github.com/reisxd/TizenBrew/blob/14760a371fa5132e6f93200f3045c5bbc5a9d1ca/tizenbrew-app/TizenBrew/tizenbrew-ui/src/pages/ModuleManager.jsx)
stores `gh/` or `npm/` identifiers;
[moduleLoader](https://github.com/reisxd/TizenBrew/blob/14760a371fa5132e6f93200f3045c5bbc5a9d1ca/tizenbrew-app/TizenBrew/service-nextgen/service/utils/moduleLoader.js)
reads package metadata from jsDelivr; the service proxies app files under a local
`/module/` route. This does **not** require attaching a ZIP asset to a GitHub release.
The user's installed TizenBrew version was not inspected; labels may differ.

### Recommended: separate public GitHub repository

1. Create a public repository you control, for example `YOURNAME/brewdocs-chromium47`.
   Upload the **contents** of the prepared source folder at its root. In particular,
   `package.json`, `dist/brewdocs.html`, `dist/brewdocs.js`, and `LICENSE` must be
   committed. Do not put another `brewdocs-chromium47/` folder inside the repo.
   Keep the MIT license/attribution. Set the repository URL in package.json to yours.
2. Commit the files, then create and push tag **`1.0.0-c47.1`** pointing at that commit.
   With a local clone connected to your new repository:

   ```sh
   git add .
   git commit -m "Support Chromium 47 in BrewDocs viewer"
   git tag 1.0.0-c47.1
   git push origin HEAD
   git push origin 1.0.0-c47.1
   ```

   The source ZIP includes `.gitignore` for node_modules. Point `origin` at your new
   repository before pushing; do not push to axelnanol's repository.
3. On a computer, verify these URLs (replace YOURNAME):

   ```text
   https://cdn.jsdelivr.net/gh/YOURNAME/brewdocs-chromium47@1.0.0-c47.1/package.json
   https://cdn.jsdelivr.net/gh/YOURNAME/brewdocs-chromium47@1.0.0-c47.1/dist/brewdocs.html
   https://cdn.jsdelivr.net/gh/YOURNAME/brewdocs-chromium47@1.0.0-c47.1/dist/brewdocs.js
   ```

   They must return the patched files, not an HTML error page. A new tag may need
   time to reach the CDN. Use a fresh version/tag for subsequent updates.
4. On your existing TV launcher, open Module Manager → **Add GitHub Module** and enter:

   ```text
   YOURNAME/brewdocs-chromium47@1.0.0-c47.1
   ```

   Do not include the `gh/` prefix or a full URL in that UI. Current loader code
   supports this jsDelivr tag syntax. If an older launcher rejects an `@tag`, use
   `YOURNAME/brewdocs-chromium47` after making the patched commit its default branch;
   delivery may be cached. Do not upgrade/reinstall the launcher just for this.
5. Launch **BrewDocs C47**. Keep the original BrewDocs, working TizenBrew and working
   TizenTube entries/settings. Do not make the experimental module autostart.
6. Rollback: remove **only this new GitHub module** in Module Manager. No firmware,
   certificates, or original apps need changing.

If Module Manager shows Unknown Module, first check package.json through the CDN.
If it shows an entry but a blank page, check the two dist URLs and TV console.

### Optional npm publishing, for an account owner

Choose your own available scoped name (e.g. `@YOUR_NPM_NAME/brewdocs-chromium47`),
remove `private: true`, update repository metadata, rebuild/test, then:

```sh
npm pack --dry-run
npm publish --access public
```

Publish only when you intend to make a public package. Add that exact published name
in **Add NPM Module**. `npm pack` alone never publishes. The supplied TGZ contains
package.json, README, LICENSE, this guide and the two dist files; it is not a signed TV app.

## On-TV acceptance checklist

1. Confirm the distinct **BrewDocs C47** logo, dark background, readable text,
   fixed-width sidebar and visible focus outline.
2. Traverse every sidebar entry, including FAQ/Troubleshooting at the bottom.
   Check that only the relevant panel scrolls.
3. Press Enter to select; Right to content, Left back; Up/Down through long pages.
4. Test channel paging and red/green/yellow/blue (Samsung on-screen colour/number
   controls may be needed on a small remote). Expand/collapse FAQ with **Enter**.
5. Follow a cross-page internal link; test Back through history and Return to
   TizenBrew from the overview. External links navigate out to arbitrary websites;
   their compatibility is outside this patch.
6. Exit and relaunch, then verify the existing TizenTube still behaves as before.
   Record firmware, module tag, exact key/action and the first console error if not.

## Other apps: a broken wiki is not a verdict on its subjects

These are triage categories, not an audit of every other app's code. TizenBrew is a
loader; it does not upgrade every website, supply modern syntax support, or make
all codecs/DRM/TV privileges available. A local documentation CSS bug says little
about a separate YouTube mod or a native player.

| Category for this 2017 TV | Apps | Evidence / practical meaning |
| --- | --- | --- |
| Working in your setup | TizenBrew and TizenTube | Your reported working installations are the strongest evidence; preserve their versions/settings. Future remote site changes can still matter. |
| Plausible / intended for older Tizen, not verified here | TizenPortal shell | Its upstream README targets Tizen 3.0 and Chrome 47. That does not certify arbitrary sites opened through it. |
| Likely patchable local UI | BrewDocs C47 | ES5 parse and modern-browser smoke pass; actual TV acceptance still pending. |
| Unverified; assess exact build and target site | TizenBrowse, TwitchTB, PrimeVideoTB, TFlix | Site modifications depend on both injected code and a remote site; modern site JS, login, DRM, iframe rules and player features can fail independently. |
| Unverified; assess exact build/server/APIs | Jellyfin TizenBrew/standalone builds, ArtGalleryTB, BrewBridge | Local shell syntax/CSS and remote APIs/server/player support all matter. A generic project listing is not a minimum-version guarantee. |
| Experimental and especially uncertain on 3.0 | Moonlight NaCl | Targets 3.0–6.0 in README, but upstream issue #1 also reports 3.0 failures. Do not classify as proven compatible. |
| Outside this TV's stated platform requirements | Moonlight WASM, HyperTizen | Upstream minimums are Tizen 5.5+ and 6.5+ respectively. A CSS patch cannot supply native/WASM platform requirements. |
| Different operating system | TizenTube Cobalt, μTube | Android/Google TV and Apple tvOS respectively; not installable TizenBrew modules on this TV. |
| Check each individual artifact | Community package collections | Bundling compatible and incompatible apps together does not give the bundle a shared compatibility level. WASM-only games are not Chromium 47 targets. |

Sources: [TizenPortal compatibility](https://github.com/axelnanol/tizenportal#-compatibility),
[Moonlight WASM](https://github.com/OneLiberty/moonlight-chrome-tizen),
[Moonlight NaCl](https://github.com/OneLiberty/moonlight-tizen-nacl),
[NaCl issue #1](https://github.com/OneLiberty/moonlight-tizen-nacl/issues/1),
[HyperTizen requirements](https://github.com/reisxd/HyperTizen/blob/main/docs/README.md).

### TFlix black screen: diagnose before changing installations

BrewDocs' snapshot describes a Cineby site wrapper. The current
[TFlix repository](https://github.com/Zyrecx/TFlix) describes a standalone catalog /
player and says the old wrapper is on `v1-legacy`. Therefore first record the
**module identifier, version, packageType, websiteURL or appPath**, and failing URL.
Do not mix instructions for these two architectures. I did not patch or test TFlix.

1. **Blank immediately, before any UI:** capture the *first* console exception and
   failed network request. `Unexpected token` often means newer JS syntax: patch the
   source and build for Chrome 47/ES5. A missing-method TypeError points to a specific
   API/polyfill need. Successfully loaded HTML with invisible text/layout points to
   CSS. Confirm the entry file and its JS dependencies returned HTTP success.
2. **Old wrapper:** open its exact target URL on the TV without the mod, if a
   separate browser entry permits it. If that also fails, investigate the target
   website's scripts, redirects, TLS and challenge/login page. An injection script
   cannot fix a page that fails to parse before it runs. Do not overwrite working
   TizenTube to perform this comparison.
3. **Catalog works; only the player is black:** record video.error, readyState,
   networkState, manifest/segment statuses and player errors. Try a known legal,
   supported H.264/AAC MP4 and then an HLS test stream you control. Success on MP4 but
   failure on HLS narrows the problem to the player/MSE/manifest/codec path; it does
   not establish the exact cause. For a newer standalone build, check its TMDB setup
   and chosen provider configuration separately from playback.
4. **Embedded player fails:** inspect iframe response headers for X-Frame-Options /
   CSP frame-ancestors, cross-origin failures, mixed content, provider redirects and
   challenge pages. Do not disable browser security as a workaround.
5. **HTTPS/API requests fail:** inspect certificate/TLS errors, clock, DNS and HTTP
   statuses; compare the exact request on another device. A 403 or unavailable
   provider is not evidence that Chromium syntax is the cause.
6. **MSE/DRM/codec failures:** check actual API presence and supported MIME strings;
   use the project's older-TV build or an AVPlay-backed player if the project
   supports one. Transpilation changes syntax, not hardware decoding or DRM support.

In a TV Web Inspector console, these ES5 diagnostics are read-only:

```js
console.log(navigator.userAgent);
console.log('MSE', !!window.MediaSource,
  'EME', !!navigator.requestMediaKeySystemAccess);
var v = document.querySelector('video');
if (v) console.log('video', v.readyState, v.networkState,
  v.error && v.error.code,
  v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
```

A top-level query cannot inspect a cross-origin iframe's video. API presence or
canPlayType returning a value is not a playback guarantee. Never share API keys,
cookies, authorization headers, signed stream URLs or full private browsing logs.
For an issue report, include model, firmware, module version, reproduction action,
and a redacted first error with file/line/status. Use Samsung's
[Web Inspector guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/web-inspector.html)
for a debug-capable session; attaching to a running TizenBrew-loaded page depends on
its launcher/service debugging setup. Do not reinstall the working launcher just
to obtain logs.
