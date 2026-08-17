import { useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, TrendingUp } from 'lucide-react';

interface CriteriaScore {
  name: string;
  band: number;
  weight: number;
  strengths: string[];
  recommendations: string[];
}

export function IELTSDiagnosticScoreCard({
  text,
  minWords = 250,
  grammarBand = 6.0
}: {
  text: string;
  minWords?: number;
  grammarBand?: number;
}) {
  const analysis = useMemo(() => {
    const words = text.trim().toLowerCase().match(/[\p{L}\p{N}'’]+/gu) || [];
    const wordCount = words.length;
    const sentences = text.split(/[.?!]+/).map(s => s.trim()).filter(Boolean);
    const sentenceCount = sentences.length;

    // 1. Lexical Resource (AWL Academic Word List check)
    const academicWords = new Set([
      'furthermore', 'nevertheless', 'consequently', 'substantial', 'phenomenon',
      'diminish', 'predominantly', 'underlying', 'implication', 'perspective',
      'demonstrate', 'facilitate', 'crucial', 'comprehensive', 'sustainable'
    ]);
    const academicCount = words.filter(w => academicWords.has(w)).length;
    const uniqueWords = new Set(words).size;
    const ttr = wordCount > 0 ? uniqueWords / wordCount : 0;
    
    let lrBand = 5.0;
    if (wordCount >= minWords * 0.8) {
      if (academicCount >= 4 && ttr > 0.45) lrBand = 7.5;
      else if (academicCount >= 2 && ttr > 0.38) lrBand = 6.5;
      else lrBand = 5.5;
    }

    // 2. Coherence & Cohesion (CC)
    const connectors = text.match(/\b(moreover|however|in addition|therefore|on the other hand|firstly|secondly|finally|in conclusion)\b/gi) || [];
    let ccBand = 5.0;
    if (wordCount >= minWords * 0.7) {
      if (connectors.length >= 4 && sentenceCount >= 5) ccBand = 7.0;
      else if (connectors.length >= 2) ccBand = 6.0;
      else ccBand = 5.5;
    }

    // 3. Task Response (TR)
    let trBand = 5.0;
    if (wordCount >= minWords) {
      trBand = sentenceCount >= 8 ? 7.0 : 6.0;
    } else if (wordCount >= minWords * 0.7) {
      trBand = 5.5;
    }

    const graBand = grammarBand;
    const overallBand = Number(((trBand + ccBand + lrBand + graBand) / 4).toFixed(1));

    const criteria: CriteriaScore[] = [
      {
        name: 'Task Response (TR)',
        band: trBand,
        weight: 25,
        strengths: wordCount >= minWords ? ['Đạt yêu cầu độ dài tối thiểu', 'Bố cục bài đủ các phần chính'] : ['Đã bắt đầu trình bày quan điểm'],
        recommendations: wordCount < minWords ? [`Cần viết thêm tối thiểu ${minWords - wordCount} từ để không bị trừ điểm TR.`] : ['Thêm dẫn chứng thực tế cho luận điểm chính.']
      },
      {
        name: 'Coherence & Cohesion (CC)',
        band: ccBand,
        weight: 25,
        strengths: connectors.length >= 2 ? [`Đã sử dụng ${connectors.length} từ nối liên kết logic`] : ['Ý tưởng có tính tiếp nối cơ bản'],
        recommendations: connectors.length < 3 ? ['Bổ sung các từ nối học thuật (Furthermore, In contrast, Consequently).'] : ['Tránh lạm dụng từ nối cơ bản (And, But) ở đầu câu.']
      },
      {
        name: 'Lexical Resource (LR)',
        band: lrBand,
        weight: 25,
        strengths: academicCount > 0 ? [`Sử dụng ${academicCount} từ vựng học thuật C1/C2`] : ['Từ vựng giao tiếp tự nhiên'],
        recommendations: ttr < 0.4 ? ['Đa dạng hóa vốn từ, tránh lặp lại từ khóa quá 3 lần.'] : ['Tích hợp thêm collocations nâng cao.']
      },
      {
        name: 'Grammar Range & Accuracy (GRA)',
        band: graBand,
        weight: 25,
        strengths: graBand >= 6.5 ? ['Độ sâu cú pháp AST cao, có câu ghép/phức'] : ['Cấu trúc câu đơn chuẩn xác'],
        recommendations: graBand < 7.0 ? ['Tăng tỷ lệ câu điều kiện, mệnh đề quan hệ và đảo ngữ.'] : ['Duy trì tính chính xác của mạo từ (a/an/the).']
      }
    ];

    return {
      wordCount,
      sentenceCount,
      overallBand,
      criteria
    };
  }, [text, minWords, grammarBand]);

  if (!text.trim()) return null;

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-6">
      {/* Overall Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-500/20">
            IELTS Academic 4-Pillar Diagnostic
          </span>
          <h3 className="text-xl font-black text-slate-100 mt-2 flex items-center gap-2">
            Ước tính Overall Band: <span className="text-2xl text-emerald-400 font-black font-mono">{analysis.overallBand}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dựa trên phân tích hình thái từ, từ nối logic và độ sâu cây cú pháp AST
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800">
          <div className="text-center px-2">
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Từ vựng</span>
            <span className="text-sm font-black text-slate-200">{analysis.wordCount}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="text-center px-2">
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Số câu</span>
            <span className="text-sm font-black text-slate-200">{analysis.sentenceCount}</span>
          </div>
        </div>
      </div>

      {/* 4 Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.criteria.map((crit, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{crit.name}</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-black text-xs font-mono">
                Band {crit.band.toFixed(1)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(crit.band / 9) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-emerald-500"
              />
            </div>

            <div className="text-[11px] space-y-1 text-slate-400">
              {crit.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-emerald-400/90">
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
              {crit.recommendations.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-amber-400/90">
                  <TrendingUp size={12} className="shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
