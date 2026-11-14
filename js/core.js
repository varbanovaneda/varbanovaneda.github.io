/* ==========================================================================
   CORE — shared components and motion used by every page.
   You shouldn't need to edit this file to change content (see content.js).
   ========================================================================== */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const projectUrl = (p) => `project.html?p=${encodeURIComponent(p.slug)}`;

  /* Colours from content.js (SITE.theme) override the defaults in styles.css. */
  const theme = (window.SITE && window.SITE.theme) || {};
  if (theme.paper) document.documentElement.style.setProperty("--white", theme.paper);
  if (theme.ink) document.documentElement.style.setProperty("--black", theme.ink);
  (theme.washes || []).forEach((c, i) => document.documentElement.style.setProperty(`--wash-${i + 1}`, c));

  /* ---------- Spring --------------------------------------------------------
     Apple-style parameters: damping ratio (1 = no overshoot) and response
     (seconds, how quickly it reaches the target). Always animates from the
     current value + velocity, so it is interruptible by design. */
  class Spring {
    constructor(value = 0, { damping = 1, response = 0.4, precision = 0.05 } = {}) {
      this.value = this.target = value;
      this.velocity = 0;
      this.precision = precision;
      this.k = Math.pow((2 * Math.PI) / response, 2);
      this.c = (4 * Math.PI * damping) / response;
    }
    step(dt) {
      const n = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        const f = -this.k * (this.value - this.target) - this.c * this.velocity;
        this.velocity += f * h;
        this.value += this.velocity * h;
      }
    }
    get settled() {
      const done = Math.abs(this.velocity) < this.precision && Math.abs(this.value - this.target) < this.precision;
      if (done) { this.value = this.target; this.velocity = 0; }
      return done;
    }
    snap(v) { this.value = this.target = v; this.velocity = 0; }
  }

  /* One shared rAF loop; tasks return false when they're finished. */
  const tasks = new Set();
  let raf = 0, last = 0;
  function frame(t) {
    const dt = Math.min((t - last) / 1000, 1 / 30);
    last = t;
    for (const fn of tasks) if (fn(dt) === false) tasks.delete(fn);
    raf = tasks.size ? requestAnimationFrame(frame) : 0;
  }
  function schedule(fn) {
    tasks.add(fn);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  /* ---------- Images -------------------------------------------------------- */
  function imgTag(image, { sizes = "100vw", alt = "", cls = "", eager = false } = {}) {
    const im = typeof image === "string" ? { src: image } : image || {};
    return `<img${cls ? ` class="${cls}"` : ""} src="${esc(im.src)}"${
      im.srcset ? ` srcset="${esc(im.srcset)}" sizes="${esc(sizes)}"` : ""
    }${im.width ? ` width="${im.width}" height="${im.height}"` : ""} alt="${esc(im.alt ?? alt)}" loading="${
      eager ? "eager" : "lazy"
    }" decoding="async"${eager ? ' fetchpriority="high"' : ""}>`;
  }
  function bindImages(root = document) {
    $$("img", root).forEach((img) => {
      const done = () => img.classList.add("is-loaded");
      if (img.complete && img.naturalWidth) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", () => img.classList.add("is-error"), { once: true });
      }
    });
  }

  /* ---------- Shared chrome ------------------------------------------------- */
  function roll(text) {
    return `<span class="roll"><span class="roll-in" data-text="${esc(text)}">${esc(text)}</span></span>`;
  }
  /* Hand-drawn HB monogram, traced from Neda's sketch. Strokes use currentColor
     so the mark always matches the nav text colour in light and dark. */
  const LOGO_SVG = `<svg class="nav-logo-mark" viewBox="200 460 480 1335" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M449 490 Q432 1120 440 1765"/>
      <path d="M244 808 Q232 1060 230 1318"/>
      <path d="M228 1018 Q330 1022 436 1026"/>
      <path d="M462 646 L604 846 Q540 950 450 1022"/>
      <path d="M455 1036 L650 1232 L460 1430"/>
    </g>
  </svg>`;
  function navHTML(page) {
    const S = window.SITE;
    const base = page === "home" ? "" : "index.html";
    const link = (id, label) =>
      `<li><a class="nav-link" href="${base}#${id}" data-section="${id}">${roll(label)}</a></li>`;
    return `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="nav" id="nav">
        <a class="nav-logo" href="${page === "home" ? "#top" : "index.html"}" aria-label="${esc(S.name)} — home">${LOGO_SVG}</a>
        <nav aria-label="Primary">
          <ul class="nav-links">${link("work", "Work")}${link("about", "About")}${link("contact", "Contact")}</ul>
        </nav>
      </header>`;
  }
  function socialsHTML(cls = "") {
    return window.SITE.socials
      .map((s) => `<li><a class="${cls}" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${roll(s.label)}</a></li>`)
      .join("");
  }
  function footerHTML() {
    const S = window.SITE;
    return `
      <footer class="footer hand-footer">
        <div class="hf-bottom">
          <p class="footer-copy">© ${new Date().getFullYear()} ${esc(S.name)}. All rights reserved.</p>
          <a class="footer-link footer-top" href="#top">${roll("Back to top ↑")}</a>
        </div>
      </footer>`;
  }

  /* ---------- Handwriting -----------------------------------------------------
     [data-write-group] writes its [data-write] text letter by letter, then draws
     any [data-draw] strokes, in document order, once the group scrolls into view. */
  function splitForWriting(el) {
    const units = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.parentNode.closest("svg") && n.textContent.trim()) nodes.push(n);
    }
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); units.push({ w: 0.4 }); return; }
        const word = document.createElement("span");
        word.className = "hw-word";
        for (const ch of part) {
          const c = document.createElement("span");
          c.className = "hw-ch";
          c.textContent = ch;
          word.append(c);
          units.push({ el: c, w: /[.,'’:;!|il1]/.test(ch) ? 0.45 : /[mwMW@]/.test(ch) ? 1.35 : 1 });
        }
        frag.append(word);
      });
      node.replaceWith(frag);
    });
    return units;
  }

  function initHandwriting() {
    const groups = $$("[data-write-group]");
    if (!groups.length) return;
    groups.forEach((g) => {
      let t = parseFloat(g.dataset.writeDelay || "0.1");
      const groupSpeed = parseFloat(g.dataset.writeSpeed || "0.055");
      const items = []; // the pen's timeline: letters and strokes, in order
      $$("[data-write], [data-draw]", g).forEach((el) => {
        if (el.hasAttribute("data-write")) {
          const label = el.textContent.replace(/\s+/g, " ").trim();
          if (el.tagName === "A" && !el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
          const speed = parseFloat(el.dataset.writeSpeed || groupSpeed);
          splitForWriting(el).forEach((u) => {
            if (u.el) {
              u.el.style.setProperty("--hd", `${t.toFixed(3)}s`);
              u.el.style.setProperty("--hl", `${(u.w * speed * 2.2).toFixed(3)}s`);
              items.push({ el: u.el, start: t, dur: u.w * speed * 2.2 });
            }
            t += u.w * speed;
          });
          t += 0.12;
        } else {
          const dur = parseFloat(el.dataset.draw || "0.8");
          el.style.setProperty("--hd", `${t.toFixed(3)}s`);
          el.style.setProperty("--hl", `${dur}s`);
          $$("path", el).forEach((p, k) => items.push({ path: p, start: t + k * dur * 0.55, dur }));
          t += dur * 0.6;
        }
      });
      g._items = items;
      g._end = items.reduce((m, it) => Math.max(m, it.start + it.dur), t);
    });
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      groups.forEach((g) => g.classList.add("is-writing"));
      return;
    }
    const hand = createWritingHand();
    // One hand, so groups are written one after another, never at the same time.
    const queue = [];
    let busy = false;
    const next = () => {
      const g = queue.shift();
      if (!g) { busy = false; hand.leave(); return; }
      busy = true;
      g.classList.add("is-writing");
      hand.write(g, next);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        queue.push(en.target);
        if (!busy) next();
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -6% 0px" });
    groups.forEach((g) => io.observe(g));
  }

  /* Traced line-art hand: lines only, transparent inside, drawn in the text colour.
     The pen tip sits at (18,152) in the 300×200 drawing; springs make it glide
     between letters, lines and strokes. */
  const HAND_SVG = `<svg viewBox="0 0 300 200" aria-hidden="true">
    <g transform="translate(6.4 34.3) scale(1.45)">
      <path class="hand-line" fill-rule="evenodd" d="M66.1 64.1 L65.6 64.1 L65.5 65.2 L65.1 66.4 L64.8 72.1 L64.9 73.2 L65.2 73.2 L65.5 73.0 L65.9 72.1 L66.0 70.4 L66.6 67.6 L66.8 65.4 L66.5 64.5ZM84.1 26.2 L83.6 26.2 L83.1 26.5 L82.1 27.4 L81.2 29.2 L81.2 30.1 L81.6 30.0 L82.0 29.1 L84.1 26.8ZM187.8 79.5 L187.4 79.1 L186.9 79.0 L185.9 78.0 L185.4 77.9 L184.5 77.1 L183.6 76.8 L181.5 75.1 L180.4 74.6 L179.8 74.0 L178.8 73.5 L178.2 73.0 L174.5 70.6 L165.2 63.6 L159.0 58.2 L150.0 49.2 L144.4 42.6 L142.0 39.4 L140.1 37.4 L139.8 36.8 L128.0 24.9 L124.8 22.2 L124.5 21.9 L124.5 21.4 L124.8 21.1 L126.9 20.0 L127.6 19.4 L128.9 18.9 L131.2 17.4 L132.6 16.8 L133.4 16.1 L133.9 16.0 L135.8 14.6 L136.9 12.9 L137.0 10.6 L135.8 8.4 L133.6 7.0 L131.5 6.9 L129.1 8.0 L126.5 9.6 L125.5 10.0 L123.0 11.6 L121.8 12.1 L119.4 13.6 L118.5 13.9 L117.8 14.5 L116.4 15.1 L114.0 16.6 L112.2 17.4 L110.9 17.4 L109.8 17.0 L104.8 16.8 L99.6 16.0 L94.5 15.8 L90.1 15.0 L85.2 14.9 L82.8 14.6 L72.1 14.6 L67.1 14.1 L58.2 14.1 L55.1 14.9 L53.4 15.9 L51.0 18.2 L48.6 23.0 L48.0 23.8 L47.8 24.5 L46.9 25.6 L45.8 27.8 L45.0 28.8 L44.6 29.8 L43.1 32.0 L41.6 35.0 L41.0 35.9 L40.6 36.9 L40.0 37.6 L39.5 38.6 L37.4 41.2 L36.8 42.5 L35.8 43.8 L34.2 46.4 L33.6 47.9 L31.1 51.5 L30.6 52.6 L30.0 53.4 L29.6 54.4 L29.1 55.0 L28.8 56.2 L28.0 57.4 L27.6 58.9 L27.1 59.6 L26.9 60.5 L27.0 61.9 L27.4 62.6 L28.5 63.8 L28.6 64.4 L28.2 64.8 L25.5 66.1 L23.1 67.6 L22.1 68.0 L21.4 68.6 L20.1 69.1 L17.6 70.8 L11.2 76.8 L9.0 78.6 L7.5 80.1 L7.0 81.4 L7.2 81.9 L7.6 82.1 L9.2 82.2 L11.8 81.9 L13.4 81.2 L16.0 80.9 L17.8 80.2 L20.5 79.9 L23.5 78.8 L25.8 77.2 L27.0 76.8 L27.4 76.4 L30.4 74.9 L31.1 74.2 L31.9 74.0 L32.9 73.2 L33.8 72.9 L34.2 72.4 L35.1 72.1 L37.1 73.4 L38.4 75.1 L38.8 75.9 L39.0 78.0 L39.8 80.5 L40.0 82.9 L40.6 84.1 L41.0 85.6 L42.4 88.0 L43.4 89.0 L45.0 90.0 L47.9 89.9 L49.8 88.9 L51.5 87.5 L52.1 87.5 L53.5 89.0 L55.1 90.0 L58.0 90.1 L59.5 89.9 L60.8 89.0 L62.0 87.8 L62.8 86.6 L63.8 83.9 L63.9 82.6 L64.4 82.0 L65.1 82.2 L68.1 84.9 L72.6 87.9 L74.9 89.0 L77.2 89.2 L78.4 88.9 L79.5 87.8 L80.9 85.2 L81.2 83.9 L81.5 83.6 L82.1 83.6 L84.1 84.2 L88.1 86.2 L93.0 89.5 L93.6 90.1 L97.6 93.0 L101.0 95.0 L101.9 95.2 L102.8 95.9 L105.4 97.0 L106.9 97.2 L108.9 98.0 L111.2 98.2 L114.4 99.0 L128.6 99.4 L135.5 100.1 L137.1 100.9 L138.9 101.2 L140.1 102.0 L141.0 102.1 L143.2 103.2 L143.8 103.8 L145.4 104.6 L146.5 105.0 L147.4 105.8 L149.4 106.8 L149.8 106.8 L149.8 106.4 L148.5 105.1 L146.1 103.8 L145.2 103.0 L142.1 101.5 L141.2 100.9 L140.2 100.6 L139.2 100.0 L137.6 99.6 L136.1 98.9 L131.2 98.0 L118.1 97.8 L114.4 97.2 L113.8 97.0 L109.8 96.6 L108.4 96.0 L106.4 95.6 L105.2 95.0 L103.8 94.6 L102.9 94.0 L101.4 93.4 L98.4 91.5 L95.5 89.5 L94.9 88.9 L94.1 88.5 L93.5 87.9 L89.2 85.0 L86.9 83.8 L86.2 83.6 L85.1 82.9 L83.5 82.5 L82.2 81.9 L80.6 81.6 L79.2 81.0 L76.5 80.6 L74.8 80.0 L64.2 79.6 L61.1 78.9 L58.6 78.8 L55.2 78.0 L51.9 77.8 L49.2 76.9 L47.8 76.8 L47.1 76.2 L48.2 75.4 L48.4 74.6 L47.9 73.4 L47.8 72.2 L47.4 71.5 L47.1 71.5 L47.0 71.9 L47.0 73.1 L46.1 74.0 L42.8 73.8 L38.5 72.5 L37.1 71.8 L36.4 71.1 L35.2 69.5 L35.1 66.5 L35.6 65.0 L36.6 63.4 L38.5 62.2 L39.1 62.1 L42.6 62.2 L44.2 62.9 L46.4 63.2 L47.0 64.4 L47.1 67.0 L47.4 67.0 L47.9 64.8 L48.5 63.8 L48.5 62.9 L47.8 62.1 L44.8 61.5 L44.4 61.1 L44.4 60.6 L45.4 60.1 L47.2 60.0 L50.0 59.2 L54.9 59.1 L55.0 59.0 L62.2 59.1 L65.0 59.5 L66.8 60.0 L68.2 60.1 L69.5 60.5 L70.2 61.0 L72.8 61.5 L76.0 61.5 L83.4 60.9 L84.9 60.2 L86.9 60.0 L88.1 59.2 L89.8 58.8 L92.6 56.9 L93.8 55.6 L93.8 55.2 L93.4 55.2 L91.5 56.4 L91.2 56.4 L90.9 56.0 L91.1 54.6 L93.0 51.0 L93.1 50.2 L93.8 49.0 L93.9 45.8 L93.5 44.4 L93.2 44.4 L92.8 47.0 L91.9 50.0 L89.9 54.0 L89.6 55.1 L88.9 56.5 L88.9 56.9 L88.2 57.8 L85.9 58.8 L83.6 59.0 L81.1 59.6 L80.6 59.5 L80.0 58.9 L79.8 57.0 L79.5 56.4 L79.0 55.9 L78.8 55.9 L78.9 59.1 L78.1 59.8 L72.6 59.9 L70.9 59.4 L69.1 57.8 L68.5 57.8 L68.1 58.2 L67.2 58.4 L65.9 57.9 L62.2 57.8 L61.9 57.6 L61.6 57.2 L62.2 56.5 L63.8 55.9 L66.2 54.2 L67.4 53.9 L68.2 53.1 L70.6 52.0 L71.4 51.4 L72.6 50.9 L73.4 50.2 L77.8 47.9 L78.5 47.2 L79.4 47.0 L81.9 45.4 L83.1 44.9 L83.9 44.2 L84.6 44.0 L85.6 43.2 L88.4 41.9 L89.1 41.2 L90.0 41.0 L91.0 40.2 L91.8 40.0 L92.5 39.4 L93.6 38.9 L94.4 38.2 L95.4 37.9 L96.1 37.2 L97.2 36.9 L98.0 36.2 L98.8 36.0 L99.4 35.5 L102.5 33.9 L104.8 32.4 L108.0 30.8 L108.4 30.4 L109.4 30.0 L110.1 29.4 L111.5 28.8 L115.4 26.4 L116.4 26.0 L117.1 25.4 L120.2 23.8 L120.6 23.4 L122.4 22.6 L123.5 23.0 L125.6 24.8 L136.6 35.8 L141.6 41.5 L145.6 46.8 L150.0 51.6 L156.4 58.0 L160.9 62.0 L161.4 62.2 L163.2 64.0 L168.2 68.0 L175.4 73.0 L176.0 73.2 L176.8 73.9 L177.5 74.1 L178.4 74.9 L179.5 75.4 L181.6 76.9 L184.5 78.2 L185.2 78.9 L186.2 79.1 L187.1 79.8 L187.8 79.8ZM55.1 82.9 L55.6 83.5 L55.5 84.4 L54.2 85.9 L53.5 86.4 L53.1 86.0 L53.2 85.0 L53.8 84.4 L54.1 83.2 L54.5 82.9ZM76.5 82.1 L78.0 82.4 L79.2 83.0 L79.8 83.8 L78.8 86.4 L77.9 87.1 L77.4 86.9 L77.6 85.6 L77.6 84.8 L77.1 83.5 L76.1 82.6 L76.1 82.4ZM67.0 81.6 L67.2 81.4 L67.9 81.2 L69.6 81.4 L70.4 82.1 L71.2 82.0 L72.6 82.1 L74.2 83.0 L75.9 84.8 L75.9 86.5 L75.6 87.1 L75.4 87.4 L74.8 87.4 L71.9 85.8 L70.6 84.9 L69.5 83.8 L67.9 82.9 L67.1 82.1ZM55.9 80.0 L60.8 80.5 L61.8 80.9 L62.5 81.6 L62.2 83.6 L61.6 85.8 L60.1 87.6 L58.4 88.8 L57.9 88.9 L55.8 88.8 L55.0 88.1 L54.9 87.8 L55.1 86.9 L57.2 84.8 L57.2 83.9 L57.0 83.4 L55.9 82.1 L55.2 80.9 L55.4 80.4ZM40.5 75.4 L42.4 76.0 L43.5 76.9 L45.2 77.2 L46.2 77.9 L47.6 78.1 L49.5 78.9 L53.0 79.2 L53.6 79.8 L53.8 80.0 L53.6 81.4 L53.0 82.4 L52.4 84.0 L50.8 86.1 L49.2 87.5 L46.9 88.6 L45.4 88.6 L44.5 88.0 L44.2 87.5 L44.2 87.0 L45.4 85.4 L46.2 84.5 L46.5 83.5 L45.0 80.8 L43.5 78.9 L43.1 78.9 L43.1 79.2 L44.8 82.5 L44.9 83.5 L44.5 84.4 L43.5 85.6 L43.1 85.8 L42.4 85.2 L41.9 83.2 L41.1 81.4 L40.9 78.4 L40.1 76.1 L40.1 75.8ZM18.2 73.5 L18.8 74.6 L18.9 75.6 L20.0 77.6 L20.0 78.0 L19.6 78.5 L19.0 78.8 L17.0 78.9 L14.8 79.8 L12.9 79.9 L11.0 80.5 L10.2 80.1 L10.4 79.4 L17.1 73.2 L17.8 73.1ZM33.6 64.6 L33.9 64.9 L33.8 68.6 L34.0 69.8 L34.0 70.5 L33.8 71.0 L33.0 71.6 L32.2 71.9 L29.6 73.6 L26.6 75.1 L26.2 75.5 L25.1 76.0 L24.4 76.6 L23.4 77.0 L23.0 77.4 L22.5 77.6 L21.8 77.4 L21.1 76.8 L20.1 75.0 L19.9 73.6 L19.4 72.4 L19.5 71.5 L21.1 70.2 L22.1 69.9 L22.5 69.5 L23.9 68.9 L26.0 67.5 L27.5 66.9 L30.0 65.2 L31.2 64.9 L32.2 64.9 L33.2 64.5ZM58.9 43.2 L59.4 43.8 L59.8 45.0 L59.6 46.0 L59.0 47.1 L58.4 47.8 L56.8 48.8 L56.2 48.9 L55.2 49.6 L54.2 50.0 L53.2 50.8 L52.6 50.9 L51.5 51.6 L51.1 51.6 L51.0 51.1 L51.9 49.9 L52.2 48.9 L53.9 47.1 L55.6 45.9 L58.5 43.1ZM60.1 42.1 L60.1 40.6 L60.4 40.1 L60.9 39.6 L61.9 37.8 L62.8 36.9 L63.2 36.6 L65.2 37.1 L73.6 37.1 L75.4 37.0 L76.5 36.6 L77.1 36.8 L77.1 37.1 L76.8 37.5 L71.8 40.1 L69.6 41.5 L68.6 41.9 L67.9 42.5 L64.9 44.0 L64.4 44.5 L63.4 44.9 L62.8 45.4 L62.1 45.4 L61.5 44.9ZM109.1 18.6 L109.1 19.1 L108.6 19.6 L105.9 21.0 L103.4 22.6 L102.5 22.9 L101.8 23.5 L98.8 25.0 L98.0 25.6 L95.1 27.0 L94.4 27.6 L91.6 29.0 L91.1 29.5 L88.1 31.0 L87.4 31.6 L86.1 32.1 L85.8 32.5 L84.8 32.9 L84.0 33.5 L82.8 34.0 L80.1 35.6 L79.6 35.6 L79.4 35.4 L79.8 34.6 L79.8 33.9 L79.0 33.8 L77.4 34.8 L76.5 34.9 L74.1 35.8 L72.1 35.9 L65.4 35.8 L64.2 34.8 L63.8 33.0 L63.1 32.1 L62.8 30.5 L62.5 30.0 L62.1 29.9 L62.0 31.6 L62.9 33.9 L62.6 35.0 L62.4 35.2 L61.9 35.2 L61.5 35.0 L61.0 35.1 L59.9 38.4 L57.8 41.6 L53.8 45.5 L53.1 45.9 L52.2 45.8 L51.9 45.0 L50.5 43.5 L50.1 43.5 L50.1 44.0 L50.6 44.9 L51.4 47.0 L51.4 47.6 L50.6 49.2 L48.4 51.9 L44.2 55.0 L41.5 57.8 L41.0 58.0 L39.4 59.5 L36.6 61.5 L34.4 62.8 L32.5 63.2 L31.4 63.2 L29.5 62.8 L28.5 61.6 L28.4 60.5 L29.0 59.4 L29.2 58.2 L30.0 56.9 L30.1 56.2 L30.9 55.1 L31.4 53.9 L34.8 48.9 L35.2 47.5 L35.9 46.6 L36.5 45.2 L38.4 42.2 L40.0 40.4 L41.9 37.5 L43.4 34.5 L43.9 33.9 L44.2 32.9 L45.0 31.9 L46.4 29.2 L47.9 27.1 L48.2 26.1 L48.9 25.4 L51.4 20.4 L52.6 18.6 L53.8 17.5 L55.5 16.2 L56.1 16.0 L60.0 15.6 L68.2 15.8 L71.4 16.0 L83.9 16.0 L87.5 16.2 L92.4 17.0 L97.5 17.2 L101.4 17.9 L108.2 18.2ZM135.1 10.0 L135.6 11.1 L135.5 12.2 L134.8 13.5 L133.2 14.8 L132.2 15.1 L131.9 15.5 L127.2 18.0 L126.5 18.6 L125.6 18.9 L124.9 19.5 L122.1 20.9 L119.6 22.5 L118.4 23.0 L117.6 23.6 L116.6 24.0 L114.2 25.5 L111.2 27.0 L110.8 27.5 L109.4 28.1 L109.0 28.5 L107.6 29.1 L105.5 30.5 L104.5 30.9 L103.8 31.5 L102.8 31.9 L101.8 32.6 L99.1 33.9 L98.4 34.5 L97.2 35.0 L96.8 35.5 L94.0 36.9 L93.2 37.5 L92.0 38.0 L89.6 39.5 L88.4 40.0 L86.1 41.5 L83.4 42.9 L80.9 44.5 L79.6 45.0 L78.9 45.6 L77.9 46.0 L71.9 49.6 L70.9 50.0 L66.5 52.6 L65.8 52.9 L64.6 53.8 L62.2 54.9 L61.4 55.6 L60.4 56.0 L59.8 56.5 L57.8 57.4 L54.5 57.4 L53.0 57.6 L48.4 57.9 L45.5 58.8 L44.1 58.9 L42.5 59.8 L41.9 59.8 L41.6 59.5 L42.4 58.6 L45.9 56.2 L47.0 55.9 L49.5 54.2 L52.6 52.8 L53.4 52.1 L54.1 51.9 L56.5 50.4 L57.8 49.9 L60.1 48.2 L63.0 46.9 L65.4 45.4 L66.8 44.9 L67.2 44.4 L68.4 43.9 L69.1 43.2 L70.2 42.9 L71.0 42.2 L73.8 40.9 L74.2 40.4 L75.8 39.8 L78.0 38.2 L79.4 37.8 L81.6 36.2 L82.9 35.8 L83.6 35.1 L84.5 34.9 L86.8 33.4 L87.8 33.0 L88.5 32.4 L89.8 31.9 L92.1 30.4 L93.4 29.9 L94.1 29.2 L97.0 27.9 L97.8 27.2 L100.5 25.9 L101.0 25.4 L102.2 24.9 L103.0 24.2 L104.2 23.8 L106.4 22.4 L107.6 21.9 L108.4 21.2 L109.5 20.9 L110.4 20.1 L113.1 18.8 L113.5 18.4 L116.5 16.9 L117.1 16.4 L118.4 15.9 L120.6 14.4 L121.9 13.9 L124.4 12.2 L125.6 11.8 L129.6 9.4 L131.8 8.4 L132.8 8.2 L134.4 9.1Z"/>
    </g>
  </svg>`;

  function createWritingHand() {
    const el = document.createElement("div");
    el.className = "writing-hand";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = HAND_SVG;
    document.body.append(el);
    const x = new Spring(innerWidth + 200, { response: 0.14 });
    const y = new Spring(innerHeight + 200, { response: 0.14 });
    let raf = 0, job = null, leaving = false;

    const tipOffset = () => { const w = el.offsetWidth || 210, h = el.offsetHeight || w / 1.5; return [(18 / 300) * w, (152 / 200) * h]; };
    function targetAt(items, e) {
      let cur = items[0];
      for (const it of items) { if (it.start <= e) cur = it; else break; }
      if (!cur) return null;
      const p = Math.min(1, Math.max(0, (e - cur.start) / cur.dur));
      if (cur.el) {
        const r = cur.el.getBoundingClientRect();
        return { x: r.left + r.width * p, y: r.top + r.height * 0.74, writing: p > 0 && p < 1 };
      }
      const L = cur.path.getTotalLength();
      const pt = cur.path.getPointAtLength(L * p);
      const m = cur.path.getScreenCTM();
      return { x: m.a * pt.x + m.c * pt.y + m.e, y: m.b * pt.x + m.d * pt.y + m.f, writing: p > 0 && p < 1 };
    }
    let last = 0;
    function frame(now) {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (job) {
        const e = (now - job.t0) / 1000;
        const tg = targetAt(job.g._items, e);
        if (tg) {
          // a little up-and-down while the pen is moving, like a real hand writing
          const wobble = tg.writing ? Math.sin(e * 46) * 1.6 : 0;
          x.target = tg.x; y.target = tg.y + wobble;
        }
        if (e > job.g._end + 0.2) { const done = job.done; job = null; done(); }
      }
      x.step(dt); y.step(dt);
      const [ox, oy] = tipOffset();
      el.style.transform = `translate3d(${(x.value - ox).toFixed(1)}px, ${(y.value - oy).toFixed(1)}px, 0)`;
      const settled = x.settled && y.settled;
      if (job || !settled) raf = requestAnimationFrame(frame);
      else if (leaving) el.classList.remove("is-on");
    }
    const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    return {
      write(g, done) {
        leaving = false;
        const first = g._items[0];
        if (!el.classList.contains("is-on") && first) {
          // enter from the lower right, toward the first letter
          const r = (first.el || first.path).getBoundingClientRect();
          x.snap(r.left + 160); y.snap(r.bottom + 180);
        }
        el.classList.add("is-on");
        job = { g, done, t0: performance.now() };
        run();
      },
      leave() {
        leaving = true;
        x.target = x.value + 220; y.target = y.value + 260;
        run();
      },
    };
  }

  /* ---------- Behaviours ---------------------------------------------------- */
  function initNavHide() {
    const nav = $("#nav");
    let lastY = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      if (y > 160 && y > lastY + 4) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 160) nav.classList.remove("is-hidden");
      lastY = y;
    }, { passive: true });
  }

  function initReveals(root = document) {
    const els = $$("[data-reveal]:not(.is-in)", root);
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    els.forEach((el) => io.observe(el));
  }

  /* Watercolour wash between light and dark sections: the next colour blooms
     up from the bottom of the screen with a soft, uneven, pigment-rimmed edge
     until it covers the page. A fixed WebGL canvas behind the content, drawn
     at half resolution (the edge is soft anyway) and only while a wash shows. */
  function makeWash() {
    const cv = document.createElement("canvas");
    cv.className = "wash-canvas";
    cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return null;
    const FS = `precision highp float;
    uniform vec2 uRes; uniform float uP, uT, uMaxR; uniform vec3 uTo, uRim;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; } return v; }
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes.y;                     // y up, screen height = 1
      vec2 d = uv - vec2(uRes.x / uRes.y * 0.5, -0.35);       // blooms from below the bottom edge
      d.x *= 0.62;                                            // a wide, low dome
      float r = length(d);
      float lobes = fbm(vec2(atan(d.y, d.x) * 2.2, uT * 0.04)); // slow, uneven lobes along the edge
      float n = fbm(uv * 1.7 + vec2(0.0, -uT * 0.05));         // finer bleeding
      r += (lobes - 0.5) * 0.30 + (n - 0.5) * 0.22;
      float R = uP * uMaxR;
      float a = 1.0 - smoothstep(R - 0.30, R + 0.06, r);
      // pigment pools at the drying edge, like a real wash
      float rim = smoothstep(R - 0.34, R - 0.06, r) * (1.0 - smoothstep(R - 0.06, R + 0.06, r));
      float g = noise(gl_FragCoord.xy * 0.45) - 0.5;           // paper grain
      a = clamp(a + g * 0.12 * a * (1.0 - a), 0.0, 1.0);
      gl_FragColor = vec4(mix(uTo, uRim, rim * 0.75) * a, a);
    }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uP", "uT", "uMaxR", "uTo", "uRim"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    document.body.prepend(cv);

    const css = getComputedStyle(document.documentElement);
    const rgb = (name) => { const h = css.getPropertyValue(name).trim().replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
    const TONE = [rgb("--black"), rgb("--white")];
    const RIM = [[0.56, 0.32, 0.18], [0.96, 0.87, 0.78]];   // burnt sienna into the dark, warm cream into the light

    let p = 0, to = 0, loop = 0, on = false, w = 0, h = 0;
    const t0 = performance.now();
    const size = () => {
      w = Math.max(1, Math.round(cv.clientWidth * 0.5)); h = Math.max(1, Math.round(cv.clientHeight * 0.5));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    };
    const render = () => {
      const visible = p > 0.002 && p < 0.998;
      if (visible !== on) { on = visible; cv.classList.toggle("is-on", on); if (on) size(); }
      if (!on) return false;
      const asp = w / h, rmax = Math.hypot(0.31 * asp, 1.35) + 0.22;
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uP, p);
      gl.uniform1f(U.uT, (performance.now() - t0) / 1000);
      gl.uniform1f(U.uMaxR, rmax + 0.32);
      gl.uniform3fv(U.uTo, TONE[to]);
      gl.uniform3fv(U.uRim, RIM[to]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    };
    // the edge keeps breathing slowly while a wash is on screen
    const tick = () => { loop = render() ? requestAnimationFrame(tick) : 0; };
    addEventListener("resize", () => { if (on) { size(); render(); } });
    return {
      set(np, nt) {
        p = np; to = nt;
        if (render() && !loop) loop = requestAnimationFrame(tick);   // drawn now, in the same frame as --bg
      },
    };
  }

  /* Sections declare data-tone="light|dark"; the page background eases
     between them as each section crosses the middle of the viewport. */
  function initTones() {
    const sections = $$("[data-tone]").filter((s) => s !== document.body);
    if (!sections.length) return;
    const links = $$(".nav-link[data-section]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        document.body.dataset.tone = en.target.dataset.tone;
        const id = en.target.id;
        links.forEach((l) => l.toggleAttribute("data-active", !!id && l.dataset.section === id));
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));

    /* Scroll-linked fade: every light/dark boundary gets a long, eased fade
       zone (up to ~1.8 screens of scrolling), capped at half of each
       neighbouring section so every section still reaches its true colour. */
    if (reduceMotion.matches) return;
    // top-level sections only (the <body> carries data-tone too: skip it)
    const top = sections.filter((s) => s !== document.body && !s.parentElement.closest("main [data-tone]"));
    if (!top.length) return;
    const body = document.body;
    let ticking = false, last = -1;
    const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);               // smootherstep
    const wash = makeWash();                                                  // null without WebGL: plain fade
    const update = () => {
      ticking = false;
      const vh = innerHeight, mid = vh / 2;
      const rects = top.map((s) => [s.getBoundingClientRect(), s.dataset.tone === "light" ? 1 : 0]);
      // tone of the section under the middle of the screen (gaps/footer: the one above)
      let light = rects[0][1], zone = null;
      for (const [r, t] of rects) if (r.top <= mid) light = t;
      for (let i = 0; i < rects.length - 1; i++) {
        const [a, ta] = rects[i], [b, tb] = rects[i + 1];
        if (ta === tb) continue;
        const y = b.top;                                                       // the boundary
        const h = Math.min(vh * 0.9, a.height * 0.5, b.height * 0.5);          // half-width of the fade
        if (Math.abs(mid - y) < h) { zone = [ta, tb, (mid - y + h) / (2 * h)]; light = ta + (tb - ta) * smooth(zone[2]); break; }
      }
      if (wash) {
        // the page keeps the colour we came from; the next colour blooms up over it
        const [from, to, p] = zone || [light, light, 0];
        const ink = Math.round(smooth(Math.min(1, Math.max(0, (light - 0.42) / 0.16))) * 1000) / 10;
        body.classList.add("tone-wash");
        body.style.setProperty("--bg", from ? "var(--white)" : "var(--black)");
        body.style.setProperty("--fg", `color-mix(in oklab, var(--black) ${ink}%, var(--white))`);
        wash.set(p, to);
        return;
      }
      const pct = Math.round(light * 1000) / 10;
      if (pct === last) return;
      last = pct;
      // the text turns over a little quicker than the page, so it never sinks into it
      const ink = Math.round(smooth(Math.min(1, Math.max(0, (light - 0.42) / 0.16))) * 1000) / 10;
      body.classList.add("tone-blend");
      body.style.setProperty("--bg", `color-mix(in oklab, var(--white) ${pct}%, var(--black))`);
      body.style.setProperty("--fg", `color-mix(in oklab, var(--black) ${ink}%, var(--white))`);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    update();
  }

  /* Elements with data-drift slide horizontally as they scroll through view. */
  function initDrift() {
    const els = $$("[data-drift]");
    if (!els.length || reduceMotion.matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1 across the viewport
        el.style.transform = `translate3d(${(-25 + p * parseFloat(el.dataset.drift || 12)).toFixed(3)}%,0,0)`;
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* Cursor — a small dot on the pointer and a ring that trails it on a spring.
     Over links, buttons and artworks the ring widens a little.
     Mouse only; touch keeps the system behaviour. */
  function initCursor() {
    if (!finePointer.matches || reduceMotion.matches) return;
    document.documentElement.classList.add("has-cursor");
    const el = document.createElement("div");
    el.className = "cursor";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<span class="cursor-ring"></span><span class="cursor-dot"></span>`;
    document.body.append(el);
    const ring = $(".cursor-ring", el), dot = $(".cursor-dot", el);
    const x = new Spring(innerWidth / 2, { response: 0.13 }), y = new Spring(innerHeight / 2, { response: 0.13 });
    const s = new Spring(1, { response: 0.35, precision: 0.002 });
    let px = innerWidth / 2, py = innerHeight / 2, running = false, shown = false;
    const tick = (dt) => {
      x.step(dt); y.step(dt); s.step(dt);
      dot.style.transform = `translate3d(${px}px,${py}px,0)`;
      ring.style.transform = `translate3d(${x.value}px,${y.value}px,0) scale(${s.value.toFixed(3)})`;
      if (x.settled && y.settled && s.settled) { running = false; return false; }
    };
    const kick = () => { if (!running) { running = true; schedule(tick); } };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX; py = e.clientY;
      if (!shown) { shown = true; x.snap(px); y.snap(py); el.classList.add("is-on"); }
      x.target = px; y.target = py;
      kick();
    }, { passive: true });
    const INTERACTIVE = "a, button, summary, label, [role='button'], [data-cursor]";
    document.addEventListener("pointerover", (e) => {
      s.target = e.target.closest(INTERACTIVE) ? 2.1 : 1;
      kick();
    });
    document.documentElement.addEventListener("pointerleave", () => { el.classList.remove("is-on"); shown = false; });
    addEventListener("pointerdown", () => { s.target *= 0.85; kick(); });
    addEventListener("pointerup", () => { s.target /= 0.85; kick(); });
  }

  /* Smooth inertial scrolling (Lenis), driving GSAP's ScrollTrigger from the same clock.
     Off with reduced motion: the browser's own scrolling is used instead. */
  let lenis = null;
  function initSmoothScroll() {
    const { gsap, ScrollTrigger, Lenis } = window;
    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (!Lenis || reduceMotion.matches) return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    window.Site.lenis = lenis;
    if (gsap && ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    // in-page links glide instead of jumping (and still move keyboard focus there)
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href*='#']");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      const target = url.hash === "#top" ? 0 : document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -24, duration: 1.6 });
      history.pushState(null, "", url.hash);
      if (target && target.focus) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
    });
  }

  /* Film grain and a soft vignette over everything (decorative). */
  function grainTile() {
    const n = 160, c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d"), img = g.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const v = Math.random();
      const dark = v < 0.5;
      img.data.set(dark ? [65, 57, 53, (0.5 - v) * 90] : [255, 255, 255, (v - 0.5) * 110], i * 4);
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  /* ---------- Watercolour-bloom page transitions ---------------------------
     Uses cross-document View Transitions (Chrome/Edge 126+, Safari 18.2+):
     the next page appears through a watercolour stain that spreads from the
     click point, tinted with the project's colour, while the clicked artwork
     flies from its card into place. Other browsers get the curtain below. */
  const crossVT = "onpagereveal" in window;

  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  /* Draws an organic stain outline; the same seed gives the same shape twice. */
  function stainCanvas(seed, color) {
    const size = 512, c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const rand = seeded(seed);
    const ph = [rand() * 6.283, rand() * 6.283, rand() * 6.283, rand() * 6.283];
    const pts = [];
    for (let k = 0; k < 120; k++) {
      const a = (k / 120) * Math.PI * 2;
      const r = 0.3 * (1 + 0.1 * Math.sin(3 * a + ph[0]) + 0.06 * Math.sin(5 * a + ph[1]) + 0.04 * Math.sin(11 * a + ph[2]) + 0.025 * Math.sin(23 * a + ph[3]));
      pts.push([size / 2 + Math.cos(a) * r * size, size / 2 + Math.sin(a) * r * size]);
    }
    const path = new Path2D();
    pts.forEach(([x, y], k) => (k ? path.lineTo(x, y) : path.moveTo(x, y)));
    path.closePath();
    if (!color) { // mask: solid shape with a soft wet edge
      g.filter = "blur(5px)";
      g.fillStyle = "#000";
      g.fill(path);
      return c.toDataURL();
    }
    // colour: pigment pooled at the edge, lighter centre, granulation
    g.filter = "blur(3px)";
    g.globalAlpha = 0.78; g.fillStyle = color; g.fill(path);
    g.globalAlpha = 0.9; g.lineWidth = 7; g.strokeStyle = color; g.stroke(path);
    g.filter = "blur(28px)";
    g.globalCompositeOperation = "destination-out";
    g.globalAlpha = 0.45; g.beginPath(); g.arc(size / 2 + (rand() - 0.5) * 60, size / 2 + (rand() - 0.5) * 60, size * 0.16, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "source-atop"; g.filter = "none"; g.globalAlpha = 0.22; g.fillStyle = "#261E18";
    for (let k = 0; k < 2600; k++) g.fillRect(rand() * size, rand() * size, 1.2, 1.2);
    return c.toDataURL();
  }

  function inView(el) {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  }

  function initViewTransitions() {
    if (!crossVT) return;
    let point = null, clicked = null;
    addEventListener("pointerdown", (e) => { point = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
    document.addEventListener("click", (e) => { clicked = e.target.closest("a[href]"); }, true);

    addEventListener("pageswap", (e) => {
      if (!e.viewTransition) return;
      // a skipped transition (e.g. a hidden tab) is fine — don't report it as an error
      [e.viewTransition.ready, e.viewTransition.finished, e.viewTransition.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
      if (reduceMotion.matches) { e.viewTransition.skipTransition(); return; }
      const to = e.activation && e.activation.entry ? new URL(e.activation.entry.url) : null;
      const target = to ? to.searchParams.get("p") : null;
      const here = new URLSearchParams(location.search).get("p");
      let shared = null;
      if (target) {
        shared = (clicked && clicked.querySelector("[data-shared]")) || $(`[data-slug="${CSS.escape(target)}"] [data-shared]`);
      } else if (here) {
        shared = $(".p-cover-frame");
      }
      if (shared && !inView(shared)) shared = null;
      if (shared) shared.style.viewTransitionName = "artwork";
      const slug = target || here;
      const project = (window.PROJECTS || []).find((x) => x.slug === slug);
      const series = project && (window.SERIES || []).find((s) => s.id === project.series);
      const pt = point || { x: innerWidth / 2, y: innerHeight / 2 };
      try {
        sessionStorage.setItem("vt", JSON.stringify({
          x: pt.x / innerWidth, y: pt.y / innerHeight, slug, shared: !!shared,
          color: (series && series.accent) || "#c9577a", seed: (Math.random() * 1e9) | 0, at: Date.now(),
        }));
      } catch {}
      clicked = null;
    });

    addEventListener("pagereveal", (e) => {
      if (!e.viewTransition) return;
      [e.viewTransition.ready, e.viewTransition.finished, e.viewTransition.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
      if (reduceMotion.matches) { e.viewTransition.skipTransition(); return; }
      let vt = null;
      try { vt = JSON.parse(sessionStorage.getItem("vt")); } catch {}
      if (!vt || Date.now() - vt.at > 6000) vt = { x: 0.5, y: 0.5, color: "#c9577a", seed: 7 };
      const root = document.documentElement;
      root.style.setProperty("--sx", `${(vt.x * 100).toFixed(2)}vw`);
      root.style.setProperty("--sy", `${(vt.y * 100).toFixed(2)}vh`);
      root.style.setProperty("--stain", `url(${stainCanvas(vt.seed)})`);
      const wash = document.createElement("div");
      wash.className = "vt-wash";
      wash.setAttribute("aria-hidden", "true");
      wash.style.backgroundImage = `url(${stainCanvas(vt.seed, vt.color)})`;
      wash.style.setProperty("--wash", vt.color);
      document.body.append(wash);

      let shared = null;
      if (vt.shared && vt.slug) {
        const here = new URLSearchParams(location.search).get("p");
        shared = here === vt.slug ? $(".p-cover-frame") : $(`.card-item[data-slug="${CSS.escape(vt.slug)}"] [data-shared]`);
        if (shared && !inView(shared)) shared = null;
        if (shared) shared.style.viewTransitionName = "artwork";
      }
      e.viewTransition.finished.catch(() => {}).finally(() => {
        wash.remove();
        if (shared) shared.style.viewTransitionName = "";
      });
    });

    // Coming back via the back/forward cache: clear names left on the old page.
    addEventListener("pageshow", () => $$("[data-shared]").forEach((el) => (el.style.viewTransitionName = "")));
  }

  /* Fallback page transition — a curtain wipes up before navigating. */
  function initTransitions() {
    if (crossVT) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.protocol !== location.protocol || url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // in-page anchor
      if (reduceMotion.matches) return;
      e.preventDefault();
      document.documentElement.classList.add("is-leaving");
      setTimeout(() => { location.href = url.href; }, 460);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) document.documentElement.classList.remove("is-leaving"); });
  }

  function initClock() {
    const els = $$("[data-clock]");
    if (!els.length) return;
    let fmt;
    try { fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: window.SITE.timezone }); }
    catch { fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }); }
    const tick = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
    tick();
    setInterval(tick, 15000);
  }

  function mountChrome(page) {
    document.body.insertAdjacentHTML("afterbegin", navHTML(page) + '<div class="curtain" aria-hidden="true"></div>');
    document.body.insertAdjacentHTML("beforeend", footerHTML() + '<div class="vignette" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div>');
    try { $(".grain").style.backgroundImage = `url(${grainTile()})`; } catch {}
  }

  function init(page) {
    initSmoothScroll();
    initHandwriting();
    initNavHide();
    initReveals();
    initTones();
    initDrift();
    initCursor();
    initTransitions();
    initViewTransitions();
    initClock();
    bindImages();
  }

  window.Site = {
    $, $$, esc, pad, clamp, projectUrl, roll, socialsHTML,
    Spring, schedule, imgTag, bindImages, initReveals,
    reduceMotion, finePointer, mountChrome, init, lenis: null,
  };
})();
