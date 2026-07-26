# Echlearn Atelier UI Design

**Status:** Design approved in conversation; implementation awaits review of this written specification.

## Purpose

Make Echlearn feel like a calm, cinematic language studio while improving clarity in everyday study. The visual reference is the editorial pacing and purposeful motion of Humble Factory, not its visual assets, copy, layout, or industrial identity. Echlearn remains a distinct education product built around a deep-green identity and an original frog guide, Ech Buri.

## Brand and visual thesis

### Echlearn Atelier

The product should feel composed rather than busy:

- **Minimal luxury:** large, deliberate type, generous whitespace, quiet surfaces, and a strict hierarchy.
- **Cinematic impact:** landing-page chapters progress as a visual story. Motion reveals useful content and never becomes ornament.
- **Warm creativity:** Ech Buri is a capable, playful study companion. It is central in the product narrative, but does not cover the interface.
- **Honesty:** learning progress and AI capability states must only represent verified product data. No placeholder output, fake feedback, or unsupported local-AI claim may appear.

Ech Buri is an original Echlearn frog mascot. Do not reproduce, name, trace, or imitate Pepe the Frog, its facial construction, styling, or other protected trade dress unless a verified written licence is supplied.

## Scope and delivery order

### First delivery: shared system and public landing

1. Consolidate global visual tokens and remove conflicting legacy theme utilities as they are migrated.
2. Establish shared primitives for surface, type, actions, navigation, focus, and reduced motion.
3. Rebuild the public layout and landing page as a five-chapter narrative.
4. Position Ech Buri as the guide in the hero, chapter transitions, onboarding, empty states, and earned celebrations.
5. Preserve existing routes, localisation, auth flows, data contracts, curriculum content, and Supabase behaviour.

### Second delivery: authenticated workspace

1. Apply the shared system to `AppLayout`, `TopBar`, and `DashboardPage`.
2. Recompose the dashboard around **Focus → Evidence → Next step**.
3. Keep evaluation and progress information clearly sourced; do not upgrade static/mock data into a real claim.
4. Migrate high-traffic app pages progressively, without changing their business logic in the visual redesign.

## Information architecture

### Landing narrative

The landing page has five distinct chapters instead of a feature-card wall:

| Chapter | Purpose | Primary content | Action |
| --- | --- | --- | --- |
| Start | State the learner promise and today’s orientation | Hero statement, one honest product preview, Ech Buri cameo | Begin learning / continue learning |
| Practice | Show focused learning without distractions | A believable lesson workspace preview | Explore a learning path |
| Evidence | Demonstrate that progress is visible | Real progress semantics and capability-safe explanation | View how progress works |
| Remember | Explain recall and habit-building | Review rhythm and learner-memory consent explanation | See your study plan |
| Progress | Close with confident momentum | Achievement-oriented visual, but no fabricated score | Start or return to learning |

Every chapter has one clear action. Product preview media must use project-owned assets or authentic interface renderings, with loading and failure states. Remote autoplay video and borrowed visual assets are not a dependency of the final experience.

### Dashboard

The dashboard's first screen answers three questions in this order:

1. What is the single best learning action right now?
2. What evidence shows momentum or a gap?
3. What can the learner do next without searching?

The page uses a focused main column, a compact progress/evidence rail on wide screens, and an ordered single column on mobile. Ech Buri appears once in the welcome/focus moment and again only when a state calls for encouragement, recovery, or celebration.

## Design system

### Tokens

Create semantic tokens rather than page-specific colours:

- Canvas: deep ink background with a restrained green atmospheric wash only in feature moments.
- Surfaces: three opaque tonal elevations for navigation, standard content, and emphasis.
- Text: high-contrast primary, readable secondary, and restrained metadata.
- Action: Ech emerald is reserved for primary action, selection, verified progress, and focus states.
- Achievement: a small warm-gold allowance for earned achievement and premium accents, never as the default visual language.
- Borders and shadows: low-contrast strokes and short soft shadows; no universal glass, glow, 3D tilt, or gradient border treatment.
- Type: a warm display face used only for public marketing headings and short editorial moments; an accessible sans-serif for all learning and application UI.

The migration replaces competing Orbis, Aetheris, Lumora, neon, and liquid-glass utility layers in `src/index.css` with the shared token system. Existing user preferences such as surface modes must continue to work or be explicitly mapped to the new semantic surfaces.

### Components

Create or refactor compact primitives with clear responsibilities:

- `BrandMark` and public/app navigation primitives.
- `AtelierButton`, `AtelierSurface`, `SectionEyebrow`, and typography styles.
- `ChapterFrame` for the landing’s visual story beats.
- `LearningFocusCard`, `ProgressEvidence`, and `NextStepList` for dashboard composition.
- `EchBuriPresence` as a state-aware wrapper around existing project-owned mascot assets.
- A motion utility layer used by components rather than page-specific animation sprawl.

Components must compose existing data and interactions; they do not create new learning, score, or AI logic.

## Motion and interaction

- Button feedback: 160–200 ms.
- Card and navigation transitions: 180–240 ms; lift is limited to 2–4 px where it aids affordance.
- Section reveal: opacity plus 8–16 px movement, 360–520 ms, once per chapter.
- Progress, step, and tab changes animate between real states over roughly 220 ms.
- No scroll-jacking, autoplay audio, infinite glows, perpetual shimmer, bouncing mascot, or hover-only core interaction.
- `prefers-reduced-motion` makes all transitions immediate and freezes decorative movement while preserving state changes.

## Responsive and accessibility requirements

- Support 320 px, 768 px, 1024 px, and 1440 px without clipped content or hover-only dependencies.
- Use a stacked narrative on narrow screens; horizontal step controls are permitted only when snap-safe and not required for comprehension.
- Maintain 44 px minimum interactive targets, visible focus, semantic landmarks, keyboard-operable controls, and text labels in addition to colour.
- Meet WCAG 2.1 AA contrast for normal UI text; verify at 200% zoom and with long Vietnamese strings.
- Avoid backdrop filtering on reading and practice surfaces. Any video has poster, pause control, loading state, and failure fallback.

## Data, safety, and migration constraints

- Preserve existing multilingual curriculum, public data, audio assets, migrations, and consent controls.
- Keep all unavailable AI states explicit. Remove the incorrect “Local AI Qwen3” landing claim and replace it with a truthful capability state or omit it.
- Do not add a model provider, AI SDK, AI endpoint, AI key, or generated learning/assessment content.
- Do not change scores, progress calculations, routes, auth, or community behaviour as part of the visual work.
- Treat the existing working tree as user-owned. Only touch files necessary to the design and never discard unrelated modifications.

## Verification and acceptance criteria

### Automated

- Relevant existing route, no-blank-page, dashboard reactivity, i18n, mascot, and visual customisation checks pass.
- Type check, production build, and lint pass for the changed revision.
- Add focused tests for any new stateful visual logic and truthfulness copy regression.

### Browser QA

- Landing and dashboard render correctly at the four target widths.
- Keyboard navigation reaches every action in a logical order, with a visible focus state.
- Reduced-motion mode has no meaningful movement but still communicates state.
- Public pages have no unsupported AI promises, remote-media blank areas, mojibake, or inaccessible colour-only state.
- App shell, landing, dashboard, auth, and current high-traffic routes retain their intended behaviours.

## Planned file boundaries

- Global system: `src/index.css` and small focused shared UI primitives under `src/components/ui/`.
- Public experience: `src/components/layout/PublicLayout.tsx`, `src/pages/public/LandingPage.tsx`, and landing-specific components.
- App experience: `src/components/layout/AppLayout.tsx`, `src/components/layout/TopBar.tsx`, `src/pages/app/DashboardPage.tsx`, and dashboard-specific components.
- Mascot: existing `src/components/mascot/` components and project-owned `public/mascots/` assets only.

The implementation must not turn this redesign into a broad rewrite of unrelated app pages.
