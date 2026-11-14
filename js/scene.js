/* ==========================================================================
   SCENE — the hero's 3D world (Three.js), original to this site.
   Layers of watercolour washes and torn tissue paper float at different
   depths in a pale mist. The camera leans with the mouse, so the layers
   part like looking through paper; setProgress() moves it on scroll.
   Colours come from SITE.theme in content.js.
   ========================================================================== */
import * as THREE from "three";

const NOISE = `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; } return v; }
`;

/* The mist behind everything: paper with slow clouds of colour. */
const SKY_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
const SKY_FS = `
uniform vec2 uRes; uniform float uT; uniform vec2 uLook;
uniform vec3 uPaper, uA, uB, uC;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) + uLook * 0.04;
  float t = uT * 0.012;
  float n1 = fbm(p * 1.1 + vec2(t, -t * 0.6));
  float n2 = fbm(p * 1.6 - vec2(t * 0.7, t) + 4.3);
  float n3 = fbm(p * 0.8 + vec2(9.1 + t, 2.0));
  vec3 col = uPaper;
  col = mix(col, uA, smoothstep(0.42, 0.86, n1) * 0.42 * (1.0 - vUv.y * 0.35));   // mist blue, heavier low down
  col = mix(col, uB, smoothstep(0.5, 0.9, n2) * 0.26);                             // sage
  col = mix(col, uC, smoothstep(0.5, 0.92, n3) * 0.3 * smoothstep(0.35, 1.0, vUv.y)); // blush light up high
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.014;                                    // paper tooth
  gl_FragColor = vec4(col, 1.0);
}`;

/* A floating layer: a pigment wash (type 0) or a torn tissue sheet (type 1). */
const VEIL_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const VEIL_FS = `
uniform float uT, uSeed, uOpacity, uType; uniform vec3 uColor;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float t = uT * 0.02;
  float a; vec3 col = uColor;
  if (uType < 0.5) {
    // an uneven pool with blooms inside and pigment dried darker at its edge
    float ang = atan(uv.y, uv.x);
    float edge = 0.76 + (fbm(vec2(ang * 1.3 + uSeed, t) + uSeed) - 0.5) * 0.46 + (fbm(uv * 3.0 + uSeed + t) - 0.5) * 0.18;
    float d = length(uv);
    float body = 1.0 - smoothstep(edge - 0.44, edge, d);
    float rim = smoothstep(edge - 0.16, edge - 0.03, d) * (1.0 - smoothstep(edge - 0.03, edge + 0.01, d));
    float bloom = fbm(uv * 2.4 + uSeed * 1.7 - t);
    float streak = fbm(vec2(uv.x * 9.0 + uSeed, uv.y * 0.6 - t));          // pigment settling in faint drips
    a = body * (0.3 + 0.5 * bloom) * (0.8 + 0.35 * streak) + rim * 0.32;
    col = mix(uColor, uColor * 0.8, clamp(rim * 1.2 + (bloom - 0.5) * 0.6, 0.0, 1.0));
  } else {
    // translucent paper with a ragged torn edge and long fibres
    vec2 q = abs(uv) - vec2(0.86, 0.8);
    float tear = (fbm(uv * 3.0 + uSeed) - 0.5) * 0.34 + (fbm(uv * 11.0 + uSeed) - 0.5) * 0.12 + (noise(uv * 42.0 + uSeed) - 0.5) * 0.04;
    float box = max(q.x, q.y) + tear;
    float sheet = 1.0 - smoothstep(-0.015, 0.01, box);
    float fibre = fbm(uv * vec2(3.0, 16.0) + uSeed);
    float edgeLine = smoothstep(-0.06, -0.004, box) * sheet;
    a = sheet * (0.42 + 0.2 * fibre) + edgeLine * 0.18;
    col = mix(uColor, uColor * 0.9, edgeLine);
  }
  a = clamp(a * uOpacity + (hash(gl_FragCoord.xy + uSeed) - 0.5) * 0.03 * a, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`;

/* Layer layout: z (depth), x, y, width, height, type (0 wash, 1 tissue), colour index, opacity. */
const LAYERS = [
  { z: -9, x: -5.2, y: 1.6, w: 12, h: 8.5, t: 0, c: 4, o: 0.5 },
  { z: -8, x: 5.4, y: -1.2, w: 11, h: 9, t: 0, c: 0, o: 0.62 },
  { z: -6.2, x: 0.6, y: 3.4, w: 9, h: 5, t: 0, c: 2, o: 0.55 },
  { z: -5, x: -3.6, y: -2.6, w: 7, h: 6, t: 0, c: 1, o: 0.6 },
  { z: -3.6, x: 3.1, y: 0.9, w: 5.6, h: 7, t: 1, c: -1, o: 0.75 },
  { z: -2.6, x: -2.1, y: 0.7, w: 4.6, h: 6.2, t: 1, c: -1, o: 0.65 },
  { z: -1.6, x: 4.4, y: -2.3, w: 4.4, h: 3.8, t: 0, c: 3, o: 0.5 },
  { z: 0.4, x: -4.8, y: -1.8, w: 3.8, h: 4.8, t: 1, c: -1, o: 0.3 },
];
const LITE_LAYERS = [0, 1, 2, 4, 6];

export function createScene(canvas, { theme, lite = false, still = false, observe = canvas } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: lite ? "low-power" : "high-performance" });
  const maxPR = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  let pr = maxPR;
  renderer.setPixelRatio(pr);
  const col = (h) => new THREE.Color(h);
  const paper = col(theme.paper), washes = theme.washes.map(col), dots = theme.dots.map(col);
  renderer.setClearColor(paper);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 10);
  const uT = { value: 0 };

  /* the mist */
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: SKY_VS, fragmentShader: SKY_FS, depthTest: false, depthWrite: false,
    uniforms: { uT, uRes: { value: new THREE.Vector2(1, 1) }, uLook: { value: new THREE.Vector2() },
      uPaper: { value: paper }, uA: { value: washes[0] }, uB: { value: washes[1] }, uC: { value: washes[2] } },
  }));
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);

  /* the floating layers */
  const tissue = paper.clone().lerp(new THREE.Color("#ffffff"), 0.6);
  const veils = (lite ? LITE_LAYERS.map((i) => LAYERS[i]) : LAYERS).map((L, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      vertexShader: VEIL_VS, fragmentShader: VEIL_FS, transparent: true, depthWrite: false,
      uniforms: { uT, uSeed: { value: i * 7.31 + 1.7 }, uOpacity: { value: L.o }, uType: { value: L.t },
        uColor: { value: L.c < 0 ? tissue : washes[L.c % washes.length] } },
    }));
    m.position.set(L.x, L.y, L.z);
    m.scale.set(L.w, L.h, 1);
    m.rotation.z = (i % 2 ? 1 : -1) * (L.t ? 0.07 + 0.03 * (i % 3) : 0.04 * (i % 3));
    m.userData = { base: m.position.clone(), phase: i * 1.7 };
    m.renderOrder = i;                 // far to near
    scene.add(m);
    return m;
  });

  /* camera: leans with the mouse, travels with scroll */
  const look = new THREE.Vector2(), lookTo = new THREE.Vector2();
  let progress = 0, progressTo = 0;
  const onMove = (e) => lookTo.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
  if (!still) addEventListener("pointermove", onMove, { passive: true });

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 48 : 35;    // portrait screens see a little more
    camera.updateProjectionMatrix();
    sky.material.uniforms.uRes.value.set(w, h);
  }

  function place(dt) {
    const k = still ? 1 : 1 - Math.exp(-dt * 2.2);
    look.lerp(lookTo, k);
    progress += (progressTo - progress) * (still ? 1 : 1 - Math.exp(-dt * 4));
    // scroll: drift forward through the layers and swing round slowly
    const swing = progress * 0.5;
    camera.position.set(look.x * 0.7 + Math.sin(swing) * 3.2, look.y * 0.45 - progress * 0.6, 10 - progress * 5.5);
    camera.lookAt(Math.sin(swing) * 1.2, -progress * 0.3, -3);
    sky.material.uniforms.uLook.value.copy(look);
    veils.forEach((m) => {
      const { base, phase } = m.userData;
      m.position.y = base.y + Math.sin(uT.value * 0.12 + phase) * 0.18;
      m.position.x = base.x + Math.cos(uT.value * 0.09 + phase) * 0.12;
    });
  }

  let raf = 0, last = 0, visible = true, slow = 0, frames = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    uT.value += dt;
    place(dt);
    renderer.render(scene, camera);
    // keep 60fps: if frames run long, render at a lower pixel ratio
    frames++; slow += dt > 0.021 ? 1 : 0;
    if (frames === 90) {
      if (slow > 45 && pr > 1) { pr = Math.max(1, pr - 0.5); renderer.setPixelRatio(pr); resize(); }
      frames = slow = 0;
    }
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const draw = () => { place(1); renderer.render(scene, camera); };

  resize();
  addEventListener("resize", () => { resize(); if (still) draw(); });
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    canvas.style.visibility = visible ? "" : "hidden";       // off-screen: nothing to draw or composite
    if (visible && !still) wake();
  });
  io.observe(observe);
  document.addEventListener("visibilitychange", () => { if (!still) wake(); });

  uT.value = 12;          // start mid-drift, not on a perfectly still first frame
  draw();
  if (!still) wake();

  return {
    setProgress(p) { progressTo = Math.min(1, Math.max(0, p)); if (still) { progress = progressTo; draw(); } },
    dispose() { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onMove); renderer.dispose(); },
  };
}
