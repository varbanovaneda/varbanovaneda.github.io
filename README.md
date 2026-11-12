# Portfolio template

A cinematic, minimal portfolio. It's plain HTML, CSS and JS, with no build step.

```
index.html      Home: hero, work gallery and index list, about, contact
project.html    One reusable detail page for every project (project.html?p=<slug>)
css/styles.css  Design tokens at the top (colours, fonts, spacing, easing)
js/content.js   ← ALL content lives here: name, email, socials, about, projects
js/core.js      Shared nav/footer, springs, reveals, cursor, page transitions
js/home.js      Renders the home page from content.js
js/project.js   Renders a project page from content.js
```

## Make it yours
1. Open `js/content.js` and edit `SITE` (name, email, availability, socials, about text).
2. `SERIES` lists the gallery groups (Watercolour, Linocut, Posters, Illustration, Logos) in display order.
3. `PROJECTS` lists every work. Each one needs a `slug`, a `title`, a `series` and a `cover`.
   Images live in `assets/work/`. Use `img("file.jpg", width, height, "alt text")` so the artwork
   keeps its real proportions and is never cropped.
4. `span` sets how many of the 12 grid columns a card takes on desktop (4 = one third, 6 = half,
   8 = two thirds, 12 = full width). `year`, `client`, `medium`, `lang` (set it to "bg" for
   Bulgarian titles) and `gallery` (extra images on the work's page) are all optional.

## Effects
- **Living paint hero** (`js/paint.js`): a WebGL watercolour simulation. Move the mouse or swipe to paint.
  Its colours are in `PALETTE` at the top of the file.
- **Watercolour wash between sections** (`makeWash` in `js/core.js`): scrolling from a light section to a dark
  one (or back), the next colour blooms up from the bottom of the screen with a soft, uneven edge. Its edge colours
  are in `RIM`. Without WebGL, or with reduced motion, the page fades between colours instead.
- **Medium reveals**: each series in `SERIES` has `reveal`: `wash` (watercolour bloom), `print` (linocut
  roller), `spray` (droplets) or `sketch` (drawn wipe).
- **Watercolour-bloom page transitions**: a stain in the series' `accent` colour spreads from the click
  point while the artwork flies into place. This needs Chrome or Edge 126+, or Safari 18.2+. Other
  browsers use a curtain wipe instead.
- With "reduce motion" switched on, all of these become a still painting and simple fades.

## Run locally
The pages load scripts with relative paths, so serve the folder rather than double-clicking the file.
Any static server works, for example `npx serve .` or the VS Code Live Server extension.
To deploy, upload the folder to any static host (Netlify, Vercel, GitHub Pages).

## Accessibility
- Reduced motion: turns off springs, parallax, the curtain and the cursor bubble, and uses short fades instead.
- High contrast: the navigation becomes solid and secondary text gets darker.
- On touch devices, cards always show a "View project" label in place of the hover bubble.
