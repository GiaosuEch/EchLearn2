export type IeltsVocabularyBand = '6.5' | '7.5' | '8.0+';

export type IeltsVocabularyTopic =
  | 'Environment'
  | 'Technology'
  | 'Education'
  | 'Health'
  | 'Society'
  | 'Work';

export interface IeltsVocabularyEntry {
  readonly id: string;
  readonly term: string;
  readonly partOfSpeech: string;
  readonly band: IeltsVocabularyBand;
  readonly topic: IeltsVocabularyTopic;
  readonly definition: string;
  readonly vietnameseMeaning: string;
  readonly collocations: readonly string[];
  readonly idiom?: string;
  readonly example: string;
  readonly practicePrompt: string;
}

export interface IeltsVocabularyProgress {
  readonly entryId: string;
  readonly repetitions: number;
  readonly lapses: number;
  readonly intervalDays: number;
  readonly dueAt: string;
  readonly lastReviewedAt?: string;
}

export type IeltsVocabularyRating = 'again' | 'hard' | 'good' | 'easy';

export interface IeltsVocabularyReviewItem {
  readonly entry: IeltsVocabularyEntry;
  readonly progress: IeltsVocabularyProgress;
}

const entries: readonly IeltsVocabularyEntry[] = [
  {
    id: 'ielts-environment-mitigate', term: 'mitigate', partOfSpeech: 'verb', band: '7.5', topic: 'Environment',
    definition: 'to make a harmful effect less severe', vietnameseMeaning: 'giam nhe, han che',
    collocations: ['mitigate climate change', 'mitigate the impact', 'mitigate risks'],
    example: 'Cities can mitigate air pollution by expanding reliable public transport.',
    practicePrompt: 'Explain one measure that could mitigate an environmental problem in your area.',
  },
  {
    id: 'ielts-environment-sustainable', term: 'sustainable', partOfSpeech: 'adjective', band: '6.5', topic: 'Environment',
    definition: 'able to continue without exhausting resources or causing long-term harm', vietnameseMeaning: 'ben vung',
    collocations: ['sustainable development', 'sustainable energy', 'sustainable lifestyle'],
    example: 'Sustainable energy policies reduce dependence on fossil fuels.',
    practicePrompt: 'Describe one sustainable habit you would encourage in schools.',
  },
  {
    id: 'ielts-environment-biodiversity', term: 'biodiversity', partOfSpeech: 'noun', band: '8.0+', topic: 'Environment',
    definition: 'the variety of plant and animal life in a particular habitat', vietnameseMeaning: 'da dang sinh hoc',
    collocations: ['protect biodiversity', 'loss of biodiversity', 'biodiversity conservation'],
    example: 'Deforestation can cause an irreversible loss of biodiversity.',
    practicePrompt: 'Give a reason why biodiversity conservation matters to communities.',
  },
  {
    id: 'ielts-environment-degrade', term: 'degrade', partOfSpeech: 'verb', band: '7.5', topic: 'Environment',
    definition: 'to reduce the quality of something over time', vietnameseMeaning: 'lam suy thoai',
    collocations: ['degrade soil quality', 'environmentally degraded', 'degrade rapidly'],
    example: 'Untreated waste can degrade the quality of rivers and farmland.',
    practicePrompt: 'Write one sentence about an activity that can degrade the environment.',
  },
  {
    id: 'ielts-technology-ubiquitous', term: 'ubiquitous', partOfSpeech: 'adjective', band: '8.0+', topic: 'Technology',
    definition: 'present or appearing everywhere', vietnameseMeaning: 'co mat khap noi',
    collocations: ['ubiquitous technology', 'become ubiquitous', 'increasingly ubiquitous'],
    example: 'Smartphones have become ubiquitous in modern communication.',
    practicePrompt: 'Discuss one benefit and one drawback of ubiquitous technology.',
  },
  {
    id: 'ielts-technology-innovative', term: 'innovative', partOfSpeech: 'adjective', band: '6.5', topic: 'Technology',
    definition: 'using new ideas or methods', vietnameseMeaning: 'doi moi, sang tao',
    collocations: ['innovative solution', 'innovative approach', 'highly innovative'],
    example: 'An innovative payment system can make public services easier to access.',
    practicePrompt: 'Describe an innovative solution to a daily problem.',
  },
  {
    id: 'ielts-technology-obsolete', term: 'obsolete', partOfSpeech: 'adjective', band: '7.5', topic: 'Technology',
    definition: 'no longer used because something newer is better', vietnameseMeaning: 'loi thoi',
    collocations: ['become obsolete', 'obsolete equipment', 'technologically obsolete'],
    example: 'Some jobs may become obsolete when routine tasks are automated.',
    practicePrompt: 'Should schools replace obsolete technology immediately? Explain why.',
  },
  {
    id: 'ielts-technology-digital-literacy', term: 'digital literacy', partOfSpeech: 'noun phrase', band: '7.5', topic: 'Technology',
    definition: 'the ability to find, evaluate, and use digital information effectively', vietnameseMeaning: 'nang luc so',
    collocations: ['improve digital literacy', 'digital literacy skills', 'lack digital literacy'],
    example: 'Digital literacy helps learners judge whether online information is trustworthy.',
    practicePrompt: 'Explain why digital literacy should be taught at school.',
  },
  {
    id: 'ielts-education-curriculum', term: 'curriculum', partOfSpeech: 'noun', band: '6.5', topic: 'Education',
    definition: 'the subjects and learning plan offered by an educational institution', vietnameseMeaning: 'chuong trinh giao duc',
    collocations: ['school curriculum', 'revise the curriculum', 'national curriculum'],
    example: 'A balanced curriculum should develop practical as well as academic skills.',
    practicePrompt: 'Name one subject that should be added to the school curriculum.',
  },
  {
    id: 'ielts-education-pedagogy', term: 'pedagogy', partOfSpeech: 'noun', band: '8.0+', topic: 'Education',
    definition: 'the method and practice of teaching', vietnameseMeaning: 'phuong phap giao duc',
    collocations: ['modern pedagogy', 'teaching pedagogy', 'student-centred pedagogy'],
    example: 'Student-centred pedagogy encourages learners to explain their reasoning.',
    practicePrompt: 'Compare a teacher-centred and a student-centred pedagogy.',
  },
  {
    id: 'ielts-education-compulsory', term: 'compulsory', partOfSpeech: 'adjective', band: '7.5', topic: 'Education',
    definition: 'required by law or rules', vietnameseMeaning: 'bat buoc',
    collocations: ['compulsory education', 'be compulsory', 'compulsory subject'],
    example: 'Many people believe financial literacy should be a compulsory school subject.',
    practicePrompt: 'Should physical education be compulsory at university?',
  },
  {
    id: 'ielts-education-academic-rigour', term: 'academic rigour', partOfSpeech: 'noun phrase', band: '8.0+', topic: 'Education',
    definition: 'a demanding standard of careful and serious academic work', vietnameseMeaning: 'tinh chat nghiem tuc hoc thuat',
    collocations: ['maintain academic rigour', 'academic rigour matters', 'rigorous academic standards'],
    example: 'Online courses can maintain academic rigour through clear feedback and assessment.',
    practicePrompt: 'How can online education maintain academic rigour?',
  },
  {
    id: 'ielts-health-preventive', term: 'preventive', partOfSpeech: 'adjective', band: '7.5', topic: 'Health',
    definition: 'intended to stop illness or problems before they occur', vietnameseMeaning: 'phong ngua',
    collocations: ['preventive healthcare', 'preventive measure', 'preventive screening'],
    example: 'Preventive healthcare can reduce pressure on hospitals over time.',
    practicePrompt: 'Describe one preventive health measure that governments should support.',
  },
  {
    id: 'ielts-health-sedentary', term: 'sedentary', partOfSpeech: 'adjective', band: '7.5', topic: 'Health',
    definition: 'involving too much sitting and too little physical activity', vietnameseMeaning: 'it van dong',
    collocations: ['sedentary lifestyle', 'sedentary work', 'reduce sedentary behaviour'],
    example: 'Office workers can reduce sedentary behaviour by taking regular walking breaks.',
    practicePrompt: 'What are the risks of a sedentary lifestyle?',
  },
  {
    id: 'ielts-health-wellbeing', term: 'well-being', partOfSpeech: 'noun', band: '6.5', topic: 'Health',
    definition: 'the state of being healthy, comfortable, and satisfied', vietnameseMeaning: 'suc khoe va hanh phuc',
    collocations: ['mental well-being', 'promote well-being', 'employee well-being'],
    example: 'Access to green spaces can improve mental well-being.',
    practicePrompt: 'Explain one way workplaces can support employee well-being.',
  },
  {
    id: 'ielts-health-alleviate', term: 'alleviate', partOfSpeech: 'verb', band: '8.0+', topic: 'Health',
    definition: 'to make pain or difficulty less severe', vietnameseMeaning: 'lam giam, xoa diu',
    collocations: ['alleviate pain', 'alleviate pressure', 'alleviate poverty'],
    example: 'Community clinics can alleviate pressure on major hospitals.',
    practicePrompt: 'Suggest one policy that could alleviate pressure on public hospitals.',
  },
  {
    id: 'ielts-society-disparity', term: 'disparity', partOfSpeech: 'noun', band: '8.0+', topic: 'Society',
    definition: 'a great difference between two groups or situations', vietnameseMeaning: 'su chenh lech',
    collocations: ['income disparity', 'reduce disparities', 'regional disparity'],
    example: 'Reliable transport can reduce the disparity between urban and rural opportunities.',
    practicePrompt: 'Describe one cause of income disparity in a country.',
  },
  {
    id: 'ielts-society-cohesion', term: 'social cohesion', partOfSpeech: 'noun phrase', band: '8.0+', topic: 'Society',
    definition: 'the strength of relationships and shared belonging within a community', vietnameseMeaning: 'su gan ket xa hoi',
    collocations: ['promote social cohesion', 'community cohesion', 'strengthen cohesion'],
    example: 'Public libraries can promote social cohesion by offering shared community spaces.',
    practicePrompt: 'How can local facilities strengthen social cohesion?',
  },
  {
    id: 'ielts-society-volunteer', term: 'volunteerism', partOfSpeech: 'noun', band: '6.5', topic: 'Society',
    definition: 'the practice of giving time to help others without payment', vietnameseMeaning: 'hoat dong tinh nguyen',
    collocations: ['encourage volunteerism', 'culture of volunteerism', 'youth volunteerism'],
    example: 'Youth volunteerism can help students develop empathy and practical skills.',
    practicePrompt: 'Should volunteerism be part of secondary education?',
  },
  {
    id: 'ielts-society-marginalised', term: 'marginalised', partOfSpeech: 'adjective', band: '7.5', topic: 'Society',
    definition: 'treated as less important and kept outside the main part of society', vietnameseMeaning: 'bi gạt ra ben le',
    collocations: ['marginalised communities', 'support marginalised groups', 'socially marginalised'],
    example: 'Accessible public services should support marginalised communities.',
    practicePrompt: 'What can governments do to support marginalised groups?',
  },
  {
    id: 'ielts-work-productivity', term: 'productivity', partOfSpeech: 'noun', band: '6.5', topic: 'Work',
    definition: 'the rate at which useful work is completed', vietnameseMeaning: 'nang suat',
    collocations: ['increase productivity', 'workplace productivity', 'productivity gains'],
    example: 'Clear priorities can improve productivity without extending working hours.',
    practicePrompt: 'What is one healthy way to improve workplace productivity?',
  },
  {
    id: 'ielts-work-autonomy', term: 'autonomy', partOfSpeech: 'noun', band: '7.5', topic: 'Work',
    definition: 'the freedom to make decisions about how work is done', vietnameseMeaning: 'tinh tu chu',
    collocations: ['employee autonomy', 'greater autonomy', 'professional autonomy'],
    example: 'Employee autonomy can improve motivation when goals are clearly defined.',
    practicePrompt: 'Should employees have greater autonomy at work?',
  },
  {
    id: 'ielts-work-entrepreneurship', term: 'entrepreneurship', partOfSpeech: 'noun', band: '7.5', topic: 'Work',
    definition: 'the activity of creating and running a business', vietnameseMeaning: 'tinh than khoi nghiep',
    collocations: ['encourage entrepreneurship', 'social entrepreneurship', 'entrepreneurial skills'],
    example: 'Entrepreneurship education can help learners turn useful ideas into services.',
    practicePrompt: 'Should schools teach entrepreneurship?',
  },
  {
    id: 'ielts-work-work-life-balance', term: 'work-life balance', partOfSpeech: 'noun phrase', band: '6.5', topic: 'Work',
    definition: 'a healthy division between work responsibilities and personal life', vietnameseMeaning: 'can bang cong viec va cuoc song',
    collocations: ['maintain work-life balance', 'poor work-life balance', 'improve work-life balance'],
    idiom: 'burn the candle at both ends',
    example: 'Flexible hours can help parents maintain a better work-life balance.',
    practicePrompt: 'Describe a policy that could improve work-life balance.',
  },
] as const;

export const IELTS_VOCABULARY = entries;

export function filterIeltsVocabulary(filters: {
  readonly band?: IeltsVocabularyBand | 'all';
  readonly topic?: IeltsVocabularyTopic | 'all';
  readonly query?: string;
} = {}): readonly IeltsVocabularyEntry[] {
  const query = filters.query?.trim().toLowerCase() ?? '';
  return IELTS_VOCABULARY.filter((entry) => (
    (!filters.band || filters.band === 'all' || entry.band === filters.band)
    && (!filters.topic || filters.topic === 'all' || entry.topic === filters.topic)
    && (!query || [entry.term, entry.definition, entry.topic, ...entry.collocations]
      .some((value) => value.toLowerCase().includes(query)))
  ));
}

export function createIeltsVocabularyProgress(entryId: string, now: string): IeltsVocabularyProgress {
  if (!IELTS_VOCABULARY.some((entry) => entry.id === entryId)) {
    throw new Error(`Unknown IELTS vocabulary entry: ${entryId}`);
  }
  return { entryId, repetitions: 0, lapses: 0, intervalDays: 0, dueAt: now };
}

function toMillis(value: string): number {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(toMillis(iso) + minutes * 60_000).toISOString();
}

function addDays(iso: string, days: number): string {
  return new Date(toMillis(iso) + days * 86_400_000).toISOString();
}

export function gradeIeltsVocabularyReview(
  progress: IeltsVocabularyProgress,
  rating: IeltsVocabularyRating,
  now: string,
): IeltsVocabularyProgress {
  if (rating === 'again') {
    return {
      ...progress,
      repetitions: 0,
      lapses: progress.lapses + 1,
      intervalDays: 0,
      dueAt: addMinutes(now, 10),
      lastReviewedAt: now,
    };
  }

  const multiplier = rating === 'easy' ? 2.5 : rating === 'good' ? 2 : 1.2;
  const baseInterval = progress.intervalDays > 0 ? progress.intervalDays : 1;
  const intervalDays = Math.max(1, Math.round(baseInterval * multiplier));
  return {
    ...progress,
    repetitions: progress.repetitions + 1,
    intervalDays,
    dueAt: addDays(now, intervalDays),
    lastReviewedAt: now,
  };
}

export function buildIeltsVocabularyReviewQueue(
  progressRecords: readonly IeltsVocabularyProgress[],
  now: string,
  limit = 12,
): readonly IeltsVocabularyReviewItem[] {
  const byId = new Map(progressRecords.map((record) => [record.entryId, record]));
  const records = IELTS_VOCABULARY.map((entry) => ({
    entry,
    progress: byId.get(entry.id) ?? createIeltsVocabularyProgress(entry.id, now),
  }));
  const nowMillis = toMillis(now);
  return records
    .filter((item) => toMillis(item.progress.dueAt) <= nowMillis)
    .sort((left, right) => (
      toMillis(left.progress.dueAt) - toMillis(right.progress.dueAt)
      || left.progress.repetitions - right.progress.repetitions
      || left.entry.id.localeCompare(right.entry.id)
    ))
    .slice(0, Math.max(1, limit));
}
