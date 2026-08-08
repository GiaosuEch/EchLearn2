# Public UI Reliability Design

## Goal

Make EchLearn's public experience trustworthy and coherent in Vietnamese, with a resilient pricing surface, accurate capability claims, compact mobile layouts, and accessible public controls.

## Decisions

- Vietnamese is the default language for every public route. The product name is `EchLearn` everywhere.
- Pricing always renders the published default plan prices. Remote Supabase prices may override them, but a missing table or failed request must not leave price content blank.
- The public interface must not claim real-time automated assessment while the capability is unavailable. Copy describes available guided practice and communicates unavailable assessment plainly.
- Shared public navigation and footer remain the structural shell. Public content pages use the same surface, spacing, heading, CTA, and card language as the landing page.
- On narrow screens, the language discovery section starts compact and expands on request rather than presenting all thirteen options at once.

## Components and Data Flow

`pricingService` normalizes remote, cached, and default price data. It will expose a result that distinguishes a remote response from safe fallback data; `pricingStore` surfaces that state to `PricingPage` for an honest, non-blocking notice.

Public routes continue to compose inside `PublicLayout`. `AllPages` becomes Vietnamese-only and uses the existing shared visual tokens. `CinematicHero` will use capability-safe product copy. Registration controls retain their behavior but expose programmatic labels and password visibility state.

## Failure Handling

- Price-table request failure: retain deterministic default prices, cache them, and show a concise "displaying standard prices" note. Never show a blank plan price.
- Public content loading: preserve the existing loading state, but pages must resolve to a readable empty/error state instead of an indefinite spinner.
- Automated assessment unavailable: describe the limitation rather than implying feedback was generated.

## Accessibility and Responsive Requirements

- Inputs use visible labels programmatically bound to fields; the password reveal control has an accessible name and pressed state.
- Interactive elements preserve visible keyboard focus and button/link semantics.
- At 375px wide, no horizontal overflow; language cards initially show six options with an accessible expand/collapse control.
- Footer removes duplicated bilingual internal-status text and remains concise on mobile.

## Verification

- Node tests cover price fallback/source state and public copy contracts that can be represented as pure functions/constants.
- Lint, targeted tests, build, and browser checks at desktop and 375px are required.
- Browser validation confirms prices are visible when the remote request fails, mobile content does not overflow, and the registration form has named controls.
