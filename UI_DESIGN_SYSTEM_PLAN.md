# AI Language Learning Platform UI Design-system Plan

## Direction

Preserve Ech Buri and the green identity while creating one serious, accessible, premium language-learning experience across generic learning and Product Packs. IELTS Academic may have focused exam surfaces, but it does not define the global shell or visual system.

Implementation remains blocked until platform, learning, and module gates pass.

## System layers

- Primitive tokens: neutral/green palettes, typography, spacing, radii, elevation, motion.
- Semantic tokens: canvas, surface, raised surface, text, muted text, border, action, success, warning, danger, focus, disabled, locked.
- Component tokens: navigation, course/lesson card, practice workspace, feedback, evidence, capability, artifact download, consent, entitlement, pack badge.
- Pack tokens: limited accent/illustration metadata only. A Product Pack cannot redefine accessibility, status, focus, typography, or core surface semantics.

## Visual rules

- Opaque or lightly tinted surfaces carry reading, practice, and feedback content.
- Gradients are reserved for restrained brand/pack accents, not default cards.
- Blur/glass is reserved for transient overlays where context matters.
- Borders, typography, spacing, and one elevation system create hierarchy.
- Ech Buri supports onboarding, empty states, coaching, and encouragement without constant motion or exam-page distraction.
- Avoid neon glows, excessive pills, color-only status, fake progress, and celebratory effects in serious assessment contexts.

## Platform information hierarchy

1. Learning objective, content, or learner work.
2. Capability, data, entitlement, and pack state.
3. Evidence-backed feedback or next activity.
4. Progress/history under real persisted data.
5. Model, rubric, pack, and provenance metadata.

## Shared components

- Language/CourseTrack/SkillArea navigation.
- Product Pack switcher and namespaced pack badge.
- Capability banner with ready/download/unsupported/consent/error states.
- Artifact manager with size, quota, progress, cancel, retry, version, integrity, and delete.
- Practice workspace and AssessmentResult presentation.
- RubricCriterion feedback row with Evidence, Confidence, Limitation, and next action.
- Consent panel with category/purpose, revoke, export, and delete.
- Entitlement panel with accessible locked/upgrade states and retained data controls.
- Content publication/validation state.
- Honest empty state using Ech Buri and one clear action.

## Pack composition

- General English uses the base learning shell.
- Conversation emphasizes turn-taking/transcript/fluency evidence without mimicking an exam.
- Pronunciation exposes acoustic capability/measurement limitations before any result.
- IELTS Academic contributes focused exam workspaces, pack-owned rubric/value/disclosure components, and premium entitlement metadata.
- Future packs register through the same module slots; no duplicated global layouts.

## Accessibility baseline

- WCAG 2.2 AA contrast target.
- Visible `:focus-visible`, skip link, landmarks, and one clear page heading.
- Accessible names for all icon-only controls.
- Text and live-region status in addition to color/animation.
- Semantic progress and keyboard-reachable cancellation.
- Dialog focus trap/restore and confirmation for destructive data/model deletion.
- `prefers-reduced-motion` disables nonessential mascot, gradient, confetti, and transition motion.
- Usable at 320 CSS px and 200% zoom with long multilingual content.

## Protected baseline rule

The pivot does not restyle or rewrite existing curriculum, public language data, audio assets, or migrations. UI integration later wraps them through shared components and adapters with regression tests.

## Release evidence

- Generic and pack route inventory/smoke checks.
- Keyboard walkthrough of learning, pack, capability, consent, and entitlement flows.
- Automated and manual accessibility evidence.
- Responsive screenshots with multilingual/long content.
- Clean production console and expected network boundaries.
- No fake progress, mock personalized data, or pack-specific global-shell leakage.
