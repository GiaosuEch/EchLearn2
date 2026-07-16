# Learning Domain

The Learning Domain represents what a learner studies, practices, receives as feedback, remembers, and plans across languages and product packs.

## Curriculum

**Language**:
The language being learned or used for instruction, identified independently from an exam or commercial pack.
_Avoid_: locale, course language

**CourseTrack**:
A coherent learning journey with goals, audience, progression, and content requirements.
_Avoid_: product pack, course list

**SkillArea**:
A durable learning capability such as listening, reading, writing, speaking, vocabulary, grammar, or pronunciation.
_Avoid_: screen, exercise type

**Lesson**:
A bounded instructional unit with objectives, content, activities, and completion criteria.
_Avoid_: page, module

**ContentRegistry**:
The authoritative catalog of versioned learning content and its ownership, language, track, skill, and publication state.
_Avoid_: data file list, curriculum array

## Practice and assessment

**PracticeSession**:
A learner's bounded attempt to practice one or more objectives with recorded inputs, activities, and outcomes.
_Avoid_: test, page visit

**Assessment**:
A process that applies a Rubric to learner Evidence and may produce an AssessmentResult or an explicit abstention.
_Avoid_: score calculation, AI grading

**Rubric**:
A versioned set of RubricCriteria and aggregation/abstention rules for a declared learning purpose.
_Avoid_: prompt, scoring formula

**RubricCriterion**:
A named dimension of performance with evidence requirements and permitted feedback or value semantics.
_Avoid_: score field, AI category

**AssessmentResult**:
A provenance-bearing outcome containing criterion results, Evidence, Confidence, Limitations, and optional track-defined values.
_Avoid_: IELTS result, AI score

**Evidence**:
A bounded learner excerpt or measurable signal that supports a feedback observation.
_Avoid_: proof of score, model rationale

**Confidence**:
A declared degree of support for a result under a named method and version, not a claim of correctness or official validity.
_Avoid_: accuracy, certainty

**Limitation**:
A concrete boundary on what an assessment method measured, inferred, or could not determine.
_Avoid_: disclaimer text, fine print

**SkillFeedback**:
Actionable observations and next steps tied to a SkillArea and supported by Evidence.
_Avoid_: AI response, score explanation

**GeneratedContentFingerprint**:
A deterministic exact and/or similarity signature used to identify duplicate generated learning content within a registry policy.
_Avoid_: IELTS fingerprint, random content ID

## Learner continuity

**LearnerMemory**:
User-controlled learning context covering profile, preferences, mistakes, vocabulary, practice history, and plan evidence.
_Avoid_: AI brain, self-training data

**StudyPlan**:
An editable sequence of learning goals and activities justified by learner evidence and constraints.
_Avoid_: AI schedule, fixed roadmap

**MistakeNotebook**:
A learner-owned collection of evidenced mistakes, corrections, recurrence, and review state.
_Avoid_: fake examples, error feed
