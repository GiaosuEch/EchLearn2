import { getDiscordCommunityUrl } from './communityLinks';

export type CommunityChannel = {
  id: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  icon: string;
  route?: string;
  externalUrl?: string;
  badge?: string;
};

export type ProfileWidget = {
  id: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  icon: string;
  accent: string;
};

export const discordCommunityChannels: CommunityChannel[] = [
  {
    id: 'welcome',
    nameVi: 'chào-mừng',
    nameEn: 'welcome',
    descriptionVi: 'Luật cộng đồng, cách bắt đầu học và nơi giới thiệu bản thân.',
    descriptionEn: 'Community rules, getting started, and learner introductions.',
    icon: '👋',
    route: '/app/community',
  },
  {
    id: 'skin-requests',
    nameVi: 'yêu-cầu-skin',
    nameEn: 'skin-requests',
    descriptionVi: 'Gửi ý tưởng skin ếch, theme theo mùa, outfit anime-inspired hoặc nameplate.',
    descriptionEn: 'Request frog skins, seasonal themes, anime-inspired outfits, or nameplates.',
    icon: '🎨',
    externalUrl: getDiscordCommunityUrl(),
    badge: 'Discord',
  },
  {
    id: 'study-rooms',
    nameVi: 'phòng-học',
    nameEn: 'study-rooms',
    descriptionVi: 'Tạo nhóm học, luyện speaking, chia sẻ mục tiêu ngày.',
    descriptionEn: 'Create study groups, speaking rooms, and daily goal posts.',
    icon: '🐸',
    route: '/app/groups',
  },
  {
    id: 'voice-lounge',
    nameVi: 'phòng-thoại',
    nameEn: 'voice-lounge',
    descriptionVi: 'Vào phòng thoại MVP để luyện nói. WebRTC/LiveKit sẽ được nâng cấp sau.',
    descriptionEn: 'Join MVP voice rooms for speaking practice. WebRTC/LiveKit can be upgraded later.',
    icon: '🎙️',
    route: '/app/voice-rooms',
  },
  {
    id: 'bugs-feedback',
    nameVi: 'báo-lỗi-góp-ý',
    nameEn: 'bugs-feedback',
    descriptionVi: 'Gửi lỗi UI, lỗi audio, lỗi bài học hoặc góp ý sản phẩm.',
    descriptionEn: 'Send UI bugs, audio issues, lesson bugs, or product feedback.',
    icon: '🛠️',
    externalUrl: getDiscordCommunityUrl(),
    badge: 'Discord',
  },
];

export const profileWidgets: ProfileWidget[] = [
  {
    id: 'learning-board',
    titleVi: 'Bảng học tập',
    titleEn: 'Learning board',
    descriptionVi: 'Ngôn ngữ đang học, streak, XP và kỹ năng yếu nổi bật.',
    descriptionEn: 'Current language, streak, XP, and highlighted weak skills.',
    icon: '📚',
    accent: 'from-primary-500/25 to-emerald-500/10',
  },
  {
    id: 'mascot-style',
    titleVi: 'Phong cách ếch',
    titleEn: 'Frog style',
    descriptionVi: 'Skin, bảng màu, hiệu ứng mùa và nameplate cá nhân.',
    descriptionEn: 'Skin, palette, seasonal effects, and personal nameplate.',
    icon: '🐸',
    accent: 'from-lime-500/25 to-yellow-500/10',
  },
  {
    id: 'social-card',
    titleVi: 'Kết nối cộng đồng',
    titleEn: 'Community links',
    descriptionVi: 'Bạn bè, nhóm học, phòng thoại và kênh Discord.',
    descriptionEn: 'Friends, study groups, voice rooms, and Discord channel.',
    icon: '💬',
    accent: 'from-indigo-500/25 to-sky-500/10',
  },
  {
    id: 'wishlist',
    titleVi: 'Wishlist skin',
    titleEn: 'Skin wishlist',
    descriptionVi: 'Gửi ý tưởng skin mới qua kênh Discord cộng đồng.',
    descriptionEn: 'Request new skins through the community Discord channel.',
    icon: '✨',
    accent: 'from-fuchsia-500/25 to-pink-500/10',
  },
];

export const profileNameplates = [
  { id: 'frog-default', nameVi: 'Ếch mặc định', nameEn: 'Default Frog', gradient: 'from-primary-500 via-emerald-500 to-teal-500' },
  { id: 'night-student', nameVi: 'Học đêm', nameEn: 'Night Student', gradient: 'from-indigo-700 via-violet-600 to-slate-900' },
  { id: 'golden-streak', nameVi: 'Chuỗi vàng', nameEn: 'Golden Streak', gradient: 'from-yellow-500 via-orange-500 to-amber-800' },
  { id: 'lofi-rain', nameVi: 'Mưa lofi', nameEn: 'Lofi Rain', gradient: 'from-sky-700 via-cyan-600 to-slate-800' },
  { id: 'anime-energy', nameVi: 'Năng lượng anime', nameEn: 'Anime Energy', gradient: 'from-rose-500 via-purple-600 to-indigo-900' },
];
