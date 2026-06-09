# Animatrix Studio — Agent Briefing

> **What you are building:** A browser-based animation and scientific-visualization authoring tool inspired by 3Blue1Brown's *manim* library but delivered as a **no-code, visual, timeline-driven web app**. Users design scenes with primitive and CS/science shapes, build charts, draw custom brushwork, animate everything frame-by-frame, then export a high-quality video file.

---

## Quick-start for the coding agent

Read every spec file in this order before writing a single line of code:

| # | File | Purpose |
|---|------|---------|
| 1 | `ARCHITECTURE.md` | Tech stack, folder structure, design principles |
| 2 | `SHAPES_SPEC.md` | All built-in shape types and their data models |
| 3 | `CHARTS_SPEC.md` | Graphing / charting engine spec |
| 4 | `BRUSH_SPEC.md` | Freehand brush tool and custom-style system |
| 5 | `ANIMATION_SPEC.md` | Animation system, timeline, built-in presets |
| 6 | `FX_SPEC.md` | Visual effects, color, background, glow system |
| 7 | `EXPORT_SPEC.md` | Video export pipeline, aspect ratios, platform presets |
| 8 | `UI_SPEC.md` | Full UI layout, panels, and interaction model |
| 9 | `PROMPT.md` | **The exact prompt to paste into your coding agent** |

---

## Golden rules the agent must never break

1. **OOP + SOLID throughout.** Every entity (shape, chart, animation, effect) is a class. Shared behaviour lives in abstract base classes. No god-objects.
2. **Design patterns explicitly used:** Factory (shape/chart creation), Observer (timeline ↔ viewport), Command (undo/redo), Strategy (animation presets), Composite (groups/layers), Decorator (FX pipeline).
3. **All code commented** — every public method has a JSDoc block; every non-obvious logic block has an inline comment.
4. **No magic numbers.** Constants live in `src/constants/`.
5. **Modularity over convenience.** If two features share logic, extract it — do not copy-paste.
