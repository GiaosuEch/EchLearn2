import type {
  LocalModelBenchmarkBrowserCapabilityContract,
  LocalModelBenchmarkCorpusTask,
  LocalModelBenchmarkDeviceTier,
  LocalModelBenchmarkDimension,
  LocalModelBenchmarkLanguage,
  LocalModelBenchmarkResult,
} from './localModelBenchmarkTypes.ts';

export const LOCAL_MODEL_BENCHMARK_LANGUAGES: readonly LocalModelBenchmarkLanguage[] = [
  'en',
  'vi',
  'fr',
  'de',
  'es',
  'zh',
  'ja',
  'ko',
  'it',
  'pt',
  'ru',
  'th',
  'ar',
] as const;

export const LOCAL_MODEL_BENCHMARK_DIMENSIONS: readonly LocalModelBenchmarkDimension[] = [
  {
    id: 'runtime-capability',
    label: 'Runtime capability',
    description: 'Verify the isolated runtime can initialize, cancel, dispose, and report unsupported conditions safely.',
    status: 'planned',
  },
  {
    id: 'artifact-size-budget',
    label: 'Artifact size budget',
    description: 'Measure transfer and installed-size requirements against approved device-tier budgets.',
    status: 'planned',
  },
  {
    id: 'initialization-time',
    label: 'Initialization time',
    description: 'Measure deterministic startup time from an approved local artifact state.',
    status: 'planned',
  },
  {
    id: 'first-token-latency',
    label: 'First-token latency',
    description: 'Measure time to the first generated token without simulated progress or delay.',
    status: 'planned',
  },
  {
    id: 'sustained-generation-speed',
    label: 'Sustained generation speed',
    description: 'Measure steady generation throughput after initialization.',
    status: 'planned',
  },
  {
    id: 'peak-memory-risk',
    label: 'Peak memory risk',
    description: 'Record peak memory pressure and failure behavior by device tier.',
    status: 'planned',
  },
  {
    id: 'cancellation-reload-recovery',
    label: 'Cancellation and reload recovery',
    description: 'Verify cancellation and page reload return the product to a consistent unavailable-safe state.',
    status: 'planned',
  },
  {
    id: 'corrupted-cache-recovery',
    label: 'Corrupted cache recovery',
    description: 'Verify invalid local artifacts are rejected and recovery never exposes generated content.',
    status: 'planned',
  },
  {
    id: 'unsupported-device-fallback',
    label: 'Unsupported-device fallback',
    description: 'Verify unsupported devices remain unavailable-safe without claiming runtime readiness.',
    status: 'planned',
  },
  {
    id: 'multilingual-instruction-following',
    label: 'Multilingual instruction following',
    description: 'Evaluate short deterministic instructions across all 13 supported languages.',
    status: 'planned',
  },
  {
    id: 'tutor-usefulness',
    label: 'Tutor usefulness',
    description: 'Review whether responses follow the learner request while remaining transparent about limitations.',
    status: 'planned',
  },
  {
    id: 'practice-generation-usefulness',
    label: 'Practice generation usefulness',
    description: 'Review relevance, structure, answerability, and safety of generated practice material.',
    status: 'planned',
  },
  {
    id: 'writing-feedback-usefulness',
    label: 'Writing feedback usefulness',
    description: 'Review whether feedback is grounded in supplied text and avoids unsupported grading claims.',
    status: 'planned',
  },
  {
    id: 'transcript-speaking-feedback-usefulness',
    label: 'Transcript-based speaking feedback usefulness',
    description: 'Review feedback from supplied transcript text only; no audio recognition or pronunciation model is assumed.',
    status: 'planned',
  },
  {
    id: 'safety-behavior',
    label: 'Safety behavior',
    description: 'Evaluate hallucination, refusal consistency, unsafe requests, and prompt-injection resistance.',
    status: 'planned',
  },
  {
    id: 'audit-provenance-metadata',
    label: 'Audit and provenance metadata',
    description: 'Verify metadata records identify candidate, runtime build, device tier, and safety events without raw learner content.',
    status: 'planned',
  },
  {
    id: 'no-authoritative-scoring-claim',
    label: 'No authoritative scoring claim',
    description: 'Verify generated feedback is never presented as an authoritative assessment result.',
    status: 'planned',
  },
] as const;

export const LOCAL_MODEL_BENCHMARK_CORPUS: readonly LocalModelBenchmarkCorpusTask[] = [
  {
    taskId: 'daily-routine-en',
    language: 'en',
    instruction: 'Reply in English with three short sentences about a normal weekday routine.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-vi',
    language: 'vi',
    instruction: 'Trả lời bằng tiếng Việt với ba câu ngắn về một ngày thường.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-fr',
    language: 'fr',
    instruction: 'Répondez en français avec trois phrases courtes sur une journée ordinaire.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-de',
    language: 'de',
    instruction: 'Antworte auf Deutsch mit drei kurzen Sätzen über einen normalen Wochentag.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-es',
    language: 'es',
    instruction: 'Responde en español con tres frases breves sobre un día normal.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-zh',
    language: 'zh',
    instruction: '请用中文写三个简短句子，描述一个普通工作日。',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-ja',
    language: 'ja',
    instruction: '普通の平日について、日本語で短い三文を書いてください。',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-ko',
    language: 'ko',
    instruction: '평범한 평일 일과를 한국어로 짧은 세 문장으로 설명하세요.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-it',
    language: 'it',
    instruction: 'Rispondi in italiano con tre frasi brevi su una giornata normale.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-pt',
    language: 'pt',
    instruction: 'Responda em português com três frases curtas sobre um dia comum.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-ru',
    language: 'ru',
    instruction: 'Ответьте по-русски тремя короткими предложениями об обычном буднем дне.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-th',
    language: 'th',
    instruction: 'ตอบเป็นภาษาไทยสามประโยคสั้น ๆ เกี่ยวกับวันธรรมดาทั่วไป',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
  {
    taskId: 'daily-routine-ar',
    language: 'ar',
    instruction: 'أجب بالعربية بثلاث جمل قصيرة عن يوم عادي خلال الأسبوع.',
    containsUserData: false,
    containsCopyrightedPassage: false,
    expectedOutput: null,
  },
] as const;

export const LOCAL_MODEL_BENCHMARK_BROWSER_CAPABILITY: LocalModelBenchmarkBrowserCapabilityContract = {
  secureContextRequired: true,
  webGpuRequired: true,
  navigatorGpuAvailable: 'unchecked',
  adapterStatus: 'unchecked',
  deviceStatus: 'unchecked',
  storageEstimateSupported: 'unchecked',
  unsupportedDeviceFallback: 'unavailable-safe',
};

export interface CreateNotRunLocalModelBenchmarkResultInput {
  readonly candidateId: string;
  readonly runtimeCandidateId: string;
  readonly deviceTier?: LocalModelBenchmarkDeviceTier;
}

export function createNotRunLocalModelBenchmarkResult(
  input: CreateNotRunLocalModelBenchmarkResultInput,
): LocalModelBenchmarkResult {
  return {
    candidateId: input.candidateId,
    runtimeCandidateId: input.runtimeCandidateId,
    deviceTier: input.deviceTier ?? 'unknown',
    benchmarkStartedAt: null,
    benchmarkCompletedAt: null,
    metrics: null,
    status: 'not-run',
    provenance: { status: 'not-collected' },
    safetyFlags: [],
    notes: [],
  };
}
