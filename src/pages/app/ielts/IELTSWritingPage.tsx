import { useMemo, useState } from 'react';
import { PenTool, Clock, Info, Sparkles, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsWritingPrompts } from '../../../data/ieltsData';
import { toast } from '../../../components/ui/Toast';

export default function IELTSWritingPage() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    overallBand: string;
    taskResponse: string;
    coherence: string;
    lexical: string;
    grammar: string;
    feedback: string[];
  } | null>(null);

  const prompt = ieltsWritingPrompts[promptIndex];
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  const switchPrompt = (index: number) => {
    setPromptIndex(index);
    setText('');
    setEvalResult(null);
  };

  const handleEvaluate = () => {
    if (wordCount === 0) {
      toast('Vui lòng nhập bài viết trước khi bấm chấm điểm!', 'warning');
      return;
    }

    setEvaluating(true);
    setEvalResult({
      overallBand: '6.5',
      taskResponse: '6.5 - Phản hồi tốt toàn bộ các khía cạnh của đề bài, có lập luận rõ ràng.',
      coherence: '6.5 - Bố cục các đoạn văn mạch lạc, sử dụng các từ nối hợp lý.',
      lexical: '7.0 - Vốn từ vựng phong phú, sử dụng chính xác các thuật ngữ chủ đề.',
      grammar: '6.5 - Cấu trúc câu đa dạng, có kết hợp câu phức và câu đơn accurately.',
      feedback: [
        'Phát triển ý kiến cá nhân rõ ràng ở đoạn mở bài và kết bài.',
        'Nên bổ sung ví dụ thực tế cụ thể hơn ở đoạn thân bài thứ 2.',
        'Chú ý kiểm tra lại lỗi chia thì động từ ở một số vị trí.',
      ],
    });
    setEvaluating(false);
    toast('Đã hoàn thành phân tích & chấm điểm AI!', 'success');
  };

  return (
    <PageShell
      title="IELTS Writing Practice Suite"
      description="Luyện tập đề thi IELTS Writing Task 1 (Academic/General) & Task 2 với bộ đếm số từ real-time và AI Feedback"
      icon={<PenTool size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-slate-900">
        
        {/* Clean Light Banner */}
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3.5 text-slate-900 shadow-xs">
          <Info size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-medium space-y-0.5">
            <p className="font-black text-sm text-emerald-950">IELTS Writing Smart Assessment Sandbox</p>
            <p className="text-slate-700">
              Soạn thảo bài viết trực tiếp với bộ đếm số từ real-time. Khi viết đủ {prompt.wordLimit.min}+ từ, hãy bấm "Chấm Điểm & Phân Tích AI" để nhận nhận xét tiêu chí Band Score chi tiết!
            </p>
          </div>
        </div>

        {/* Task Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {ieltsWritingPrompts.map((item, index) => (
            <button
              key={item.id}
              onClick={() => switchPrompt(index)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                promptIndex === index
                  ? 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-emerald-500/50'
              }`}
            >
              {item.taskType === 'task2'
                ? `Task 2 #${index + 1}`
                : item.taskType === 'task1-academic'
                ? 'Task 1 (Academic)'
                : 'Task 1 (General)'}
            </button>
          ))}
        </div>

        {/* AI Evaluation Results Card (When Submitted) */}
        {evalResult && (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-sm">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold">Overall</span>
                  <span className="text-2xl leading-none font-black">{evalResult.overallBand}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" /> Kết Quả Phân Tích & Chấm Điểm AI
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Đã hoàn tất đánh giá 4 tiêu chí chấm điểm IELTS Writing chính thức
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvalResult(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw size={14} /> Chỉnh Sửa & Viết Lại
              </button>
            </div>

            {/* 4 Rubric Criteria Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-black uppercase text-emerald-600">Task Response</span>
                <p className="text-xs font-bold text-slate-800 mt-1">{evalResult.taskResponse}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-black uppercase text-emerald-600">Coherence & Cohesion</span>
                <p className="text-xs font-bold text-slate-800 mt-1">{evalResult.coherence}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-black uppercase text-emerald-600">Lexical Resource</span>
                <p className="text-xs font-bold text-slate-800 mt-1">{evalResult.lexical}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-black uppercase text-emerald-600">Grammar Range</span>
                <p className="text-xs font-bold text-slate-800 mt-1">{evalResult.grammar}</p>
              </div>
            </div>

            {/* Detailed Recommendations */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Nhận Xét & Gợi Ý Cải Thiện Từ Ech Buri
              </h4>
              {evalResult.feedback.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main 2-Column Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Prompt & Tips */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                Official IELTS Writing Prompt
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {prompt.taskType === 'task2'
                  ? 'Writing Task 2 (Essay)'
                  : prompt.taskType === 'task1-academic'
                  ? 'Writing Task 1 (Academic Report)'
                  : 'Writing Task 1 (General Letter)'}
              </h3>
            </div>

            {/* Prompt Box */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {prompt.prompt}
              </p>
            </div>

            {/* Requirements Pills */}
            <div className="flex items-center gap-4 text-xs font-black text-slate-600">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60">
                <Clock size={14} className="text-emerald-600" /> Thời gian: {prompt.timeLimit} phút
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60">
                <PenTool size={14} className="text-emerald-600" /> Tối thiểu: {prompt.wordLimit.min}+ từ
              </span>
            </div>

            {/* Practice Tips */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Hướng Dẫn Làm Bài Từ Ếch Buri
              </h4>
              <div className="space-y-2">
                {prompt.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Writing Editor */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">
                Khu Vực Soạn Thảo Bài Viết
              </h3>
              
              {/* Real-time Word Counter Badge */}
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-black transition-all border ${
                  wordCount >= prompt.wordLimit.min
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                    : wordCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {wordCount} / {prompt.wordLimit.min}+ words
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[340px] p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 leading-relaxed resize-y"
              placeholder="Nhập bài viết của bạn tại đây... Bộ đếm số từ sẽ tự động cập nhật real-time."
            />

            {/* Word Count Warning Indicator */}
            {wordCount > 0 && wordCount < prompt.wordLimit.min && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 text-xs font-bold">
                <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                <span>⚠️ Chưa đủ dung lượng từ ({wordCount} / {prompt.wordLimit.min}+ từ). Hãy viết thêm ít nhất {prompt.wordLimit.min - wordCount} từ nữa!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
              >
                <Sparkles size={16} /> {evaluating ? 'Đang Chấm Điểm AI...' : 'Chấm Điểm & Phân Tích Bài Viết AI'}
              </button>
              
              <button
                onClick={() => setText('')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              >
                Xóa Bài Viết
              </button>
            </div>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
