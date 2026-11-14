/* Work detail page — one template for every work: project.html?p=<slug> */
(function () {
  const { $, esc, pad, projectUrl, roll, imgTag } = window.Site;
  const S = window.SITE;
  const P = window.PROJECTS;
  const SERIES = window.SERIES || [];
  const main = $("#main");
  window.Site.mountChrome("project");

  const slug = new URLSearchParams(location.search).get("p");
  const i = P.findIndex((p) => p.slug === slug);

  if (i < 0) {
    document.title = `Not found — ${S.name}`;
    main.innerHTML = `
      <section class="not-found" data-tone="light">
        <p class="label muted">Error 404</p>
        <h1 class="display"><span class="line"><span class="line-in">Nothing here</span></span></h1>
        <a class="back-link label" href="index.html#work">← ${roll("Back to selected works")}</a>
      </section>`;
    window.Site.init("project");
    return;
  }

  const p = P[i];
  const next = P[(i + 1) % P.length];
  const prev = P[(i - 1 + P.length) % P.length];
  const series = SERIES.find((s) => s.id === p.series);
  const sIndex = SERIES.indexOf(series);
  const siblings = P.filter((x) => x.series === p.series);
  const langAttr = (x) => (x.lang ? ` lang="${esc(x.lang)}"` : "");

  document.title = `${p.title} — ${S.name}`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", p.summary || (series && series.text && series.text[0]) || S.description);

  const meta = [
    ...(series ? [["Project", series.title]] : []),
    ...((series && series.meta) || []),
    ...(p.meta || []),
    ...(p.year ? [["Year", p.year]] : []),
  ];
  const cw = p.cover && p.cover.width ? p.cover.width : 4;
  const ch = p.cover && p.cover.height ? p.cover.height : 3;
  const aspect = (im) => (im && typeof im === "object" && im.width ? `${im.width} / ${im.height}` : "16 / 9");

  /* The work's own text first; the series text follows (or stands alone). */
  const own = p.description || [];
  const seriesText = (series && series.text) || [];
  const overview = `
    <section class="p-overview" aria-labelledby="overview-title">
      <h2 class="label" id="overview-title">${own.length ? "About this work" : "About the project"}</h2>
      <div class="p-overview-body">
        ${p.summary ? `<p class="p-summary" data-reveal>${esc(p.summary)}</p>` : ""}
        <div class="p-desc" data-reveal style="--d:.1s">${(own.length ? own : seriesText).map((d) => `<p>${esc(d)}</p>`).join("")}</div>
      </div>
    </section>
    ${own.length && seriesText.length ? `
    <section class="p-overview p-series" aria-labelledby="series-title">
      <h2 class="label" id="series-title">The project</h2>
      <div class="p-overview-body"><div class="p-desc" data-reveal>${seriesText.map((d) => `<p>${esc(d)}</p>`).join("")}</div></div>
    </section>` : ""}`;

  const gallery = (p.gallery || []).map((g, n) => `
    <figure class="shot" data-size="${esc(g.size || "full")}" data-reveal>
      <div class="shot-media" style="aspect-ratio:${aspect(g.image)}">${imgTag(g.image, { sizes: "100vw", alt: g.alt || `${p.title} — image ${n + 2}` })}</div>
      ${g.caption ? `<figcaption class="label">${esc(g.caption)}</figcaption>` : ""}
    </figure>`).join("");

  /* A sideways-scrolling strip of extra views (p.scroll in content.js). */
  const S2 = p.scroll && p.scroll.items && p.scroll.items.length ? p.scroll : null;
  const strip = S2 ? `
    <section class="p-scroll" aria-label="${esc(S2.label || "More views")}">
      <div class="p-scroll-head label"><span>${esc(S2.label || "More views")}</span><span class="muted" aria-hidden="true">Scroll sideways →</span></div>
      <div class="p-scroll-track" tabindex="0" data-lenis-prevent>
        ${S2.items.map((g, n) => `
          <figure class="p-scroll-item">
            <div class="p-scroll-media">${imgTag(g.image, { sizes: "(max-width: 640px) 90vw, 60vw", alt: (g.image && g.image.alt) || `${p.title} — view ${n + 1}` })}</div>
            ${g.caption ? `<figcaption class="label">${esc(g.caption)}</figcaption>` : ""}
          </figure>`).join("")}
      </div>
    </section>` : "";

  const more = siblings.length > 1 ? `
    <section class="p-siblings" aria-labelledby="siblings-title">
      <h2 class="label" id="siblings-title">More from ${esc(series.title)}</h2>
      <ol class="p-siblings-list">${siblings.map((x) => `
        <li data-slug="${esc(x.slug)}"${x === p ? ' aria-current="true"' : ""}>
          <a href="${projectUrl(x)}" aria-label="${esc(x.title)}"${x === p ? ' tabindex="-1"' : ""}>
            <span class="p-sib-media" data-shared style="aspect-ratio:${aspect(x.cover)}">${imgTag(x.cover, { sizes: "200px", alt: "" })}</span>
          </a>
        </li>`).join("")}</ol>
    </section>` : "";

  main.innerHTML = `
    <article class="project">
      <header class="p-head" data-tone="light">
        <div class="p-topline label">
          <a class="back-link" href="index.html#${series ? `series-${esc(series.id)}` : "work"}"><span aria-hidden="true">←</span>${roll(series ? `${pad(sIndex + 1)} ${series.title}` : "Selected works")}</a>
          <span class="muted">${pad(i + 1)} / ${pad(P.length)}</span>
        </div>
        <h1 class="display p-title"${langAttr(p)}><span class="line"><span class="line-in">${esc(p.title)}</span></span></h1>
        <dl class="p-meta fade-up" style="--d:.65s">
          ${meta.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
      </header>

      <figure class="p-cover"><div class="p-cover-frame" data-shared style="--ratio:${cw} / ${ch};--r:${(cw / ch).toFixed(4)}">${imgTag(p.cover, { sizes: "100vw", alt: p.title, eager: true })}</div></figure>

      ${strip}

      ${overview}

      ${gallery ? `<section class="p-gallery" aria-label="More images">${gallery}</section>` : ""}

      ${more}

      <a class="p-next" href="${projectUrl(next)}" data-slug="${esc(next.slug)}" data-cursor="Next work" rel="next">
        <div class="p-next-top label"><span>Next work</span><span class="muted">${pad(((i + 1) % P.length) + 1)} / ${pad(P.length)}</span></div>
        <span class="display p-next-title" data-reveal${langAttr(next)}>${esc(next.title)}</span>
        <div class="p-next-media" data-shared data-reveal style="--d:.1s">${imgTag(next.cover, { sizes: "100vw", alt: "" })}</div>
      </a>
    </article>`;

  /* Open on the artwork itself: frame it in the viewport (the title stays just above).
     With the bloom transition this happens before the first paint, so the flying
     artwork lands exactly where it ends up; otherwise it scrolls down smoothly. */
  function frameArtwork(behavior) {
    const f = $(".p-cover-frame");
    if (!f) return;
    const r = f.getBoundingClientRect();
    const navRoom = 64;
    const top = r.top + scrollY - Math.max(navRoom, (innerHeight - r.height) / 2);
    window.scrollTo({ top: Math.max(0, top), behavior });
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  let userScrolled = false;
  ["wheel", "touchstart", "keydown"].forEach((ev) => addEventListener(ev, () => (userScrolled = true), { once: true, passive: true }));
  const reduce = window.Site.reduceMotion.matches;
  const instant = reduce || document.documentElement.classList.contains("vt");
  if (instant) frameArtwork("instant");
  else setTimeout(() => { if (!userScrolled) frameArtwork("smooth"); }, 450);
  // Web fonts can change the title's height; re-frame if the visitor hasn't moved yet.
  document.fonts?.ready.then(() => { if (instant && !userScrolled) frameArtwork("instant"); });

  const track = $(".p-scroll-track");
  if (track) {
    // one notch of the wheel glides to the next (or previous) artwork; at either end the page scrolls on
    let busy = 0;
    track.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;                    // a trackpad already scrolls sideways
      const max = track.scrollWidth - track.clientWidth;
      const dir = Math.sign(e.deltaY);
      if (!dir || (dir > 0 && track.scrollLeft >= max - 2) || (dir < 0 && track.scrollLeft <= 2)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < busy) return;
      busy = now + 650;
      const step = (track.querySelector(".p-scroll-item") || track).getBoundingClientRect().width;
      track.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
    }, { passive: false });
  }

  /* ← / → to move between works. */
  addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const to = e.key === "ArrowRight" ? next : e.key === "ArrowLeft" ? prev : null;
    if (!to) return;
    const a = Object.assign(document.createElement("a"), { href: projectUrl(to) });
    document.body.append(a); a.click(); a.remove();
  });

  window.Site.init("project");
})();
