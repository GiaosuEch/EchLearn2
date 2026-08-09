import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (relativePath: string) => readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

const componentPath = 'src/components/mascot/EchBuriAnimated.tsx';

test('EchBuriAnimated exposes the full feedback state set with motion safeguards', async () => {
  const component = await source(componentPath);

  assert.match(component, /'idle' \| 'welcome' \| 'success' \| 'incorrect' \| 'thinking' \| 'cheering' \| 'listening' \| 'streak'/);
  assert.match(component, /useReducedMotion/);
  assert.match(component, /willChange/);
  assert.doesNotMatch(component, /linearGradient|radialGradient|<img/);
});

test('the mascot stays a self-contained vector with no raster or external artwork', async () => {
  const component = await source(componentPath);

  assert.match(component, /<svg viewBox="0 0 240 240"/);
  assert.doesNotMatch(component, /<image|url\(|\.png|\.gif|\.svg'|lottie/i);
});

test('animation is gated on both the user setting and the system reduced-motion preference', async () => {
  const component = await source(componentPath);

  assert.match(component, /mascotAnimation/);
  assert.match(component, /motionEnabled = animate && !reducedMotion && mascotAnimation/);
});

test('Ech Buri has a distinct streak state without raster art', async () => {
  const component = await source(componentPath);

  assert.match(component, /streak: \{ y:/);
  assert.match(component, /state === 'streak'/);
  assert.doesNotMatch(component, /<image|\.png|\.gif|lottie/i);
});

test('entitlement activation uses one checked server RPC instead of unchecked client writes', async () => {
  const [entitlements, store] = await Promise.all([
    source('src/services/entitlementService.ts'),
    source('src/stores/entitlementStore.ts'),
  ]);

  assert.match(entitlements, /const \{ error \} = await supabase\.rpc\('activate_course_entitlement'/);
  assert.match(entitlements, /reason: 'remote-sync-failed'/);
  assert.doesNotMatch(entitlements, /\.from\('course_entitlements'\)\.upsert/);
  assert.doesNotMatch(entitlements, /\.from\('profiles'\)\.update/);
  assert.match(store, /writeLocalProFlags\(input\.userId, resolveProAccess/);
});

test('remote entitlement reads wait for the matching authenticated session', async () => {
  const [entitlements, pricing] = await Promise.all([
    source('src/services/entitlementService.ts'),
    source('src/pages/app/PricingPage.tsx'),
  ]);

  assert.match(entitlements, /supabase\.auth\.getSession\(\)/);
  assert.match(entitlements, /!session \|\| session\.user\.id !== userId/);
  assert.match(pricing, /if \(isAuthenticated && user\?\.id\) \{/);
  assert.doesNotMatch(pricing, /user\?\.id \|\| \(typeof window !== 'undefined' \? localStorage\.getItem/);
});

test('landing presents a concrete eight-minute first win instead of a design direction', async () => {
  const [hero, landing] = await Promise.all([
    source('src/components/landing/CinematicHero.tsx'),
    source('src/pages/public/LandingPage.tsx'),
  ]);

  assert.match(hero, /Mỗi ngày 8 phút,[\s\S]*tiếng Anh tiến một bước/);
  assert.match(hero, /Bắt đầu 8 phút đầu tiên/);
  assert.match(hero, /isAuthenticated \? 'Vào học' : 'Bắt đầu miễn phí'/);
  assert.doesNotMatch(hero, /Năng lượng cộng đồng|Chọn hướng này/);
  assert.match(landing, /Chọn mục tiêu/);
  assert.match(landing, /Hoàn thành 8 phút/);
  assert.match(landing, /Nhận bước tiếp theo cho ngày mai/);
});

test('first-win progress uses an owner-scoped persistence service', async () => {
  const service = await source('src/services/firstWinService.ts');

  assert.match(service, /export type FirstWinGoal = 'habit' \| 'speaking' \| 'ielts'/);
  assert.match(service, /supabase\.auth\.getSession\(\)/);
  assert.match(service, /session\.user\.id !== userId/);
  assert.match(service, /first_win_progress/);
});

test('community writes do not create local phantom records when Supabase is configured', async () => {
  const [service, chat] = await Promise.all([
    source('src/services/communitySupabaseService.ts'),
    source('src/pages/app/community/ChatRoomsPage.tsx'),
  ]);

  assert.match(service, /if \(error\) throw new Error\(error\.message\);\s*return;/);
  assert.match(service, /const \{ data: room, error: roomError \}/);
  assert.match(service, /if \(memberError\)/);
  assert.match(chat, /setMessages\(prev => prev\.filter\(message => message\.id !== optimisticId\)\)/);
  assert.match(chat, /setInputText\(content\)/);
});

test('the chat room loader preserves a user-selected room while refreshing the list', async () => {
  const chat = await source('src/pages/app/community/ChatRoomsPage.tsx');

  assert.match(chat, /setActiveChat\(currentChat => currentChat \?\? rooms\[0\]\.id\)/);
  assert.doesNotMatch(chat, /rooms\.length > 0 && !activeChat/);
});

test('pricing updates use the admin RPC and restore the displayed price when a remote save fails', async () => {
  const [pricingService, pricingStore] = await Promise.all([
    source('src/services/pricingService.ts'),
    source('src/stores/pricingStore.ts'),
  ]);

  assert.match(pricingService, /const \{ error \} = await supabase\.rpc\('admin_set_plan_price'/);
  assert.match(pricingService, /if \(error\) throw new Error\(error\.message\)/);
  assert.doesNotMatch(pricingService, /\.from\('plan_prices'\)\.upsert/);
  assert.match(pricingStore, /\? \{ prices: current, syncError: result\.reason \}/);
});

test('new installs enable the companion while reduced motion remains a hard stop', async () => {
  const [store, component] = await Promise.all([
    source('src/stores/appStore.ts'),
    source(componentPath),
  ]);

  assert.match(store, /mascotAnimation: true/);
  assert.match(component, /motionEnabled = animate && !reducedMotion && mascotAnimation/);
});

test('idle breathing and blinking loop while feedback states resolve once', async () => {
  const component = await source(componentPath);

  assert.match(component, /duration: 3\.2[\s\S]*repeat: Infinity/);
  assert.match(component, /duration: 5\.4[\s\S]*repeat: Infinity/);
  assert.match(component, /scaleY: \[1, 1, 0\.12, 1\]/);
  assert.match(component, /success: \{ y: \[0, -14, 0\], rotate: \[0, -3, 3, 0\]/);
});

test('the mascot animates transform and opacity only so it stays on the compositor', async () => {
  const component = await source(componentPath);

  const animatedProperties = [...component.matchAll(/^\s{2}(?:idle|success):/gm)];
  assert.ok(animatedProperties.length >= 3, 'expects idle and success variants for body, eyes and book');
  assert.doesNotMatch(component, /(?:width|height|top|left|margin|boxShadow|filter):\s*\[/);
});

test('the lesson player maps answer progress and outcomes to one shared mascot state', async () => {
  const lesson = await source('src/pages/app/LessonPlayerPage.tsx');

  assert.match(lesson, /const mascotState(?:: EchBuriAnimationState)? = showResult/);
  assert.match(lesson, /isAudioExercise = exercise\?\.type === 'listen-choose' \|\| Boolean\(exercise\?\.audioText\)/);
  assert.match(lesson, /selected \|\| userInput \? 'thinking' : isAudioExercise \? 'listening' : 'idle'/);
  assert.match(lesson, /state=\{mascotState\}/);
});

test('the static mascot component stays available for the screens that still use it', async () => {
  const mascot = await source('src/components/mascot/Mascot.tsx');

  assert.match(mascot, /export/);
});

test('the public community preview uses clear Vietnamese value instead of unverified audience counts', async () => {
  const pages = await source('src/pages/app/AllPages.tsx');
  const preview = pages.slice(pages.indexOf('export function CommunityPreviewPage'));

  assert.match(preview, /Học đều hơn khi có người đồng hành/);
  assert.match(preview, /Nhóm học theo mục tiêu/);
  assert.match(preview, /Bắt đầu cùng cộng đồng/);
  assert.doesNotMatch(preview, /Join Our Community|10,000\+|Active Learners|Join Free/);
});

test('the reset password flow uses the EchLearn brand and an accessible email field', async () => {
  const [translations, resetPage] = await Promise.all([
    source('src/i18n/phase129Text.ts'),
    source('src/pages/auth/ForgotPasswordPage.tsx'),
  ]);

  assert.doesNotMatch(translations, /Ech Lern/);
  assert.match(translations, /EchLearn/);
  assert.match(resetPage, /htmlFor="reset-email"/);
  assert.match(resetPage, /id="reset-email"/);
  assert.match(resetPage, /autoComplete="email"/);
  assert.match(resetPage, /role="alert"/);
});

test('creating a study group persists through the service before the UI confirms it', async () => {
  const groups = await source('src/pages/app/community/StudyGroupsPage.tsx');

  assert.match(groups, /await communitySupabaseService\.createStudyGroup/);
  assert.match(groups, /await loadGroups\(\)/);
  assert.match(groups, /createError/);
  assert.doesNotMatch(groups, /Fallback static creation/);
});

test('public information pages keep their text legible on the light public surface', async () => {
  const pages = await source('src/pages/app/AllPages.tsx');
  const about = pages.slice(pages.indexOf('export function AboutPage'), pages.indexOf('export function LanguagesPublicPage'));
  const languages = pages.slice(pages.indexOf('export function LanguagesPublicPage'), pages.indexOf('export function IELTSProgramPage'));
  const ielts = pages.slice(pages.indexOf('export function IELTSProgramPage'), pages.indexOf('export function CommunityPreviewPage'));

  assert.match(about, /text-slate-950/);
  assert.doesNotMatch(about, /text-4xl font-bold text-white/);
  assert.match(languages, /text-slate-950 text-center/);
  assert.match(languages, /text-slate-950 text-lg truncate/);
  assert.match(ielts, /text-4xl font-bold text-slate-950/);
  assert.doesNotMatch(ielts, /font-semibold text-white/);
});

test('quiz center routes every challenge to a real learning destination', async () => {
  const pages = await source('src/pages/app/AllPages.tsx');
  const quiz = pages.slice(pages.indexOf('export function QuizCenterPage'), pages.indexOf('export function FlashcardsPage'));

  assert.match(quiz, /Thử thách nhanh/);
  assert.match(quiz, /to: '\/app\/speed-quiz'/);
  assert.match(quiz, /<Link key=\{quiz\.title\} to=\{quiz\.to\}/);
  assert.doesNotMatch(quiz, /Best:|questions Â·|cursor-pointer/);
});

test('voice room creation surfaces a persistence failure instead of opening a phantom room', async () => {
  const [service, rooms] = await Promise.all([
    source('src/services/communitySupabaseService.ts'),
    source('src/pages/app/community/VoiceRoomsPage.tsx'),
  ]);

  assert.match(service, /const \{ data, error \} = await supabase\.from\('voice_rooms'\)\.insert/);
  assert.match(service, /if \(error\) throw new Error\(error\.message\)/);
  assert.match(rooms, /createError/);
  assert.match(rooms, /await communitySupabaseService\.createVoiceRoom/);
  assert.match(rooms, /Chưa thể tạo phòng lúc này/);
  assert.match(rooms, /htmlFor="voice-room-topic"/);
  assert.match(rooms, /id="voice-room-topic"/);
});

test('the login form labels credentials and exposes errors to assistive technology', async () => {
  const login = await source('src/pages/auth/LoginPage.tsx');

  assert.match(login, /htmlFor="login-email"/);
  assert.match(login, /id="login-email"/);
  assert.match(login, /autoComplete="email"/);
  assert.match(login, /htmlFor="login-password"/);
  assert.match(login, /id="login-password"/);
  assert.match(login, /autoComplete="current-password"/);
  assert.match(login, /role="alert"/);
  assert.match(login, /aria-label=\{showPassword \? 'Ẩn mật khẩu' : 'Hiện mật khẩu'\}/);
});
