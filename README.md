# Toolzy

Modular browser-first toolbox for GitHub Pages.

Live target: https://vsb190709.github.io/toolzy/

## Run locally
python -m http.server 8000

Open http://localhost:8000/

## Visual system
- HackerNoon V2 font loaded locally from `assets/fonts/`
- HackerNoon Pixel Icon Library SVG assets loaded locally from `assets/icons/pixel/`
- No Vite, bundler, npm, or CDN required
- Icon mapping is browser-native and centralized in `src/core/icons.js`

## URL model
- `/toolzy/`
- `/toolzy/basic`
- `/toolzy/basic/percentage`
- `/toolzy/text/word-counter`
- `/toolzy/developer/json-formatter`
