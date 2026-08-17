import { learningCoordinator } from './learningCoordinator';
import { type SkillType } from '../types/learningTypes';
import { recordActivityCompletion, type MissionEventType } from './missionProgressService';
import { localDb } from '../lib/storage/localDatabase';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export type PracticeSkill = SkillType;

export interface PracticeAnswerEvent {
  id?: string;
  itemId?: string;
  questionId?: string;
  isCorrect: boolean;
  answer?: string;
  correctAnswer?: string;
  typedExact?: boolean;
  typedClose?: boolean;
  skipped?: boolean;
  audioReplay?: boolean;
  timeSpentSec?: number;
  difficulty?: number;
}

export interface PracticeAttemptInput {
  userId?: string;
  targetLanguage: string;
  nativeLanguage?: string;
  interfaceLanguage?: string;
  skillType: PracticeSkill;
  activityId: string;
  activityTitle?: string;
  score?: number;
  total?: number;
  timeSpentSec?: number;
  answers?: PracticeAnswerEvent[];
  metadata?: Record<string, any>;
}

export interface PracticeAttemptSummary {
  id: string;
  userId: string;
  targetLanguage: string;
  skillType: PracticeSkill;
  activityId: string;
  score: number;
  total: number;
  percent: number;
  xpEarned: number;
  masteryAverage: number;
  weakItems: string[];
  nextAction: {
    label: string;
    path: string;
    reason: string;
  };
  createdAt: string;
}

export interface WritingFeedbackResult {
  score: number;
  isIELTS: boolean;
  band?: number;
  wordCount: number;
  categories: {
    taskResponse: number;
    coherence: number;
    vocabulary: number;
    grammar: number;
  };
  strengths: string[];
  improvements: string[];
  rewriteSuggestion: string;
  disclaimer: string;
}

export interface SpeakingFeedbackResult {
  duration: number;
  targetDuration: number;
  practiceXP: number;
  completionAwarded: boolean;
  strengths: string[];
  improvements: string[];
  selfReviewChecklist: string[];
  disclaimer: string;
}

const attemptsTable = 'practice_attempt_summaries';
const writingFeedbackTable = 'writing_feedback_results';
const speakingFeedbackTable = 'speaking_feedback_results';

function nowIso() {
  return new Date().toISOString();
}

function safeId(value: string) {
  return String(value || 'item').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 140);
}

function getCurrentUserId(explicit?: string) {
  if (explicit) return explicit;
  try {
    const user = useAuthStore.getState().user;
    if (user?.id) return user.id;
  } catch {
    // store may not be initialized in tests
  }
  let guest = localStorage.getItem('echlern_guest_learning_user_id');
  if (!guest) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${performance.now().toFixed(3)}`;
    guest = `guest_${id}`;
    localStorage.setItem('echlern_guest_learning_user_id', guest);
  }
  return guest;
}

function scoreToNextAction(skillType: SkillType, percent: number, weakCount: number) {
  const map: Record<string, { label: string; path: string }> = {
    listening: { label: 'Ôn nghe thêm', path: '/app/listening' },
    speaking: { label: 'Luyện nói lại', path: '/app/speaking' },
    reading: { label: 'Đọc lại bài ngắn', path: '/app/reading' },
    writing: { label: 'Viết lại với gợi ý', path: '/app/writing' },
    vocabulary: { label: 'Ôn từ yếu', path: '/app/vocabulary' },
    grammar: { label: 'Ôn ngữ pháp', path: '/app/grammar' },
    pronunciation: { label: 'Luyện phát âm', path: '/app/speaking' },
    lesson: { label: 'Tiếp tục bài học', path: '/app/lesson' },
  };
  const base = map[skillType] || map.lesson;
  return {
    ...base,
    reason: percent >= 80
      ? 'Bạn làm khá tốt. Tiếp tục bài mới để giữ đà học.'
      : weakCount > 0
        ? `Bạn có ${weakCount} mục cần ôn lại theo spaced repetition.`
        : 'Điểm chưa cao, nên luyện lại kỹ năng này trước khi sang bài mới.',
  };
}

async function saveAttempt(summary: PracticeAttemptSummary, metadata: Record<string, any> = {}) {
  const row = { ...summary, metadata };
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from(attemptsTable).insert({
      id: row.id,
      user_id: row.userId,
      target_language: row.targetLanguage,
      skill_type: row.skillType,
      activity_id: row.activityId,
      activity_title: metadata.activityTitle || null,
      score: row.score,
      total: row.total,
      percent: row.percent,
      xp_earned: row.xpEarned,
      mastery_average: row.masteryAverage,
      weak_items: row.weakItems,
      next_action: row.nextAction,
      metadata,
      created_at: row.createdAt,
    });
    if (!error) return row;
  }
  localDb.insert(attemptsTable, row);
  return row;
}

export async function recordPracticeAttempt(input: PracticeAttemptInput): Promise<PracticeAttemptSummary> {
  const userId = getCurrentUserId(input.userId);
  const answers = input.answers?.length ? input.answers : [{
    itemId: input.activityId,
    isCorrect: (input.score || 0) >= Math.max(1, Math.ceil((input.total || 1) * 0.6)),
    answer: String(input.score ?? ''),
    correctAnswer: String(input.total ?? ''),
    timeSpentSec: input.timeSpentSec,
  }];

  let totalXp = 0;
  let masteryTotal = 0;
  const weakItems: string[] = [];

  for (const answer of answers) {
    const itemId = safeId(answer.itemId || answer.questionId || input.activityId);
    const { progress, event } = await learningCoordinator.recordLearningEvent({
      userId,
      targetLanguage: input.targetLanguage,
      itemId,
      skillType: input.skillType,
      isCorrect: Boolean(answer.isCorrect),
      answer: answer.answer,
      correctAnswer: answer.correctAnswer,
      audioReplay: answer.audioReplay,
      skipped: answer.skipped,
      typedExact: answer.typedExact,
      typedClose: answer.typedClose,
      timeSpentSec: answer.timeSpentSec || input.timeSpentSec || 0,
      difficulty: answer.difficulty || input.metadata?.difficulty || 1,
    });
    totalXp += event.xpEarned || 0;
    masteryTotal += progress.masteryScore || 0;
    if (!answer.isCorrect || (progress.masteryScore || 0) < 50) weakItems.push(itemId);
  }

  const score = Number.isFinite(Number(input.score)) ? Number(input.score) : answers.filter(a => a.isCorrect).length;
  const total = Number.isFinite(Number(input.total)) ? Number(input.total) : Math.max(answers.length, 1);
  const percent = Math.round((score / Math.max(total, 1)) * 100);
  const masteryAverage = Math.round(masteryTotal / Math.max(answers.length, 1));
  const summary: PracticeAttemptSummary = {
    id: `pa_${safeId(userId)}_${safeId(input.activityId)}_${Date.now()}`,
    userId,
    targetLanguage: input.targetLanguage,
    skillType: input.skillType,
    activityId: input.activityId,
    score,
    total,
    percent,
    xpEarned: totalXp,
    masteryAverage,
    weakItems: Array.from(new Set(weakItems)).slice(0, 12),
    nextAction: scoreToNextAction(input.skillType, percent, weakItems.length),
    createdAt: nowIso(),
  };
  await saveAttempt(summary, { ...input.metadata, activityTitle: input.activityTitle, nativeLanguage: input.nativeLanguage, interfaceLanguage: input.interfaceLanguage });

  // Central mission trigger: every finished lesson/quiz that lands here advances
  // the matching daily mission. Wiring it once at the integration layer means a
  // new practice screen gets mission tracking for free.
  recordActivityCompletion({
    userId,
    skillType: toMissionSkill(input.skillType),
    isPerfect: total > 0 && score >= total,
    source: input.activityId,
  });

  return summary;
}

/** Maps an adaptive-engine skill onto the mission counter it should advance. */
function toMissionSkill(skill: PracticeSkill): MissionEventType | 'lesson' {
  switch (skill) {
    case 'speaking':
    case 'listening':
    case 'reading':
    case 'writing':
    case 'vocabulary':
    case 'grammar':
      return skill;
    default:
      return 'lesson';
  }
}

function lexicalDiversity(text: string) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}'’]+/gu) || [];
  return new Set(words).size / Math.max(words.length, 1);
}

function sentenceCount(text: string) {
  return text.split(/[.!?。！？]+/).map(s => s.trim()).filter(Boolean).length;
}

export function evaluateWritingPractice(params: {
  text: string;
  prompt?: any;
  targetLanguage?: string;
  interfaceLanguage?: string;
}): WritingFeedbackResult {
  const text = params.text || '';
  const words = text.trim().match(/[\p{L}\p{N}'’]+/gu) || [];
  const wordCount = words.length;
  const minWords = Number(params.prompt?.minWords || 40);
  const diversity = lexicalDiversity(text);
  const sentences = sentenceCount(text);
  const hasConnectors = /\b(and|but|because|however|therefore|first|then|finally|và|nhưng|bởi vì|tuy nhiên|đầu tiên|sau đó|cuối cùng)\b/i.test(text);
  const taskResponse = Math.min(100, Math.round(30 + Math.min(35, (wordCount / Math.max(minWords, 1)) * 35) + (sentences >= 3 ? 20 : sentences * 7) + (hasConnectors ? 15 : 0)));
  const coherence = Math.min(100, Math.round(35 + Math.min(30, sentences * 8) + (hasConnectors ? 20 : 0) + Math.min(15, wordCount / 10)));
  const vocabulary = Math.min(100, Math.round(40 + diversity * 50 + Math.min(10, wordCount / 20)));
  const grammar = Math.min(100, Math.round(45 + Math.min(20, sentences * 4) + (/[.!?。！？]/.test(text) ? 15 : 0) + (text.length > 120 ? 20 : 5)));
  const score = Math.round((taskResponse + coherence + vocabulary + grammar) / 4);
  const vi = params.interfaceLanguage === 'vi';

  return {
    score,
    isIELTS: false, // SUPREME INDICTMENT: LEGACY
    band: undefined, // SUPREME INDICTMENT: NO FAKE BANDS
    wordCount,
    categories: { taskResponse, coherence, vocabulary, grammar },
    strengths: [
      wordCount >= minWords ? (vi ? 'Độ dài đạt yêu cầu.' : 'The response meets the length target.') : (vi ? 'Bạn đã bắt đầu trả lời đúng chủ đề.' : 'You addressed the task topic.'),
      diversity > 0.45 ? (vi ? 'Từ vựng tương đối đa dạng.' : 'Vocabulary range is reasonably varied.') : (vi ? 'Từ vựng đủ dùng cho bản nháp đầu.' : 'Vocabulary is usable for a first draft.'),
      sentences >= 3 ? (vi ? 'Có nhiều câu để phát triển ý.' : 'There are multiple sentences to develop ideas.') : (vi ? 'Có câu trả lời nền tảng để mở rộng.' : 'There is a base answer to expand.'),
    ],
    improvements: [
      wordCount < minWords ? (vi ? `Viết thêm chi tiết để đạt khoảng ${minWords} từ.` : `Add details to reach about ${minWords} words.`) : (vi ? 'Thêm ví dụ cụ thể để tăng sức thuyết phục.' : 'Add specific examples to make it stronger.'),
      hasConnectors ? (vi ? 'Tiếp tục dùng từ nối để liên kết ý.' : 'Keep using connectors to link ideas.') : (vi ? 'Thêm từ nối như vì vậy, tuy nhiên, sau đó.' : 'Add linking words such as because, however, then.'),
      vi ? 'Tự đọc lại để sửa chính tả và dấu câu.' : 'Proofread spelling and punctuation.',
    ],
    rewriteSuggestion: vi
      ? 'Gợi ý viết lại: Mở đầu bằng một câu trả lời trực tiếp, thêm một ví dụ đời sống, rồi kết lại bằng điều bạn sẽ làm tiếp theo.'
      : 'Rewrite suggestion: Start with a direct answer, add one real-life example, then close with what you would do next.',
    disclaimer: vi
      ? 'Đây là phản hồi cục bộ để luyện tập, không phải điểm chính thức.'
      : 'This is local practice feedback, not an official score.',
  };
}

export function evaluateSpeakingPractice(params: {
  duration: number;
  prompt?: any;
  hasRecording?: boolean;
  transcript?: string;
  interfaceLanguage?: string;
}): SpeakingFeedbackResult {
  const duration = Math.max(Number(params.duration || 0), 0);
  const targetDuration = Math.max(Number(params.prompt?.expectedDurationSeconds || params.prompt?.timeLimit || 60), 1);
  const completionAwarded = Boolean(params.hasRecording && duration > 0);
  const practiceXP = completionAwarded ? (duration >= Math.min(targetDuration, 30) ? 24 : 18) : 0;
  const vi = params.interfaceLanguage === 'vi';
  
  // Calculate Levenshtein-based accuracy if transcript is provided
  let accuracyScore = 0;
  let accuracyMessage = vi ? 'Không thu được văn bản để đánh giá.' : 'No transcript recorded for evaluation.';
  
  if (params.transcript && params.prompt?.prompt) {
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?]/g, '').trim();
    const sourceText = normalize(params.prompt.prompt);
    const spokenText = normalize(params.transcript);
    
    // Quick simple Levenshtein implementation for the browser
    const track = Array(spokenText.length + 1).fill(null).map(() => Array(sourceText.length + 1).fill(null));
    for (let i = 0; i <= spokenText.length; i += 1) track[i][0] = i;
    for (let j = 0; j <= sourceText.length; j += 1) track[0][j] = j;
    for (let i = 1; i <= spokenText.length; i += 1) {
      for (let j = 1; j <= sourceText.length; j += 1) {
        const indicator = spokenText[i - 1] === sourceText[j - 1] ? 0 : 1;
        track[i][j] = Math.min(
          track[i - 1][j] + 1,
          track[i][j - 1] + 1,
          track[i - 1][j - 1] + indicator
        );
      }
    }
    const distance = track[spokenText.length][sourceText.length];
    const maxLength = Math.max(sourceText.length, spokenText.length);
    accuracyScore = maxLength === 0 ? 0 : Math.max(0, Math.round((1 - distance / maxLength) * 100));
    accuracyMessage = vi 
      ? `Độ chính xác phát âm ước tính: ${accuracyScore}%.` 
      : `Estimated pronunciation accuracy: ${accuracyScore}%.`;
  }

  return {
    duration,
    targetDuration,
    practiceXP,
    completionAwarded,
    strengths: [
      duration >= targetDuration * 0.75 ? (vi ? 'Thời lượng nói gần đạt mục tiêu.' : 'Speaking duration is close to target.') : (vi ? 'Bạn đã lưu một lượt trả lời để nghe lại.' : 'You saved one response to replay.'),
      accuracyScore >= 80 ? (vi ? 'Phát âm rất rõ ràng và chuẩn xác.' : 'Pronunciation is very clear and accurate.') : (vi ? 'Bạn đã thử sức phát âm câu này.' : 'You attempted to pronounce this sentence.'),
    ],
    improvements: [
      duration < targetDuration ? (vi ? `Nói dài hơn, mục tiêu khoảng ${targetDuration} giây.` : `Speak longer; aim for about ${targetDuration} seconds.`) : (vi ? 'Ghi âm thêm một lượt và so sánh hai phiên bản.' : 'Record one more take and compare both versions.'),
      accuracyScore < 80 ? (vi ? `Độ chính xác phát âm (${accuracyScore}%) cần cải thiện. Hãy nói rõ chữ hơn.` : `Accuracy (${accuracyScore}%) needs improvement. Articulate more clearly.`) : (vi ? 'Tập dùng 2–3 từ khóa mới trong câu trả lời.' : 'Try using 2–3 new key words in the answer.'),
    ],
    selfReviewChecklist: [
      vi ? 'Tôi nói đủ to và rõ chưa?' : 'Did I speak loudly and clearly?',
      vi ? 'Tôi có trả lời đúng chủ đề không?' : 'Did I answer the prompt?',
      vi ? 'Tôi có dùng từ/câu của ngôn ngữ đang học không?' : 'Did I use the target language?',
      vi ? 'Tôi có thể nói lại tự nhiên hơn không?' : 'Can I say it again more naturally?',
    ],
    disclaimer: vi
      ? `Hệ thống chưa chấm phát âm tự động (${accuracyMessage}). Hãy nhớ đây chỉ là đánh giá tương đối của trình duyệt.`
      : `No automatic pronunciation score provided (${accuracyMessage}). Note this is a relative browser evaluation.`,
  };
}

export async function saveWritingFeedback(params: { userId?: string; targetLanguage: string; promptId: string; text: string; feedback: WritingFeedbackResult }) {
  const userId = getCurrentUserId(params.userId);
  const row = { id: `wf_${safeId(userId)}_${safeId(params.promptId)}_${Date.now()}`, userId, targetLanguage: params.targetLanguage, promptId: params.promptId, text: params.text, feedback: params.feedback, createdAt: nowIso() };
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from(writingFeedbackTable).insert({ id: row.id, user_id: userId, target_language: params.targetLanguage, prompt_id: params.promptId, text: params.text, feedback: params.feedback, score: params.feedback.score, created_at: row.createdAt });
    if (!error) return row;
  }
  localDb.insert(writingFeedbackTable, row);
  return row;
}

export async function saveSpeakingFeedback(params: { userId?: string; targetLanguage: string; promptId: string; audioUrl?: string; feedback: SpeakingFeedbackResult }) {
  const userId = getCurrentUserId(params.userId);
  const row = { id: `sf_${safeId(userId)}_${safeId(params.promptId)}_${Date.now()}`, userId, targetLanguage: params.targetLanguage, promptId: params.promptId, audioUrl: params.audioUrl, feedback: params.feedback, createdAt: nowIso() };
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from(speakingFeedbackTable).insert({ id: row.id, user_id: userId, target_language: params.targetLanguage, prompt_id: params.promptId, audio_url: params.audioUrl || null, feedback: params.feedback, score: 0, created_at: row.createdAt });
    if (!error) return row;
  }
  localDb.insert(speakingFeedbackTable, row);
  return row;
}

export function getRecentPracticeSummaries(limit = 12): PracticeAttemptSummary[] {
  return localDb.getTable<PracticeAttemptSummary>(attemptsTable)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}

export function validatePracticeLearningIntegration() {
  const writing = evaluateWritingPractice({ text: 'Tôi học mỗi ngày vì tôi muốn giao tiếp tốt hơn. Sau đó tôi nghe một podcast ngắn và viết lại câu mới.', prompt: { minWords: 20 }, interfaceLanguage: 'vi' });
  const speaking = evaluateSpeakingPractice({ duration: 45, prompt: { expectedDurationSeconds: 60 }, hasRecording: true, interfaceLanguage: 'vi' });
  return {
    ok: writing.score > 50 && speaking.completionAwarded && speaking.practiceXP > 0 && writing.disclaimer.includes('cục bộ') && speaking.selfReviewChecklist.length >= 4,
    checks: [`writing=${writing.score}`, `speaking-complete=${speaking.completionAwarded}`, writing.disclaimer, speaking.disclaimer],
  };
}
