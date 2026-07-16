// @ts-nocheck
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
          <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-400 font-bold">{tx(interfaceLanguage, 'spotifyReady')}</p>
              <h2 className="text-xl font-bold text-white mt-1">{language?.flag} {language?.name} {t13(interfaceLanguage, 'spotifyListening')}</h2>
              <p className="text-sm text-dark-400 mt-2">{configured ? tx(interfaceLanguage, 'spotifyNote') : tx(interfaceLanguage, 'spotifyNoKey')}</p>
            </div>
            <button onClick={() => startSpotifyPkceLogin()} className="px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold disabled:opacity-50" disabled={!configured}>{tx(interfaceLanguage, 'spotifyConnect')}</button>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Music2 size={20} /> {tx(interfaceLanguage, 'songs')}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {media.filter((m) => m.kind === 'song').map((item) => <MediaCard key={item.id} item={item} interfaceLanguage={interfaceLanguage} />)}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Podcast size={20} /> {tx(interfaceLanguage, 'podcasts')}</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {media.filter((m) => m.kind === 'podcast').map((item) => <MediaCard key={item.id} item={item} interfaceLanguage={interfaceLanguage} />)}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-bold text-white flex items-center gap-2"><ShieldCheck size={18} /> {t13(interfaceLanguage, 'honestIntegration')}</h3>
            <p className="text-sm text-dark-400 mt-2">{tx(interfaceLanguage, 'spotifyNote')}</p>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-3">{tx(interfaceLanguage, 'listeningPlan')}</h3>
            <div className="space-y-3">
              {plan.map((week) => (
                <div key={week.week} className="p-3 rounded-xl bg-dark-800 border border-dark-700">
                  <p className="text-xs text-primary-400 font-bold">{tx(interfaceLanguage, 'week')} {week.week}</p>
                  <p className="text-sm text-dark-300 mt-1">{week.task}</p>
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
    <a href={item.spotifyUrl} target="_blank" rel="noreferrer" className="block p-4 rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-primary-400 font-bold uppercase tracking-wide">{getMediaLevelLabel(item.level, interfaceLanguage)}</p>
          <h3 className="text-white font-semibold mt-1">{item.title}</h3>
          <p className="text-xs text-dark-500 mt-1">{tx(interfaceLanguage, 'searchFor')}: {item.searchQuery}</p>
        </div>
        <ExternalLink size={16} className="text-dark-500" />
      </div>
      <p className="text-sm text-dark-400 mt-3">{item.reason}</p>
      <span className="inline-flex mt-4 text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-300">{tx(interfaceLanguage, 'openSpotify')}</span>
    </a>
  );
}
