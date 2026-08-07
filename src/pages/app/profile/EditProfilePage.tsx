import { useState, useEffect } from 'react';
import { Edit, ImagePlus, Check, Sparkles, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import PageShell from '../../PageShell';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from '../../../components/ui/Toast';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const DISCORD_MASCOT_PRESETS = [
  { id: 'pepe-master', name: 'Pepe Master', url: '/mascots/pepe_mascot_avatar.png' },
  { id: 'pepe-tutor', name: 'Ếch Giáo Sư', url: '/mascots/pepe_mascot_tutor.png' },
  { id: 'vangogh-ech', name: 'Van Gogh Mascot', url: '/mascots/ech_buri_vangogh_mascot.png' },
  { id: 'backpack-ech', name: 'Ếch Đeo Balo', url: '/mascots/mascot_frog_backpack.png' },
  { id: 'study-ech', name: 'Ếch Đọc Sách', url: '/mascots/ech_buri_study_companion.png' },
  { id: 'celebrate-ech', name: 'Ếch Ăn Mừng', url: '/mascots/pepe_mascot_celebrate.png' },
];

export function EditProfilePage() {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const navigate = useNavigate();

  const userId = user?.id || '';

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || (userId ? localStorage.getItem(`echlern_profile_bio_${userId}`) : '') || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || (userId ? localStorage.getItem(`echlern_profile_status_${userId}`) : '') || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || (userId ? localStorage.getItem(`echlern_profile_avatar_${userId}`) : '') || '/mascots/pepe_mascot_avatar.png');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || (userId ? localStorage.getItem(`echlern_profile_banner_${userId}`) : '') || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      if (user.bio) setBio(user.bio);
      if (user.customStatus) setCustomStatus(user.customStatus);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      if (user.bannerUrl) setBannerUrl(user.bannerUrl);
    }
  }, [user]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, keyPrefix: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Chỉ chấp nhận tệp hình ảnh (.png, .jpg, .gif, .webp)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Kích thước ảnh lớn hơn 5MB, hệ thống sẽ tối ưu tự động.', 'warning');
    }
    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
    if (userId) {
      localStorage.setItem(`${keyPrefix}_${userId}`, dataUrl);
    }
    toast('Đã tải ảnh lên thành công!', 'success');
  };

  const save = async () => {
    setSaving(true);

    const cleanEmail = (user?.email || '').toLowerCase().trim();
    const isAdmin = cleanEmail === 'khounguyennguyen2012@gmail.com';
    const isReservedName = (str: string) => {
      const clean = (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.includes('giaosuech') || clean === 'giaosu';
    };

    if (!isAdmin && (isReservedName(displayName) || isReservedName(username))) {
      toast('Tên "GiaosuEch" hoặc "Giaosu" là danh xưng độc quyền dành riêng cho Admin (khounguyennguyen2012@gmail.com)!', 'error');
      setSaving(false);
      return;
    }

    if (userId) {
      localStorage.setItem(`echlern_profile_bio_${userId}`, bio);
      localStorage.setItem(`echlern_profile_status_${userId}`, customStatus);
      localStorage.setItem(`echlern_profile_avatar_${userId}`, avatarUrl);
      localStorage.setItem(`echlern_profile_banner_${userId}`, bannerUrl);
    }
    try {
      if (user) {
        await updateProfile({ displayName, username, bio, customStatus, avatarUrl, bannerUrl });
      }
      toast('Đã lưu thay đổi hồ sơ cá nhân thành công!', 'success');
      navigate('/app/profile');
    } catch (error: any) {
      toast(error?.message || 'Đã xảy ra lỗi khi lưu hồ sơ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Chỉnh Sửa Hồ Sơ Cá Nhân" description="Tùy chỉnh thông tin hiển thị, avatar phong cách Discord và ảnh bìa cá nhân" icon={<Edit size={20} />} backTo="/app/profile">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Banner & Main Avatar Preview */}
        <section className="liquid-glass rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 shadow-2xl">
          <div className="h-48 bg-slate-900 relative group">
            {bannerUrl ? <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/60 via-purple-900/60 to-slate-900/90" />}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-semibold backdrop-blur-sm">
              <ImagePlus size={18} /> <span className="ml-2">Tải Ảnh Bìa Mới</span>
              <input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => upload(event, setBannerUrl, 'echlern_profile_banner')} />
            </label>
          </div>
          <div className="p-6 -mt-14 relative z-10 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-28 h-28 rounded-3xl border-4 border-slate-950 bg-slate-900 overflow-hidden relative group flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                <img src={avatarUrl || '/mascots/pepe_mascot_avatar.png'} alt="Avatar" className="w-full h-full object-cover scale-[1.25] transform" />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm">
                  <ImagePlus size={24} />
                  <input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => upload(event, setAvatarUrl, 'echlern_profile_avatar')} />
                </label>
              </div>
              <div className="pb-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{displayName || 'Học Viên Ếch'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh avatar độc quyền bên dưới</p>
              </div>
            </div>

            <label className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all">
              <Upload size={14} /> Tải Ảnh Lên
              <input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => upload(event, setAvatarUrl, 'echlern_profile_avatar')} />
            </label>
          </div>
        </section>

        {/* Discord-Style Mascot Avatar Presets */}
        <section className="liquid-glass p-6 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                Bộ Avatar Mặc Định Phong Cách Discord & EchLearn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chọn avatar mascot mang phong cách riêng hoặc tải ảnh cá nhân của bạn lên.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {DISCORD_MASCOT_PRESETS.map((preset) => {
              const isSelected = avatarUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset.url);
                    toast(`Đã chọn avatar ${preset.name}!`, 'info');
                  }}
                  className={`relative group rounded-2xl p-2 border transition-all cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/50 scale-105'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 relative">
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover scale-[1.25] transform" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-[1px] flex items-center justify-center">
                        <Check size={20} className="text-slate-950 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Profile Details Form */}
        <section className="liquid-glass p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/15 space-y-5 shadow-2xl bg-white dark:bg-slate-900">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5 block">Tên hiển thị</span>
            <input value={displayName} onChange={event => setDisplayName(event.target.value)} placeholder="Tên hiển thị của bạn..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mã ID Định Danh Duy Nhất (System Account ID):</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              #{user?.id ? user.id : 'N/A'}
            </span>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5 block">Tên người dùng / Unique Handle (@username)</span>
            <input value={username} onChange={event => setUsername(event.target.value)} placeholder="@hocvien_ech" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5 block">Trạng thái tùy chỉnh</span>
            <input value={customStatus} onChange={event => setCustomStatus(event.target.value)} placeholder="Đang quyết tâm học IELTS 8.5..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5 block">Tiểu sử</span>
            <textarea value={bio} onChange={event => setBio(event.target.value)} rows={4} placeholder="Giới thiệu bản thân và mục tiêu học tập..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none" />
          </label>
          <button onClick={save} disabled={saving} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 cursor-pointer">
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </section>
      </div>
    </PageShell>
  );
}

export default EditProfilePage;
