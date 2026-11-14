# Graph Report - varbanovaneda.github.io  (2026-11-14)

## Corpus Check
- 8 files · ~17,201 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 87 nodes · 142 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `baf9dee1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createPaint
- core.js
- home.js
- Spring
- scene.js
- mountChrome
- Portfolio template
- initViewTransitions
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `createPaint()` - 18 edges
2. `init()` - 12 edges
3. `frame()` - 8 edges
4. `Spring` - 7 edges
5. `initCursor()` - 6 edges
6. `initViewTransitions()` - 6 edges
7. `splat()` - 6 edges
8. `createWritingHand()` - 5 edges
9. `allocate()` - 5 edges
10. `Portfolio template` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Effects` --references--> `makeWash()`  [INFERRED]
  README.md → js/core.js

## Import Cycles
- None detected.

## Communities (11 total, 3 thin omitted)

### Community 0 - "createPaint"
Cohesion: 0.22
Nodes (18): createPaint(), allocate(), drainQueue(), frame(), idleBrush(), onMove(), pair(), pass() (+10 more)

### Community 1 - "core.js"
Cohesion: 0.28
Nodes (11): bindImages(), init(), initClock(), initDrift(), initHandwriting(), initNavHide(), initReveals(), initSmoothScroll() (+3 more)

### Community 2 - "home.js"
Cohesion: 0.24
Nodes (7): cardHTML(), indexHTML(), initPreview(), placePill(), seriesHTML(), setView(), workHTML()

### Community 3 - "Spring"
Cohesion: 0.24
Nodes (7): createWritingHand(), frame(), targetAt(), frame(), initCursor(), schedule(), Spring

### Community 4 - "scene.js"
Cohesion: 0.32
Nodes (6): createScene(), frame(), place(), resize(), LAYERS, LITE_LAYERS

### Community 5 - "mountChrome"
Cohesion: 0.40
Nodes (6): footerHTML(), grainTile(), mountChrome(), navHTML(), roll(), socialsHTML()

### Community 6 - "Portfolio template"
Cohesion: 0.33
Nodes (5): Accessibility, Effects, Make it yours, Portfolio template, Run locally

### Community 7 - "initViewTransitions"
Cohesion: 0.38
Nodes (7): initTransitions(), initViewTransitions(), inView(), paletteOf(), seeded(), stainCanvas(), washLayers()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `makeWash()` connect `core.js` to `Portfolio template`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `initCursor()` (e.g. with `.snap()` and `.step()`) actually correct?**
  _`initCursor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Why does `Effects` connect `Portfolio template` to `core.js`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._