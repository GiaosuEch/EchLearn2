# Track Module Design

## Purpose

Allow Product Packs to register learning or exam experiences without editing Platform Core and without duplicating shared Learning Domain behavior.

## Track module manifest

Every Product Pack publishes a versioned manifest containing:

- pack and module identifiers;
- display metadata and supported instruction/target languages;
- audience, goals, and CourseTracks;
- required and optional SkillAreas;
- contributed lessons/content-registry sources;
- contributed Rubrics and assessment policies;
- generated-content policies and validators;
- required platform capabilities;
- entitlement declaration;
- route/navigation contributions;
- learner-data categories and consent purposes;
- evaluation suite references;
- pack version, compatibility range, and notices.

The manifest is data/configuration validated at registration time, not executable model output.

## Registration lifecycle

`discovered -> schema-valid -> compatible -> policy-valid -> registered -> enabled`

A module stays disabled with a reason if it is incompatible, lacks entitlement, requires an unavailable capability, or violates namespace/policy rules. Registration never silently falls back to fake pack behavior.

## Namespace rules

- Generic identifiers use platform/learning namespaces.
- Pack-specific criteria, content, routes, fingerprints, benchmarks, and persistence keys use the pack namespace.
- A pack cannot overwrite another pack's content or Rubric identifiers.
- Shared learner evidence may be referenced across packs only through Learning Domain permissions and consent, not direct database access.

## Generic content generation

Learning Domain supplies GeneratedContentFingerprint, registry publication states, and validation orchestration. Each pack supplies the canonical fields, similarity policy, threshold, evidence/answer validation, and regeneration limits appropriate to its content. “IELTS test uniqueness” is therefore an IELTS Academic policy layered on generic fingerprints.

## Entitlement

The module declares requirements such as free, premium pack, trial, educator grant, or promotional access. Platform Core evaluates Entitlement and returns a decision. The module must render locked/upgrade states without hiding locally owned learner data.

## Failure isolation

- Disabling or removing a pack does not break the app shell or other packs.
- A pack migration cannot alter Platform Core tables without a separately reviewed platform migration.
- Pack runtime errors are caught at the module boundary and reported as privacy-filtered Platform Events.
- Pack assets and routes can be code-split without changing domain contracts.

## Contract verification

- Register a minimal test pack without editing Platform Core.
- Reject duplicate namespaces and invalid manifests.
- Reject pack imports from forbidden internal platform modules.
- Prove entitlement, unavailable capability, and disabled states.
- Prove one pack cannot read another pack's private state.
- Prove existing multilingual curriculum can be adapted into ContentRegistry without altering source assets.
