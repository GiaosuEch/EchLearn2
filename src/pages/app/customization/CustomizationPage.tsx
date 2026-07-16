import { useMemo, useState } from 'react';
import { ExternalLink, Palette, Sparkles, Shirt, SlidersHorizontal, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { accentPalettes, getAccentPalette, getMascotSkin, mascotSkinCategories, mascotSkins, type MascotSkinCategory } from '../../../data/customization';
import { getDiscordCommunityUrl, getDiscordSetupHint } from '../../../data/communityLinks';
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { settingsService } from '../../../services/settingsService';
import { toast } from '../../../components/ui/Toast';


function SurfacePreview({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${selected ? 'border-primary-400 bg-primary-500/15' : 'border-dark-700 bg-dark-900/70 hover:border-primary-500/40'}`}
    >
      <div className="h-16 rounded-xl bg-gradient-to-br from-dark-800 to-dark-950 border border-dark-700/70 p-2">
        <div className="h-3 w-20 rounded-full bg-primary-500/70" />
        <div className="mt-2 h-2 w-28 rounded-full bg-dark-600" />
        <div className="mt-2 h-2 w-16 rounded-full bg-dark-700" />
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{label}</p>
    </button>
  );
}

export default function CustomizationPage() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith('vi');
  const accentPaletteId = useAppStore((state) => state.accentPaletteId);
  const mascotSkinId = useAppStore((state) => state.mascotSkinId);
  const uiSurface = useAppStore((state) => state.uiSurface);
  const mascotAnimation = useAppStore((state) => state.mascotAnimation);
  const seasonalEffects = useAppStore((state) => state.seasonalEffects);
  const setAccentPaletteId = useAppStore((state) => state.setAccentPaletteId);
  const setMascotSkinId = useAppStore((state) => state.setMascotSkinId);
  const setUiSurface = useAppStore((state) => state.setUiSurface);
  const setMascotAnimation = useAppStore((state) => state.setMascotAnimation);
  const setSeasonalEffects = useAppStore((state) => state.setSeasonalEffects);
  const [category, setCategory] = useState<MascotSkinCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const user = useAuthStore((state) => state.user);
  const selectedPalette = getAccentPalette(accentPaletteId);
  const selectedSkin = getMascotSkin(mascotSkinId);
  const discordSkinRequestUrl = getDiscordCommunityUrl();
  const isDiscordConfigured = discordSkinRequestUrl !== 'https://discord.com/channels/@me';
  const saveCustomization = async () => {
    if (!user?.id) {
      toast(isVi ? 'Đã lưu tùy chỉnh trên thiết bị này.' : 'Customization saved on this device.', 'success');
      return;
    }
    const ok = await settingsService.saveSettings(user.id, {
      accentPaletteId,
      mascotSkinId,
      uiSurface,
      mascotAnimation,
      seasonalEffects,
    });
    toast(ok ? (isVi ? 'Đã lưu tùy chỉnh.' : 'Customization saved.') : (isVi ? 'Không thể lưu lên đám mây, đã giữ cục bộ.' : 'Cloud save failed; local copy kept.'), ok ? 'success' : 'warning');
  };

  const visibleSkins = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mascotSkins.filter((skin) => {
      if (category !== 'all' && skin.category !== category) return false;
      if (!query) return true;
      return `${skin.name} ${skin.category} ${skin.rarity} ${skin.season}`.toLowerCase().includes(query);
    });
  }, [category, search]);

  return (
    <PageShell
      title={t('customization.title', { defaultValue: 'Tùy chỉnh giao diện' })}
      description={t('customization.description', { defaultValue: 'Đổi màu như Discord, chọn skin linh vật ếch và lưu phong cách cá nhân của bạn.' })}
      icon={<Palette size={20} />}
    >
      <div className="grid xl:grid-cols-[360px,1fr] gap-6">
        <aside className="space-y-6">
          <section className="glass-card p-6 text-center sticky top-4">
            <div className="mx-auto w-44 h-44 rounded-[2rem] border border-primary-500/30 bg-gradient-to-br from-dark-800 to-dark-950 flex items-center justify-center shadow-2xl shadow-primary-950/40">
              <Mascot size={140} expression="cool" skinId={selectedSkin.id} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{selectedSkin.name}</h3>
            <p className="text-sm text-dark-400 capitalize">{selectedSkin.category} · {selectedSkin.rarity}</p>
            <div className="mt-4 rounded-xl border border-dark-700/70 bg-dark-900/70 p-3 text-left text-sm text-dark-300">
              <p className="font-semibold text-primary-300">{isVi ? 'Quy tắc bản quyền' : 'Copyright rule'}</p>
              <p className="mt-1 text-xs leading-relaxed text-dark-400">
                {isVi
                  ? 'Skin là thiết kế ếch gốc lấy cảm hứng thời trang/anime, không nhúng logo hay nhân vật có bản quyền. Muốn thêm skin cụ thể thì cần asset hợp pháp.'
                  : 'Skins are original frog outfits inspired by fashion/anime. They do not bundle copyrighted logos or characters. Specific licensed skins need legal assets.'}
              </p>
            </div>
            <button type="button" onClick={saveCustomization} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm font-bold text-primary-200 hover:bg-primary-500/20 w-full">
              {isVi ? 'Lưu tùy chỉnh' : 'Save customization'} <Sparkles size={16} />
            </button>
            <a href={discordSkinRequestUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 w-full">
              {isVi ? 'Yêu cầu thêm skin qua Discord' : 'Request more skins on Discord'} <ExternalLink size={16} />
            </a>
            {!isDiscordConfigured && (
              <p className="mt-2 text-[11px] leading-relaxed text-dark-500">{getDiscordSetupHint(isVi)}</p>
            )}
          </section>
        </aside>

        <div className="space-y-6">
          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-300 flex items-center justify-center"><Palette size={20} /></div>
              <div>
                <h3 className="font-bold text-white">{isVi ? 'Bảng màu giao diện' : 'Accent color palettes'}</h3>
                <p className="text-sm text-dark-400">{isVi ? 'Đổi màu chính toàn web như Discord theme.' : 'Change the main app colors like a Discord theme.'}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accentPalettes.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setAccentPaletteId(palette.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${palette.id === selectedPalette.id ? 'border-primary-400 bg-primary-500/10' : 'border-dark-700 bg-dark-900/70 hover:border-primary-500/40'}`}
                >
                  <div className="flex items-center gap-2">
                    {[palette.primary, palette.primaryLight, palette.accent, palette.surface].map((color) => <span key={color} className="h-6 w-6 rounded-full border border-white/10" style={{ background: color }} />)}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{palette.name}</p>
                  <p className="text-xs text-dark-400">{palette.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 text-accent-400 flex items-center justify-center"><SlidersHorizontal size={20} /></div>
              <div>
                <h3 className="font-bold text-white">{isVi ? 'Kiểu hiển thị' : 'Surface style'}</h3>
                <p className="text-sm text-dark-400">{isVi ? 'Chọn cảm giác giao diện: kính mờ, chắc, ấm, hoặc gọn.' : 'Choose glass, solid, cozy, or compact UI feel.'}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <SurfacePreview label={isVi ? 'Kính mờ' : 'Glass'} selected={uiSurface === 'glass'} onClick={() => setUiSurface('glass')} />
              <SurfacePreview label={isVi ? 'Chắc màu' : 'Solid'} selected={uiSurface === 'solid'} onClick={() => setUiSurface('solid')} />
              <SurfacePreview label={isVi ? 'Ấm áp' : 'Cozy'} selected={uiSurface === 'cozy'} onClick={() => setUiSurface('cozy')} />
              <SurfacePreview label={isVi ? 'Gọn' : 'Compact'} selected={uiSurface === 'compact'} onClick={() => setUiSurface('compact')} />
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setMascotAnimation(!mascotAnimation)} className={`rounded-xl border px-4 py-3 text-left ${mascotAnimation ? 'border-primary-400 bg-primary-500/10' : 'border-dark-700 bg-dark-900/70'}`}>
                <p className="font-semibold text-white">{isVi ? 'Linh vật chuyển động' : 'Mascot animation'}</p>
                <p className="text-xs text-dark-400">{mascotAnimation ? (isVi ? 'Đang bật' : 'Enabled') : (isVi ? 'Đang tắt' : 'Disabled')}</p>
              </button>
              <button type="button" onClick={() => setSeasonalEffects(!seasonalEffects)} className={`rounded-xl border px-4 py-3 text-left ${seasonalEffects ? 'border-primary-400 bg-primary-500/10' : 'border-dark-700 bg-dark-900/70'}`}>
                <p className="font-semibold text-white">{isVi ? 'Hiệu ứng mùa' : 'Seasonal effects'}</p>
                <p className="text-xs text-dark-400">{seasonalEffects ? (isVi ? 'Đang bật' : 'Enabled') : (isVi ? 'Đang tắt' : 'Disabled')}</p>
              </button>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-300 flex items-center justify-center"><Shirt size={20} /></div>
                <div>
                  <h3 className="font-bold text-white">{isVi ? 'Tủ đồ linh vật ếch' : 'Frog mascot wardrobe'}</h3>
                  <p className="text-sm text-dark-400">{isVi ? `${mascotSkins.length} skin, ${mascotSkins.filter((skin) => skin.isAvailable).length} skin có sẵn.` : `${mascotSkins.length} skins, ${mascotSkins.filter((skin) => skin.isAvailable).length} available.`}</p>
                </div>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isVi ? 'Tìm skin...' : 'Search skins...'}
                className="rounded-xl border border-dark-700 bg-dark-900/70 px-4 py-2 text-sm text-white outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {mascotSkinCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${category === item.id ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}
                >
                  {isVi ? item.labelVi : item.labelEn}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[760px] overflow-y-auto pr-1">
              {visibleSkins.map((skin) => (
                <button
                  key={skin.id}
                  type="button"
                  onClick={() => skin.isAvailable && setMascotSkinId(skin.id)}
                  className={`relative rounded-2xl border p-3 text-left transition-all ${skin.id === selectedSkin.id ? 'border-primary-400 bg-primary-500/15' : 'border-dark-700 bg-dark-900/70 hover:border-primary-500/40'} ${!skin.isAvailable ? 'opacity-60' : ''}`}
                >
                  {!skin.isAvailable && <span className="absolute right-2 top-2 rounded-full bg-dark-950/80 px-2 py-1 text-[10px] font-bold text-accent-400">Update</span>}
                  <div className="h-28 rounded-xl bg-gradient-to-br from-dark-800 to-dark-950 flex items-center justify-center border border-dark-700/70">
                    <Mascot size={86} expression={skin.rarity === 'legendary' ? 'savage' : 'happy'} skinId={skin.id} animate={false} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-bold text-white">{skin.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-dark-500">{skin.rarity} · {skin.season}</p>
                  <p className="mt-1 text-xs text-dark-400">{skin.unlockText}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-primary-500/30 bg-primary-500/10 p-5 flex items-start gap-3">
            <Wand2 className="text-primary-300 shrink-0" size={22} />
            <div>
              <h3 className="font-bold text-white">{isVi ? 'Ghi chú sản phẩm' : 'Product note'}</h3>
              <p className="mt-1 text-sm text-dark-300 leading-relaxed">
                {isVi
                  ? 'Hệ thống này đã có 100+ skin metadata và SVG skin động. Skin kiểu anime chỉ là thiết kế gốc lấy cảm hứng, không sao chép nhân vật/logo. Các bộ có bản quyền cần asset được cấp phép trước khi đưa vào app public. Yêu cầu skin mới sẽ đi qua kênh Discord của cộng đồng.'
                  : 'This system includes 100+ skin metadata entries and dynamic SVG skins. Anime-inspired skins are original outfits, not copied characters/logos. Licensed costumes need legal assets before public release. New skin requests go through the community Discord channel.'}
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
