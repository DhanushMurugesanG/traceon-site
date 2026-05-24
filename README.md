# TraceOn — landing page

Marketing/landing site for [TraceOn](https://github.com/DhanushMurugesanG/TraceOn) — runtime verification for AI coding agents.

## Stack

Static single-page site. React 18 + Tailwind loaded via CDN, Babel-standalone compiles the JSX in-browser. No build step.

- `index.html` — shell, design tokens (Tailwind config inline), global styles
- `hero-loop.jsx` — animated SVG diagram of the verification loop (one prompt in → write/test/read-evidence → one done out)
- `sections.jsx` — Nav, Hero, Problem, Solution + Comparison + JSON, How it works, Honesty (8 decision rules), Get started (5-step stepper + prerequisites), Limits, Footer
- `app.jsx` — root component, dark/light theme toggle

## Run locally

Any static file server works. For example:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Or:

```sh
npx serve .
```

## Deploy

Drop the four files (plus `README.md`) on any static host — GitHub Pages, Vercel, Netlify, Cloudflare Pages. No build configuration needed.
