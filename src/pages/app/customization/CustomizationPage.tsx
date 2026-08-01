import { memo, useCallback, useMemo, useState } from 'react';
import { ExternalLink, Palette, Sparkles, Shirt, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { accentPalettes, getAccentPalette, getMascotSkin, mascotSkinCategories, mascotSkins, type MascotSkinCategory } from '../../../data/customization';
import { getDiscordCommunityUrl } from '../../../data/communityLinks';
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { settingsService } from '../../../services/settingsService';
import { toast } from '../../../components/ui/Toast';

function SurfacePreview({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${selected ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 hover:border-emerald-500/40'}`}
    >
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2">
        <div className="h-3 w-20 rounded-full bg-emerald-500/80" />
        <div className="mt-2 h-2 w-28 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="mt-2 h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">{label}</p>
    </button>
  );
}

/* ── React.memo SkinCard — prevents 132+ re-renders when selecting 1 skin ── */
const SKIN_BATCH_SIZE = 24;

interface SkinCardProps {
  skin: ReturnType<typeof getMascotSkin> & { isUnlocked: boolean };
  isSelected: boolean;
  onSelect: (id: string, name: string) => void;
}

const SkinCard = memo(function SkinCard({ skin, isSelected, onSelect }: SkinCardProps) {
  return (
    <button
      key={skin.id}
      type="button"
      onClick={() => { if (skin.isUnlocked) onSelect(skin.id, skin.name); }}
      className={`relative rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
        isSelected
          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50 scale-[1.03] shadow-lg'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-emerald-500/50 hover:scale-[1.01]'
      } ${!skin.isUnlocked ? 'opacity-50' : ''}`}
    >
      {skin.rarity === 'legendary' && (
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/30">
          LEGEND
        </span>
      )}

      <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5" />
        <Mascot size={90} expression={skin.rarity === 'legendary' ? 'savage' : 'happy'} skinId={skin.id} animate={false} />
      </div>

      <p className="mt-3 line-clamp-1 text-sm font-black text-slate-900 dark:text-white">{skin.name}</p>
      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">⚡ {skin.actionName}</p>

      {/* Visual Effect Description Indicator */}
      <div className="mt-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
        🎯 Tác dụng: Đổi trang phục Ếch Buri ở Trang chủ & Luyện tập
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span className="capitalize">{skin.category}</span>
        <span className={skin.isUnlocked ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
          {skin.isUnlocked ? (isSelected ? '✓ Đang mặc' : 'Mặc ngay') : skin.unlockText}
        </span>
      </div>
    </button>
  );
});

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
  const [category, setCategory] = useState<MascotSkinCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin' && user?.email?.toLowerCase() === 'khounguyennguyen2012@gmail.com';

  const selectedPalette = getAccentPalette(accentPaletteId);
  const selectedSkin = getMascotSkin(mascotSkinId);
  const discordSkinRequestUrl = getDiscordCommunityUrl();

  const [visibleCount, setVisibleCount] = useState(SKIN_BATCH_SIZE);

  const handleSelectSkin = useCallback((id: string, name: string) => {
    setMascotSkinId(id);
    toast(`Đã khoác áo skin "${name}" cho Ếch Buri! 🐸✨`, 'success');
  }, [setMascotSkinId]);

  const saveCustomization = useCallback(async () => {
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
  }, [user?.id, isVi, accentPaletteId, mascotSkinId, uiSurface, mascotAnimation, seasonalEffects]);

  const visibleSkins = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mascotSkins.map(skin => ({
      ...skin,
      // Admin GiaosuEch has ALL skins unlocked 100%
      isUnlocked: skin.isAvailable || isAdmin
    })).filter((skin) => {
      if (category !== 'all' && skin.category !== category) return false;
      if (!query) return true;
      return `${skin.name} ${skin.category} ${skin.rarity} ${skin.season}`.toLowerCase().includes(query);
    });
  }, [category, search, isAdmin]);

  return (
    <PageShell
      title={t('customization.title', { defaultValue: 'Tủ Đồ Linh Vật & Giao Diện' })}
      description={t('customization.description', { defaultValue: 'Đổi màu Cyberpunk, chọn skin anime nổi tiếng (Naruto, Saiyan, Luffy, Gojo) cho Pepe.' })}
      icon={<Palette size={20} />}
    >
      <div className="grid xl:grid-cols-[360px,1fr] gap-6">
        <aside className="space-y-6">
          <section className="glass-card p-6 text-center sticky top-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl">
            <div className="relative mx-auto w-44 h-44 rounded-[2rem] border border-emerald-500/40 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl" />
              <Mascot size={130} expression="cool" skinId={selectedSkin.id} />
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{selectedSkin.name}</h3>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                {selectedSkin.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                {selectedSkin.rarity}
              </span>
            </div>

            {isAdmin && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                👑 Admin GiaosuEch — Mở Khoá Full Skin!
              </div>
            )}

            <button 
              type="button" 
              onClick={saveCustomization} 
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-3.5 text-sm font-bold text-slate-950 w-full shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02]"
            >
              {isVi ? 'Lưu Trang Phục Pepe' : 'Save Pepe Outfit'} <Sparkles size={18} />
            </button>

            <a 
              href={discordSkinRequestUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-3 text-sm font-bold w-full transition-all"
            >
              {isVi ? 'Yêu Cầu Skin Qua Discord' : 'Request Skin on Discord'} <ExternalLink size={16} />
            </a>
          </section>
        </aside>

        <div className="space-y-6">
          {/* MASCOT WARDROBE GRID (TOP PRIORITY) */}
          <section className="glass-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30"><Shirt size={24} /></div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-xl">{isVi ? '🐸 Tủ Đồ Trang Phục Linh Vật Ếch Buri (132+ Skins)' : 'Pepe Mascot Wardrobe'}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {isAdmin 
                      ? '👑 Admin Server — Đã mở khoá FULL 100% Skin!' 
                      : isVi ? 'Bấm 1-Click để thay trang phục linh vật Ếch Buri ngay lập tức.' : 'Click to instantly equip mascot skins.'}
                  </p>
                </div>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isVi ? 'Tìm skin Naruto, Saiyan, Luffy, Wizard...' : 'Search skins...'}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Explanation Banner: What does skin do */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-6 space-y-1.5 shadow-inner">
              <p className="font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={16} /> Tác dụng thực tế của Skin Linh Vật Ếch Buri:
              </p>
              <p>• <strong>Thay đổi Ngoại hình 3D/Vectơ</strong>: Linh vật Ếch Buri sẽ mặc skin đã chọn trên toàn bộ hệ thống (Dashboard, Trang Luyện Tập, Nhắc Nhở & Cổ Vũ Học Tập).</p>
              <p>• <strong>Biểu cảm & Động tác riêng</strong>: Các Skin Độc Quyền (Anime, Cyberpunk, Wizard) kích hoạt chuỗi hiệu ứng nhảy ăn mừng và âm thanh khi hoàn thành bài học xuất sắc.</p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {mascotSkinCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${category === item.id ? 'bg-emerald-500 text-slate-950 shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {isVi ? item.labelVi : item.labelEn}
                </button>
              ))}
            </div>

            {/* Skin Cards Grid — windowed: render only first N, load more on demand */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {visibleSkins.slice(0, visibleCount).map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  isSelected={skin.id === selectedSkin.id}
                  onSelect={handleSelectSkin}
                />
              ))}
            </div>
            {visibleCount < visibleSkins.length && (
              <button
                type="button"
                onClick={() => setVisibleCount(c => Math.min(c + SKIN_BATCH_SIZE, visibleSkins.length))}
                className="mt-4 w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isVi ? `Xem thêm (${visibleSkins.length - visibleCount} skins còn lại)` : `Load more (${visibleSkins.length - visibleCount} remaining)`}
              </button>
            )}
          </section>

          {/* ACCENT PALETTES */}
          <section className="glass-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Palette size={20} /></div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">{isVi ? 'Bảng Màu Giao Diện Cyber 3D' : '3D Cyber Color Palettes'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isVi ? 'Tùy chọn tông màu dạ quang tối giản cao cấp.' : 'Choose sleek neon cyber colors.'}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accentPalettes.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setAccentPaletteId(palette.id)}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${palette.id === selectedPalette.id ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-400'}`}
                >
                  <div className="flex items-center gap-2">
                    {[palette.primary, palette.primaryLight, palette.accent, palette.surface].map((color) => <span key={color} className="h-6 w-6 rounded-full border border-white/20 shadow-sm" style={{ background: color }} />)}
                  </div>
                  <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">{palette.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{palette.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* DISPLAY STYLES */}
          <section className="glass-card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center"><SlidersHorizontal size={20} /></div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">{isVi ? 'Cấu Hình Hiển Thị UI' : 'UI Display Options'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isVi ? 'Kính mờ Kính 3D, chuyển động linh vật.' : 'Glassmorphism & mascot animations.'}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <SurfacePreview label={isVi ? 'Kính mờ 3D' : 'Glass'} selected={uiSurface === 'glass'} onClick={() => setUiSurface('glass')} />
              <SurfacePreview label={isVi ? 'Dạ quang' : 'Solid'} selected={uiSurface === 'solid'} onClick={() => setUiSurface('solid')} />
              <SurfacePreview label={isVi ? 'Cyber' : 'Cozy'} selected={uiSurface === 'cozy'} onClick={() => setUiSurface('cozy')} />
              <SurfacePreview label={isVi ? 'Gọn gàng' : 'Compact'} selected={uiSurface === 'compact'} onClick={() => setUiSurface('compact')} />
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
