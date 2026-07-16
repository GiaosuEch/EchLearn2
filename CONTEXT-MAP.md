# AI Language Learning Platform Context Map

## Contexts

- [Platform Core](./docs/contexts/platform/CONTEXT.md) — supplies local AI, model/artifact governance, evaluation, privacy infrastructure, entitlement, observability, and security without knowing any learning track.
- [Learning Domain](./docs/contexts/learning/CONTEXT.md) — represents languages, courses, skills, lessons, practice, assessment, learner memory, plans, mistakes, and content.
- [Product Packs](./docs/contexts/product-packs/CONTEXT.md) — packages track-specific content, rubrics, claims, generation rules, and experience composition such as General English or IELTS Academic.

## Relationships

- **Learning Domain -> Platform Core**: Learning requests capabilities, validation, persistence infrastructure, and policy decisions through stable interfaces.
- **Product Packs -> Learning Domain**: A pack contributes CourseTracks, content, rubrics, and track policies using shared learning concepts.
- **Product Packs -> Platform Core**: A pack declares capability and entitlement requirements but cannot bypass platform privacy, security, model-approval, or no-fake/no-random policies.
- **Platform Core -x-> Product Packs**: Platform Core never imports pack-specific terms, routes, scores, rubrics, or content.

## Boundary test

If a concept mentions IELTS, TOEIC, TOEFL, a named exam task, or a track-specific score, it belongs to a Product Pack. If it remains meaningful across every language and track, place it in Learning Domain or Platform Core according to ownership.
