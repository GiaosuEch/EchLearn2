import { useState, useMemo } from 'react';
import { CheckCircle, BookOpen, PenTool, Sparkles, AlertCircle, Quote, MessageCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { FuriganaText } from '../../ui/FuriganaText';
import { progressService } from '../../../services/progressService';
import { useAuthStore } from '../../../stores/authStore';
import { type AuthoredLessonPayload } from '../../../curriculum/roadmap/lessonPayloadResolver';
import { LessonCompletionScreen } from '../LessonCompletionScreen';
import { toast } from '../../ui/Toast';
import { BlobBackground } from '../../ui/BlobBackground';
import DOMPurify from 'dompurify';

interface Props {
  payload: AuthoredLessonPayload;
  lessonId: string;
}

const renderJapaneseSegment = (text: any) => {
  if (typeof text === 'string') return text;
  if (Array.isArray(text)) {
    return text.map((seg: any, i: number) => (
      <span key={i}>
        {seg.ruby ? <FuriganaText base={seg.base} ruby={seg.ruby} /> : seg.base}
      </span>
    ));
  }
  return text;
};

const renderMainText = (obj: any) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return renderJapaneseSegment(obj);
  return obj.hanzi || obj.hangul || obj.base || obj.japanese || obj.text || '';
};

const renderSubText = (obj: any) => {
  if (!obj || typeof obj === 'string' || Array.isArray(obj)) return '';
  return obj.pinyin || obj.romanization || obj.ruby || '';
};

export function AuthoredLessonContainer({ payload, lessonId }: Props) {
  const [stage, setStage] = useState<'theory' | 'practice' | 'completed'>('theory');
  const user = useAuthStore(state => state.user);

  const sanitizedTheory = useMemo(() => {
    return payload.type === 'japanese' && payload.content.theory
      ? DOMPurify.sanitize(payload.content.theory)
      : '';
  }, [payload.type, payload.content.theory]);

  const handleComplete = async () => {
    if (user) {
      await progressService.markLessonCompleted(user.id, lessonId);
      toast('Xuất sắc! Bạn đã vượt qua bài học!', 'success');
    }
    setStage('completed');
  };

  if (stage === 'completed') {
    return (
      <LessonCompletionScreen
        score={100}
        total={10}
        xpEarned={15}
        coinsEarned={5}
        onRetry={() => setStage('theory')}
        nextLessonPath="/app/roadmap"
      />
    );
  }

  const renderQuestions = (questions: any[]) => (
    <div className="space-y-6">
      {questions.map((q: any, idx: number) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          key={idx} 
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center">
              {idx + 1}
            </span>
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100 mt-1">
              {q.prompt ? renderMainText(q.prompt) : renderMainText(q.question)}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                {q.prompt && renderSubText(q.prompt) ? `(${renderSubText(q.prompt)})` : ''}
              </span>
            </p>
          </div>
          
          <div className="grid gap-3 ml-11">
            {q.choices.map((c: any, cIdx: number) => (
              <div key={cIdx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shadow-sm">
                  {String.fromCharCode(65 + cIdx)}
                </span>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {renderMainText(c.text || c.label)}{' '}
                    <span className="text-slate-400 font-normal">
                      {c.text && renderSubText(c.text) ? `(${renderSubText(c.text)})` : ''}
                    </span>
                  </span>
                  {(c.meaningVi || c.meaning) && (
                    <span className="text-slate-500 dark:text-slate-400 mt-0.5">- {c.meaningVi || c.meaning}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-5 ml-11 pt-4 border-t border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              <CheckCircle size={16} /> 
              <span>Đáp án: {q.correctChoiceId?.toUpperCase() || q.correctAnswer?.toUpperCase()}</span>
            </div>
            {(q.analysis || q.explanation) && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                {q.analysis || q.explanation}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <BlobBackground colors={['bg-indigo-500/10', 'bg-purple-500/10', 'bg-sky-400/10']} />
      
      <div className="mx-auto max-w-4xl p-4 sm:p-8 relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase mb-4 border border-indigo-500/20">
            <Sparkles size={16} /> Lý Thuyết Chuyên Sâu
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            {renderMainText(payload.content.title || payload.content.titleVi || payload.content.japaneseTitle || 'Bài học')}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 max-w-2xl mx-auto">
            {payload.content.objective || payload.content.canDoVi || payload.content.theme || 'Nắm vững kiến thức nền tảng để áp dụng vào thực tế.'}
          </p>
        </motion.header>

        <div className="space-y-12">
          {/* Realworld Scenario */}
          {payload.type === 'realworld' && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-indigo-100 dark:border-indigo-500/20">
                <h3 className="text-xl font-black mb-6 text-indigo-700 dark:text-indigo-400 flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
                  <MessageCircle size={24} /> Ngữ Cảnh Giao Tiếp: {payload.content.scenario?.settingVi}
                </h3>
                <div className="space-y-4">
                  {payload.content.dialogue?.map((d: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {d.speaker.charAt(0)}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1 block uppercase tracking-wider">{d.speaker}</span>
                        <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{d.text}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">{d.vi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
          
          {/* Legacy Japanese Specific Content */}
          {payload.type === 'japanese' && payload.content.theory && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div 
                className="prose prose-lg dark:prose-invert max-w-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800"
                dangerouslySetInnerHTML={{ __html: sanitizedTheory }} 
              />
            </motion.section>
          )}

          {/* Core Content (HSK, TOPIK, and JLPT N5 Extra) */}
          {(payload.type === 'chinese' || payload.type === 'korean' || payload.type === 'japanese') && (
            <div className="space-y-8">
              
              {/* Giải thích */}
              {payload.content.explanation && payload.content.explanation.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/20 dark:shadow-none">
                    <h3 className="font-black text-slate-800 dark:text-white mb-6 text-xl flex items-center gap-2">
                      <Info className="text-sky-500" /> Cấu Trúc & Ngữ Pháp
                    </h3>
                    <div className="space-y-4">
                      {payload.content.explanation.map((exp: string, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="w-2 h-2 rounded-full bg-sky-500 mt-2.5 flex-shrink-0" />
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{exp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Đoạn văn / Hội thoại */}
              {payload.content.passage && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
                    <Quote className="absolute top-4 right-4 text-indigo-500/10 w-32 h-32 transform rotate-12" />
                    <h3 className="font-black text-indigo-900 dark:text-indigo-300 mb-6 text-xl flex items-center gap-2 relative z-10">
                      <BookOpen size={24} /> Đoạn Văn Mẫu
                    </h3>
                    <div className="space-y-4 relative z-10 bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl backdrop-blur-sm border border-indigo-50 dark:border-slate-800">
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-relaxed">
                        {renderMainText(payload.content.passage)}
                      </p>
                      <p className="text-lg text-indigo-600 dark:text-indigo-400 font-mono tracking-wide">
                        {renderSubText(payload.content.passage)}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-400 italic text-lg leading-relaxed">
                          {payload.content.passage?.translationVi || payload.content.passage?.translation || payload.content.translationVi || payload.content.translation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Ví dụ */}
              {payload.content.examples && payload.content.examples.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/10 dark:shadow-none">
                    <h3 className="font-black text-slate-800 dark:text-white mb-6 text-xl flex items-center gap-2">
                      <AlertCircle className="text-amber-500" /> Ví Dụ Minh Họa
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {payload.content.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="group bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
                          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-relaxed group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {renderMainText(ex.japanese || ex)}
                          </p>
                          <p className="text-sm text-indigo-500 dark:text-indigo-400 font-mono mb-3 tracking-wide">
                            {renderSubText(ex.japanese || ex)}
                          </p>
                          <div className="h-px w-12 bg-slate-200 dark:bg-slate-700 mb-3" />
                          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            {ex.translationVi || ex.translation}
                          </p>
                          {ex.note && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-start gap-2">
                              <Info size={14} className="mt-0.5 text-amber-500 flex-shrink-0" />
                              <span>{ex.note}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Luyện tập nhanh */}
              {payload.content.questions && payload.content.questions.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 shadow-xl shadow-emerald-900/5 dark:shadow-none">
                    <h3 className="font-black text-emerald-800 dark:text-emerald-400 mb-6 text-xl flex items-center gap-2">
                      <PenTool size={24} /> Luyện Tập Củng Cố
                    </h3>
                    {renderQuestions(payload.content.questions)}
                  </div>
                </motion.section>
              )}
              
              {/* Phased Content (Japanese N5 Curriculum) */}
              {payload.content.phases && payload.content.phases.length > 0 && (
                <div className="space-y-8">
                  {payload.content.phases.map((phase: any, pIdx: number) => (
                    <motion.section 
                      key={pIdx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-indigo-100 dark:border-indigo-500/20"
                    >
                      <h3 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black text-lg uppercase tracking-wider mb-8 border border-indigo-100 dark:border-indigo-500/20">
                        <Sparkles size={20} /> Bước {pIdx + 1}: {phase.type.replace('-', ' ')}
                      </h3>
                      
                      {phase.content?.explanations && (
                        <div className="mb-8">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-lg flex items-center gap-2"><Info className="text-sky-500" /> Trọng Tâm Kiến Thức</h4>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <ul className="space-y-3">
                              {phase.content.explanations.map((exp: string, idx: number) => (
                                <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                                  <span>{exp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {phase.content?.examples && (
                        <div className="mb-8">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-lg flex items-center gap-2"><BookOpen className="text-amber-500" /> Tình Huống Giao Tiếp</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            {phase.content.examples.map((ex: any, idx: number) => (
                              <div key={idx} className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/50 transition-all">
                                <p className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                  {renderMainText(ex.text || ex.japanese || ex)}
                                </p>
                                <div className="h-px w-12 bg-slate-200 dark:bg-slate-700 mb-3" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium">
                                  {ex.translation || ex.translationVi}
                                </p>
                                {ex.note && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex gap-2">
                                    <Info size={14} className="mt-0.5 text-amber-500 flex-shrink-0" /> {ex.note}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {phase.content?.questions && (
                        <div>
                          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-6 text-lg flex items-center gap-2"><CheckCircle /> Bài Tập Tự Đánh Giá</h4>
                          {renderQuestions(phase.content.questions)}
                        </div>
                      )}
                    </motion.section>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="sticky bottom-0 z-20 mt-12 p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-center sm:justify-end"
      >
        <button
          onClick={handleComplete}
          className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-10 py-4 sm:py-5 text-lg font-black text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-wider"
        >
          <PenTool size={22} /> Hoàn Thành Khóa Huấn Luyện
        </button>
      </motion.div>
    </div>
  );
}
