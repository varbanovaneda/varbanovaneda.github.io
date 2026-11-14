# Graph Report - varbanovaneda.github.io  (2026-11-14)

## Corpus Check
- 8 files · ~16,665 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 85 nodes · 135 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6680502`
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
- initHandwriting

## God Nodes (most connected - your core abstractions)
1. `createPaint()` - 18 edges
2. `init()` - 12 edges
3. `frame()` - 8 edges
4. `Spring` - 7 edges
5. `initCursor()` - 6 edges
6. `splat()` - 6 edges
7. `createWritingHand()` - 5 edges
8. `allocate()` - 5 edges
9. `Portfolio template` - 5 edges
10. `roll()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Effects` --references--> `makeWash()`  [INFERRED]
  README.md → js/core.js

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 0 - "createPaint"
Cohesion: 0.22
Nodes (18): createPaint(), allocate(), drainQueue(), frame(), idleBrush(), onMove(), pair(), pass() (+10 more)

### Community 1 - "core.js"
Cohesion: 0.30
Nodes (10): bindImages(), init(), initClock(), initDrift(), initNavHide(), initReveals(), initSmoothScroll(), initTones() (+2 more)

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
Cohesion: 0.50
Nodes (4): initViewTransitions(), inView(), seeded(), stainCanvas()

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `makeWash()` connect `core.js` to `Portfolio template`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `initCursor()` (e.g. with `.snap()` and `.step()`) actually correct?**
  _`initCursor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Why does `Effects` connect `Portfolio template` to `core.js`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._