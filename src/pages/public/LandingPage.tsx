import { ArrowRight, BookOpen, Headphones, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { CinematicHero } from '../../components/landing/CinematicHero';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const capabilities = [
  {
    icon: BookOpen,
    title: 'Lộ trình học có cấu trúc',
    description: 'Theo dõi mục tiêu, quay lại nội dung cần ôn và học theo kế hoạch phù hợp với bạn.',
  },
  {
    icon: Headphones,
    title: 'Luyện theo từng kỹ năng',
    description: 'Tập trung vào nghe, nói, đọc, viết và từ vựng bằng các bài luyện riêng cho từng mục tiêu.',
  },
  {
    icon: Sparkles,
    title: 'Không gian ôn luyện IELTS',
    description: 'Khám phá các bài luyện IELTS Academic và ghi nhận tiến độ học của riêng bạn.',
  },
];

export default function LandingPage() {
  return (
    <main id="main-content" className="overflow-x-hidden bg-slate-50 text-slate-900">
      <section id="meet"><CinematicHero /></section>

      <section id="listen" className="mx-auto max-w-6xl border-t border-slate-200 px-5 py-16 sm:px-8 lg:py-24">
        <div id="speak" className="mx-auto max-w-2xl space-y-4 text-center">
          <Badge variant="default" className="gap-2 px-3 py-1.5"><Sparkles size={14} aria-hidden="true" /><span>CÁCH HỌC TẠI ECHLEARN</span></Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Từng bước nhỏ, một kế hoạch rõ ràng</h2>
          <p className="text-base leading-7 text-slate-600">Chọn kỹ năng bạn muốn cải thiện và xây dựng nhịp học đều đặn theo cách phù hợp với mình.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-slate-200 bg-white p-6 shadow-none transition-colors hover:border-emerald-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={22} aria-hidden="true" /></div>
              <CardHeader className="space-y-2 p-0 pt-5"><CardTitle className="text-lg">{title}</CardTitle><CardDescription className="leading-6">{description}</CardDescription></CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="begin" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 lg:pb-24">
        <div id="return" className="rounded-2xl bg-emerald-700 px-6 py-10 text-center text-white sm:px-12 sm:py-14">
          <div className="mx-auto max-w-2xl space-y-5">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Bắt đầu từ mục tiêu của bạn</h2>
            <p className="text-base leading-7 text-emerald-50">Chọn kỹ năng muốn cải thiện và xây dựng thói quen học tập bền vững.</p>
            <div className="pt-2"><Link to="/app"><Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50">Khám phá không gian học <ArrowRight size={18} /></Button></Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}
