/* ==========================================================================
   Living paint hero — move the mouse (or swipe) over the hero to paint.
   A small WebGL watercolour simulation: pigment is stored as absorbance and
   drawn as the light it lets through, and the canvas multiplies onto the 3D
   scene below (mix-blend-mode in styles.css), so strokes layer over the mist
   like real washes. Water spreads pigment while wet, then evaporates; edges
   darken where pigment pools. The colour drifts through the palette as you
   paint and jumps to the next one after a pause. Colours: SITE.theme.washes.
   ========================================================================== */
(function () {
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".paint-canvas");
  if (!canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) { hero.classList.add("no-paint"); return; }
  hero.classList.add("has-paint");

  // the theme's washes, a little deeper so a stroke reads over the mist; stored as absorbance (1 - colour)
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const PALETTE = ((window.SITE && window.SITE.theme && window.SITE.theme.washes) || ["#AFC3D6", "#BCC9B4", "#EBCFCB", "#CEC8DE", "#8FA6B5"])
    .map((h) => hex(h).map((v) => Math.min(1, (1 - v) * 1.6)));
  const N = PALETTE.length;
  // a colour part-way between two neighbours in the palette (t = 2.5 → halfway from the 3rd to the 4th)
  const colorAt = (t) => { const i = Math.floor(t), f = t - i, a = PALETTE[((i % N) + N) % N], b = PALETTE[(((i + 1) % N) + N) % N]; return a.map((v, k) => v + (b[k] - v) * f); };

  /* ---------- Shaders ------------------------------------------------------- */
  const VS = `#version 300 es
  in vec2 aPos; out vec2 vUv;
  void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const HEAD = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; out vec4 outColor;
  const float VS = 0.6;
  vec2 dec(vec4 t){ return (t.xy * 2.0 - 1.0) * VS; }
  vec4 enc(vec2 v){ return vec4(clamp(v / VS, -1.0, 1.0) * 0.5 + 0.5, 0.0, 1.0); }
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  `;
  const VEL_STEP = `
  uniform sampler2D uVel; uniform float uDt; uniform float uTime;
  void main(){
    vec2 v = dec(texture(uVel, vUv));
    vec2 a = dec(texture(uVel, vUv - v * uDt));
    float t = uTime * 0.12;
    vec2 drift = vec2(sin(vUv.y * 5.0 + t * 3.0) + 0.5 * sin(vUv.y * 13.0 - t * 2.0),
                      cos(vUv.x * 4.0 - t * 2.5) + 0.5 * cos(vUv.x * 11.0 + t * 1.7)) * 0.012;
    float k = pow(0.3, uDt);
    outColor = enc(a * k + drift * (1.0 - k));
  }`;
  const VEL_SPLAT = `
  uniform sampler2D uVel; uniform vec2 uPoint; uniform vec2 uForce; uniform float uRadius; uniform float uAspect;
  void main(){
    vec2 v = dec(texture(uVel, vUv));
    vec2 d = vUv - uPoint; d.x *= uAspect;
    v += uForce * exp(-dot(d, d) / uRadius);
    outColor = enc(v);
  }`;
  const DYE_STEP = `
  uniform sampler2D uDye; uniform sampler2D uVel; uniform vec2 uTexel; uniform float uDt;
  void main(){
    vec2 v = dec(texture(uVel, vUv));
    vec2 p = vUv - v * uDt;
    vec4 c = texture(uDye, p);
    vec4 n = (texture(uDye, p + vec2(uTexel.x, 0.0)) + texture(uDye, p - vec2(uTexel.x, 0.0)) +
              texture(uDye, p + vec2(0.0, uTexel.y)) + texture(uDye, p - vec2(0.0, uTexel.y))) * 0.25;
    float f = clamp(uDt * 30.0, 0.0, 2.0);
    float wet = max(c.a, n.a);
    c.rgb = mix(c.rgb, n.rgb, clamp((0.008 + 0.2 * wet) * f, 0.0, 0.9));    // pigment moves while wet
    c.a = mix(c.a, n.a, clamp(0.35 * f, 0.0, 0.9));                           // water spreads
    c.a *= pow(0.5, uDt);                                                     // evaporation
    c.rgb *= pow(0.992, uDt);                                                 // the page slowly breathes clean
    outColor = clamp(c, 0.0, 1.0);
  }`;
  const DYE_SPLAT = `
  uniform sampler2D uDye; uniform vec2 uPoint; uniform vec3 uColor; uniform float uAmount; uniform float uWater; uniform float uRadius; uniform float uAspect;
  void main(){
    vec4 c = texture(uDye, vUv);
    vec2 d = vUv - uPoint; d.x *= uAspect;
    // a flat pool with an irregular, defined edge (not an airbrush gaussian)
    float ang = atan(d.y, d.x);
    float R = sqrt(uRadius) * 1.5 * (0.86 + 0.08 * sin(ang * 3.0 + uPoint.x * 40.0) + 0.06 * sin(ang * 7.0 + uPoint.y * 31.0));
    float s = 1.0 - smoothstep(0.62, 1.0, length(d) / R);
    s *= 0.78 + 0.44 * hash(floor(vUv * vec2(220.0, 140.0)));                 // dry-brush texture
    c.rgb += uColor * s * uAmount * (1.0 - c.rgb * 0.6);
    c.a = max(c.a, s * uWater);
    outColor = clamp(c, 0.0, 1.0);
  }`;
  const DISPLAY = `
  uniform sampler2D uDye; uniform vec2 uTexel;
  void main(){
    vec3 A = texture(uDye, vUv).rgb;
    vec3 ax = texture(uDye, vUv + vec2(uTexel.x, 0.0)).rgb - texture(uDye, vUv - vec2(uTexel.x, 0.0)).rgb;
    vec3 ay = texture(uDye, vUv + vec2(0.0, uTexel.y)).rgb - texture(uDye, vUv - vec2(0.0, uTexel.y)).rgb;
    float edge = clamp((length(ax) + length(ay)) * 3.2, 0.0, 1.0);           // pigment pools at edges
    float grain = hash(floor(gl_FragCoord.xy));
    float fiber = hash(floor(gl_FragCoord.xy * 0.33));
    A *= 1.0 + edge * 1.5 + (grain - 0.5) * 0.4 + (fiber - 0.5) * 0.25;      // granulation
    float peak = max(max(A.r, A.g), A.b);                                     // layers never build up dark:
    A *= min(1.0, 0.2 / max(peak, 1e-4));                                     // cap the density, keep the hue
    outColor = vec4(exp(-A * 2.5), 1.0);                                      // white = untouched, multiplied over the scene
  }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const vso = shader(gl.VERTEX_SHADER, VS);
  function program(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, vso);
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, HEAD + fs));
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    for (let k = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); k < n; k++) {
      const info = gl.getActiveUniform(p, k);
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p, u };
  }

  let progs;
  try {
    progs = { velStep: program(VEL_STEP), velSplat: program(VEL_SPLAT), dyeStep: program(DYE_STEP), dyeSplat: program(DYE_SPLAT), display: program(DISPLAY) };
  } catch (err) {
    console.warn("Paint hero disabled:", err);
    hero.classList.replace("has-paint", "no-paint");
    return;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  /* ---------- Render targets (half-float when available) ------------------ */
  let fmt = { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE };
  if (gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float")) fmt = { internal: gl.RGBA16F, type: gl.HALF_FLOAT };

  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, gl.RGBA, fmt.type, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb, ok: gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE };
  }
  function pair(w, h, clear) {
    const a = target(w, h), b = target(w, h);
    [a, b].forEach((t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); gl.clearColor(...clear); gl.clear(gl.COLOR_BUFFER_BIT); });
    return { read: a, write: b, ok: a.ok && b.ok, swap() { [this.read, this.write] = [this.write, this.read]; } };
  }

  let simW = 0, simH = 0, aspect = 1, vel, dye;
  function allocate() {
    vel = pair(simW, simH, [0.5, 0.5, 0, 1]);   // 0.5 encodes zero velocity
    dye = pair(simW, simH, [0, 0, 0, 0]);
    if (!vel.ok && fmt.type !== gl.UNSIGNED_BYTE) { fmt = { internal: gl.RGBA8, type: gl.UNSIGNED_BYTE }; allocate(); }
  }

  function resize() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    aspect = r.width / Math.max(1, r.height);
    const sw = Math.round(Math.min(360, Math.max(160, r.width / 3.2)));
    const sh = Math.max(64, Math.round(sw / aspect));
    // Re-allocate (clears the paint) only on a real size change, not the mobile URL bar.
    if (!vel || Math.abs(sw - simW) / simW > 0.15 || Math.abs(sh - simH) / simH > 0.25) {
      simW = sw; simH = sh; allocate();
    }
  }

  function pass(prog, out, uniforms) {
    gl.useProgram(prog.p);
    let unit = 0;
    for (const name in uniforms) {
      const loc = prog.u[name];
      if (loc == null) continue;
      const v = uniforms[name];
      if (v && v.tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(loc, unit++); }
      else if (typeof v === "number") gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else gl.uniform3f(loc, v[0], v[1], v[2]);
    }
    if (out) { gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb); gl.viewport(0, 0, simW, simH); }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function splat(x, y, fx, fy, color, amount, water, radius) {
    pass(progs.velSplat, vel.write, { uVel: vel.read, uPoint: [x, y], uForce: [fx, fy], uRadius: radius, uAspect: aspect });
    vel.swap();
    pass(progs.dyeSplat, dye.write, { uDye: dye.read, uPoint: [x, y], uColor: color, uAmount: amount, uWater: water, uRadius: radius, uAspect: aspect });
    dye.swap();
  }
  let time = 0;
  function step(dt) {
    pass(progs.velStep, vel.write, { uVel: vel.read, uDt: dt, uTime: time });
    vel.swap();
    pass(progs.dyeStep, dye.write, { uDye: dye.read, uVel: vel.read, uTexel: [1 / simW, 1 / simH], uDt: dt });
    dye.swap();
  }
  function render() {
    pass(progs.display, null, { uDye: dye.read, uTexel: [1 / simW, 1 / simH] });
  }

  /* ---------- Input: the brush ---------------------------------------------- */
  let hue = Math.floor(Math.random() * N);          // position in the palette; grows as the brush travels
  let pointer = null, lastInput = -1e9;
  const queue = [];
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) { pointer = null; return; }
    const now = performance.now();
    if (!pointer || now - pointer.t > 250) {
      if (now - lastInput > 600) hue = Math.floor(hue) + 1;                      // a pause starts a new colour
      pointer = { x, y, t: now };
    } else {
      queue.push({ x0: pointer.x, y0: pointer.y, x1: x, y1: y, dt: Math.max((now - pointer.t) / 1000, 1 / 240) });
      pointer = { x, y, t: now };
    }
    lastInput = now;
    wake();
  }
  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerdown", (e) => {
    onMove(e);
    if (!pointer) return;
    hue = Math.floor(hue) + 1;
    splat(pointer.x, pointer.y, 0, 0, colorAt(hue), 0.55, 1, 0.006);        // a tap drops a bloom
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { pointer = null; });

  function drainQueue() {
    let budget = 16;
    while (queue.length && budget > 0) {
      const s = queue.shift();
      const dx = (s.x1 - s.x0) * aspect, dy = s.y1 - s.y0;
      const dist = Math.hypot(dx, dy);
      const speed = dist / s.dt;
      const steps = Math.min(8, Math.max(1, Math.ceil(dist / 0.01)));
      const fx = Math.max(-1.4, Math.min(1.4, (s.x1 - s.x0) / s.dt)) * 0.35;
      const fy = Math.max(-1.4, Math.min(1.4, (s.y1 - s.y0) / s.dt)) * 0.35;
      const amount = (0.11 * Math.max(0.35, Math.min(1, 1.3 - speed * 0.35))) / Math.sqrt(steps);
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        hue += (dist / steps) * 1.4;                                               // about one colour per two-thirds of the screen
        splat(s.x0 + (s.x1 - s.x0) * t, s.y0 + (s.y1 - s.y0) * t, fx / steps, fy / steps, colorAt(hue), amount, 0.85, 0.0026);
        budget--;
      }
    }
    if (queue.length > 48) queue.splice(0, queue.length - 48); // never lag far behind the hand
  }

  /* ---------- Opening blooms + idle brush ----------------------------------- */
  const intro = [
    { at: 0.15, x: 0.18, y: 0.7, c: 0, r: 0.016 },
    { at: 0.45, x: 0.78, y: 0.78, c: 1, r: 0.012 },
    { at: 0.8, x: 0.62, y: 0.42, c: 2, r: 0.014 },
    { at: 1.15, x: 0.35, y: 0.3, c: 4, r: 0.01 },
    { at: 1.5, x: 0.9, y: 0.35, c: 5, r: 0.011 },
    { at: 1.9, x: 0.08, y: 0.25, c: 3, r: 0.009 },
  ];
  function runIntro() {
    while (intro.length && intro[0].at <= time) {
      const b = intro.shift();
      const jitter = () => (Math.random() - 0.5) * 0.08;
      splat(b.x + jitter(), b.y + jitter(), 0, 0, PALETTE[b.c % N], 0.42, 1, b.r);
      splat(b.x + jitter(), b.y + jitter(), 0, 0, PALETTE[b.c % N], 0.22, 1, b.r * 0.45);
    }
  }
  function idleBrush(now) {
    if (reduce || now - lastInput < 3500 || intro.length) return;
    const t = time * 0.35;
    const x = 0.5 + 0.42 * Math.sin(t * 0.61), y = 0.5 + 0.34 * Math.sin(t * 0.83 + 1.3);
    const vx = 0.42 * 0.61 * 0.35 * Math.cos(t * 0.61), vy = 0.34 * 0.83 * 0.35 * Math.cos(t * 0.83 + 1.3);
    splat(x, y, vx * 0.5, vy * 0.5, colorAt(time / 6), 0.022, 0.6, 0.0035);   // the idle brush drifts through the colours too
  }

  /* ---------- Loop ---------------------------------------------------------- */
  let raf = 0, last = 0, visible = true;
  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    time += dt;
    runIntro();
    drainQueue();
    idleBrush(now);
    step(dt);
    render();
    const keepGoing = !reduce || intro.length || now - lastInput < 4000;
    if (keepGoing && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  resize();
  if (reduce) {
    // Still image: let the opening blooms settle off-screen, then draw once.
    intro.forEach((b) => (b.at = 0));
    runIntro();
    for (let k = 0; k < 120; k++) step(1 / 30);
    render();
  } else {
    wake();
  }

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); render(); wake(); }, 150); });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); hero.classList.replace("has-paint", "no-paint"); });
})();
