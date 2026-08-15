# Phase 7 — Whole-Platform UI System · QA Checklist

Status legend: ☐ not run · ✅ pass · ❌ fail

## 1. Automated gates (`verify:all` + additions)
- ☐ `npm.cmd run lint` — oxlint, 0 errors (Phase 7 files clean)
- ☐ `npx tsc -b` — 0 type errors **(blocked on pre-existing repo errors owned by the platform fix; Phase 7 files themselves are clean)**
- ☐ `node --test test/ui/phase7DesignSystem.test.ts` — Phase 7 contract suite green
- ☐ `npm.cmd run test` — full UI suite (add `test/ui/phase7DesignSystem.test.ts` to the script)
- ☐ `npm.cmd run test:e2e` — Playwright smoke
- ☐ `npm.cmd run build` — production build
- ☐ `node scripts/verify_no_random_assessment.mjs` — no random/fabricated assessment
- ☐ `node scripts/verify_no_fake_ai_claims.cjs` — no fake-AI claims

## 2. Non-AI / no-fabrication guardrail (AGENTS.md)
- ☐ `BandScoreReveal` shows the **exact** Band returned by `IELTSEvaluator` (count-up lands on the same figure).
- ☐ `AnimatedNumber` final value === input for a table of DTW% → Band cases (9.0, 8.5, …, 4.0).
- ☐ Unavailable path (no mic input / empty draft) renders the explicit state — **no number, no animation, no "success"**.
- ☐ No scoring-math file changed: `ieltsEvaluator.ts`, `srsAlgorithm.ts`, `ScoringEngine.ts`, `deterministicEvaluator.ts`, `lib/nlp/*`, `lib/dsp/*` untouched by Phase 7.
- ☐ Evidence chips show real mechanical figures (DTW raw %, sentence/word counts), not invented metrics.

## 3. Design language (restrained, readable, green identity)
- ☐ No glassmorphism / decorative gradients introduced (primitives use flat tokens).
- ☐ Emerald primary + Zinc neutrals + amber accent preserved; Ech Buri unchanged.
- ☐ Typography uses the new scale tokens; spacing rhythm consistent.

## 4. Accessibility & motion
- ☐ `prefers-reduced-motion`: page entry, count-up, progress ring, card hover all resolve instantly with no transform.
- ☐ Emerald focus ring visible on all interactive primitives; `Button` min-height ≥ 44px.
- ☐ `BandScoreReveal` / `ProgressRing` expose correct ARIA (`role="status"` / `role="progressbar"`, live region).
- ☐ Screen reader announces the final Band value (not the animating intermediate).

## 5. Theming & responsive
- ☐ Light mode: IELTS Speaking + Writing reveal legible, correct band colors (≥7 green / ≥5 amber / else red).
- ☐ Dark mode: same, tokens invert correctly (`html.dark` overrides).
- ☐ Mobile (<1024px) and desktop layouts intact; sidebar drawer + escape-to-close still work.

## 6. Regression sweep
- ☐ Existing suites still green: `legacyDarkPalette`, `iconSystem`, `routeLoading`, `globalSearch`, `speakingFeedbackHonesty`.
- ☐ `PageShell`-based pages animate consistently; no double-animation or layout shift.

## Notes
- Cleanup: remove the temporary `tsc_phase7.txt` build-log artifact from repo root before commit.
- Shell audit: `AppLayout`, `SidebarNav`, `TopBar` already comply with the restrained token system — intentionally left unchanged in Phase 7 to avoid regressions.
