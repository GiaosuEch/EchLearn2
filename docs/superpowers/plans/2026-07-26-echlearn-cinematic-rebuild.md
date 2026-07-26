# Echlearn Cinematic Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current flat landing with a fast, accessible, original cinematic Echlearn experience centered on the project-owned mascot.

**Architecture:** The landing is composed from five small presentational modules: a CSS-backed cinematic environment, an interactive hero, an asymmetric study constellation, an evidence arc, and a scene frame. One additive token block in `src/index.css` owns motion, depth, and material values; no learning, authentication, route, store, or AI-runtime ownership moves into the visual modules.

**Tech Stack:** React 19, TypeScript, React Router, motion/react, Lucide React, Tailwind CSS 4, Node source-contract scripts, built-in image generation for an optional original non-character background asset.

## Global Constraints

- Preserve routes, authentication, localisation, stores, learning logic, existing curriculum, and honest-AI behaviour.
- Keep the dirty worktree user-owned. Inspect every target diff, use narrow patches, and never reset, checkout, or mass-format.
- Only use project-owned existing mascot material. Do not create or add Pepe the Frog imagery, name, facial construction, or other third-party character trade dress.
- Do not add remote image/video/audio dependencies, autoplay media, fake product metrics, fake social proof, provider keys, model claims, or fabricated assessment output.
- Motion must use transform/opacity, be finite and scene-based, respect `prefers-reduced-motion`, and remain useful without hover or pointer input.
- The final page must work at 375, 768, 1024, and 1440 px, without horizontal overflow; controls have visible focus and practical 44 px targets.
- Preserve exact public AI limitation wording already required by `scripts/verify_no_fake_ai_claims.cjs`.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/index.css` | Additive cinematic primitive, semantic, and component token layers; motion and reduced-motion rules. |
| `src/components/landing/CinematicBackdrop.tsx` | Decorative CSS layers for light field, grain, and depth. |
| `src/components/landing/CinematicHero.tsx` | Accessible navigation, hero choreography, pointer-safe focal scene, and primary CTA. |
| `src/components/landing/StudyConstellation.tsx` | Asymmetric practice artefact composition. |
| `src/components/landing/LearningArc.tsx` | Verified-progress path and review-return sequence. |
| `src/components/landing/CinematicChapter.tsx` | Semantic story-scene wrapper with finite reveal. |
| `src/pages/public/LandingPage.tsx` | Composes the five landing scenes only. |
| `public/visuals/echlearn-cinematic-atmosphere-v1.webp` | Optional original non-character atmospheric art, generated and stored locally only if it improves the CSS composition. |
| `scripts/verify_atelier_ui_contract.cjs` | Landing source contracts for cinematic modules, reduced motion, honesty, and dependency safety. |

## Task 1: Establish the cinematic contract gate

**Files:**
- Modify: `scripts/verify_atelier_ui_contract.cjs`
- Test: `scripts/verify_atelier_ui_contract.cjs`

**Interfaces:**
- Consumes: current landing composition and source-contract helpers.
- Produces: a gate that accepts composition through `CinematicHero`, `CinematicChapter`, `StudyConstellation`, `LearningArc`, and `CinematicBackdrop`.

- [ ] **Step 1: Write failing assertions for the replacement composition**

Add exact required source checks:

```js
const cinematicHero = readRequired('src/components/landing/CinematicHero.tsx');
const cinematicChapter = readRequired('src/components/landing/CinematicChapter.tsx');
const constellation = readRequired('src/components/landing/StudyConstellation.tsx');
const learningArc = readRequired('src/components/landing/LearningArc.tsx');
const cinematicBackdrop = readRequired('src/components/landing/CinematicBackdrop.tsx');
const cinematicSource = [landing, cinematicHero, cinematicChapter, constellation, learningArc, cinematicBackdrop].join('\n');

required(cinematicSource, 'prefers-reduced-motion', 'cinematic motion coverage');
requiredMatch(cinematicHero, /<nav\b[^>]*aria-label\s*=\s*["']Primary navigation["']/, 'cinematic nav must be labelled');
```

Retain all existing no-remote-media, honest-AI, h1, scene-anchor, and mobile-menu checks, but run them against `cinematicSource` instead of only a parent file.

- [ ] **Step 2: Run RED**

Run: `npm.cmd run verify:atelier-ui`

Expected: FAIL because the cinematic modules do not yet exist.

- [ ] **Step 3: Commit the focused gate**

```powershell
git add -- scripts/verify_atelier_ui_contract.cjs
git commit -m "test: define cinematic landing contract"
```

## Task 2: Add cinematic token and motion layers

**Files:**
- Modify: `src/index.css`
- Test: `scripts/verify_atelier_ui_contract.cjs`

**Interfaces:**
- Consumes: existing `--ech-*` token layer and customisation selectors.
- Produces: CSS variables consumed by every new cinematic module.

- [ ] **Step 1: Add a failing token assertion**

Require `--cinematic-ink`, `--cinematic-emerald-glow`, `--cinematic-gold`, `--cinematic-ease-enter`, `--cinematic-duration-scene`, and a cinematic reduced-motion selector in the contract.

- [ ] **Step 2: Run RED**

Run: `npm.cmd run verify:atelier-ui`

Expected: FAIL naming the first missing cinematic token.

- [ ] **Step 3: Add narrow three-layer tokens and motion CSS**

Append one clearly labelled block; do not rewrite existing theme utilities:

```css
/* === Echlearn cinematic primitives, semantic roles, components === */
:root {
  --cinematic-ink-950: #03100b;
  --cinematic-forest-800: #0b2b1d;
  --cinematic-emerald-400: #63e99a;
  --cinematic-gold-400: #e0b86f;
  --cinematic-coral-400: #ee8d72;
  --cinematic-ink: var(--cinematic-ink-950);
  --cinematic-emerald-glow: color-mix(in srgb, var(--cinematic-emerald-400) 42%, transparent);
  --cinematic-gold: var(--cinematic-gold-400);
  --cinematic-ease-enter: cubic-bezier(.16, 1, .3, 1);
  --cinematic-duration-scene: 720ms;
  --cinematic-panel-bg: color-mix(in srgb, var(--cinematic-forest-800) 72%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .cinematic-motion, .cinematic-motion * { animation: none !important; transition-duration: 1ms !important; transform: none !important; }
}
```

Use only opacity/transform animations and a static fallback for every decorative layer.

- [ ] **Step 4: Run GREEN**

Run: `npm.cmd run verify:atelier-ui`

Expected: the gate advances to missing module checks.

- [ ] **Step 5: Commit**

```powershell
git add -- src/index.css scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: add cinematic visual tokens"
```

## Task 3: Build the cinematic environment and original atmospheric visual

**Files:**
- Create: `src/components/landing/CinematicBackdrop.tsx`
- Create: `public/visuals/echlearn-cinematic-atmosphere-v1.webp` only if the generated visual materially improves the composition
- Test: `scripts/verify_atelier_ui_contract.cjs`

**Interfaces:**
- Produces:

```ts
export type CinematicBackdropProps = {
  intensity?: 'hero' | 'quiet' | 'luminous';
  className?: string;
};
export function CinematicBackdrop(props: CinematicBackdropProps): JSX.Element;
```

- [ ] **Step 1: Generate or reject the optional local visual**

Use built-in image generation with this exact scope; generate once, inspect it, and use it only if it contains no character, text, watermark, logo, or remote dependency:

```text
Use case: stylized-concept
Asset type: subtle landing-page atmosphere behind a language-learning hero
Primary request: original cinematic dark-forest study atmosphere, abstract luminous emerald beams, warm aged-gold particulate light, softly defocused paper and metal learning objects, no character, no frog, no text, no logo
Composition/framing: wide 16:9 background with quiet negative space on the left for HTML headline
Lighting/mood: premium film still, warm rim light, deep dimensional shadow, realistic soft grain
Constraints: no words, no watermark, no UI screenshot, no third-party brand or character
```

If accepted, move the selected output into the exact project path above; otherwise use CSS-only layers and record no asset change.

- [ ] **Step 2: Implement the decorative module**

```tsx
export function CinematicBackdrop({ intensity = 'hero', className = '' }: CinematicBackdropProps) {
  return (
    <div className={`cinematic-backdrop cinematic-backdrop--${intensity} ${className}`} aria-hidden="true">
      <span className="cinematic-backdrop__light" />
      <span className="cinematic-backdrop__grain" />
      <span className="cinematic-backdrop__orb cinematic-motion" />
    </div>
  );
}
```

The component has no controls, text alternative, external URL, canvas loop, or layout-reading code.

- [ ] **Step 3: Run focused verification**

Run: `npm.cmd run verify:atelier-ui`

Expected: the gate advances to missing hero/scene modules.

- [ ] **Step 4: Commit**

```powershell
git add -- src/components/landing/CinematicBackdrop.tsx public/visuals/echlearn-cinematic-atmosphere-v1.webp scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: create cinematic landing atmosphere"
```

If no image was accepted, omit the absent asset from `git add` and preserve the commit message.

## Task 4: Build the accessible cinematic hero

**Files:**
- Create: `src/components/landing/CinematicHero.tsx`
- Test: `scripts/verify_atelier_ui_contract.cjs`

**Interfaces:**
- Consumes: `CinematicBackdrop`, existing `EchBuriPresence`, React Router, Lucide.
- Produces: a self-contained hero/navigation module with existing routes `/`, `/login`, `/register`, and `/languages`.

- [ ] **Step 1: Implement navigation state with an explicit focus seam**

```ts
const [isMenuOpen, setIsMenuOpen] = useState(false);
const menuTriggerRef = useRef<HTMLButtonElement>(null);
const closeMenu = (restoreFocus: boolean) => {
  setIsMenuOpen(false);
  if (restoreFocus) requestAnimationFrame(() => menuTriggerRef.current?.focus());
};
```

Close on `Escape`, current-route change, and mobile link activation. The mobile trigger has `type="button"`, non-empty `aria-label`, `aria-expanded`, and `aria-controls`; the panel has the matching id and labelled close button.

- [ ] **Step 2: Implement finite visual choreography**

Use `motion/react` only for entry opacity/translate and a clamped `useMotionValue` pointer response on the hero evidence plane. Pointer handling is disabled for coarse pointers/reduced motion and never changes route or button hit geometry.

```tsx
<motion.div
  className="cinematic-hero__guide cinematic-motion"
  initial={{ opacity: 0, y: 28, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
>
  <EchBuriPresence mood="focus" size={240} />
</motion.div>
```

Render one h1, one primary CTA, one secondary CTA, and only demonstrable study artefacts. The mascot wrapper remains decorative; surrounding text supplies the meaning.

- [ ] **Step 3: Run RED/GREEN contract cycle**

Run: `npm.cmd run verify:atelier-ui`

Expected: PASS hero and mobile-nav requirements, then fail only on remaining scene modules.

- [ ] **Step 4: Commit**

```powershell
git add -- src/components/landing/CinematicHero.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: build cinematic Echlearn hero"
```

## Task 5: Build the studio and learning-path scenes

**Files:**
- Create: `src/components/landing/StudyConstellation.tsx`
- Create: `src/components/landing/LearningArc.tsx`
- Create: `src/components/landing/CinematicChapter.tsx`
- Test: `scripts/verify_atelier_ui_contract.cjs`

**Interfaces:**

```ts
export type StudyConstellationProps = { className?: string };
export type LearningArcProps = { className?: string };
export type CinematicChapterProps = {
  id: 'start' | 'practice' | 'evidence' | 'remember' | 'progress';
  index: number;
  eyebrow: string;
  title: string;
  tone: 'forest' | 'studio' | 'quiet' | 'luminous';
  children: ReactNode;
};
```

- [ ] **Step 1: Implement `CinematicChapter`**

Make it a semantic `<section>` with `scroll-mt`, h2 hierarchy, a finite `whileInView` opacity/translate reveal, and a static reduced-motion-safe presentation. It owns no route links or metrics.

- [ ] **Step 2: Implement `StudyConstellation`**

Use four fixed, truthful artefacts—listen, speak, write, review—with Lucide icons and real route links. Arrange them asymmetrically using CSS grid areas and relative depth, not a uniform card grid. All actions use native links, have visible focus, and work without hover.

- [ ] **Step 3: Implement `LearningArc`**

Use a three-stop visual path with actual concepts: choose a session, complete practice, return for review. Copy must say “your activity” rather than publish numeric claims. At narrow widths the arc becomes a readable vertical sequence.

- [ ] **Step 4: Run module contract**

Run: `npm.cmd run verify:atelier-ui`

Expected: PASS all cinematic module, anchor, h1, source-safety, and reduced-motion checks.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/landing/StudyConstellation.tsx src/components/landing/LearningArc.tsx src/components/landing/CinematicChapter.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: add cinematic learning scenes"
```

## Task 6: Compose the new landing and remove the flat presentation

**Files:**
- Modify: `src/pages/public/LandingPage.tsx`
- Test: route/no-fake/blank/error scripts and browser snapshot

**Interfaces:**
- Consumes: the Task 3–5 cinematic module interfaces.
- Produces: exactly one h1 via `CinematicHero`; five ordered scene ids; no duplicated old `AtelierHero`/`LandingChapter` composition.

- [ ] **Step 1: Replace composition only**

Compose the scenes in this exact order:

```tsx
<main id="main-content" className="cinematic-landing">
  <CinematicHero />
  <CinematicChapter id="start" index={1} tone="forest" eyebrow="Begin with a direction" title="Make the next session feel possible.">
    <StartScene />
  </CinematicChapter>
  <CinematicChapter id="practice" index={2} tone="studio" eyebrow="The study studio" title="Practice has a physical rhythm.">
    <StudyConstellation />
  </CinematicChapter>
  <CinematicChapter id="evidence" index={3} tone="forest" eyebrow="A path you can see" title="Small sessions become a record.">
    <LearningArc />
  </CinematicChapter>
  <CinematicChapter id="remember" index={4} tone="quiet" eyebrow="Return with purpose" title="Review is how momentum stays alive.">
    <ReturnScene />
  </CinematicChapter>
  <CinematicChapter id="progress" index={5} tone="luminous" eyebrow="The invitation" title="Start a study rhythm that can last.">
    <InvitationScene />
  </CinematicChapter>
</main>
```

Define `StartScene`, `ReturnScene`, and `InvitationScene` as small local JSX constants in `LandingPage.tsx`; each has one paragraph and a native `Link` to the relevant existing route. Use genuine CTA routes: `/register`, `/languages`, `/ielts-program`, and `/community-preview`. Preserve public layout ownership of footer limitation copy. Remove the old flat card-grid copy from this page, but do not alter app/dashboard components.

- [ ] **Step 2: Run focused product checks**

Run:

```powershell
npm.cmd run verify:atelier-ui
node scripts/verify_route_smoke.cjs
node scripts/verify_no_blank_pages.cjs
node scripts/verify_no_empty_error_boxes.cjs
node scripts/verify_no_fake_ai_claims.cjs
```

Expected: every command exits 0.

- [ ] **Step 3: Commit**

```powershell
git add -- src/pages/public/LandingPage.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: compose cinematic Echlearn landing"
```

## Task 7: Production and browser quality gate

**Files:**
- Modify only if a concrete defect is observed: task-owned cinematic source files or `src/index.css`
- Test: production build, lint, browser QA

- [ ] **Step 1: Run production checks**

```powershell
npm.cmd run build
npm.cmd run lint
git diff --check
```

Expected: build exits 0; lint has no new cinematic warnings; diff check distinguishes any pre-existing unrelated whitespace warning.

- [ ] **Step 2: Run browser QA**

Start the local preview and inspect at 375, 768, 1024, and 1440 px. Confirm hero framing, no horizontal scroll, CTA navigation, scene reveals, mobile navigation, keyboard focus, Escape close, and reduced-motion static presentation. Inspect the console for errors; capture a hero screenshot and a mid-page scene screenshot.

- [ ] **Step 3: Make one targeted correction only if QA finds a defect**

Examples: constrain a hero layer that overflows at 375 px; remove an animated blur that causes jank; restore focus after a menu closes. Re-run the exact failed check and then the full Task 7 checks.

- [ ] **Step 4: Commit final verification correction if needed**

```powershell
git add -- src/index.css src/components/landing src/pages/public/LandingPage.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "fix: polish cinematic landing quality"
```

If QA needs no code correction, do not create an empty commit.

## Plan Self-Review

### Spec coverage

- Three visual depth planes and central project-owned mascot: Tasks 3 and 4.
- Token hierarchy, material, palette, and typography support: Task 2.
- Five distinct story scenes: Tasks 5 and 6.
- Finite, GPU-friendly, reduced-motion-safe choreography: Tasks 2, 4, 5, and 7.
- Truthful product claims/no remote media/no character copying: Tasks 1, 3, 4, and 6.
- Accessibility, mobile navigation, focus, and breakpoint behaviour: Tasks 4, 5, and 7.
- Browser and production proof: Task 7.

### Placeholder scan

This plan contains no unresolved implementation markers. The optional art asset has an explicit prompt, acceptance condition, fallback, and exact destination.

### Type consistency

`CinematicChapterProps` defines all five scene ids consumed in Task 6. `CinematicBackdropProps`, `StudyConstellationProps`, and `LearningArcProps` are defined before their consuming tasks. Every later route is an existing route verified by Task 6.
