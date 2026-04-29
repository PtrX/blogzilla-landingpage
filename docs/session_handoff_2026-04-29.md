# Session Handoff — 2026-04-29

## Status

Blockzilla Runner Beta is integrated into the Netlify promo site and pushed.

Repository:

- `/Users/peter/claude_code/Blockzilla 2/08_landingpage/site/Blockzilla_2_Promo_Export`
- Remote: `https://github.com/PtrX/blogzilla-landingpage.git`
- Branch: `main`

Latest relevant commits:

- `004a695 Fix Netlify newsletter forms`
- `97ef56d Release Blockzilla Runner beta`

## What Changed

### Newsletter forms

- Existing merch newsletter form remains `name="newsletter"`.
- The Folge-03 notification form is now a real Netlify form:
  - `name="episode-updates"`
  - `method="POST"`
  - `data-netlify="true"`
  - hidden `form-name`
  - honeypot via `netlify-honeypot="bot-field"`
  - named email field: `name="email"`

Netlify Form Detection must be enabled in the Netlify UI.

### Game beta

- `play.html` now includes:
  - `game/assets/index.css`
  - `game/assets/index.js`
- Built Phaser/Vite assets copied into:
  - `game/assets/`
- Main landing page already links to:
  - `play.html`

## Verification

Local test server:

```bash
cd "/Users/peter/claude_code/Blockzilla 2/08_landingpage/site/Blockzilla_2_Promo_Export"
python3 -m http.server 8099
```

Tested URLs:

- `http://localhost:8099/play.html`
- `http://localhost:8099/play.html?autoplay=1`

Passed:

- Game mounts inside `#game`.
- Canvas renders in the prepared `play.html` frame.
- Splash hides after game boot / timeout.
- Asset requests for CSS, JS, backgrounds, and sprites returned `200` or `304`.
- No 404s seen in local server logs.
- Autoplay smoke test reached the portal and showed `PORTAL ERREICHT!`.

Known note:

- The in-app browser screenshot capture timed out once after final rebuild, but DOM and server logs still confirmed the page loaded. Earlier visual screenshots and autoplay finish were successful.

## Runner Source Note

The source project lives at:

- `/Users/peter/claude_code/blockzilla-runner-game`

That folder is currently not a Git repository. It contains local source changes used to build the beta:

- `vite.config.ts` added for relative Netlify/subfolder build output.
- Phaser `parent` changed to `game`.
- Asset loading changed from absolute `/assets/...` paths to runtime-relative built asset paths.
- Start scene posts `window.parent.postMessage({ type: "game-ready" }, "*")`.
- `?autoplay=1` now auto-starts from the start screen.
- Standalone dev `index.html` now uses `<div id="game"></div>`.
- CSS was scoped so the Vite build does not globally override `play.html`.

Before future game work, either initialize/version this source directory or copy these source changes into the canonical game repo.

## Next Time

Suggested next checks after Netlify deploy:

- Open deployed `/play.html`.
- Confirm Network tab has no 404s.
- Submit both Netlify forms once using test emails.
- Confirm Netlify Forms shows both `newsletter` and `episode-updates`.
- Test desktop keyboard controls manually: arrows/WASD, Space, R, ESC menu behavior.
