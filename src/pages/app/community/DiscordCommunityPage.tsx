import { ExternalLink, Hash, MessageCircle, Palette, Shield, Users, Volume2 } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { discordCommunityChannels } from '../../../data/socialPolish';
import { getDiscordCommunityUrl, getDiscordSetupHint } from '../../../data/communityLinks';

export default function DiscordCommunityPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language?.startsWith('vi');
  const discordUrl = getDiscordCommunityUrl();
  const isConfigured = discordUrl !== 'https://discord.com/channels/@me';

  return (
    <PageShell
      title={isVi ? 'Kênh Discord cộng đồng' : 'Community Discord Channel'}
      description={isVi ? 'Nơi yêu cầu skin, báo lỗi, tìm bạn học và vào nhóm luyện nói.' : 'Request skins, report bugs, find study buddies, and join speaking groups.'}
      icon={<MessageCircle size={20} />}
    >
      <div className="grid lg:grid-cols-[360px,1fr] gap-6 items-start">
        <aside className="glass-card overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-indigo-700 via-violet-700 to-primary-700" />
          <div className="p-6 -mt-12">
            <div className="w-24 h-24 rounded-3xl border-4 border-dark-950 bg-dark-900 flex items-center justify-center shadow-xl">
              <Mascot size={78} expression="cool" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">Ech Lern Discord</h2>
            <p className="mt-2 text-sm text-dark-300 leading-relaxed">
              {isVi
                ? 'Tất cả yêu cầu skin mới, góp ý giao diện, lỗi âm thanh và phòng học cộng đồng sẽ gom về Discord thay vì Facebook.'
                : 'All skin requests, UI feedback, audio bugs, and community study room discussions now go through Discord.'}
            </p>
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-all shadow-md"
            >
              {isVi ? 'Mở kênh Discord' : 'Open Discord channel'} <ExternalLink size={16} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61576223186362"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{isVi ? 'Liên hệ Facebook Hỗ Trợ' : 'Contact Support on Facebook'}</span>
              <ExternalLink size={16} />
            </a>
            {!isConfigured && (
              <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs leading-relaxed text-yellow-100">
                {getDiscordSetupHint(isVi)}
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="grid md:grid-cols-2 gap-4">
            {discordCommunityChannels.map((channel) => {
              const label = isVi ? channel.nameVi : channel.nameEn;
              const description = isVi ? channel.descriptionVi : channel.descriptionEn;

              const channelIcons: Record<string, any> = {
                welcome: <Users className="w-5 h-5 text-emerald-400" />,
                'skin-requests': <Palette className="w-5 h-5 text-amber-400" />,
                'study-rooms': <MessageCircle className="w-5 h-5 text-indigo-400" />,
                'voice-lounge': <Volume2 className="w-5 h-5 text-sky-400" />,
                'bugs-feedback': <Shield className="w-5 h-5 text-rose-400" />,
              };

              const body = (
                <div className="glass-card p-5 h-full hover:border-primary-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary-500/15 flex items-center justify-center">
                        {channelIcons[channel.id] || <Hash size={20} className="text-emerald-400" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2"><Hash size={16} className="text-dark-500" /> {label}</h3>
                        {channel.badge && <p className="text-[11px] uppercase tracking-wide text-primary-300 font-bold">{channel.badge}</p>}
                      </div>
                    </div>
                    {channel.externalUrl && <ExternalLink size={16} className="text-dark-500" />}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-dark-300">{description}</p>
                </div>
              );
              if (channel.externalUrl) {
                return <a key={channel.id} href={channel.externalUrl} target="_blank" rel="noreferrer">{body}</a>;
              }
              return <Link key={channel.id} to={channel.route || '/app/community'}>{body}</Link>;
            })}
          </section>

          <section className="glass-card p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Shield size={20} className="text-primary-300" /> {isVi ? 'Luật cộng đồng ngắn gọn' : 'Quick community rules'}</h3>
            <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-dark-300">
              <div className="rounded-2xl bg-dark-900/70 border border-dark-700 p-4"><Users className="text-primary-300 mb-2" />{isVi ? 'Tôn trọng người học mới. Không chê phát âm, không spam.' : 'Respect new learners. No pronunciation shaming or spam.'}</div>
              <div className="rounded-2xl bg-dark-900/70 border border-dark-700 p-4"><Palette className="text-accent-300 mb-2" />{isVi ? 'Skin anime chỉ lấy cảm hứng, không yêu cầu logo/nhân vật bản quyền nếu chưa có asset hợp pháp.' : 'Anime-inspired skins only. No copyrighted logos/characters without legal assets.'}</div>
              <div className="rounded-2xl bg-dark-900/70 border border-dark-700 p-4"><Volume2 className="text-sky-300 mb-2" />{isVi ? 'Báo lỗi audio cần ghi rõ ngôn ngữ, bài học và trình duyệt.' : 'Audio bug reports should include language, lesson, and browser.'}</div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
