# Warm community UI and Ech Buri motion design

## Decision

Adopt the warm, community-led visual direction selected by the product owner: cream surfaces, forest green as the functional primary, and a restrained tangerine highlight. Ech Buri remains an original, SVG-based EchLearn character; it may be playful and responsive, but it does not mimic another product's visual assets or choreography.

## First delivery

The first delivery applies the direction where learning feedback has the highest frequency: the lesson player. It activates the existing animated mascot by default for new visitors and turns the feedback panel into a calm companion:

- **Arrival:** idle breathing and infrequent blink while the question is ready.
- **Answer composed:** a focused/thinking pose after the learner selects or types an answer.
- **Correct:** a short, one-off celebration with colour particles and the existing positive feedback.
- **Incorrect:** a brief recovery pose with a concrete retry message; it must never shame the learner.
- **Completion:** uses the existing completion screen's celebratory state.

The dashboard and public landing mascot retain their existing placement and consume the same default setting, so the new behaviour appears consistently without adding floating mascots to every screen.

## Interaction and accessibility constraints

- The user's animation preference remains available and disables all mascot movement when off.
- `prefers-reduced-motion` always disables movement, even if the user setting is on.
- Motion only animates compositor-friendly `transform` and `opacity`; no layout properties are animated.
- The feedback header keeps live text status alongside the visual state, so colour and animation are never the only feedback channel.
- The card works at 320px; mascot and copy must remain readable without horizontal overflow.

## Technical shape

`EchBuriAnimated` continues as the single SVG state renderer. The lesson player derives its mascot state from existing answer state (`selected`, `userInput`, `showResult`, `isCorrect`) rather than introducing a second state store. The persisted app setting changes its default to enabled for new installs while preserving a user's saved explicit choice.

## Validation

Automated checks cover the mascot state contract, default preference, and lesson-player mapping. The completed experience is inspected at mobile and desktop breakpoints, with reduced motion enabled and disabled.
