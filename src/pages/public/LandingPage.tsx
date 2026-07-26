import { BookOpen, Brain, ChartNoAxesCombined, Headphones, Users } from 'lucide-react';
import { AtelierSurface } from '../../components/atelier/AtelierSurface';
import { AtelierHero } from '../../components/landing/AtelierHero';
import { LandingChapter } from '../../components/landing/LandingChapter';

const practiceModes = [
  { icon: Headphones, title: 'Listen and respond', detail: 'Work through guided listening and speaking practice in a clear sequence.' },
  { icon: BookOpen, title: 'Read and write', detail: 'Keep vocabulary, grammar, reading, and writing work close to your course.' },
  { icon: Brain, title: 'Return with purpose', detail: 'Use review cues to revisit material instead of starting from zero.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[var(--ech-canvas)] text-[var(--ech-text)]">
      <AtelierHero />

      <div>
        <LandingChapter
          id="start"
          index={1}
          eyebrow="Start with a direction"
          title="A home for the next honest step."
          action={{ label: 'Choose a language', to: '/languages' }}
        >
          <AtelierSurface tone="raised" className="p-6 sm:p-8">
            <p className="max-w-2xl text-lg leading-8 text-[var(--ech-text-muted)]">
              Begin with a language track or an IELTS path, then make today&apos;s work small enough to return to. Echlearn keeps the next action visible without pretending every learner follows the same route.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Language tracks', 'IELTS programme', 'Study space'].map((label, index) => (
                <div key={label} className="rounded-md bg-[var(--ech-canvas)] p-4">
                  <span className="font-mono text-xs text-[var(--ech-achievement)]">0{index + 1}</span>
                  <p className="mt-5 font-semibold text-[var(--ech-text)]">{label}</p>
                </div>
              ))}
            </div>
          </AtelierSurface>
        </LandingChapter>

        <LandingChapter
          id="practice"
          index={2}
          eyebrow="Practice with structure"
          title="Different skills, one steady rhythm."
          action={{ label: 'See the IELTS programme', to: '/ielts-program' }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {practiceModes.map(({ icon: Icon, title, detail }) => (
              <AtelierSurface key={title} tone="default" className="p-5">
                <Icon size={22} className="text-[var(--ech-action)]" aria-hidden="true" />
                <h3 className="mt-7 text-lg font-semibold tracking-[-0.03em] text-[var(--ech-text)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ech-text-muted)]">{detail}</p>
              </AtelierSurface>
            ))}
          </div>
        </LandingChapter>

        <LandingChapter
          id="evidence"
          index={3}
          eyebrow="Evidence over noise"
          title="See the work you have actually done."
        >
          <AtelierSurface tone="raised" className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
            <div>
              <ChartNoAxesCombined size={24} className="text-[var(--ech-achievement)]" aria-hidden="true" />
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--ech-text-muted)]">
                Track completed lessons, practice activity, streaks, and review work in the learner workspace. What is not available remains clearly unavailable rather than being made up.
              </p>
            </div>
            <div className="rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] px-5 py-4 text-sm text-[var(--ech-text-muted)]">
              <span className="block font-mono text-xs tracking-[0.14em] text-[var(--ech-achievement)]">YOUR RECORD</span>
              <span className="mt-2 block text-[var(--ech-text)]">Built from your study activity</span>
            </div>
          </AtelierSurface>
        </LandingChapter>

        <LandingChapter
          id="remember"
          index={4}
          eyebrow="Remember what matters"
          title="Make review part of learning, not an afterthought."
        >
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <AtelierSurface tone="default" className="p-6 sm:p-8">
              <p className="text-lg leading-8 text-[var(--ech-text-muted)]">
                Return to vocabulary and practice material with a calmer cadence. The goal is not a dramatic promise; it is a reliable place to notice, practise, and revisit.
              </p>
            </AtelierSurface>
            <AtelierSurface tone="muted" className="p-6 sm:p-8">
              <p className="font-mono text-xs tracking-[0.16em] text-[var(--ech-achievement)]">REVIEW CUE</p>
              <p className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[var(--ech-text)]">Leave yourself a clear way back.</p>
            </AtelierSurface>
          </div>
        </LandingChapter>

        <LandingChapter
          id="progress"
          index={5}
          eyebrow="Progress with people"
          title="Keep going in good company."
          action={{ label: 'Visit the community', to: '/community-preview' }}
        >
          <AtelierSurface tone="raised" className="p-6 sm:p-8">
            <Users size={24} className="text-[var(--ech-action)]" aria-hidden="true" />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ech-text-muted)]">
              Explore study groups, voice rooms, and the community preview when you want shared momentum. The product remains useful on a quiet solo day too.
            </p>
          </AtelierSurface>
        </LandingChapter>
      </div>
    </div>
  );
}
