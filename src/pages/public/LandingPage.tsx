import { ArrowRight, BookOpen, Headphones, Mic, PenTool, Target, Users, Sparkles, CheckCircle2, Globe2, Trophy, Award } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { CinematicHero } from '../../components/landing/CinematicHero';
import { getFlagUrl } from '../../data/languages';
import { useAuthStore } from '../../stores/authStore';

/* ── 6 Core Capabilities ── */
const features = [
  {
    icon: BookOpen,
    badge: 'Cấu trúc bài học',
    title: 'Lộ trình học có cấu trúc',
    description: 'Ba giai đoạn 30 ngày với mục tiêu và điểm kiểm tra rõ ràng, để bạn luôn biết mình đang ở đâu.',
    size: 'lg:col-span-2',
  },
  {
    icon: Target,
    badge: 'Bốn kỹ năng',
    title: 'Luyện theo từng kỹ năng',
    description: 'Bài luyện tách riêng cho Nghe, Nói, Đọc và Viết để bạn tập trung vào phần cần cải thiện.',
    size: 'lg:col-span-1',
  },
  {
    icon: Headphones,
    badge: 'Luyện thi IELTS',
    title: 'Không gian ôn luyện IELTS',
    description: 'Bài luyện IELTS Academic tham chiếu band descriptors được công bố công khai.',
    size: 'lg:col-span-1',
  },
  {
    icon: Mic,
    badge: 'Luyện nói',
    title: 'Luyện phát âm & Shadowing',
    description: 'Nhận xét về phát âm và ngữ điệu ngay sau khi ghi âm, kèm gợi ý từ vựng thay thế.',
    size: 'lg:col-span-2',
  },
  {
    icon: PenTool,
    badge: 'Sửa lỗi',
    title: 'Viết Essay & Sổ tay lỗi sai',
    description: 'Bài viết được phân tích lỗi ngữ pháp và từ vựng, lưu lại vào sổ tay ôn tập theo lịch SRS.',
    size: 'lg:col-span-2',
  },
  {
    icon: Users,
    badge: 'Cộng đồng học tập',
    title: 'Thách đấu & Bảng xếp hạng',
    description: 'Thi đấu từ vựng Speed Quiz và theo dõi thứ hạng cùng những người học khác.',
    size: 'lg:col-span-1',
  },
];

/* ── 13 Flag Languages Showcase ── */
const showcaseLanguages = [
  { code: 'en', name: 'English', nativeName: 'Tiếng Anh' },
  { code: 'fr', name: 'French', nativeName: 'Tiếng Pháp' },
  { code: 'de', name: 'German', nativeName: 'Tiếng Đức' },
  { code: 'zh', name: 'Chinese', nativeName: 'Tiếng Trung' },
  { code: 'ja', name: 'Japanese', nativeName: 'Tiếng Nhật' },
  { code: 'ko', name: 'Korean', nativeName: 'Tiếng Hàn' },
  { code: 'es', name: 'Spanish', nativeName: 'Tiếng Tây Ban Nha' },
  { code: 'it', name: 'Italian', nativeName: 'Tiếng Ý' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Tiếng Bồ Đào Nha' },
  { code: 'ru', name: 'Russian', nativeName: 'Tiếng Nga' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'Tiếng Thái' },
  { code: 'ar', name: 'Arabic', nativeName: 'Tiếng Ả Rập' },
];

/* ── What the product actually ships — no learner counts or outcome rates ── */
const stats = [
  { value: '13', label: 'Ngôn ngữ có sẵn trong ứng dụng', icon: Globe2 },
  { value: '4', label: 'Kỹ năng luyện riêng: Nghe, Nói, Đọc, Viết', icon: Award },
  { value: '90', label: 'Ngày trong lộ trình, chia ba giai đoạn', icon: Trophy },
];

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const fadeUp = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.5, ease: 'easeOut' as const },
      };

  return (
    <div className="overflow-x-hidden bg-[var(--ech-bg)] text-[var(--ech-text)]">

      {/* ── Section 1: Hero split screen with Bento Grid ── */}
      <section id="meet">
        <CinematicHero />
      </section>

      {/* ── Section 2: Quantitative Stats Bento Bar ── */}
      <section id="listen" className="border-y border-[var(--ech-hairline)] bg-[var(--ech-surface)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <dl id="speak" className="grid grid-cols-1 divide-[var(--ech-hairline)] sm:grid-cols-3 sm:divide-x">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                className="group flex flex-col items-center px-4 py-10 text-center transition-colors duration-200 hover:bg-[var(--ech-surface-2)]/60"
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  className="mb-3 text-[var(--ech-text-muted)] transition-colors duration-200 group-hover:text-[var(--ech-action)]"
                />
                <dd className="text-3xl font-bold tracking-[-0.03em] tabular-nums text-[var(--ech-text)] sm:text-4xl">
                  {value}
                </dd>
                <dt className="mt-2 max-w-[22ch] text-xs leading-relaxed text-[var(--ech-text-muted)]">
                  {label}
                </dt>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Section 3: Asymmetrical Capabilities Bento Grid ── */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Phương pháp học EchLearn</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Từng bước nhỏ, kế hoạch rõ ràng
          </h2>
          <p className="text-base leading-relaxed text-[var(--ech-text-muted)] max-w-[60ch] mx-auto">
            Học tập theo cấu trúc khoa học, ôn luyện bằng AI và đo lường tiến bộ rõ ràng sau từng giai đoạn.
          </p>
        </motion.div>

        {/* Asymmetrical Bento Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, badge, title, description, size }, i) => (
            <motion.div
              key={title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-3xl border border-[var(--ech-border)] bg-[var(--ech-surface)]/70 p-7 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 ${size}`}
            >
              {/* Subtle Card Corner Glow */}
              <div aria-hidden="true" className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--ech-text)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ech-text-muted)]">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 4: 13 National Flags Showcase Strip ── */}
      <section id="languages" className="border-y border-[var(--ech-border)] bg-[var(--ech-surface-2)]/60 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div {...fadeUp} className="text-center space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Đa dạng ngôn ngữ</span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Chọn ngôn ngữ bạn muốn chinh phục
            </h2>
            <p className="text-sm text-[var(--ech-text-muted)] max-w-[50ch] mx-auto">
              13 ngôn ngữ, mỗi ngôn ngữ có lộ trình riêng theo cấp độ và bài luyện cho cả bốn kỹ năng.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {showcaseLanguages.map(({ code, name, nativeName }) => (
              <Link
                key={code}
                to={isAuthenticated ? '/app/languages' : '/register'}
                className="group flex flex-col items-center text-center rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)]/80 p-4 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative mb-3">
                  <img
                    src={getFlagUrl(code)}
                    alt={`${name} flag`}
                    className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-[var(--ech-surface)] group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px]">
                    ✓
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--ech-text)] group-hover:text-emerald-600 transition-colors">{name}</p>
                <p className="text-[10px] text-[var(--ech-text-muted)] mt-0.5">{nativeName}</p>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 5: High-Converting High-End CTA Banner ── */}
      <section id="begin" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <motion.div
          id="return"
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-emerald-700 px-6 py-16 text-center text-white sm:px-14 sm:py-20"
        >
          {/* Single soft light source, consistent with the hero aura */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md border border-white/20">
              <CheckCircle2 size={13} className="text-emerald-300" />
              <span>Dùng thử không cần thẻ tín dụng</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Bắt đầu lộ trình học ngay hôm nay
            </h2>
            <p className="text-base leading-relaxed text-emerald-100 max-w-[55ch] mx-auto">
              Xây dựng thói quen học đều đặn mỗi ngày cùng Ech Buri, bắt đầu từ kỹ năng bạn muốn cải thiện nhất.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/app' : '/register'}
                className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-800 font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-sm inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
              >
                <span>{isAuthenticated ? 'Vào học (Dashboard)' : 'Bắt đầu học miễn phí'}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto bg-emerald-700/50 hover:bg-emerald-700 text-white border border-emerald-400/30 font-semibold py-4 px-6 rounded-xl transition-all text-sm inline-flex items-center justify-center gap-1.5 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
              >
                <span>Xem bảng giá gói VIP</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
