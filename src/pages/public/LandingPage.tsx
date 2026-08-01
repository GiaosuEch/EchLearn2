import { CinematicHero } from '../../components/landing/CinematicHero';
import { ArrowRight, Brain, Headphones, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function LandingPage() {
  return (
    <main id="main-content" className="overflow-x-hidden bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 text-slate-900 relative">
      {/* Hero Section */}
      <section id="meet">
        <CinematicHero />
      </section>

      {/* Clean Modern Features Grid Section */}
      <section id="listen" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 space-y-12">
        <div id="speak" className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="default" className="py-1.5 px-4">
            <Sparkles size={14} />
            <span>TÍNH NĂNG ĐỘT PHÁ</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Học Tiếng Anh Thông Minh Theo Chuẩn Khoa Học 🧠⚡
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-semibold">
            Lộ trình có kiểm chứng theo ngày, ôn tập ngắt quãng và bài tập theo tình huống thực tế.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              <Brain size={28} />
            </div>
            <CardHeader className="p-0 space-y-2">
              <CardTitle>Lộ Trình Thích Ứng AI</CardTitle>
              <CardDescription>
                Tự động phân tích điểm yếu phát âm và từ vựng để tạo bài học tối ưu riêng cho từng học viên mỗi ngày.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-2xl font-bold">
              <Headphones size={28} />
            </div>
            <CardHeader className="p-0 space-y-2">
              <CardTitle>Phản Xạ Giọng Nói AI 24/7</CardTitle>
              <CardDescription>
                Luyện phát âm từng âm tiết IPA chuẩn xác với nhận dạng giọng nói AI tức thì, giúp bạn tự tin giao tiếp.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl font-bold">
              <Trophy size={28} />
            </div>
            <CardHeader className="p-0 space-y-2">
              <CardTitle>Luyện Thi IELTS Academic</CardTitle>
              <CardDescription>
                Bộ đề thi thật Cambridge, chấm điểm bài viết Writing Task 1 & 2 chi tiết 4 tiêu chí và dự đoán Band score chính xác.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Clean Call To Action Section */}
      <section id="begin" className="py-16 px-6 max-w-7xl mx-auto mb-16">
        <div id="return" className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 z-10 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Sẵn Sàng Chinh Phục Tiếng Anh Ngay Hôm Nay? 🐸⚡</h2>
            <p className="text-emerald-100 text-sm sm:text-base font-medium">Gia nhập cùng hơn 50,000+ học viên và trải nghiệm lộ trình học tập thích ứng miễn phí.</p>
            <div className="pt-4 flex justify-center">
              <Link to="/app">
                <Button size="lg" className="uppercase tracking-wider">
                  <span>🚀 BẮT ĐẦU HỌC MIỄN PHÍ</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
