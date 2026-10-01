# Project Doctor
Local, privacy-first health check for web projects, built for phones. Vanilla HTML/CSS/JS with ES modules; nothing is uploaded.

## Run
`python3 -m http.server` in this folder, then open http://localhost:8000 (service workers and ES modules need http, not file://).

## What it finds
Syntax errors, broken imports and exports, missing files, **wrong letter case in file names** (works on Windows, breaks online), misspelled HTML tags, duplicate attributes, mistyped CSS properties, invalid colours, missing units and semicolons, `100vw` overflow, typos in JS names (`.lenght`, `addEventListner`), `=` inside `if`, undefined click handlers, ids that are almost right, unused imports, risky calls, exposed secrets and PWA readiness. Each finding shows file and line. Static analysis cannot prove a project is bug-free.

## Make an Android APK with PWABuilder
1. Host this folder over **HTTPS** (GitHub Pages, Netlify, Cloudflare Pages or Vercel; drag-and-drop the folder).
2. Open https://www.pwabuilder.com, paste your site URL, press Start.
3. Package for Android, download the ZIP, and install the `.apk`. Keep the signing key it gives you for future updates.

Included for PWABuilder: `manifest.webmanifest`, `sw.js` (offline cache), `offline.html`, PNG icons 48 to 512 plus maskable 192/512 in `assets/icons/`, and `assetlinks.example.json` (see below).

### Hide the browser bar (Digital Asset Links)
After PWABuilder gives you the SHA-256 fingerprint, copy `assetlinks.example.json` to `.well-known/assetlinks.json` on your host, fill in the package name and fingerprint, and re-upload.
