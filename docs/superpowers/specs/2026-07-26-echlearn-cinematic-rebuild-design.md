# Echlearn Cinematic Rebuild Design

**Status:** Approved art direction. Implementation starts only after review of this written specification.

## Intent

Replace the current safe, flat Atelier landing with an original high-craft Echlearn experience that feels like a motion title sequence: warm, cinematic, dimensional, and immediately memorable. The supplied reference video informs the emotional bar—layered depth, confident pacing, fluid transitions, and a strong visual focal point—but no source code, copy, media, layout, or trade dress is copied from it.

The goal is not decorative complexity. The goal is a landing page that makes the next learning action feel magnetic while remaining fast, accessible, and truthful about product capabilities.

## Visual direction: Echlearn Motion Atelier

### Core image

Ech Buri, using only the project-owned existing mascot material, is the central guide. It is staged as a large, editorial object rather than a small dashboard icon. The first viewport is an immersive study universe: a dark forest studio, warm rim light, floating learning artefacts, restrained grain, and a deliberate field of emerald illumination around the guide.

The composition has three depth planes:

1. **Atmosphere:** ink-to-forest backdrop, soft radial light field, film grain, and sparse dust/stars rendered in CSS.
2. **Guide:** the existing mascot treatment, large and visually anchored, with a finite entrance and subtle idle breathing only when motion is allowed.
3. **Evidence:** spatial study artefacts—lesson strip, audio waveform, streak/review indicator, and a single focused action—shown as a believable study environment rather than a generic card grid.

No new Pepe image, name, facial construction, or third-party character art is created. If a new raster visual is generated, it is an original non-character cinematic background or study-object composition and is stored as a project asset.

### Palette and material

The token system remains three-layered: primitives → semantic roles → component roles. The new visual layer uses:

- **Ink forest:** near-black green canvas and deep tonal gradients for cinematic depth.
- **Luminous emerald:** reserved for action, focus, and progress; never used as a blanket glow.
- **Aged gold:** editorial labels, chronology, and quiet achievement.
- **Warm parchment:** high-contrast body copy and highlighted evidence.
- **Coral signal:** rare, small points of human warmth only.

Surfaces feel like smoked glass, lacquered paper, or metal-edged studio equipment—not frosted SaaS cards. Corners, borders, shadows, and highlights use component tokens so the treatment stays coherent across landing and application shell.

### Typography

The landing employs a display scale with sentence-case editorial headlines, a tight leading rhythm, and small uppercase micro-labels. Body copy stays highly readable and intentionally short. Each viewport has one focal sentence; the hierarchy never competes with the mascot or primary action.

## Experience structure

### 1. Opening sequence — `start`

A full-screen cinematic hero with original motion layers, large headline, one primary action, and one quiet secondary route. The first viewport has a labelled desktop/mobile navigation and a skip-to-content path. A subtle scroll cue appears only when motion is enabled.

### 2. The studio — `practice`

Instead of a feature-card grid, this is an asymmetric study-desk composition: listening, speaking, writing, and review live as tactile artefacts around one active task. Hover/focus reveals a precise benefit; no fake AI feedback or unsupported live metrics are shown.

### 3. The path — `evidence`

A horizontal-to-vertical progression sequence shows how a learner moves from one session to an accumulated habit. It uses verified product ideas—structured practice, progress tracking, and route-based learning—without fabricated learner numbers, scores, or testimonials.

### 4. The return — `remember`

A quieter cinematic break: the environment darkens, copy becomes more intimate, and review/repetition is presented as a return path. This scene deliberately slows visual density before the final call to action.

### 5. The invitation — `progress`

A luminous closing frame with the guide, one primary conversion route, one product-exploration route, and a small truthful note that automated assessment remains unavailable unless an approved model exists.

## Motion language

Motion is choreographed in scenes, not sprinkled on every object.

- On entry, layers use opacity and transform only: background light, guide, title, then evidence.
- Scroll reveals are finite and one scene at a time; no scroll-jacking or endless marquee.
- Pointer response is limited to one hero focal object and is clamped to a small range. Touch users get the same content without pointer dependence.
- Buttons use a 150–220 ms press/hover response; scene entrances use 450–850 ms custom ease-out curves; exit is shorter than entry.
- `prefers-reduced-motion` disables parallax, idle animation, stagger choreography, smooth scroll, and non-essential reveal effects while retaining hierarchy.
- Animations are GPU-friendly (`transform`, `opacity`); no per-frame layout reads, expensive blur animation, or autoplay remote video.

## Modules and seams

The rebuild is composed from focused modules so visual behaviour remains local:

| Module | Interface | Responsibility |
| --- | --- | --- |
| `CinematicHero` | headline, actions, mascot mood | Owns the three-plane opening sequence and responsive navigation. |
| `StudyConstellation` | learning artefact data | Presents practice modes as a spatial/tactile composition. |
| `LearningArc` | verified path steps | Owns the evidence/progression scene without inventing metrics. |
| `CinematicChapter` | id, eyebrow, title, tone, children | Gives each story scene a consistent semantic frame and reduced-motion-safe reveal. |
| `CinematicBackdrop` | intensity, accent | Encapsulates gradients, grain, and lights behind a small presentational interface. |

Existing routes, authentication, localisation, stores, learning logic, and no-fake-AI restrictions remain outside these modules and unchanged.

## Responsive and accessibility requirements

- Verify 375, 768, 1024, and 1440 px layouts with no horizontal overflow.
- Maintain one visible heading hierarchy, native controls, 44 px targets, visible focus, and labelled mobile navigation.
- Respect reduced motion and keyboard-only operation; no visual action depends on hover or pointer movement.
- Decorative art uses empty alternative text and `aria-hidden`; meaningful visual copy remains actual HTML text.
- Preserve exact honest-AI limitation copy and prohibit local-model/browser-running claims.

## Quality bar and non-goals

The target is a composed, film-grade product experience—not a clone of the supplied video, a video-background landing, a neon cyberpunk page, an endless glass-card grid, or a performance-heavy WebGL experiment. No remote video/image dependency, unlicensed character art, fake demo state, fake social proof, or raw learner data is introduced.

## Verification

- Extend the Atelier contract to require the cinematic modules, scene anchors, one landing h1, honest AI wording, no remote media, and reduced-motion coverage.
- Run route, no-blank-page, no-empty-error, no-fake-AI, build, lint, and diff checks.
- Browser QA at 375/768/1024/1440: hero framing, scene rhythm, CTA navigation, mobile menu, keyboard focus, reduced motion, and no overflow.
- Inspect live console and screenshot the hero and one scrolled narrative scene before closeout.
