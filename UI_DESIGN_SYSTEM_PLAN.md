# IELTS UI design-system plan

## Direction

Preserve Ech Buri and the green brand while moving from decorative glassmorphism toward a credible premium education product: calm surfaces, strong information hierarchy, precise states, generous whitespace, and limited motion.

This plan is locked now but implemented only after quality, Writing, Speaking, test generation, and learner-memory phases pass.

## Token strategy

- Primitive tokens: neutral and green palettes, typography scale, spacing, radii, shadows, motion durations.
- Semantic tokens: canvas, surface, surface-raised, text, text-muted, border, action, success, warning, danger, focus, disabled.
- Component tokens: button, field, card, rubric row, evidence callout, capability notice, download panel, consent panel, test status.
- Light/dark themes map semantic tokens; feature code does not hardcode brand shades.

## Visual rules

- Use opaque or lightly tinted surfaces for primary reading and assessment content.
- Reserve gradients for small brand accents or a single hero moment, never as the default card background.
- Reserve blur/glass for transient overlays where spatial context matters.
- Use one restrained elevation system; borders and spacing do most grouping work.
- Keep Ech Buri as guide, empty-state support, and feedback companion, not as constant animation competing with study content.
- Avoid neon glows, excessive rounded pills, gamified confetti during serious assessment, and color-only status communication.

## IELTS information hierarchy

1. Task/prompt and learner work.
2. Capability/privacy/estimate status.
3. Criterion feedback with evidence.
4. Next action and revision workflow.
5. Secondary history/model metadata.

The fixed `uncalibrated beta estimate` label remains adjacent to every band-like value. The Speaking measurement disclosure remains adjacent to the result, not hidden in a tooltip or footer.

## Core components

- Capability banner with ready/download/unsupported/error states.
- Model-pack manager with size, quota, progress, cancel, retry, version, integrity state, and delete.
- Assessment provenance panel.
- Criterion feedback row with estimate, confidence, evidence excerpt, limitation, and next action.
- Consent panel with category toggles, plain-language data flow, revoke, export, and delete.
- Test validation status with candidate/rejected/published states.
- Serious empty state using Ech Buri and a clear primary action.

## Accessibility baseline

- WCAG 2.2 AA contrast target.
- Visible `:focus-visible` treatment and skip link.
- All icon-only controls have accessible names.
- Status is exposed through text and appropriate live regions, not only color or animation.
- Downloads expose progress semantics and cancellation remains keyboard reachable.
- Dialog focus is trapped and restored; destructive data/model deletion requires explicit confirmation.
- `prefers-reduced-motion` disables nonessential mascot, gradient, confetti, and transition movement.
- Reading/assessment layouts remain usable at 320 CSS px and 200% zoom.

## UI release evidence

- Route smoke check for every IELTS path.
- Keyboard walkthrough of critical flows.
- Automated accessible-name/landmark/form checks plus manual screen-reader spot check.
- Responsive screenshots for mobile, tablet, desktop, and long content.
- Clean production console and expected network activity.
- No glass/gradient regression outside the documented exceptions.

