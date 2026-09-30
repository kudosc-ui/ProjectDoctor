# Project Doctor
Local, privacy-first health check for web projects. Vanilla HTML/CSS/JS with ES modules; nothing is uploaded.

Run: `python3 -m http.server` in this folder, then open http://localhost:8000 (ES modules need http, not file://).

Score: 100 − 12 per critical (max 60) − 4 per warning (max 30) − 1 per suggestion (max 10). Findings are labelled Confirmed, Heuristic or Suggestion. Static analysis is not a substitute for browser testing.

Deep scan: matches HTML tags, finds dead links/anchors, blank pages, invalid JSON, CSS brace errors, JS syntax errors, broken imports and missing element ids, each with file and line.
Scans are stored in the device's localStorage (last 12) so they stay available between visits.
