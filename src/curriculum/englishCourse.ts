export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: {
    id: string;
    title: string;
    type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing';
    referenceId: string; // Links to the bank ID
  }[];
}

export const englishCourse: CourseUnit[] = [
  // A1 Beginner
  {
    id: 'en-a1-1',
    title: 'Welcome to English',
    description: 'Learn the absolute basics to survive in an English-speaking environment.',
    level: 'A1',
    lessons: [
      { id: 'en-a1-1-v1', title: 'Basic Greetings', type: 'vocabulary', referenceId: 'v1' },
      { id: 'en-a1-1-g1', title: 'I am, You are', type: 'grammar', referenceId: 'g1' },
      { id: 'en-a1-1-l1', title: 'Ordering Food', type: 'listening', referenceId: 'l1' },
      { id: 'en-a1-1-s1', title: 'Saying Hello', type: 'speaking', referenceId: 's1' },
      { id: 'en-a1-1-w1', title: 'Your First Message', type: 'writing', referenceId: 'w1' }
    ]
  },
  {
    id: 'en-a1-2',
    title: 'Daily Life',
    description: 'Talk about your routines and habits.',
    level: 'A1',
    lessons: [
      { id: 'en-a1-2-v1', title: 'Common Objects', type: 'vocabulary', referenceId: 'v2' },
      { id: 'en-a1-2-g1', title: 'Plural Nouns', type: 'grammar', referenceId: 'g2' },
      { id: 'en-a1-2-r1', title: 'A Student Life', type: 'reading', referenceId: 'r1' },
      { id: 'en-a1-2-s1', title: 'Introducing Yourself', type: 'speaking', referenceId: 's2' },
      { id: 'en-a1-2-w1', title: 'Your Routine', type: 'writing', referenceId: 'w2' }
    ]
  },
  // A2 Elementary
  {
    id: 'en-a2-1',
    title: 'Past Events',
    description: 'Talk about things that have already happened.',
    level: 'A2',
    lessons: [
      { id: 'en-a2-1-v1', title: 'Travel & Transport', type: 'vocabulary', referenceId: 'v3' },
      { id: 'en-a2-1-g1', title: 'Simple Past', type: 'grammar', referenceId: 'g3' },
      { id: 'en-a2-1-l1', title: 'A Vacation Story', type: 'listening', referenceId: 'l2' },
      { id: 'en-a2-1-r1', title: 'Travel Blog', type: 'reading', referenceId: 'r2' },
      { id: 'en-a2-1-s1', title: 'Describing a Trip', type: 'speaking', referenceId: 's3' }
    ]
  },
  {
    id: 'en-a2-2',
    title: 'Directions & Locations',
    description: 'Navigate the city and give directions.',
    level: 'A2',
    lessons: [
      { id: 'en-a2-2-v1', title: 'City Places', type: 'vocabulary', referenceId: 'v4' },
      { id: 'en-a2-2-g1', title: 'Prepositions of Place', type: 'grammar', referenceId: 'g4' },
      { id: 'en-a2-2-l1', title: 'Asking for Directions', type: 'listening', referenceId: 'l3' },
      { id: 'en-a2-2-s1', title: 'Giving Directions', type: 'speaking', referenceId: 's4' }
    ]
  },
  // B1 Intermediate
  {
    id: 'en-b1-1',
    title: 'Opinions & News',
    description: 'Express your thoughts on current events.',
    level: 'B1',
    lessons: [
      { id: 'en-b1-1-v1', title: 'News Vocabulary', type: 'vocabulary', referenceId: 'v5' },
      { id: 'en-b1-1-g1', title: 'Present Perfect', type: 'grammar', referenceId: 'g5' },
      { id: 'en-b1-1-r1', title: 'Global News Article', type: 'reading', referenceId: 'r3' },
      { id: 'en-b1-1-w1', title: 'Writing an Opinion', type: 'writing', referenceId: 'w3' }
    ]
  },
  {
    id: 'en-b1-2',
    title: 'Problem Solving',
    description: 'Discuss issues and propose solutions.',
    level: 'B1',
    lessons: [
      { id: 'en-b1-2-v1', title: 'Workplace Terms', type: 'vocabulary', referenceId: 'v6' },
      { id: 'en-b1-2-g1', title: 'Conditionals (Zero & First)', type: 'grammar', referenceId: 'g6' },
      { id: 'en-b1-2-l1', title: 'Meeting Negotiation', type: 'listening', referenceId: 'l4' },
      { id: 'en-b1-2-s1', title: 'Proposing a Fix', type: 'speaking', referenceId: 's5' }
    ]
  },
  // B2 Upper Intermediate
  {
    id: 'en-b2-1',
    title: 'Debate & Discussion',
    description: 'Argue complex points effectively.',
    level: 'B2',
    lessons: [
      { id: 'en-b2-1-v1', title: 'Academic Vocabulary', type: 'vocabulary', referenceId: 'v7' },
      { id: 'en-b2-1-g1', title: 'Passive Voice', type: 'grammar', referenceId: 'g7' },
      { id: 'en-b2-1-r1', title: 'Research Paper Extract', type: 'reading', referenceId: 'r4' },
      { id: 'en-b2-1-w1', title: 'Argumentative Essay', type: 'writing', referenceId: 'w4' }
    ]
  },
  {
    id: 'en-b2-2',
    title: 'Professional Talks',
    description: 'Deliver and understand long presentations.',
    level: 'B2',
    lessons: [
      { id: 'en-b2-2-v1', title: 'Presentation Phrases', type: 'vocabulary', referenceId: 'v8' },
      { id: 'en-b2-2-g1', title: 'Reported Speech', type: 'grammar', referenceId: 'g8' },
      { id: 'en-b2-2-l1', title: 'TED-style Talk', type: 'listening', referenceId: 'l5' },
      { id: 'en-b2-2-s1', title: 'Mini Presentation', type: 'speaking', referenceId: 's6' }
    ]
  },
  // IELTS Track
  {
    id: 'en-ielts-1',
    title: 'IELTS Foundation',
    description: 'Core skills for the IELTS exam.',
    level: 'IELTS',
    lessons: [
      { id: 'en-ielts-1-v1', title: 'IELTS Core Vocab', type: 'vocabulary', referenceId: 'v9' },
      { id: 'en-ielts-1-r1', title: 'Skimming & Scanning', type: 'reading', referenceId: 'r5' },
      { id: 'en-ielts-1-l1', title: 'Listening Part 1', type: 'listening', referenceId: 'l6' },
      { id: 'en-ielts-1-s1', title: 'Speaking Part 1', type: 'speaking', referenceId: 's7' }
    ]
  }
];
