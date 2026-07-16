export interface SpeakingPrompt {
  id: string;
  topic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'IELTS Part 1' | 'IELTS Part 2' | 'IELTS Part 3';
  prompt: string;
  bulletPoints?: string[];
  sampleAnswer?: string;
  expectedDurationSeconds: number;
  tags: string[];
}

export const speakingPrompts: SpeakingPrompt[] = [
  { id: 's1', topic: 'Self Introduction', level: 'A1', prompt: 'Introduce yourself. Say your name, where you are from, what you do, and one thing you like.', sampleAnswer: 'My name is Minh. I am from Ho Chi Minh City, Vietnam. I am a university student studying business. I like playing football with my friends on weekends.', expectedDurationSeconds: 30, tags: ['basics'] },
  { id: 's2', topic: 'My Family', level: 'A1', prompt: 'Describe your family. How many people are there? What do they do?', sampleAnswer: 'There are four people in my family: my parents, my younger sister, and me. My father is an engineer and my mother is a teacher. My sister is a high school student.', expectedDurationSeconds: 30, tags: ['family', 'basics'] },
  { id: 's3', topic: 'My Daily Routine', level: 'A2', prompt: 'Describe a typical day in your life. What do you do from morning to evening?', expectedDurationSeconds: 45, tags: ['daily life'] },
  { id: 's4', topic: 'A Place I Love', level: 'A2', prompt: 'Talk about a place you love to visit. Where is it? What do you do there? Why do you like it?', expectedDurationSeconds: 45, tags: ['travel'] },
  { id: 's5', topic: 'Learning English', level: 'B1', prompt: 'Why are you learning English? What methods do you use? What challenges do you face?', expectedDurationSeconds: 60, tags: ['education', 'language'] },
  { id: 's6', topic: 'Social Media', level: 'B1', prompt: 'Do you use social media? Which platforms? What do you think are the advantages and disadvantages?', expectedDurationSeconds: 60, tags: ['technology', 'society'] },
  { id: 's7', topic: 'Healthy Lifestyle', level: 'B2', prompt: 'What does a healthy lifestyle mean to you? How do you try to stay healthy? What advice would you give others?', expectedDurationSeconds: 90, tags: ['health'] },
  { id: 's8', topic: 'Describe a memorable trip', level: 'IELTS Part 2', prompt: 'Describe a memorable trip you took.', bulletPoints: ['Where did you go?', 'Who did you go with?', 'What did you do there?', 'Explain why it was memorable.'], expectedDurationSeconds: 120, tags: ['travel', 'ielts'] },
  { id: 's9', topic: 'Describe a person who has influenced you', level: 'IELTS Part 2', prompt: 'Describe a person who has had a significant influence on your life.', bulletPoints: ['Who is this person?', 'How did you meet them?', 'What did they do that influenced you?', 'How has your life changed because of them?'], expectedDurationSeconds: 120, tags: ['people', 'ielts'] },
  { id: 's10', topic: 'Describe a book or film you enjoyed', level: 'IELTS Part 2', prompt: 'Describe a book you read or a film you watched recently that you really enjoyed.', bulletPoints: ['What was it about?', 'When did you read/watch it?', 'Why did you enjoy it?', 'Would you recommend it to others?'], expectedDurationSeconds: 120, tags: ['entertainment', 'ielts'] },
  { id: 's11', topic: 'Hometown', level: 'IELTS Part 1', prompt: 'Can you describe your hometown? What is special about it? Would you recommend it to visitors?', expectedDurationSeconds: 60, tags: ['ielts', 'places'] },
  { id: 's12', topic: 'Technology and Society', level: 'IELTS Part 3', prompt: 'How has technology changed the way people communicate? Do you think face-to-face communication is becoming less important?', expectedDurationSeconds: 120, tags: ['technology', 'ielts'] },
  { id: 's13', topic: 'Education System', level: 'IELTS Part 3', prompt: 'What are the biggest challenges facing the education system in your country? How could it be improved?', expectedDurationSeconds: 120, tags: ['education', 'ielts'] },
  { id: 's14', topic: 'Environmental Responsibility', level: 'IELTS Part 3', prompt: 'Should individuals or governments be more responsible for protecting the environment? Why?', expectedDurationSeconds: 120, tags: ['environment', 'ielts'] },
  { id: 's15', topic: 'Pronunciation: Minimal Pairs', level: 'A2', prompt: 'Practice these pairs: ship/sheep, sit/seat, bit/beat, fill/feel. Say each word clearly and slowly.', expectedDurationSeconds: 30, tags: ['pronunciation'] },
  { id: 's16', topic: 'Shadowing: Restaurant Order', level: 'B1', prompt: 'Listen to the sentence and repeat: "I would like a hamburger and a glass of cola, please. Could I also get a side of fries?"', expectedDurationSeconds: 15, tags: ['shadowing', 'fluency'] },
  { id: 's17', topic: 'Debate: Online Learning vs Classroom', level: 'B2', prompt: 'Argue for or against this statement: "Online learning is more effective than traditional classroom learning." Give at least three reasons.', expectedDurationSeconds: 120, tags: ['debate', 'education'] },
  { id: 's18', topic: 'Describe a Skill', level: 'B1', prompt: 'Talk about a skill you would like to learn or improve. Why is it important? How do you plan to learn it?', expectedDurationSeconds: 60, tags: ['self-improvement'] },
  { id: 's19', topic: 'City vs Countryside', level: 'B2', prompt: 'Do you prefer living in a city or the countryside? What are the advantages and disadvantages of each?', expectedDurationSeconds: 90, tags: ['society', 'ielts'] },
  { id: 's20', topic: 'Future Plans', level: 'B1', prompt: 'What are your plans for the next 5 years? Talk about your career, education, and personal goals.', expectedDurationSeconds: 60, tags: ['career', 'goals'] },
];
