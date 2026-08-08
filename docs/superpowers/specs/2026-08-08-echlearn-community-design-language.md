# EchLearn Community Design Language

## Intent

Use the approved reference as the visual source of truth: a warm, energetic,
community-first language-learning product. This replaces the current generic
emerald SaaS look rather than adding another visual layer on top of it.

## Visual principles

- Warm cream canvas (`#FFF6E8`) is the default public surface.
- Ech green (`#17A957`) represents learning, progress and the companion.
- Coral orange (`#F77B38`) represents community, invitations, challenges and
  primary conversion actions.
- Ink (`#10231D`) is the only headline color. Body copy uses a softened ink,
  not slate-gray.
- Cards use a friendly, lightly imperfect character: 18–28px corners, dark
  hand-drawn style borders only on featured challenge cards, and restrained
  offset shadows. Standard product cards stay clean and accessible.
- The public hero is an editorial two-column composition, not a dashboard
  disguised as a landing page.

## Official Ech Buri

Ech Buri becomes a simple, rounded green frog: a single soft body shape, two
large white eyes, a minimal smile and a small yellow ECH BURI book. It has no
belly panel, heavy outline, glasses, tie or costume by default. A pale green
circle and offset orange disc frame it in marketing placements.

States remain `idle`, `welcome`, `thinking`, `listening`, `success`,
`incorrect` and `cheering`. State changes use transform/opacity only and stop
when either the learner setting or `prefers-reduced-motion` disables motion.

## Page hierarchy

### Public landing

1. An amber direction strip introduces the current product energy.
2. Compact white navigation keeps challenge, study groups, leaderboard and
   plans visible.
3. The hero puts a direct community-learning proposition on the left and the
   mascot/challenge invitation on the right.
4. Below the fold, capability blocks become learning paths, community loops
   and language choice surfaces using the same token system.

### Authenticated app

The app shell uses the same cream canvas and green/orange semantic colors but
is quieter than the landing page. Sidebar and top bar remain information-dense
and functional. Dashboard cards become an actionable daily learning plan with
one prominent next action; community and streak actions use orange.

### Lesson experience

Lesson surfaces retain their focus but share the same green progress,
cream canvas, orange challenge highlights and Buri feedback. Correct answers
are green; recovery cues are warm orange rather than punitive red.

## Responsive and accessible behaviour

- Public hero stacks at widths below 900px, retaining the companion and the
  challenge card without horizontal overflow at 320px.
- Buttons retain a 44px minimum touch target and visible keyboard focus.
- Decorative mascot art remains hidden from assistive technology; the mascot
  wrapper has a concise accessible label.
- No meaning relies on color alone.

## Scope and non-goals

This pass reworks global tokens, public shell, landing composition, official
mascot, dashboard and lesson chrome. It deliberately preserves existing data,
routes, entitlement logic and the optional learner wardrobe system. Dense
specialist tools retain their structure but inherit shared colors, surfaces and
controls through the global design tokens.
