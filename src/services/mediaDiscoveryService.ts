export type MediaKind = 'song' | 'podcast';

export interface LearningMediaItem {
  id: string;
  language: string;
  kind: MediaKind;
  title: string;
  creator: string;
  level: 'easy' | 'medium' | 'hard';
  reason: string;
  searchQuery: string;
  spotifyUrl: string;
}

const languageQueries: Record<string, { songs: string[]; podcasts: string[]; label: string }> = {
  en: { label: 'English', songs: ['English pop hits lyrics', 'acoustic English songs clear lyrics', 'classic English songs for learners'], podcasts: ['BBC Learning English podcast', 'English learning podcast slow', 'English conversation podcast'] },
  ja: { label: 'Japanese', songs: ['J-pop clear lyrics', 'Japanese city pop lyrics', 'Japanese songs for learners'], podcasts: ['NHK Easy Japanese podcast', 'Nihongo con Teppei beginner podcast', 'Japanese conversation podcast'] },
  ko: { label: 'Korean', songs: ['K-pop clear lyrics', 'Korean ballad lyrics', 'Korean songs for learners'], podcasts: ['Talk To Me In Korean podcast', 'Korean learning podcast beginner', 'Korean conversation podcast'] },
  zh: { label: 'Chinese', songs: ['Mandarin pop clear lyrics', 'Chinese songs for learners', 'Mandarin ballads lyrics'], podcasts: ['ChinesePod beginner podcast', 'slow Chinese podcast', 'Mandarin learning podcast beginner'] },
  fr: { label: 'French', songs: ['French pop clear lyrics', 'chanson française lyrics', 'French songs for learners'], podcasts: ['Coffee Break French podcast', 'slow French podcast', 'French learning podcast beginner'] },
  de: { label: 'German', songs: ['German pop clear lyrics', 'Deutsch pop lyrics', 'German songs for learners'], podcasts: ['Coffee Break German podcast', 'slow German podcast', 'German learning podcast beginner'] },
  es: { label: 'Spanish', songs: ['Spanish pop clear lyrics', 'Latin pop Spanish lyrics', 'Spanish songs for learners'], podcasts: ['Coffee Break Spanish podcast', 'slow Spanish podcast', 'Spanish learning podcast beginner'] },
  it: { label: 'Italian', songs: ['Italian pop clear lyrics', 'Italian ballads lyrics', 'Italian songs for learners'], podcasts: ['Coffee Break Italian podcast', 'slow Italian podcast', 'Italian learning podcast beginner'] },
  pt: { label: 'Portuguese', songs: ['Brazilian Portuguese songs clear lyrics', 'MPB lyrics', 'Portuguese songs for learners'], podcasts: ['Brazilian Portuguese podcast beginner', 'Portuguese learning podcast', 'slow Portuguese podcast'] },
  ru: { label: 'Russian', songs: ['Russian pop clear lyrics', 'Russian songs for learners', 'Russian ballads lyrics'], podcasts: ['Russian learning podcast beginner', 'slow Russian podcast', 'Russian conversation podcast'] },
  vi: { label: 'Vietnamese', songs: ['V-pop clear lyrics', 'Vietnamese pop lyrics', 'Vietnamese songs for learners'], podcasts: ['Vietnamese learning podcast', 'slow Vietnamese podcast', 'Vietnamese conversation podcast'] },
  th: { label: 'Thai', songs: ['Thai pop clear lyrics', 'T-pop lyrics', 'Thai songs for learners'], podcasts: ['Thai learning podcast beginner', 'slow Thai podcast', 'Thai conversation podcast'] },
  ar: { label: 'Arabic', songs: ['Arabic pop clear lyrics', 'Arabic songs for learners', 'Arabic ballads lyrics'], podcasts: ['Arabic learning podcast beginner', 'slow Arabic podcast', 'Arabic conversation podcast'] },
};

const spotifySearchUrl = (query: string) => `https://open.spotify.com/search/${encodeURIComponent(query)}`;
const isVi = (lang?: string) => (lang || '').split('-')[0] === 'vi';
const levelForIndex = (index: number): LearningMediaItem['level'] => index === 0 ? 'easy' : index === 1 ? 'medium' : 'hard';

function levelLabel(level: 'easy' | 'medium' | 'hard', uiLang?: string) {
  if (!isVi(uiLang)) return level;
  return level === 'easy' ? 'dễ' : level === 'medium' ? 'vừa' : 'khó';
}

export function getCuratedMedia(language: string, uiLang = 'en'): LearningMediaItem[] {
  const cfg = languageQueries[language] || languageQueries.en;
  const vi = isVi(uiLang);
  const songReasons = vi
    ? ['Lời rõ, phù hợp nghe chép và shadowing.', 'Tốt để luyện nhịp điệu, nối âm và cụm diễn đạt.', 'Tốc độ cao hơn để luyện nghe thực tế.']
    : ['Clear lyrics for dictation and shadowing.', 'Good for rhythm, connected speech, and common expressions.', 'Higher speed listening practice.'];
  const podcastReasons = vi
    ? ['Đầu vào chậm cho người mới.', 'Nội dung thân thiện với người học.', 'Hội thoại thật và tốc độ gần tự nhiên.']
    : ['Slow input for beginners.', 'Natural learner-friendly listening.', 'Real conversation and native-speed exposure.'];

  const songs = cfg.songs.map((query, index) => ({
    id: `${language}_song_${index}`,
    language,
    kind: 'song' as const,
    title: vi ? `${cfg.label}: bộ bài nhạc luyện nghe ${index + 1}` : `${cfg.label} listening song set ${index + 1}`,
    creator: vi ? 'Tìm kiếm Spotify' : 'Spotify search',
    level: levelForIndex(index),
    reason: songReasons[index],
    searchQuery: query,
    spotifyUrl: spotifySearchUrl(query),
  }));
  const podcasts = cfg.podcasts.map((query, index) => ({
    id: `${language}_podcast_${index}`,
    language,
    kind: 'podcast' as const,
    title: vi ? `${cfg.label}: podcast luyện nghe ${index + 1}` : `${cfg.label} podcast practice ${index + 1}`,
    creator: vi ? 'Tìm kiếm Spotify' : 'Spotify search',
    level: levelForIndex(index),
    reason: podcastReasons[index],
    searchQuery: query,
    spotifyUrl: spotifySearchUrl(query),
  }));
  return [...songs, ...podcasts];
}

export function getSpotifyClientId() {
  return (import.meta.env.VITE_SPOTIFY_CLIENT_ID || '').trim();
}

export function isSpotifyConfigured() {
  return Boolean(getSpotifyClientId());
}

export async function startSpotifyPkceLogin() {
  const clientId = getSpotifyClientId();
  if (!clientId) return { error: 'missing-client-id' };
  const redirectUri = `${window.location.origin}/app/music`;
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(64))).map((x) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[x % 66]).join('');
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  sessionStorage.setItem('spotify_pkce_verifier', verifier);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'user-read-private user-read-email',
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: redirectUri,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return {};
}

export function buildListeningPlan(language: string, uiLang = 'en') {
  const media = getCuratedMedia(language, uiLang);
  if (isVi(uiLang)) {
    return [
      { week: 1, task: 'Nghe 1 bài dễ mỗi ngày. Đọc điệp khúc và shadow 3 dòng.', media: media.filter((m) => m.kind === 'song' && m.level === 'easy').slice(0, 1) },
      { week: 2, task: 'Nghe podcast nhập môn để nắm ý chính. Ghi lại 5 từ bạn nghe được.', media: media.filter((m) => m.kind === 'podcast' && m.level === 'easy').slice(0, 1) },
      { week: 3, task: 'Dùng bài hát tốc độ vừa. Đánh dấu nối âm và lặp lại thành tiếng.', media: media.filter((m) => m.kind === 'song' && m.level === 'medium').slice(0, 1) },
      { week: 4, task: 'Thử clip podcast tốc độ tự nhiên và tóm tắt bằng tiếng mẹ đẻ.', media: media.filter((m) => m.kind === 'podcast' && m.level !== 'easy').slice(0, 2) },
    ];
  }
  return [
    { week: 1, task: 'Listen to 1 easy song daily. Read the chorus and shadow 3 lines.', media: media.filter((m) => m.kind === 'song' && m.level === 'easy').slice(0, 1) },
    { week: 2, task: 'Listen to a beginner podcast for gist. Write 5 words you caught.', media: media.filter((m) => m.kind === 'podcast' && m.level === 'easy').slice(0, 1) },
    { week: 3, task: 'Use medium-speed songs. Mark connected speech and repeat aloud.', media: media.filter((m) => m.kind === 'song' && m.level === 'medium').slice(0, 1) },
    { week: 4, task: 'Try native-speed podcast clips and summarize in your native language.', media: media.filter((m) => m.kind === 'podcast' && m.level !== 'easy').slice(0, 2) },
  ];
}

export function getMediaLevelLabel(level: 'easy' | 'medium' | 'hard', uiLang?: string) {
  return levelLabel(level, uiLang);
}
