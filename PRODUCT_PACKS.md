# Product Packs

## Product strategy

The platform serves broad language learning first and monetizes differentiated packs/capabilities. IELTS Academic is the first premium exam track because it has clear user value and specialized requirements, not because it defines the platform.

## Planned packs

| Pack | Role | Initial scope | Platform dependencies |
| --- | --- | --- | --- |
| General English | Broad foundation | Core skills, vocabulary, grammar, everyday lessons and practice using existing curricula. | Learning Domain, deterministic practice, optional local AI. |
| Conversation | Communication practice | Prompted interaction, transcript-supported feedback, fluency signals, role-play. | Local transcription/text generation when approved; generic assessment. |
| Pronunciation | Specialized acoustic learning | Phoneme/prosody feedback only after a validated acoustic capability exists. | Acoustic provider, calibrated/validated pack rubrics, explicit limitations. |
| IELTS Academic | First premium exam track | Academic Reading/Listening/Writing/Speaking, pack-owned estimates, exam tasks, test-generation policy. | Generic assessment/rubric engine, content registry, local AI, entitlement. |
| IELTS General | Later premium exam track | General Training task/content differences. | Reuses IELTS family components without leaking them into core. |
| TOEIC/TOEFL | Later exam tracks | Separate task models, rubrics, claims, and benchmarks. | Same track-module contracts. |
| Other languages | Later language packs | Existing multilingual curriculum adapted incrementally. | Language/CourseTrack/ContentRegistry contracts. |

## Shared versus pack-owned

Shared:

- capability and artifact state;
- assessment/evidence/provenance shape;
- learner memory and consent infrastructure;
- entitlement decision;
- content registration and generic fingerprints;
- UI primitives and accessibility;
- observability/security.

Pack-owned:

- named tasks and skill groupings;
- rubrics and result values;
- calibration/disclosure copy;
- content-generation and duplicate thresholds;
- route/marketing composition;
- benchmark cases and promotion thresholds for pack tasks.

## IELTS Academic policy

IELTS Academic owns every IELTS-specific term and claim. Band-like output remains an `uncalibrated beta estimate`; Speaking transcript/audio-signal feedback retains its required limitation; pronunciation is not assigned from transcript alone. These are pack policies layered on the generic AssessmentResult, not Platform Core fields.

## Commercial model

Entitlement and pricing stay declarative and platform-owned. A free/base experience must remain honest and useful without fabricating AI. Premium packs may require approved local artifacts or advanced content, but users retain access to export/delete their learner data regardless of entitlement changes.

## Rollout rule

Do not build every pack simultaneously. Prove the platform with a minimal generic test pack and one existing learning flow, then ship General English/Conversation foundations, followed by the IELTS Academic premium vertical after platform gates pass.
