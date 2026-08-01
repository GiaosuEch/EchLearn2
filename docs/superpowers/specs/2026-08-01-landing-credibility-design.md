# Landing credibility redesign

## Goal

Make the public landing page feel like a trustworthy language-learning platform rather than a game clone, while preserving EchLearn's green identity and Ech Buri mascot.

## Approved direction

Use a calm, evidence-led education design:

- Keep the green palette and Ech Buri, but position the mascot as a small study companion rather than the product's central promise.
- Replace superlative, numerical, and capability claims that cannot be verified from the current product with plain, accurate benefits.
- Remove decorative emoji, fabricated progress badges, and the purple/amber gamification treatment from the hero.
- Give the hero a single primary action, an optional route-preview action, and three concise capability statements.
- Keep the existing responsive navigation, routes, and accessible semantic structure.

## Component changes

### `CinematicHero`

- Rewrite the navigation and hero copy in clear Vietnamese.
- Replace the claim badge with a neutral product label.
- Remove the simulated streak and IELTS-goal cards.
- Retain one compact mascot companion panel with an honest explanation of its role.
- Use a restrained white-and-emerald palette with one visual emphasis colour.

### `LandingPage`

- Replace feature marketing claims with descriptions matching current routes: structured learning path, speaking practice, and IELTS Academic practice.
- Remove the unverified learner-count claim from the closing CTA.
- Tighten visual density: flatter cards, consistent corner radii, and no decorative gradients where hierarchy is better served by typography.

## Quality checks

- Update the landing smoke test to assert the new, accurate hero content and ensure retired claims are absent.
- Run lint, the landing smoke test, the production build, and browser checks at desktop and 375px mobile widths.
- Verify heading order, keyboard-reachable navigation, and a clean browser console.

## Out of scope

- Changes to the authenticated learning experience, pricing, data services, mascot assets, or backend capabilities.
- Adding claims, metrics, or AI behavior that the product cannot substantiate.
