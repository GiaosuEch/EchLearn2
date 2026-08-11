import { useMemo } from 'react';
import { ExternalLink, Headphones, Music2, Podcast, ShieldCheck } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAppStore } from '../../../stores/appStore';
import { tx } from '../../../i18n/phase129Text';
import { t13 } from '../../../i18n/phase13Text';
import { buildListeningPlan, getCuratedMedia, getMediaLevelLabel, isSpotifyConfigured, startSpotifyPkceLogin } from '../../../services/mediaDiscoveryService';
import { languages } from '../../../data/languages';

export default function MusicPodcastLabPage() {
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const targetLanguage = useAppStore((s) => s.currentLanguage);
  const language = useMemo(() => languages.find((l) => l.id === targetLanguage), [targetLanguage]);
  const media = useMemo(() => getCuratedMedia(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const plan = useMemo(() => buildListeningPlan(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const configured = isSpotifyConfigured();

  return (
    <PageShell title={tx(interfaceLanguage, 'musicTitle')} description={tx(interfaceLanguage, 'musicDesc')} icon={<Headphones size={20} />}>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-400/20 dark:bg-slate-900 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{tx(interfaceLanguage, 'spotifyReady')}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{language?.name} {t13(interfaceLanguage, 'spotifyListening')}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{configured ? tx(interfaceLanguage, 'spotifyNote') : tx(interfaceLanguage, 'spotifyNoKey')}</p>
            </div>
            <button onClick={() => startSpotifyPkceLogin()} className="min-h-11 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={!configured}>{tx(interfaceLanguage, 'spotifyConnect')}</button>
          </div>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white"><Music2 size={20} /> {tx(interfaceLanguage, 'songs')}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {media.filter((m) => m.kind === 'song').map((item) => <MediaCard key={item.id} item={item} interfaceLanguage={interfaceLanguage} />)}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white"><Podcast size={20} /> {tx(interfaceLanguage, 'podcasts')}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {media.filter((m) => m.kind === 'podcast').map((item) => <MediaCard key={item.id} item={item} interfaceLanguage={interfaceLanguage} />)}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 font-black text-slate-950 dark:text-white"><ShieldCheck size={18} /> {t13(interfaceLanguage, 'honestIntegration')}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{tx(interfaceLanguage, 'spotifyNote')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 font-black text-slate-950 dark:text-white">{tx(interfaceLanguage, 'listeningPlan')}</h3>
            <div className="space-y-3">
              {plan.map((week) => (
                <div key={week.week} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-400/15 dark:bg-emerald-500/10">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{tx(interfaceLanguage, 'week')} {week.week}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-700 dark:text-slate-200">{week.task}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function MediaCard({ item, interfaceLanguage }: any) {
  return (
    <a href={item.spotifyUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{getMediaLevelLabel(item.level, interfaceLanguage)}</p>
          <h3 className="mt-1 font-black text-slate-950 dark:text-white">{item.title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tx(interfaceLanguage, 'searchFor')}: {item.searchQuery}</p>
        </div>
        <ExternalLink size={16} className="shrink-0 text-slate-400" />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.reason}</p>
      <span className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{tx(interfaceLanguage, 'openSpotify')}</span>
    </a>
  );
}
