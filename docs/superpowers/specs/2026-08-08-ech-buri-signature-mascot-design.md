# Ech Buri Signature Mascot Design

## Product decision

Ech Buri becomes EchLearn's one recognizable, official mascot. Its visual baseline is the approved third concept: a friendly, simple green frog with large eyes, a soft rounded silhouette, a small yellow learning book, and no default glasses, tie, or costume. The result should feel as immediately legible and joyful as a top consumer learning product, while remaining original to EchLearn.

The existing wardrobe remains a learner-owned cosmetic layer. It may add an outfit or accent, but it cannot replace the base Ech Buri silhouette, face, or reading-book motif.

## Visual language

- **Character:** simple green frog; two large white eyes; dark-green pupil and outline; understated smile; yellow book as the recurring learning signal.
- **Surface:** warm cream is the public canvas. EchLearn green remains the functional primary for learning progress and primary actions. Tangerine/orange is reserved for challenge, community energy, and success moments.
- **Shape:** broad, low-complexity forms with flat colour, generous negative space, and no raster artwork, gradients, or decorative visual noise.
- **Brand use:** the mascot is present in the landing hero, dashboard study card, onboarding, lesson feedback and completion, streak/reward moments, empty states, and profile fallback. It must not be a persistent floating widget that obscures lesson content.

## Motion contract

`EchBuriAnimated` is the single component responsible for the canonical mascot and its motion. It exposes these states:

| State | User moment | Motion |
| --- | --- | --- |
| `idle` | Page is ready | Soft breathing and an occasional blink. |
| `welcome` | Landing, dashboard, onboarding | One small wave, then idle. |
| `thinking` | Learner is composing an answer | Brief head tilt and eye movement. |
| `listening` | Audio/speaking practice | Small attentive lean. |
| `success` | Correct answer or milestone | One short hop, happy face, and a few flat particles. |
| `incorrect` | Incorrect answer | Gentle recovery pose, then a neutral encouraging face. |
| `cheering` | Lesson completion or streak | Larger one-off celebration with book raised. |

All movement uses only `transform` and `opacity`. It respects both the stored `mascotAnimation` preference and `prefers-reduced-motion`; either setting selects the relevant static pose. Motion never conveys the only version of a result: visible text and icons remain the source of feedback.

## Integration and data flow

- `Mascot` delegates to the canonical renderer by default, so legacy pages inherit the official Ech Buri without per-page artwork choices.
- `EchBuriAnimated` owns the face, book, pose, and state animation. `MascotSkinRenderer` remains a decorative costume renderer used only when the learner explicitly selects a skin.
- Public hero and community/challenge surfaces use the warm cream/tangerine composition. Core learning flows continue to use the existing green functional tokens.
- Lesson, quiz, streak, and completion screens derive mascot state from their existing interaction state. No new global event store is introduced.
- Existing labels and focus behavior are retained; mascot SVGs are decorative when adjacent text already explains the moment, and labelled only when they are the sole visual content.

## Failure and performance constraints

- An unknown state falls back to `idle` with no runtime error.
- A disabled animation preference, reduced motion, or a failed optional costume never prevents an exercise or CTA from rendering.
- No new animation dependency, image download, Lottie file, or layout animation is introduced.
- At 320px, mascot placement must not create horizontal overflow or hide buttons and answer controls.

## Verification

- Source-level tests cover all canonical states, the reduced-motion and user-preference guards, and the mapping from `Mascot` to the canonical default.
- Browser checks cover landing, dashboard, a lesson result, and a completion/reward surface at 320px, 768px, 1024px, and 1440px.
- Browser checks assert no console/page error, no horizontal overflow, usable keyboard controls, and successful static rendering when animation is disabled.
- Run the relevant Node tests, Playwright suite, lint, and production build before release.
