import { Link } from 'react-router';
import { Award, BookOpen, Edit, Flame, Target, Trophy, Users, Sparkles, UserCheck, LogOut, Palette, MessageSquare, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { ProBadge } from '../../../components/common/ProBadge';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { getLanguageMeta } from '../../../utils/languageUtils';
import { getMascotSkin, getAccentPalette } from '../../../data/customization';
import { getDiscordSetupHint, isDiscordInviteConfigured } from '../../../data/communityLinks';
import { profileNameplates, profileWidgets } from '../../../data/socialPolish';

import { useState } from 'react';
import { AccountSwitcherModal } from '../../../components/auth/AccountSwitcherModal';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith('vi');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const user = useAuthStore(s => s.user);
  const stats = useLearningStore(s => s.stats);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const mascotSkinId = useAppStore(s => s.mascotSkinId);
  const accentPaletteId = useAppStore(s => s.accentPaletteId);
  const targetMeta = getLanguageMeta(currentLanguage);
  const selectedSkin = getMascotSkin(mascotSkinId);
  const selectedPalette = getAccentPalette(accentPaletteId);
  const discordConfigured = isDiscordInviteConfigured();
  const userId = user?.id || '';
  const avatar = user?.avatarUrl || (userId ? localStorage.getItem(`echlern_profile_avatar_${userId}`) : '') || '';
  const banner = user?.bannerUrl || (userId ? localStorage.getItem(`echlern_profile_banner_${userId}`) : '') || '';
  const status = user?.customStatus || (userId ? localStorage.getItem(`echlern_profile_status_${userId}`) : '') || (isVi ? 'Đang học đều mỗi ngày' : 'Building a daily learning rhythm');
  const bio = user?.bio || (userId ? localStorage.getItem(`echlern_profile_bio_${userId}`) : '') || '';
  const selectedNameplate = profileNameplates[Math.abs((user?.username || 'frog').length) % profileNameplates.length];

  const statCards = [
    { icon: <Flame size={24} />, label: isVi ? 'Chuỗi ngày' : 'Streak', value: stats.currentStreak || 0 },
    { icon: <Trophy size={24} />, label: 'XP', value: stats.totalXP || 0 },
    { icon: <BookOpen size={24} />, label: isVi ? 'Cấp' : 'Level', value: user?.level || 1 },
    { icon: <Target size={24} />, label: 'IELTS', value: stats.ieltsEstimatedBand ? stats.ieltsEstimatedBand : t('ielts.estimated_score') },
  ];

  return (
    <PageShell title={isVi ? 'Hồ sơ cá nhân' : 'Profile'} description={isVi ? 'Hồ sơ kiểu Discord với nameplate, skin ếch, widget và liên kết cộng đồng.' : 'Discord-style profile with nameplate, frog skin, widgets, and community links.'}>
      <div className="grid xl:grid-cols-[420px,1fr] gap-6 items-start">
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          <div className={`h-40 bg-gradient-to-r ${selectedNameplate.gradient} relative`}>
            {banner && <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <Link to="/app/edit-profile" className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold shadow-md"><Edit size={16} /> {t('common.edit')}</Link>
          </div>
          <div className="p-6 -mt-14 relative z-10">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-950 overflow-hidden flex items-center justify-center shadow-xl relative">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <Mascot size={104} expression="cool" skinId={selectedSkin.id} />}
              </div>
              <div className="mb-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 px-4 py-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Nameplate</p>
                <p className="font-bold text-slate-900 dark:text-white">{isVi ? selectedNameplate.nameVi : selectedNameplate.nameEn}</p>
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{user?.displayName || 'Ech Learner'}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-slate-600 dark:text-slate-300 font-mono text-sm">@{user?.username || 'learner'}</span>
              <span className="text-slate-400 font-mono text-xs">• {user?.email || 'learner@echlearn.vn'}</span>
              <ProBadge showWhenFree size="md" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs font-mono flex items-center gap-1">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Skin: {selectedSkin.name}</span>
            </p>
            {status && <p className="inline-flex mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">{status}</p>}
            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl">{bio || (isVi ? 'Mô tả bản thân, mục tiêu học và phong cách ếch yêu thích của bạn.' : 'Describe yourself, your learning goal, and your favorite frog style.')}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setShowAccountSwitcher(true)} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/20 p-3 text-sm font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                <UserCheck size={16} />
                <span>{isVi ? 'Chuyển Đổi Tài Khoản' : 'Switch Account'}</span>
              </button>
              <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/login'; }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-600 dark:text-rose-200 hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer">
                <LogOut size={16} />
                <span>{isVi ? 'Đăng Xuất' : 'Sign Out'}</span>
              </button>
            </div>
            {!discordConfigured && <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">{getDiscordSetupHint(isVi)}</p>}
          </div>
        </section>

        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {statCards.map(card => (
              <div key={card.label} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">{card.icon}</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{isVi ? 'Widget hồ sơ' : 'Profile widgets'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isVi ? 'Kiểu Discord: hiển thị học tập, skin, cộng đồng và wishlist.' : 'Discord-style board for learning, skins, community, and wishlist.'}</p>
              </div>
              <Link to="/app/community/discord" className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">{isVi ? 'Mở Discord' : 'Open Discord'}</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profileWidgets.map((widget) => {
                const widgetIcons: Record<string, any> = {
                  'learning-board': <BookOpen className="w-5 h-5 text-emerald-500" />,
                  'mascot-style': <Sparkles className="w-5 h-5 text-amber-500" />,
                  'social-card': <MessageSquare className="w-5 h-5 text-indigo-500" />,
                  'wishlist': <Heart className="w-5 h-5 text-rose-500" />,
                };

                return (
                  <div key={widget.id} className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br ${widget.accent} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm shrink-0">
                        {widgetIcons[widget.id] || <Sparkles className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{isVi ? widget.titleVi : widget.titleEn}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{isVi ? widget.descriptionVi : widget.descriptionEn}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-6">
            <section className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={18} /> {t('settings.language')}</h3>
              <div className="space-y-3 text-sm text-dark-300">
                <p>{t('settings.learning_language')}: {targetMeta.flag} {targetMeta.nativeName}</p>
                <p>{t('settings.interface_language')}: {getLanguageMeta(interfaceLanguage).nativeName}</p>
                <p>{t('settings.native_language')}: {getLanguageMeta(nativeLanguage).nativeName}</p>
              </div>
            </section>
            <section className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Award size={18} /> {t('profile.badges')}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center gap-1.5"><Sparkles size={14} /> Ech Learner</span>
                <span className="px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm font-semibold flex items-center gap-1.5"><Flame size={14} /> XP</span>
                <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-semibold flex items-center gap-1.5"><Palette size={14} /> {selectedPalette.name}</span>
              </div>
            </section>
            <section className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={18} /> {t('profile.friends')}</h3>
              <div className="space-y-2 text-sm">
                <Link to="/app/friends" className="block text-primary-400 hover:underline">{t('social.search_users')}</Link>
                <Link to="/app/community/discord" className="block text-indigo-300 hover:underline">{isVi ? 'Kênh Discord / yêu cầu skin' : 'Discord channel / skin requests'}</Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AccountSwitcherModal isOpen={showAccountSwitcher} onClose={() => setShowAccountSwitcher(false)} />
    </PageShell>
  );
}
