/* Builds portfolio.pdf (A4 landscape) from js/content.js, so the PDF always matches the website.
   Run from the repository root:  node tools/make-pdf.js
   Layout: cover, about, one page per section (the watercolours on two), closing photo.
   Artwork is sized in millimetres so each row of works fills the space with no dead areas. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/content.js"), "utf8"), ctx);
const { SITE: S, SERIES, PROJECTS: P } = ctx.window;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const file = (im, want = 1400) => {
  const base = im.src.replace(/^assets\/work\//, "").replace(/\.[^.]+$/, "");
  for (const w of [want, 1400, 1200, 1000, 800]) {
    const p = path.join(ROOT, `assets/work/opt/${base}-${w}.jpg`);
    if (w <= want && fs.existsSync(p)) return "file://" + p;
  }
  return "file://" + path.join(ROOT, im.src);
};
/* print copies: each image resampled to the size it is shown at (150 dpi), cached in tools/.pdf-cache */
const { execFileSync } = require("child_process");
const CACHE = path.join(ROOT, "tools/.pdf-cache");
fs.mkdirSync(CACHE, { recursive: true });
const DPI = 200;
const printed = (im, mm) => {
  const px = Math.min(im.width, Math.ceil((mm / 25.4) * DPI));
  const out = path.join(CACHE, `${path.basename(im.src).replace(/\.[^.]+$/, "")}-${px}.jpg`);
  if (!fs.existsSync(out)) execFileSync("python3", [path.join(__dirname, "pdf-image.py"), path.join(ROOT, im.src), out, String(px)]);
  return "file://" + out;
};
const yearOf = (p) => p.year || (SERIES.find((s) => s.id === p.series) || {}).year || "";

/* page geometry (mm) */
const PW = 297, PH = 210, PAD_X = 9, PAD_T = 8, PAD_B = 11;
const CW = PW - 2 * PAD_X, CH = PH - PAD_T - PAD_B;      // content box 269 × 183
const TEXT_W = 84, COL_GAP = 12, GAP = 4.5, CAP = 6;          // text column, gaps, caption height

function build(measured = {}) {
let pageNo = 0;
const page = (inner, cls = "") =>
  `<section class="page ${cls}">${inner}<footer><span>${esc(S.name)} — Portfolio</span><span>${pad(++pageNo)}</span></footer></section>`;

/* lay works out in justified rows that fill width W and fit height H */
function fit(rows, W, H) {
  const ar = (p) => p.cover.width / p.cover.height;
  let hs = rows.map((r) => (W - GAP * (r.length - 1)) / r.reduce((a, p) => a + ar(p), 0));
  const fixed = rows.length * CAP + GAP * (rows.length - 1);
  const total = hs.reduce((a, b) => a + b, 0) + fixed;
  if (total > H) { const k = (H - fixed) / (total - fixed); hs = hs.map((h) => h * k); }
  // the smallest work decides: keeps every piece as large as possible, none tiny
  const area = Math.min(...rows.flatMap((r, i) => r.map((p) => ar(p) * hs[i] * hs[i])));
  return { rows, hs, area };
}
/* one row or two, whichever shows the artwork biggest */
function rowsOf(list, W, H) {
  const ar = (p) => p.cover.width / p.cover.height;
  const options = [[list]];
  if (list.length >= 2) {
    const c = Math.ceil(list.length / 2);
    options.push([list.slice(0, c), list.slice(c)]);
    if (list.length === 3) options.push([list.slice(0, 1), list.slice(1)]);
  }
  const { rows, hs } = options.map((o) => fit(o, W, H)).sort((a, b) => b.area - a.area)[0];
  return rows.map((r, i) => `<div class="row">${r.map((p) => {
    const h = hs[i], w = ar(p) * h;
    return `<figure style="width:${w.toFixed(1)}mm"><img src="${printed(p.cover, w)}" style="width:${w.toFixed(1)}mm;height:${h.toFixed(1)}mm" alt="${esc(p.cover.alt || "")}">
      <figcaption><b${p.lang ? ` lang="${p.lang}"` : ""}>${esc(p.title)}</b><span>${esc([p.category, yearOf(p)].filter(Boolean).join(" · "))}</span></figcaption></figure>`;
  }).join("")}</div>`).join("");
}

const pages = [];

/* cover, with the about text */
const A = S.about;
pages.push(page(`
  <div class="cover">
    <div class="cover-left">
      <p class="label">${esc(S.role)} — ${esc(S.location)}</p>
      <h1 class="display">${S.hero.lines.map(esc).join("<br>")}</h1>
      <p class="lede">${esc(S.hero.intro)}</p>
    </div>
    <div class="cover-right">
      <p class="intro">${esc(A.intro)}</p>
      ${A.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}
      <div class="cols">
        <div><h3 class="label">What I do</h3><ul>${A.whatIDo.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h3 class="label">Clients</h3><ul>${A.clients.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h3 class="label">Contact</h3><ul><li>${esc(S.email)}</li><li>${esc(S.phone.label)}</li>${S.socials.map((s) => `<li>${esc(s.handle || s.label)}</li>`).join("")}<li><a href="https://varbanovaneda.github.io/">varbanovaneda.github.io</a></li></ul></div>
      </div>
    </div>
  </div>`));

/* sections: the artwork fills the page, the text runs along the bottom */
/* estimate the strip's height from its text: three columns of ~52 characters, 3.6 mm a line */
function stripHeight(s, meta) {
  const lines = (s.text || []).reduce((a, t) => a + Math.ceil(t.length / 46) + 0.6, 0) + (s.link ? 1.6 : 0);
  const body = Math.ceil(lines / 4) * 3.4;
  const head = 4 + Math.ceil(s.title.length / 24) * 7 + (s.subtitle ? 4 : 0) + meta.reduce((a, [, v]) => a + Math.ceil(String(v).length / 34) * 3.2, 0);
  return Math.max(body, head) + 6;
}
SERIES.forEach((s, i) => {
  const works = P.filter((p) => p.series === s.id);
  const meta = [...(s.meta || []), ...(s.year ? [["Year", s.year]] : [])];
  const STRIP = measured[i] != null ? measured[i] : stripHeight(s, meta);
  const split = works.length > 4 ? 3 : works.length;
  const strip = `
    <div class="strip" data-i="${i}">
      <div class="strip-head">
        <p class="label">${pad(i + 1)}</p>
        <h2 class="display">${esc(s.title)}</h2>
        ${s.subtitle ? `<p class="sub">${esc(s.subtitle)}</p>` : ""}
        <dl>${meta.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      </div>
      <div class="strip-body">${(s.text || []).map((t) => `<p>${esc(t)}</p>`).join("")}
        ${s.link ? `<p class="link"><a href="${esc(s.link.url)}">${esc(s.link.label)} ↗</a></p>` : ""}</div>
    </div>`;
  pages.push(page(`<div class="works top" style="height:${(CH - STRIP - 5).toFixed(1)}mm">${rowsOf(works.slice(0, split), CW, CH - STRIP - 5)}</div>${strip}`));
  if (works.length > split) {
    pages.push(page(`<div class="works top">${rowsOf(works.slice(split), CW, CH - 10)}</div><p class="label running">${pad(i + 1)} ${esc(s.title)} — continued</p>`));
  }
});

/* closing */
pages.push(page(`
  <div class="closing">
    ${S.creditImage ? `<img src="${printed(S.creditImage, CW)}" alt="${esc(S.creditImage.alt || "")}">` : ""}
    <div class="closing-text">
      <p class="hand">For the full experience of my portfolio, open the website: it is part of my creative work, designed and built by me :)</p>
      <p class="site"><a href="https://varbanovaneda.github.io/">varbanovaneda.github.io</a></p>
    </div>
    <div class="closing-contact">${esc(S.email)} · ${esc(S.phone.label)} · ${S.socials.map((s) => `${esc(s.label)} ${esc(s.handle || "")}`).join(" · ")}</div>
  </div>`, "bleed"));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@600;700;800&family=Inter:opsz,wght@14..32,300..700&family=Caveat:wght@400..600&display=swap">
<style>
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #FAFAFA; color: #413935; font: 400 9pt/1.55 Inter, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { background-image: url("file://${path.join(ROOT, "tools/grain.png")}"); background-size: 64mm 64mm; width: ${PW}mm; height: ${PH}mm; padding: ${PAD_T}mm ${PAD_X}mm ${PAD_B}mm; position: relative; overflow: hidden; break-after: page; }
footer { position: absolute; left: ${PAD_X}mm; right: ${PAD_X}mm; bottom: 4mm; display: flex; justify-content: space-between; font-size: 6.5pt; letter-spacing: .08em; text-transform: uppercase; opacity: .45; }
.display { font-family: "Fira Sans Extra Condensed", sans-serif; font-weight: 800; text-transform: uppercase; line-height: .92; letter-spacing: -.005em; margin: 0; }
.label { font-size: 6.8pt; letter-spacing: .1em; text-transform: uppercase; opacity: .6; margin: 0; font-weight: 500; }
p { margin: 0 0 .75em; }
img { display: block; object-fit: cover; border-radius: 1.8mm; }

/* centred pages */
.cover { height: 100%; display: grid; grid-template-columns: 112mm 1fr; gap: 14mm; align-items: center; padding: 0 6mm; }
.cover h1 { font-size: 25mm; margin: 4mm 0 6mm; }
.cover .lede { font-size: 11pt; line-height: 1.45; max-width: 105mm; }
.cover-right { font-size: 8pt; line-height: 1.5; }
.cover-right .intro { font-size: 12pt; line-height: 1.3; font-weight: 500; letter-spacing: -.01em; }
.cover-right a { color: inherit; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; margin-top: 5mm; }
.cols ul { list-style: none; padding: 0; margin: 2mm 0 0; } .cols li { padding: 1mm 0; border-top: .25mm solid rgba(65,57,53,.15); font-size: 7.6pt; }

/* section pages */
.section { display: grid; grid-template-columns: ${TEXT_W}mm 1fr; gap: ${COL_GAP}mm; height: 100%; }
.section-text { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 0; }
.section-text .num { font-size: 14mm; opacity: .18; }
.section-text h2 { font-size: 12.5mm; margin: 1.5mm 0 2.5mm; text-wrap: balance; }
.section-text .sub { font-size: 9.5pt; opacity: .7; margin-bottom: 3mm; }
dl { margin: 1mm 0 4mm; padding: 2.5mm 0; border-top: .25mm solid rgba(65,57,53,.15); border-bottom: .25mm solid rgba(65,57,53,.15); width: 100%; display: grid; gap: 1.2mm; }
dl div { display: flex; justify-content: center; gap: 2.5mm; font-size: 8pt; } dt { padding-top: .5mm; } dd { margin: 0; }
.body { font-size: 8.4pt; line-height: 1.55; text-wrap: pretty; }
.link { font-size: 7.5pt; } .link a { color: inherit; }
.works { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: ${GAP}mm; min-height: 0; }
.works.full { height: calc(100% - 8mm); }
.row { display: flex; gap: ${GAP}mm; justify-content: center; align-items: flex-end; }
.row figure { margin: 0; }
.row figcaption { height: ${CAP}mm; padding-top: 1.8mm; display: flex; justify-content: space-between; gap: 2mm; font-size: 6.4pt; }
.row figcaption b { font-family: "Fira Sans Extra Condensed", sans-serif; font-weight: 800; text-transform: uppercase; font-size: 9.5pt; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row figcaption span { opacity: .55; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
.running { position: absolute; left: 0; right: 0; bottom: 9mm; text-align: center; }

/* artwork on top, text strip at the bottom */
.page:not(:has(.strip)) .works.top { height: calc(100% - 10mm); }
.strip { position: absolute; left: ${PAD_X}mm; right: ${PAD_X}mm; bottom: 9mm; display: grid; grid-template-columns: 56mm 1fr; gap: 7mm;
  border-top: .25mm solid rgba(65,57,53,.18); padding-top: 2.5mm; }
.strip-head h2 { font-size: 6mm; margin: .8mm 0 1mm; }
.strip-head .sub { font-size: 7.4pt; opacity: .7; margin-bottom: 1.5mm; }
.strip dl { margin: 0; padding: 0; border: 0; gap: .6mm; }
.strip dl div { display: grid; grid-template-columns: 19mm 1fr; text-align: left; font-size: 6.8pt; gap: 0; }
.strip-body { columns: 4; column-gap: 6mm; font-size: 6.7pt; line-height: 1.42; }
.strip-body p { margin: 0 0 .55em; }
/* closing */
.page.bleed { padding: 0; } .page.bleed footer { display: none; }
.closing { position: relative; height: 100%; }
.closing > img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
.closing-text { position: absolute; inset: 0 0 auto; padding: 14mm 30mm 26mm; color: #FAFAFA; text-align: center; 
  background: linear-gradient(180deg, rgba(28,23,21,.6), rgba(28,23,21,.25) 65%, transparent); }
.closing-text .site a { color: inherit; font-size: 10pt; letter-spacing: .06em; text-transform: uppercase; text-decoration: none; border-bottom: .3mm solid rgba(250,250,250,.6); }
.closing-contact { position: absolute; inset: auto 0 0; padding: 26mm 20mm 9mm; text-align: center; color: #FAFAFA; font-size: 9pt; letter-spacing: .03em; 
  background: linear-gradient(0deg, rgba(28,23,21,.6), rgba(28,23,21,.2) 65%, transparent); }
.hand { font-family: Caveat, cursive; font-size: 22pt !important; line-height: 1.15; margin-bottom: 4mm; }
</style></head><body>${pages.join("")}</body></html>`;

return html;
}

(async () => {
  const out = path.join(ROOT, "portfolio.pdf");
  const tmp = path.join(ROOT, ".portfolio-print.html");
  const b = await chromium.launch();
  const pg = await b.newPage();
  // pass 1: measure each section's text strip; pass 2: lay the artwork out around it
  fs.writeFileSync(tmp, build());
  await pg.goto("file://" + tmp, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  const measured = await pg.evaluate(() => Object.fromEntries([...document.querySelectorAll(".strip")].map((e) => [e.dataset.i, e.getBoundingClientRect().height * 25.4 / 96 + 1])));
  fs.writeFileSync(tmp, build(measured));
  await pg.goto("file://" + tmp, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: out, width: `${PW}mm`, height: `${PH}mm`, printBackground: true, preferCSSPageSize: true });
  await b.close();
  fs.unlinkSync(tmp);
  console.log(`${out}: ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
})();
