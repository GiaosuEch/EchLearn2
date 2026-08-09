import { ExternalLink, FileCheck2, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import type { ReactNode } from 'react';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';
import { getDiscordCommunityUrl, getFacebookCommunityUrl } from '../../data/communityLinks';

type TrustPageKind = 'privacy' | 'terms' | 'contact' | 'cookies';

const pageContent: Record<TrustPageKind, { eyebrow: string; title: string; description: string }> = {
  privacy: {
    eyebrow: 'Quyền riêng tư',
    title: 'Dữ liệu học tập thuộc về bạn.',
    description: 'EchLearn chỉ dùng dữ liệu cần thiết để vận hành tài khoản, lưu tiến độ và cá nhân hoá trải nghiệm học.',
  },
  terms: {
    eyebrow: 'Điều khoản sử dụng',
    title: 'Học nghiêm túc, cộng đồng tử tế.',
    description: 'Những nguyên tắc ngắn gọn để mọi người học an toàn, tôn trọng nhau và sử dụng EchLearn đúng mục đích.',
  },
  contact: {
    eyebrow: 'Trung tâm hỗ trợ',
    title: 'Cần hỗ trợ? Nói với đội ngũ ngay.',
    description: 'Chọn kênh cộng đồng phù hợp để báo lỗi, đề xuất tính năng hoặc tìm người học cùng.',
  },
  cookies: {
    eyebrow: 'Dữ liệu trên thiết bị',
    title: 'EchLearn lưu gì trên trình duyệt?',
    description: 'Một phần thiết lập và tiến độ được lưu cục bộ để trải nghiệm không bị gián đoạn khi kết nối chậm.',
  },
};

function TrustNavigation({ current }: { current: TrustPageKind }) {
  const items: Array<{ id: TrustPageKind; label: string; to: string }> = [
    { id: 'privacy', label: 'Riêng tư', to: '/privacy' },
    { id: 'terms', label: 'Điều khoản', to: '/terms' },
    { id: 'cookies', label: 'Dữ liệu thiết bị', to: '/cookies' },
    { id: 'contact', label: 'Liên hệ', to: '/contact' },
  ];

  return (
    <nav aria-label="Thông tin EchLearn" className="flex flex-wrap justify-center gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          aria-current={current === item.id ? 'page' : undefined}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${current === item.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-800'}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function TrustPage({ kind }: { kind: TrustPageKind }) {
  const content = pageContent[kind];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
      <TrustNavigation current={kind} />
      <header className="mx-auto mt-8 max-w-3xl text-center">
        <div className="mx-auto w-fit rounded-3xl bg-emerald-100 p-3 text-emerald-800">
          {kind === 'privacy' ? <LockKeyhole size={28} aria-hidden="true" /> : kind === 'terms' ? <FileCheck2 size={28} aria-hidden="true" /> : kind === 'contact' ? <HeartHandshake size={28} aria-hidden="true" /> : <ShieldCheck size={28} aria-hidden="true" />}
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[.16em] text-emerald-700">{content.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{content.title}</h1>
        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{content.description}</p>
      </header>

      {kind === 'privacy' && <PrivacyContent />}
      {kind === 'terms' && <TermsContent />}
      {kind === 'cookies' && <CookieContent />}
      {kind === 'contact' && <ContactContent />}
    </div>
  );
}

function ContentCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-[0_14px_35px_rgba(94,55,16,.07)] sm:p-7"><h2 className="text-lg font-black text-slate-950">{title}</h2><div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div></section>;
}

function PrivacyContent() {
  return <div className="mt-10 grid gap-5 md:grid-cols-2">
    <ContentCard title="Thông tin được dùng để vận hành học tập"><p>Tài khoản, ngôn ngữ bạn chọn, cài đặt hiển thị và tiến độ hoàn thành giúp EchLearn mở đúng bài học tiếp theo và hiển thị đúng trạng thái học của bạn.</p></ContentCard>
    <ContentCard title="Kiểm soát của bạn"><p>Bạn có thể thay đổi hồ sơ công khai trong phần Cài đặt. Khi gặp vấn đề với dữ liệu hoặc tài khoản, hãy liên hệ qua kênh hỗ trợ bên dưới để đội ngũ kiểm tra.</p></ContentCard>
    <ContentCard title="Không bán tiến độ học"><p>EchLearn không biến chuỗi ngày học, kết quả bài tập hay mục tiêu học của bạn thành một sản phẩm để mua bán.</p></ContentCard>
    <ContentCard title="Dịch vụ bên thứ ba"><p>Một số tính năng có thể mở nội dung hoặc cộng đồng bên ngoài EchLearn. Khi rời khỏi ứng dụng, chính sách của nền tảng đó sẽ áp dụng.</p></ContentCard>
  </div>;
}

function TermsContent() {
  return <div className="mt-10 grid gap-5 md:grid-cols-2">
    <ContentCard title="Dùng để học và hỗ trợ nhau"><p>Không spam, quấy rối, mạo danh hoặc đăng nội dung gây hại trong nhóm học và các kênh cộng đồng liên kết.</p></ContentCard>
    <ContentCard title="Nội dung học"><p>Hãy dùng nội dung trong EchLearn cho việc học cá nhân. Không sao chép hoặc phân phối lại nội dung khi chưa có quyền phù hợp.</p></ContentCard>
    <ContentCard title="Tính năng đang phát triển"><p>Một số tính năng AI, tích hợp âm thanh hoặc cộng đồng có thể thay đổi khi đang hoàn thiện. EchLearn sẽ không mô tả kết quả chưa được xác thực như một cam kết đầu ra.</p></ContentCard>
    <ContentCard title="Báo lỗi và vi phạm"><p>Nếu thấy lỗi, nội dung không phù hợp hoặc hành vi gây hại, hãy dùng kênh hỗ trợ để đội ngũ có thể xem xét và xử lý.</p></ContentCard>
  </div>;
}

function CookieContent() {
  return <div className="mt-10 grid gap-5 md:grid-cols-2">
    <ContentCard title="Lưu cục bộ để không mất nhịp"><p>Trình duyệt có thể lưu phiên đăng nhập, lựa chọn giao diện, cài đặt học và tiến độ ngắn hạn để bạn tiếp tục học sau khi tải lại trang.</p></ContentCard>
    <ContentCard title="Bạn có thể xoá"><p>Bạn có thể xoá dữ liệu trang web trong phần cài đặt của trình duyệt. Việc đó có thể đặt lại một số thiết lập cục bộ; dữ liệu đã đồng bộ sẽ phụ thuộc vào trạng thái tài khoản của bạn.</p></ContentCard>
  </div>;
}

function ContactContent() {
  const channels = [
    { title: 'Cộng đồng Discord', description: 'Báo lỗi, đề xuất tính năng và tìm nhóm học nhanh.', href: getDiscordCommunityUrl(), color: 'bg-violet-600 hover:bg-violet-700' },
    { title: 'Hỗ trợ qua Facebook', description: 'Gửi tin nhắn khi bạn cần đội ngũ kiểm tra tài khoản hoặc trải nghiệm.', href: getFacebookCommunityUrl(), color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return <div className="mt-10 grid items-center gap-6 md:grid-cols-[1fr_.7fr]">
    <div className="space-y-4">
      {channels.map((channel) => <a key={channel.title} href={channel.href} target="_blank" rel="noopener noreferrer" className={`group block rounded-3xl p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5 ${channel.color}`}><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-black">{channel.title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/85">{channel.description}</p></div><ExternalLink className="shrink-0" size={20} aria-hidden="true" /></div></a>)}
      <p className="px-1 text-xs leading-5 text-slate-500">Để xử lý nhanh, hãy kèm ảnh màn hình, đường dẫn trang và thiết bị/trình duyệt bạn đang dùng.</p>
    </div>
    <aside className="rounded-[2rem] border border-emerald-100 bg-[#f2fbf4] px-6 py-8 text-center"><EchBuriAnimated state="welcome" size={170} className="mx-auto" /><h2 className="mt-4 text-xl font-black text-slate-950">Ech Buri đang nghe đây.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Bạn không phải tự xoay xở khi trải nghiệm gặp trục trặc.</p></aside>
  </div>;
}
