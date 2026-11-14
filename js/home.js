/* Home page — renders hero, selected works (gallery + index views), about and contact from content.js */
(function () {
  const { $, $$, esc, pad, clamp, projectUrl, roll, socialsHTML, imgTag, bindImages, Spring, schedule, reduceMotion, finePointer } = window.Site;
  const S = window.SITE;
  const P = window.PROJECTS;
  const SERIES = window.SERIES || [];
  const main = $("#main");
  window.Site.mountChrome("home");

  const info = (p) => [p.category, p.year].filter(Boolean).map(esc).join(" · ");
  const langAttr = (p) => (p.lang ? ` lang="${esc(p.lang)}"` : "");
  const ratio = (im) => (im && im.width ? `${im.width} / ${im.height}` : "4 / 5");
  const seriesOf = (p) => SERIES.find((s) => s.id === p.series);

  const status = () =>
    `<span class="status label${S.availability.available ? "" : " is-off"}"><span class="status-dot" aria-hidden="true"></span>${esc(S.availability.label)}</span>`;

  /* The stage holds the hero; its background is the living watercolour (paint.js). */
  function heroHTML() {
    const H = S.hero;
    return `
      <div class="stage" id="top">
        <section class="hero" data-tone="light" aria-label="Introduction">
          <canvas class="paint-canvas" aria-hidden="true"></canvas>
          <div class="hero-top">
            <p class="hero-kicker label" data-intro style="--d:.5s">${esc(H.kicker || S.role)} — ${esc(S.location)}</p>
            <div class="hero-status" data-intro style="--d:.6s">${status()}</div>
          </div>
          <h1 class="display hero-title" aria-label="${esc(H.lines.join(" "))}">${H.lines.map((t, i) =>
            `<span class="hl" aria-hidden="true"><span class="hl-in" style="--d:${(0.08 + i * 0.12).toFixed(2)}s">${esc(t)}</span></span>`).join("")}</h1>
          <div class="hero-foot">
            <p class="hero-intro" data-intro style="--d:.55s">${esc(H.intro)}</p>
            ${H.paintHint ? `<span class="paint-hint label muted" aria-hidden="true" data-intro style="--d:.65s">${esc(H.paintHint)}</span>` : ""}
            <a class="scroll-hint label" href="#work" data-intro style="--d:.7s"><span class="scroll-line" aria-hidden="true"></span>${esc(H.hint || "Scroll to explore")}</a>
          </div>
        </section>
      </div>`;
  }

  /* Loading screen: the counter follows real work (the fonts),
     never runs shorter than ~1.2s, then the paper lifts and the headline rises.
     Skipped when arriving from another page of this site. */
  function loaderHTML() {
    return `
      <div class="loader" aria-hidden="true">
        <span class="loader-label label">${esc((S.loader && S.loader.label) || S.name)}</span>
        <span class="loader-num display">000</span>
        <span class="loader-bar"><span class="loader-fill"></span></span>
      </div>`;
  }

  function intro() {
    const root = document.documentElement;
    const reveal = () => { root.classList.remove("is-loading"); $(".hero").classList.add("is-in"); window.Site.lenis && window.Site.lenis.start(); };
    const internal = document.referrer && new URL(document.referrer, location.href).origin === location.origin;
    if (internal) { reveal(); return; }

    main.insertAdjacentHTML("beforebegin", loaderHTML());
    const loader = $(".loader"), num = $(".loader-num", loader), fill = $(".loader-fill", loader);
    root.classList.add("is-loading");
    window.Site.lenis && window.Site.lenis.stop();
    let fonts = 0, done = false;
    document.fonts ? document.fonts.ready.then(() => (fonts = 1)) : (fonts = 1);
    const t0 = performance.now(), MIN = reduceMotion.matches ? 0 : 1200, MAX = 6000;
    let shown = 0, last = t0;
    const step = (now) => {
      const dt = (now - last) / 1000; last = now;
      const elapsed = now - t0;
      const real = fonts;
      const target = Math.min(elapsed >= MAX ? 1 : real, MIN ? elapsed / MIN : 1) * 100;
      shown = reduceMotion.matches ? target : shown + (target - shown) * (1 - Math.exp(-dt * 6));
      if (target >= 100 && shown > 99.4) shown = 100;
      num.textContent = String(Math.round(shown)).padStart(3, "0");
      fill.style.transform = `scaleX(${(shown / 100).toFixed(4)})`;
      if (shown < 100) { requestAnimationFrame(step); return; }
      if (done) return;
      done = true;
      loader.classList.add("is-done");
      setTimeout(reveal, reduceMotion.matches ? 0 : 520);
      setTimeout(() => loader.remove(), 1600);
    };
    requestAnimationFrame(step);
  }

  /* Cards keep the artwork's own proportions (never cropped). */
  function cardHTML(p) {
    const i = P.indexOf(p);
    const span = Math.min(12, Math.max(3, +p.span || 6));
    // matches the real card width: 1 column ≤640px, 6-col grid ≤900px, 12-col grid above
    const alone = P.filter((x) => x.series === p.series).length === 1;
    const tablet = span >= 12 ? 100 : alone ? 67 : 50;
    const sizes = `(max-width: 640px) 100vw, (max-width: 900px) ${tablet}vw, ${Math.min(100, span * 8)}vw`;
    // deterministic, organic origin for the watercolour bloom
    const ox = 25 + ((i * 37) % 50), oy = 20 + ((i * 53) % 55);
    const start = p.start ? `--start:${+p.start};` : "";
    return `
      <li class="card-item" data-slug="${esc(p.slug)}" style="--span:${span};${start}"${span >= 8 ? " data-wide" : ""}>
        <a class="card" href="${projectUrl(p)}" data-cursor="View work" data-reveal style="--ox:${ox}%;--oy:${oy}%">
          <div class="card-media" data-shared style="--ar:${ratio(p.cover)}"><div class="card-frame">${imgTag(p.cover, { sizes, alt: p.title, eager: i < 2 })}</div></div>
          <div class="card-meta">
            <span class="card-num label">${pad(i + 1)}</span>
            <h4 class="card-title"${langAttr(p)}>${esc(p.title)}<span class="card-arrow" aria-hidden="true">↗</span></h4>
            <span class="card-info label">${info(p)}</span>
          </div>
          <span class="card-cta" aria-hidden="true">View work →</span>
        </a>
      </li>`;
  }

  function seriesHTML() {
    return SERIES.map((s, n) => {
      const works = P.filter((p) => p.series === s.id);
      if (!works.length) return "";
      const [lede, ...rest] = s.text || [];
      return `
        <section class="series" id="series-${esc(s.id)}" data-medium="${esc(s.reveal || "wash")}"${s.accent ? ` style="--accent:${esc(s.accent)}"` : ""} aria-labelledby="series-title-${n}">
          <header class="series-head" data-reveal>
            <span class="series-num display">${pad(n + 1)}</span>
            <div class="series-heading">
              <h3 class="display series-title" id="series-title-${n}">${esc(s.title)}</h3>
              ${s.subtitle ? `<p class="series-subtitle">${esc(s.subtitle)}</p>` : ""}
            </div>
            <div class="series-body">
              ${s.meta?.length ? `<dl class="series-meta">${s.meta.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
              ${lede ? `<p class="series-lede">${esc(lede)}</p>` : ""}
              ${rest.length ? `<details class="series-more"><summary class="label"><span class="more-open">Read more</span><span class="more-close">Read less</span></summary>${rest.map((t) => `<p>${esc(t)}</p>`).join("")}</details>` : ""}
            </div>
          </header>
          <ol class="series-grid">${works.map(cardHTML).join("")}</ol>
        </section>`;
    }).join("");
  }

  function indexHTML() {
    return P.map((p, i) => `
      <li data-slug="${esc(p.slug)}">
        <a class="index-row" href="${projectUrl(p)}" data-i="${i}" data-reveal style="--d:${Math.min(i * 0.03, 0.3).toFixed(2)}s">
          <span class="ir-num label">${pad(i + 1)}</span>
          <span class="ir-title"${langAttr(p)}>${esc(p.title)}</span>
          <span class="ir-cat label">${esc((seriesOf(p) || {}).title || p.category || "")}</span>
          <span class="ir-client label">${esc(p.category || "")}</span>
          <span class="ir-year label">${esc(p.year || "")}</span>
        </a>
      </li>`).join("");
  }

  function workHTML() {
    return `
      <section class="work" id="work" data-tone="light" aria-labelledby="work-title">
        <div class="trail-layer" aria-hidden="true"><canvas class="trail-canvas"></canvas></div>
        <div class="work-head">
          <h2 class="display work-title" id="work-title" data-reveal>Selected Works<span class="work-count">(${SERIES.length})</span></h2>
          <div class="view-toggle" role="group" aria-label="Layout" data-reveal style="--d:.1s">
            <span class="view-pill" aria-hidden="true"></span>
            <button type="button" data-view="grid" aria-pressed="true">Projects</button>
            <button type="button" data-view="index" aria-pressed="false">Index</button>
          </div>
        </div>
        <div class="views">
          <div class="gallery">${seriesHTML()}</div>
          <ol class="index-list" hidden>${indexHTML()}</ol>
        </div>
      </section>`;
  }

  function aboutHTML() {
    const A = S.about;
    const list = (arr) => `<ul class="about-list">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    const cols = [
      A.paragraphs?.length && `<div class="about-col" data-reveal><h3 class="label">Practice</h3>${A.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`,
      A.whatIDo?.length && `<div class="about-col" data-reveal style="--d:.08s"><h3 class="label">What I do</h3>${list(A.whatIDo)}</div>`,
      A.clients?.length && `<div class="about-col" data-reveal style="--d:.16s"><h3 class="label">Clients</h3>${list(A.clients)}</div>`,
    ].filter(Boolean).join("");
    return `
      <section class="about" id="about" data-tone="light" aria-labelledby="about-title">
        <div class="section-head label"><h2 id="about-title" class="label">About me</h2><span class="muted">${esc(S.location)}</span></div>
        <p class="about-intro" data-reveal>${esc(A.intro)}</p>
        <div class="about-grid">${cols}</div>
      </section>`;
  }

  /* Contact — written by hand as it scrolls into view (see initHandwriting in core.js). */
  function contactHTML() {
    const C = S.contact;
    const insta = S.socials.find((s) => /instagram/i.test(s.label)) || S.socials[0];
    return `
      <section class="contact" id="contact" data-tone="light" aria-labelledby="contact-title">
        <div class="section-head label"><span>Contact</span><span class="muted">Let's talk</span></div>
        <h2 class="sr-only" id="contact-title">Contact</h2>
        <div class="hand-contacts" data-write-group data-write-speed="0.045" data-write-delay="0.1">
          <div class="hand-item hand-item-email">
            <span class="label">Write to me</span>
            <a class="hand-link hand-email" href="mailto:${esc(S.email)}" data-write>${esc(S.email)}</a>
            <button type="button" class="copy-btn" data-copy="${esc(S.email)}">Copy email</button>
            <span class="sr-only" aria-live="polite" id="copy-status"></span>
          </div>
          ${S.phone ? `
          <div class="hand-item">
            <span class="label">Call me</span>
            <a class="hand-link" href="${esc(S.phone.href)}" data-write>${esc(S.phone.label)}</a>
          </div>` : ""}
          ${insta ? `
          <div class="hand-item">
            <span class="label">Follow along</span>
            <a class="hand-link" href="${esc(insta.url)}" target="_blank" rel="noopener noreferrer" data-write>${esc(insta.handle || insta.label)}</a>
          </div>` : ""}
        </div>
        ${C.note ? `<p class="contact-note" data-reveal>${esc(C.note)}</p>` : ""}
        ${S.credit ? `<div class="credit"><p data-reveal>${esc(S.credit)}</p></div>` : ""}
      </section>`;
  }

  main.innerHTML = heroHTML() + workHTML() + aboutHTML() + contactHTML();
  document.title = `${S.name} — Portfolio`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && S.description) metaDesc.setAttribute("content", S.description);

  /* ---------- View toggle (Projects / Index) ------------------------------- */
  const views = $(".views");
  const toggle = $(".view-toggle");
  const pill = $(".view-pill", toggle);
  const panes = { grid: $(".gallery"), index: $(".index-list") };
  let current = "grid";
  let previewReady = false;
  function placePill() {
    const btn = $(`[data-view="${current}"]`, toggle);
    pill.style.width = `${btn.offsetWidth}px`;
    pill.style.transform = `translateX(${btn.offsetLeft}px)`;
  }
  function setView(v, animate = true) {
    if (!panes[v] || v === current) return;
    current = v;
    $$("button", toggle).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    placePill();
    try { localStorage.setItem("portfolio-view", v); } catch {}
    const swap = () => {
      panes.grid.hidden = v !== "grid";
      panes.index.hidden = v !== "index";
      if (v === "index") initPreview();
      views.classList.remove("is-switching");
    };
    if (!animate || reduceMotion.matches) return swap();
    views.classList.add("is-switching");
    setTimeout(swap, 280);
  }
  toggle.addEventListener("click", (e) => { const b = e.target.closest("button[data-view]"); if (b) setView(b.dataset.view); });
  addEventListener("resize", placePill);
  placePill();
  try { const saved = localStorage.getItem("portfolio-view"); if (saved) setView(saved, false); } catch {}
  document.fonts?.ready.then(placePill);

  /* ---------- Index view floating preview --------------------------------- */
  function initPreview() {
    if (previewReady || !finePointer.matches || reduceMotion.matches) return;
    previewReady = true;
    const list = panes.index;
    const box = document.createElement("div");
    box.className = "preview";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = P.map((p, i) => `<div class="preview-img" data-i="${i}">${imgTag(p.cover, { sizes: "340px", alt: "", eager: true })}</div>`).join("");
    document.body.append(box);
    bindImages(box);
    const imgs = $$(".preview-img", box);
    const x = new Spring(0, { response: 0.34 });
    const y = new Spring(0, { response: 0.34 });
    const s = new Spring(0, { response: 0.32, precision: 0.001 });
    const r = new Spring(0, { response: 0.45, precision: 0.01 });
    let running = false;
    const tick = (dt) => {
      x.step(dt); y.step(dt); s.step(dt);
      r.target = clamp(x.velocity * 0.006, -7, 7); // lean into the direction of travel
      r.step(dt);
      box.style.transform = `translate3d(${x.value}px,${y.value}px,0) translate(-50%,-50%) rotate(${r.value.toFixed(2)}deg) scale(${Math.max(0, s.value).toFixed(4)})`;
      if (x.settled && y.settled && s.settled && r.settled) { running = false; return false; }
    };
    const kick = () => { if (!running) { running = true; schedule(tick); } };
    list.addEventListener("pointermove", (e) => {
      if (s.value < 0.02) { x.snap(e.clientX); y.snap(e.clientY); }
      x.target = e.clientX; y.target = e.clientY; kick();
    });
    list.addEventListener("pointerover", (e) => {
      const row = e.target.closest(".index-row");
      if (!row) return;
      imgs.forEach((el) => el.classList.toggle("is-active", el.dataset.i === row.dataset.i));
      s.target = 1; kick();
    });
    list.addEventListener("pointerleave", () => { s.target = 0; kick(); });
  }

  /* ---------- Copy email ---------------------------------------------------- */
  const copyBtn = $(".copy-btn");
  copyBtn.addEventListener("click", async () => {
    const text = copyBtn.dataset.copy;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.append(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch {}
      ta.remove();
    }
    copyBtn.textContent = ok ? "Copied ✓" : "Copy failed";
    $("#copy-status").textContent = ok ? "Email copied to clipboard" : "Could not copy email";
    clearTimeout(copyBtn._t);
    copyBtn._t = setTimeout(() => (copyBtn.textContent = "Copy email"), 1800);
  });

  window.Site.init("home");
  intro();
})();
