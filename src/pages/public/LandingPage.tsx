import { ArrowRight, Compass, RotateCcw, Users } from 'lucide-react';
import { Link } from 'react-router';
import { CinematicChapter } from '../../components/landing/CinematicChapter';
import { CinematicHero } from '../../components/landing/CinematicHero';
import { LearningArc } from '../../components/landing/LearningArc';
import { StudyConstellation } from '../../components/landing/StudyConstellation';

const sceneLinkClassName =
  'mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_30%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--ech-text)] outline-offset-4 transition-colors hover:border-[var(--cinematic-emerald-400)] hover:text-[var(--cinematic-emerald-400)]';

function StartScene() {
  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--cinematic-emerald-400)_24%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-panel-bg)_78%,transparent)] p-6 shadow-[0_22px_70px_color-mix(in_srgb,var(--cinematic-ink)_42%,transparent)] sm:p-8">
      <Compass size={24} className="text-[var(--cinematic-emerald-400)]" aria-hidden="true" />
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ech-text-muted)]">
        Start by choosing a language track that fits the time and attention you have today, then keep the next session close enough to begin.
      </p>
      <Link to="/languages" className={sceneLinkClassName}>
        Choose a language
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

function ReturnScene() {
  return (
    <div className="grid gap-6 rounded-lg border border-[color-mix(in_srgb,var(--cinematic-gold)_24%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-panel-bg)_64%,transparent)] p-6 sm:grid-cols-[auto_1fr] sm:items-start sm:p-8">
      <RotateCcw size={24} className="text-[var(--cinematic-gold)]" aria-hidden="true" />
      <div>
        <p className="max-w-2xl text-lg leading-8 text-[var(--ech-text-muted)]">
          Leave yourself a clear way back: revisit a phrase, a vocabulary cue, or the practice path whenever your next session arrives.
        </p>
        <Link to="/ielts-program" className={sceneLinkClassName}>
          Explore the IELTS programme
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function InvitationScene() {
  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--cinematic-emerald-400)_28%,transparent)] bg-[color-mix(in_srgb,var(--cinematic-emerald-400)_8%,var(--cinematic-panel-bg))] p-6 shadow-[0_24px_80px_color-mix(in_srgb,var(--cinematic-emerald-400)_12%,transparent)] sm:p-8">
      <Users size={24} className="text-[var(--cinematic-emerald-400)]" aria-hidden="true" />
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ech-text-muted)]">
        Study quietly on your own or find shared momentum in the community preview when you are ready for a little company.
      </p>
      <Link to="/community-preview" className={sceneLinkClassName}>
        Visit the community
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main id="main-content" className="cinematic-landing overflow-x-hidden bg-[var(--cinematic-ink)] text-[var(--ech-text)]">
      <CinematicHero />

      <CinematicChapter
        id="start"
        index={1}
        tone="forest"
        eyebrow="Begin with a direction"
        title="Make the next session feel possible."
      >
        <StartScene />
      </CinematicChapter>

      <CinematicChapter
        id="practice"
        index={2}
        tone="studio"
        eyebrow="The study studio"
        title="Practice has a physical rhythm."
      >
        <StudyConstellation />
      </CinematicChapter>

      <CinematicChapter
        id="evidence"
        index={3}
        tone="forest"
        eyebrow="A path you can see"
        title="Small sessions become a record."
      >
        <LearningArc />
      </CinematicChapter>

      <CinematicChapter
        id="remember"
        index={4}
        tone="quiet"
        eyebrow="Return with purpose"
        title="Review is how momentum stays alive."
      >
        <ReturnScene />
      </CinematicChapter>

      <CinematicChapter
        id="progress"
        index={5}
        tone="luminous"
        eyebrow="The invitation"
        title="Start a study rhythm that can last."
      >
        <InvitationScene />
      </CinematicChapter>
    </main>
  );
}
