import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Monitor, Shield, Sliders, Volume2 } from 'lucide-react';
import PageShell from '../../PageShell';
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { settingsService, type UserSettingsRecord } from '../../../services/settingsService';
import { supportedLanguages } from '../../../utils/languageUtils';
import { toast } from '../../../components/ui/Toast';

type SelectRowProps = {
  label: string;
  description?: string;
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
};

type ToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function SelectRow({ label, description, value, onChange, children }: SelectRowProps) {
  return (
    <div className="flex flex-col gap-3 py-4 border-t border-dark-700/50 first:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="text-xs text-dark-400 mt-1">{description}</p> : null}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500 min-w-[190px]"
      >
        {children}
      </select>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t border-dark-700/50 first:border-0 gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="text-xs text-dark-400 mt-1">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-primary-500' : 'bg-dark-700'}`}
        aria-pressed={checked}
      >
        <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${checked ? 'left-[26px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const targetLanguage = useAppStore((s) => s.currentLanguage);
  const theme = useAppStore((s) => s.theme);
  const fontSize = useAppStore((s) => s.fontSize);
  const soundEffects = useAppStore((s) => s.soundEffects);
  const speechSpeed = useAppStore((s) => s.speechSpeed);
  const dailyXpGoal = useAppStore((s) => s.dailyXpGoal);
  const ieltsTargetBand = useAppStore((s) => s.ieltsTargetBand);
  const privacyMode = useAppStore((s) => s.privacyMode);
  const user = useAuthStore((s) => s.user);
  const setInterfaceLanguage = useAppStore((s) => s.setInterfaceLanguage);
  const setNativeLanguage = useAppStore((s) => s.setNativeLanguage);
  const setCurrentLanguage = useAppStore((s) => s.setCurrentLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const setSoundEffects = useAppStore((s) => s.setSoundEffects);
  const setSpeechSpeed = useAppStore((s) => s.setSpeechSpeed);
  const setDailyXpGoal = useAppStore((s) => s.setDailyXpGoal);
  const setIeltsTargetBand = useAppStore((s) => s.setIeltsTargetBand);
  const setPrivacyMode = useAppStore((s) => s.setPrivacyMode);

  useEffect(() => {
    if (interfaceLanguage && i18n.language !== interfaceLanguage) {
      i18n.changeLanguage(interfaceLanguage);
    }
  }, [interfaceLanguage, i18n]);


  const persistSettings = (overrides: Partial<UserSettingsRecord> = {}) => {
    if (!user?.id) {
      toast(t('settings.save_success', { defaultValue: 'Đã lưu cài đặt.' }), 'success');
      return;
    }
    void settingsService.saveSettings(user.id, {
      interfaceLanguage,
      nativeLanguage,
      targetLanguage,
      theme,
      soundEffects,
      speechSpeed,
      fontSize,
      dailyXpGoal,
      ieltsTargetBand,
      publicProfile: !privacyMode,
      showOnlineStatus: true,
      allowFriendRequests: true,
      allowGroupInvites: true,
      ...overrides,
    }).then((ok) => {
      toast(ok ? t('settings.save_success', { defaultValue: 'Đã lưu cài đặt.' }) : t('settings.save_error', { defaultValue: 'Không thể lưu lên đám mây, đã giữ cục bộ.' }), ok ? 'success' : 'error');
    });
  };


  return (
    <PageShell
      title={t('settings.title', { defaultValue: 'Cài đặt' })}
      description={t('settings.description', { defaultValue: 'Quản lý ngôn ngữ, giao diện, âm thanh và quyền riêng tư.' })}
      icon={<Sliders size={20} />}
    >
      <div className="grid xl:grid-cols-2 gap-6">
        <section className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-blue-400" /> {t('settings.language', { defaultValue: 'Ngôn ngữ' })}
          </h3>
          <SelectRow
            label={t('settings.interface_language', { defaultValue: 'Ngôn ngữ giao diện' })}
            description={t('settings.interface_language_desc', { defaultValue: 'Điều khiển toàn bộ chữ hiển thị trong ứng dụng.' })}
            value={interfaceLanguage}
            onChange={(value) => { setInterfaceLanguage(value); i18n.changeLanguage(value); persistSettings({ interfaceLanguage: value }); }}
          >
            {supportedLanguages.map((language) => (
              <option key={language.id} value={language.id}>{language.flag} {language.nativeName}</option>
            ))}
          </SelectRow>
          <SelectRow
            label={t('settings.native_language', { defaultValue: 'Ngôn ngữ mẹ đẻ' })}
            description={t('settings.native_language_desc', { defaultValue: 'Dùng cho nghĩa, bản dịch và giải thích.' })}
            value={nativeLanguage}
            onChange={(value) => { setNativeLanguage(value); persistSettings({ nativeLanguage: value }); }}
          >
            {supportedLanguages.map((language) => (
              <option key={language.id} value={language.id}>{language.flag} {language.nativeName}</option>
            ))}
          </SelectRow>
          <SelectRow
            label={t('settings.learning_language', { defaultValue: 'Ngôn ngữ đang học' })}
            description={t('settings.learning_language_desc', { defaultValue: 'Dùng cho bài học, từ vựng và phát âm.' })}
            value={targetLanguage}
            onChange={(value) => { setCurrentLanguage(value); persistSettings({ targetLanguage: value }); }}
          >
            {supportedLanguages.map((language) => (
              <option key={language.id} value={language.id}>{language.flag} {language.nativeName}</option>
            ))}
          </SelectRow>
        </section>

        <section className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Monitor size={18} className="text-primary-400" /> {t('settings.appearance', { defaultValue: 'Giao diện' })}
          </h3>
          <SelectRow label={t('settings.theme', { defaultValue: 'Chủ đề' })} value={theme} onChange={(value) => { setTheme(value as 'dark' | 'light'); persistSettings({ theme: value as 'dark' | 'light' }); }}>
            <option value="dark">{t('settings.dark', { defaultValue: 'Tối' })}</option>
            <option value="light">{t('settings.light', { defaultValue: 'Sáng' })}</option>
          </SelectRow>
          <SelectRow label={t('settings.font_size', { defaultValue: 'Cỡ chữ' })} value={fontSize} onChange={(value) => { setFontSize(value as 'small' | 'medium' | 'large'); persistSettings({ fontSize: value as 'small' | 'medium' | 'large' }); }}>
            <option value="small">{t('settings.small', { defaultValue: 'Nhỏ' })}</option>
            <option value="medium">{t('settings.normal', { defaultValue: 'Bình thường' })}</option>
            <option value="large">{t('settings.large', { defaultValue: 'Lớn' })}</option>
          </SelectRow>
        </section>

        <section className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Volume2 size={18} className="text-green-400" /> {t('settings.audio', { defaultValue: 'Âm thanh' })}
          </h3>
          <ToggleRow
            label={t('settings.sound_effects', { defaultValue: 'Hiệu ứng âm thanh' })}
            checked={soundEffects}
            onChange={(value) => { setSoundEffects(value); persistSettings({ soundEffects: value }); }}
          />
          <SelectRow label={t('settings.speech_speed', { defaultValue: 'Tốc độ đọc' })} value={speechSpeed} onChange={(value) => { setSpeechSpeed(value as 'normal' | 'slow'); persistSettings({ speechSpeed: value as 'normal' | 'slow' }); }}>
            <option value="normal">{t('settings.normal', { defaultValue: 'Bình thường' })}</option>
            <option value="slow">{t('settings.slow', { defaultValue: 'Chậm' })}</option>
          </SelectRow>
        </section>

        <section className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={18} className="text-red-400" /> {t('settings.account', { defaultValue: 'Tài khoản' })}
          </h3>
          <SelectRow label={t('settings.daily_goal', { defaultValue: 'Mục tiêu XP hằng ngày' })} value={dailyXpGoal} onChange={(value) => { setDailyXpGoal(Number(value)); persistSettings({ dailyXpGoal: Number(value) }); }}>
            {[10, 30, 50, 100].map((goal) => <option key={goal} value={goal}>{goal} XP</option>)}
          </SelectRow>
          <SelectRow label={t('settings.ielts_band', { defaultValue: 'Mục tiêu IELTS' })} value={ieltsTargetBand} onChange={(value) => { setIeltsTargetBand(Number(value)); persistSettings({ ieltsTargetBand: Number(value) }); }}>
            {['5.0', '6.0', '6.5', '7.0', '7.5', '8.0', '9.0'].map((band) => <option key={band} value={band}>Band {band}</option>)}
          </SelectRow>
          <ToggleRow
            label={t('settings.public_profile', { defaultValue: 'Hồ sơ công khai' })}
            description={t('settings.public_profile_desc', { defaultValue: 'Cho phép người khác xem hồ sơ học tập cơ bản.' })}
            checked={!privacyMode}
            onChange={(value) => { setPrivacyMode(!value); persistSettings({ publicProfile: value }); }}
          />
        </section>
      </div>
    </PageShell>
  );
}

export default SettingsPage;
