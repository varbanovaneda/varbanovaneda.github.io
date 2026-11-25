/* Builds portfolio.pdf (A4 landscape) from js/content.js, so the PDF always matches the website.
   Run from the repository root:  node tools/make-pdf.js
   Needs Playwright (Chromium). Fonts load from Google Fonts. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/content.js"), "utf8"), ctx);
const { SITE: S, SERIES, PROJECTS: P } = ctx.window;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
// a print-sized copy of each image (sharp at A4, small file)
const file = (im, want = 1400) => {
  const base = im.src.replace(/^assets\/work\//, "").replace(/\.[^.]+$/, "");
  for (const w of [want, 1200, 1000, 800]) {
    const p = path.join(ROOT, `assets/work/opt/${base}-${w}.jpg`);
    if (w <= want && fs.existsSync(p)) return "file://" + p;
  }
  return "file://" + path.join(ROOT, im.src);
};
const pic = (im, cls = "", want) => `<img class="${cls}" src="${file(im, want)}" alt="${esc(im.alt || "")}">`;
const yearOf = (p) => p.year || (SERIES.find((s) => s.id === p.series) || {}).year || "";

let pageNo = 0;
const page = (inner, cls = "") => `<section class="page ${cls}">${inner}<footer><span>${esc(S.name)} — Portfolio</span><span>${pad(++pageNo)}</span></footer></section>`;

const pages = [];

/* cover */
pages.push(page(`
  <div class="cover">
    <p class="label">${esc(S.role)} — ${esc(S.location)}</p>
    <h1 class="display">${S.hero.lines.map(esc).join("<br>")}</h1>
    <p class="lede">${esc(S.hero.intro)}</p>
    <ol class="toc">${SERIES.map((s, i) => `<li><span>${pad(i + 1)}</span>${esc(s.title)}<em>${esc(s.year || "")}</em></li>`).join("")}</ol>
  </div>`, "is-cover"));

/* about */
const A = S.about;
pages.push(page(`
  <h2 class="label">About me</h2>
  <div class="about">
    <div>
      <p class="intro">${esc(A.intro)}</p>
      ${A.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}
    </div>
    <div class="cols">
      <div><h3 class="label">What I do</h3><ul>${A.whatIDo.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><h3 class="label">Clients</h3><ul>${A.clients.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div><h3 class="label">Contact</h3><ul><li>${esc(S.email)}</li><li>${esc(S.phone.label)}</li>${S.socials.map((s) => `<li>${esc(s.label)} ${esc(s.handle || "")}</li>`).join("")}<li>varbanovaneda.github.io</li></ul></div>
    </div>
  </div>`));

/* each section: a text page, then every work once, one per page */
SERIES.forEach((s, i) => {
  const works = P.filter((p) => p.series === s.id);
  const meta = [...(s.meta || []), ...(s.year ? [["Year", s.year]] : [])];
  pages.push(page(`
    <div class="intro-page">
      <span class="num display">${pad(i + 1)}</span>
      <h2 class="display">${esc(s.title)}</h2>
      ${s.subtitle ? `<p class="sub">${esc(s.subtitle)}</p>` : ""}
      <dl>${meta.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="intro-text">${(s.text || []).map((t) => `<p>${esc(t)}</p>`).join("")}
      ${s.link ? `<p class="link"><a href="${esc(s.link.url)}">${esc(s.link.label)} ↗</a></p>` : ""}</div>
    </div>`));
  works.forEach((p) => {
    pages.push(page(`
      <div class="one">
        <div class="one-img">${pic(p.cover, "", 1400)}</div>
        <div class="one-text">
          <p class="label">${pad(i + 1)} ${esc(s.title)}</p>
          <h3 class="display"${p.lang ? ` lang="${p.lang}"` : ""}>${esc(p.title)}</h3>
          <p class="label">${esc([p.category, yearOf(p)].filter(Boolean).join(" · "))}</p>
          ${(p.description || []).map((t) => `<p>${esc(t)}</p>`).join("")}
        </div>
      </div>`));
  });
});

/* closing */
pages.push(page(`
  <div class="closing">
    ${S.creditImage ? pic(S.creditImage, "", 1400) : ""}
    <div class="closing-text">
      <h2 class="display">${S.cta.lines.map(esc).join("<br>")}</h2>
      <p>${esc(S.email)}<br>${esc(S.phone.label)}<br>${S.socials.map((s) => esc(s.handle || s.label)).join(" · ")}<br>varbanovaneda.github.io</p>
      <p class="hand">${esc(S.credit || "")}</p>
    </div>
  </div>`));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@600;700;800&family=Inter:opsz,wght@14..32,300..700&family=Caveat:wght@400..600&display=swap">
<style>
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #FAFAFA; color: #413935; font: 400 9.6pt/1.5 Inter, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 297mm; height: 210mm; padding: 13mm 14mm 16mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; }
footer { position: absolute; left: 14mm; right: 14mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 7pt; letter-spacing: .06em; text-transform: uppercase; opacity: .5; }
.display { font-family: "Fira Sans Extra Condensed", sans-serif; font-weight: 800; text-transform: uppercase; line-height: .9; letter-spacing: -.01em; margin: 0; }
.label { font-size: 7pt; letter-spacing: .08em; text-transform: uppercase; opacity: .6; margin: 0; font-weight: 500; }
p { margin: 0 0 .7em; }
img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 2.5mm; }
.running { position: absolute; top: 9mm; left: 14mm; }
/* cover */
.cover { height: 100%; display: flex; flex-direction: column; }
.cover h1 { font-size: 46mm; margin-top: 6mm; }
.cover .lede { max-width: 120mm; font-size: 11pt; margin-top: 6mm; }
.toc { list-style: none; padding: 0; margin: auto 0 0; columns: 2; column-gap: 14mm; border-top: .3mm solid rgba(65,57,53,.2); padding-top: 4mm; }
.toc li { display: flex; gap: 4mm; padding: 1.2mm 0; break-inside: avoid; }
.toc li span { opacity: .5; width: 7mm; } .toc li em { margin-left: auto; font-style: normal; opacity: .5; }
/* about */
.about { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14mm; margin-top: 8mm; }
.about .intro { font-size: 15pt; line-height: 1.3; font-weight: 500; letter-spacing: -.01em; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; align-content: start; }
.cols ul { list-style: none; padding: 0; margin: 2mm 0 0; } .cols li { padding: 1.4mm 0; border-top: .3mm solid rgba(65,57,53,.15); }
/* section opener */
.series { display: grid; grid-template-columns: 88mm 1fr; gap: 10mm; height: 100%; }
.series-text { font-size: 8.8pt; overflow: hidden; }
.series-text .num { font-size: 22mm; opacity: .2; display: block; }
.series-text h2 { font-size: 13mm; margin: 2mm 0 2mm; }
.series-text .sub { opacity: .7; font-size: 10pt; }
dl { margin: 4mm 0 5mm; display: grid; gap: 1.4mm; } dl div { display: grid; grid-template-columns: 22mm 1fr; } dd { margin: 0; }
.link { font-size: 7.5pt; } .link a { color: inherit; }
.grid { display: grid; gap: 6mm; align-items: end; height: 100%; }
.grid.n1 { grid-template-columns: 1fr; } .grid.n2 { grid-template-columns: 1fr 1fr; } .grid.n3 { grid-template-columns: 1fr 1fr 1fr; } .grid.n4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.grid.wide { height: calc(100% - 6mm); margin-top: 6mm; gap: 12mm; } .grid.wide .work { align-items: center; } .grid.wide .work img { margin: 0 auto; }
.work { margin: 0; display: flex; flex-direction: column; height: 100%; justify-content: flex-end; min-height: 0; }
.work img { width: auto; height: auto; max-width: 100%; max-height: 158mm; margin: 0 auto 0 0; }
.grid.n4:not(.wide) .work img { max-height: 70mm; }
.grid.wide .work img { max-height: 165mm; }
.work figcaption { margin-top: 2.5mm; display: flex; justify-content: space-between; gap: 3mm; font-size: 8pt; }
.work figcaption b { font-family: "Fira Sans Extra Condensed", sans-serif; font-weight: 800; text-transform: uppercase; font-size: 11pt; line-height: 1; }
.work figcaption span { opacity: .55; font-size: 7pt; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
/* work detail */
.detail { display: grid; grid-template-columns: 1.1fr 1fr; gap: 10mm; height: calc(100% - 4mm); margin-top: 4mm; }
.detail-main { display: flex; align-items: center; justify-content: center; min-height: 0; }
.detail-main img { width: auto; height: auto; max-width: 100%; max-height: 172mm; }
.detail-text { font-size: 8.8pt; overflow: hidden; display: flex; flex-direction: column; }
.detail-text h3 { font-size: 11mm; margin-bottom: 2mm; }
.detail-text .label { margin-bottom: 4mm; }
.summary { font-size: 12pt; font-weight: 500; line-height: 1.3; }
.extras { margin-top: auto; display: flex; flex-wrap: wrap; gap: 4mm; align-items: flex-end; }
.extras figure { margin: 0; flex: 1 1 0; min-width: 28mm; }
.extras img { height: 38mm; width: auto; max-width: 100%; }
.extras figcaption { margin-top: 1.5mm; font-size: 6pt; }
/* a page of extra images */
.spread { display: flex; flex-direction: column; gap: 6mm; height: calc(100% - 4mm); margin-top: 6mm; }
.spread figure { margin: 0; } .spread figcaption { margin-top: 1.5mm; font-size: 6.5pt; }
.spread-wide img { width: 100%; max-height: 72mm; object-fit: contain; }
.spread-row { display: flex; gap: 5mm; justify-content: space-between; align-items: flex-end; flex: 1; min-height: 0; }
.spread-row figure { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; justify-content: flex-end; }
.spread-row img { width: 100%; height: 78mm; object-fit: cover; }
/* section intro */
.intro-page { height: 100%; display: flex; flex-direction: column; justify-content: center; max-width: 175mm; }
.intro-page .num { font-size: 30mm; opacity: .2; }
.intro-page h2 { font-size: 22mm; margin: 2mm 0 3mm; }
.intro-page .sub { font-size: 12pt; opacity: .7; }
.intro-text { columns: 2; column-gap: 10mm; font-size: 9.6pt; }
/* one work per page */
.one { display: grid; grid-template-columns: 1fr 70mm; gap: 12mm; height: 100%; align-items: center; }
.one-img { height: 100%; display: flex; align-items: center; justify-content: center; min-height: 0; }
.one-img img { width: auto; height: auto; max-width: 100%; max-height: 178mm; }
.one-text { align-self: end; font-size: 9pt; padding-bottom: 2mm; }
.one-text h3 { font-size: 11mm; margin: 2mm 0 2mm; }
.one-text .label + .display + .label { margin-bottom: 4mm; }
/* closing */
.closing { position: relative; height: 100%; }
.closing > img { width: 100%; height: 100%; object-fit: cover; border-radius: 3mm; }
.closing-text { position: absolute; top: 0; left: 0; padding: 12mm; color: #FAFAFA; max-width: 60%; background: radial-gradient(120% 100% at 0 0, rgba(28,23,21,.55), transparent 70%); }
.closing-text h2 { font-size: 20mm; margin-bottom: 6mm; }
.hand { font-family: Caveat, cursive; font-size: 17pt; line-height: 1.2; margin-top: 4mm; }
</style></head><body>${pages.join("")}</body></html>`;

(async () => {
  const out = path.join(ROOT, "portfolio.pdf");
  const tmp = path.join(ROOT, ".portfolio-print.html");
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.goto("file://" + tmp, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: out, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
  await b.close();
  fs.unlinkSync(tmp);
  console.log(`${out}: ${pageNo} pages, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
})();
