import { useState } from 'react';
import { Edit, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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

export function EditProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || localStorage.getItem('echlern_profile_bio') || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || localStorage.getItem('echlern_profile_status') || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || localStorage.getItem('echlern_profile_avatar') || '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || localStorage.getItem('echlern_profile_banner') || '');
  const [saving, setSaving] = useState(false);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, key: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast(t('lesson.errors.tts_failed'), 'error');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast(t('profile.local_upload_note'), 'warning');
    }
    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
    localStorage.setItem(key, dataUrl);
    toast(t('settings.save_success'), 'success');
  };

  const save = async () => {
    setSaving(true);
    localStorage.setItem('echlern_profile_bio', bio);
    localStorage.setItem('echlern_profile_status', customStatus);
    localStorage.setItem('echlern_profile_avatar', avatarUrl);
    localStorage.setItem('echlern_profile_banner', bannerUrl);
    try {
      if (user) {
        const { profileService } = await import('../../../services/profileService');
        await profileService.updateProfile(user.id, { displayName, username, bio, customStatus, avatarUrl, bannerUrl });
        updateProfile({ displayName, username, bio, customStatus, avatarUrl, bannerUrl });
      }
      toast(t('settings.save_success'), 'success');
      navigate('/app/profile');
    } catch (error: any) {
      toast(error?.message || t('error.something_went_wrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title={t('profile.edit_profile')} description={t('profile.local_upload_note')} icon={<Edit size={20} />} backTo="/app/profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="h-44 bg-dark-800 relative group">
            {bannerUrl ? <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-purple-900/60" />}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-semibold">
              <ImagePlus size={18} /> <span className="ml-2">{t('profile.upload_banner')}</span>
              <input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => upload(event, setBannerUrl, 'echlern_profile_banner')} />
            </label>
          </div>
          <div className="p-6 -mt-12 relative z-10 flex items-end gap-4">
            <div className="w-28 h-28 rounded-3xl border-4 border-dark-950 bg-dark-800 overflow-hidden relative group flex items-center justify-center text-white text-4xl font-bold">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (displayName?.[0] || 'U')}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer"><ImagePlus size={24} /><input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => upload(event, setAvatarUrl, 'echlern_profile_avatar')} /></label>
            </div>
            <p className="text-xs text-dark-400 pb-2">{t('profile.local_upload_note')}</p>
          </div>
        </section>

        <section className="glass-card p-6 space-y-4">
          <label className="block"><span className="text-sm text-dark-300 mb-1 block">{t('profile.display_name')}</span><input value={displayName} onChange={event => setDisplayName(event.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-sm text-white outline-none focus:border-primary-500" /></label>
          <label className="block"><span className="text-sm text-dark-300 mb-1 block">{t('profile.username')}</span><input value={username} onChange={event => setUsername(event.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-sm text-white outline-none focus:border-primary-500" /></label>
          <label className="block"><span className="text-sm text-dark-300 mb-1 block">{t('profile.custom_status')}</span><input value={customStatus} onChange={event => setCustomStatus(event.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-sm text-white outline-none focus:border-primary-500" /></label>
          <label className="block"><span className="text-sm text-dark-300 mb-1 block">{t('profile.bio')}</span><textarea value={bio} onChange={event => setBio(event.target.value)} rows={4} className="w-full bg-dark-800 border border-dark-700 rounded-xl p-3 text-sm text-white outline-none focus:border-primary-500 resize-none" /></label>
          <button onClick={save} disabled={saving} className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors">{saving ? t('lesson.generating') : t('profile.save_changes')}</button>
        </section>
      </div>
    </PageShell>
  );
}

export default EditProfilePage;
