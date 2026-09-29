# Project Doctor
Local, privacy-first health check for web projects. Vanilla HTML/CSS/JS with ES modules; nothing is uploaded.

Run: `python3 -m http.server` in this folder, then open http://localhost:8000 (ES modules need http, not file://).

Score: 100 − 12 per critical (max 60) − 4 per warning (max 30) − 1 per suggestion (max 10). Findings are labelled Confirmed, Heuristic or Suggestion. Static analysis is not a substitute for browser testing.
