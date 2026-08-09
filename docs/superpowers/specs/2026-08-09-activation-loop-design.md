# EchLearn activation-loop landing design

## Goal

Turn the public landing page from a community-design concept into a clear product entry point. A first-time Vietnamese learner should understand the value proposition, start an eight-minute first win, and see why returning with Ech Buri and a study group is worthwhile.

## Product decision

EchLearn is positioned as a daily English and IELTS momentum system for Vietnamese learners: a focused next lesson, visible progress, a companion, and an accountability group. The page must not pretend to be a product selector or a design exploration.

## Scope

- Replace the public hero's internal "03 — community energy" direction label and "choose this direction" action.
- Make the primary CTA describe the first concrete learner outcome: a personal eight-minute first lesson.
- Reframe the hero challenge card as a progress promise rather than fictional social proof.
- Add a compact, truthful "how your first day works" activation strip: choose goal, finish eight minutes, unlock tomorrow's next step.
- Keep the existing landing sections, 13-language catalogue, public routes, registration route, accessibility primitives, reduced-motion support, and existing mascot component.
- Do not fabricate learner counts, completion rates, testimonials, pricing, or outcomes.

## Experience

1. The hero opens with one promise: "Mỗi ngày 8 phút, tiếng Anh tiến một bước."
2. Supporting copy establishes the audience and method: a personal path, immediate feedback, a group that maintains the habit.
3. The primary action starts the goal and language setup at `/register`; authenticated learners go to `/app`.
4. The secondary action takes learners to the real study groups page.
5. Ech Buri remains the signature visual. Its welcome pose carries the first-contact moment; the progress card shows the concrete next lesson, not invented participants.
6. The activation strip names the three steps and makes the return loop visible before feature details.

## Component boundaries

- `CinematicHero`: public navigation, hero copy, CTAs, Buri stage, and the first-day progress card.
- `LandingPage`: high-level proof/content sections and the activation strip after the hero.
- `EchBuriAnimated`: unchanged canonical mascot API; the landing passes `welcome` only.

## Accessibility and responsive behavior

- One `h1`, named primary navigation, semantic ordered list for first-day steps, and existing keyboard-native links/buttons.
- Preserve the mobile navigation, no horizontal overflow at 390px, and reduced-motion behavior.
- All claims are concrete and truthful; no fabricated counters or social proof.

## Verification

- Add source contract tests for the new first-win language and the removal of design-direction copy.
- Run focused tests, route/browser smoke tests, and a production console check.
