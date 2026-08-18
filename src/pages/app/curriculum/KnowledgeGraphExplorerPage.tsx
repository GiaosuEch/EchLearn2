import { Brain } from 'lucide-react';
import PageShell from '../../PageShell';
import { NeuralKnowledgeGraphCanvas } from '../../../components/curriculum/NeuralKnowledgeGraphCanvas';

export default function KnowledgeGraphExplorerPage() {
  return (
    <PageShell
      title="Neural Knowledge Graph"
      description="Mạng lưới tri thức Bayesian & Bản đồ suy giảm trí nhớ FSRS v5"
      icon={<Brain size={20} />}
      backTo="/app"
    >
      <main className="max-w-6xl mx-auto space-y-6 pb-24">
        {/* Header Overview Card */}
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-500/20">
                Cognitive State Visualization
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                Bản đồ Khớp Nối Tri Thức Đa Tầng
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Mỗi nút đại diện cho một năng lực ngôn ngữ (Ngữ pháp, Từ vựng, Ngữ âm, Ngữ dụng). Đồ thị tự động tính toán xác suất thành thạo Bayesian và cảnh báo suy giảm trí nhớ để tối ưu hóa lộ trình học.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                Đã thành thạo
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                Cần ôn tập (FSRS)
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Neural Canvas */}
        <section>
          <NeuralKnowledgeGraphCanvas />
        </section>
      </main>
    </PageShell>
  );
}
