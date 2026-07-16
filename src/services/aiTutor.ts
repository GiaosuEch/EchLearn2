// AI Tutor Mock Service
// Replace with real OpenAI/Claude API integration

export interface AITutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const tutorResponses: Record<string, string[]> = {
  grammar: [
    "Great question! Let me explain this grammar point clearly.\n\nThe key difference is about **time reference**. Present Perfect connects the past to NOW, while Past Simple is about a FINISHED time.\n\n✅ I have visited Paris. (experience, time not important)\n✅ I visited Paris last year. (specific past time)\n\nWould you like me to give you more examples?",
    "That's a common confusion! Here's how to think about it:\n\n**Present Simple** = habits, routines, facts\n**Present Continuous** = happening RIGHT NOW or temporary\n\n🔑 Key signal words:\n- Always, usually, often → Simple\n- Now, right now, at the moment → Continuous\n\nShall we practice with some exercises?",
  ],
  vocabulary: [
    "Here's a great way to remember this word:\n\n📚 **Abundant** /əˈbʌndənt/\nMeaning: existing in very large quantities\n\nThink of it as: 'a-BUN-dance' — imagine so many buns dancing around that there are TOO MANY! 🍞💃\n\nExample: 'The tropical island had abundant wildlife.'\n\nCan you make your own sentence with 'abundant'?",
  ],
  ielts: [
    "For IELTS Writing Task 2, here's a proven essay structure:\n\n📝 **4-Paragraph Structure:**\n1. **Introduction** (2-3 sentences): Paraphrase + thesis\n2. **Body 1** (5-6 sentences): First main idea + examples\n3. **Body 2** (5-6 sentences): Second main idea + examples\n4. **Conclusion** (2-3 sentences): Summarize + final opinion\n\n⚡ Pro tip: Spend 5 minutes planning before writing!\n\nWant me to help you practice with a sample prompt?",
  ],
  general: [
    "I'd be happy to help you with that! 🐸\n\nBased on your current level, I recommend focusing on:\n1. Building vocabulary through daily flashcards\n2. Practicing speaking for 10 minutes daily\n3. Reading short articles in English\n\nWhich area would you like to work on right now?",
    "That's a fantastic question! Let me break it down for you.\n\nRemember, making mistakes is part of learning. Every error is a step forward! 🚀\n\nLet me know if you need more clarification or examples.",
  ],
};

export async function getAITutorResponse(message: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const lowerMessage = message.toLowerCase();
  let category = 'general';

  if (lowerMessage.includes('grammar') || lowerMessage.includes('tense') || lowerMessage.includes('verb')) {
    category = 'grammar';
  } else if (lowerMessage.includes('vocabulary') || lowerMessage.includes('word') || lowerMessage.includes('meaning')) {
    category = 'vocabulary';
  } else if (lowerMessage.includes('ielts') || lowerMessage.includes('writing') || lowerMessage.includes('band')) {
    category = 'ielts';
  }

  const responses = tutorResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function getMascotGreeting(userName: string, streak: number): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Hey';

  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';

  const greetings = [
    `${timeGreeting}, ${userName}! 🐸 Ready to learn something awesome today?`,
    `${timeGreeting}, ${userName}! Streak day ${streak} — you're on fire! 🔥`,
    `${timeGreeting}, ${userName}! Your brain is ready for action! Let's go! 🚀`,
    `${timeGreeting}, ${userName}! The frog sensei awaits! 🥋🐸`,
    `${timeGreeting}, ${userName}! One more lesson to keep your streak alive ✨`,
    `${timeGreeting}, ${userName}! Yay, you're here! Let's make today count! 🎉`,
    `${timeGreeting}, ${userName}! I've been hopping around waiting for you! 🐸💚`,
    `${timeGreeting}, ${userName}! Small steps, big wins — let's learn! 🌟`,
    `${timeGreeting}, ${userName}! I believe in you — today's the day! 💪✨`,
    `${timeGreeting}, ${userName}! Let's turn today's lesson into a tiny victory! 🏆`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/** Short, high-energy micro-reaction shown right after an answer — keeps the mascot feeling alive turn to turn. */
export function getMascotCheer(isCorrect: boolean): string {
  const correctCheers = [
    "Yes! Nailed it! 🎉",
    "Boom! You've got this! 💥",
    "Yesss! Perfect! ✨",
    "Woohoo, correct! 🐸🎊",
    "That's it! Keep the streak going! 🔥",
    "Nice one! You're on a roll! 🚀",
    "Correct! You're basically fluent already 😎",
  ];
  const encourageCheers = [
    "So close! Let's try that again 🌱",
    "Almost! Mistakes mean you're learning 💡",
    "No worries, one more try! 🐸",
    "Good effort! Let's crack this together 🤝",
    "Not quite, but you're getting sharper! ✨",
    "That's okay — every miss is a mini lesson 📘",
  ];
  const pool = isCorrect ? correctCheers : encourageCheers;
  return pool[Math.floor(Math.random() * pool.length)];
}
