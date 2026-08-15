export interface ListeningTask {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string;
  transcript: string;
  speechLang?: string;
  durationEstimate?: number; // estimated seconds when read by TTS
  topic?: string;
  romanization?: string;
  meaningVietnamese?: string;
  mediaResources?: {
    type: string;
    label: string;
    url: string;
  }[];
  questions: {
    id: string;
    type: 'multiple_choice' | 'fill_in_the_blank' | string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  tags?: string[];
}

export const listeningLibrary: ListeningTask[] = [
  {
    id: 'l1', title: 'Ordering at a Restaurant', level: 'A1', speechLang: 'en-US', durationEstimate: 25,
    transcript: 'Waiter: Good evening. Welcome to The Garden Restaurant. Are you ready to order?\nCustomer: Yes, I would like a hamburger and a glass of cola, please.\nWaiter: Would you like fries with that?\nCustomer: Yes, please. And can I also have a salad?\nWaiter: Of course. Anything else?\nCustomer: No, that\'s all. Thank you.\nWaiter: Your order will be ready in about 10 minutes.',
    questions: [
      { id: 'l1q1', type: 'multiple_choice', question: 'What did the customer order to drink?', options: ['Water', 'Cola', 'Coffee', 'Juice'], correctAnswer: 'Cola', explanation: 'The customer says "a glass of cola, please."' },
      { id: 'l1q2', type: 'multiple_choice', question: 'How long will the order take?', options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'], correctAnswer: '10 minutes', explanation: 'The waiter says "about 10 minutes."' },
    ],
    tags: ['food', 'daily life']
  },
  {
    id: 'l2', title: 'Asking for Directions', level: 'A1', speechLang: 'en-US', durationEstimate: 30,
    transcript: 'Tourist: Excuse me. Can you tell me how to get to the train station?\nLocal: Sure. Go straight along this road for about 200 metres. Then turn left at the traffic lights. The train station is on your right. You can\'t miss it.\nTourist: How long does it take to walk there?\nLocal: About 5 minutes.\nTourist: Thank you very much!\nLocal: You\'re welcome. Have a nice day!',
    questions: [
      { id: 'l2q1', type: 'multiple_choice', question: 'Where does the tourist want to go?', options: ['The airport', 'The bus stop', 'The train station', 'The hotel'], correctAnswer: 'The train station', explanation: 'The tourist asks "how to get to the train station."' },
      { id: 'l2q2', type: 'fill_in_the_blank', question: 'Turn ___ at the traffic lights.', correctAnswer: 'left', explanation: 'The local says "turn left at the traffic lights."' },
    ],
    tags: ['travel', 'directions']
  },
  {
    id: 'l3', title: 'Making a Doctor\'s Appointment', level: 'A2', speechLang: 'en-US', durationEstimate: 35,
    transcript: 'Receptionist: Good morning. City Medical Centre. How can I help you?\nPatient: Hello. I\'d like to make an appointment with Doctor Chen, please.\nReceptionist: Is it urgent?\nPatient: Not really, but I\'ve had a headache for three days.\nReceptionist: I see. Doctor Chen is available on Thursday at 2:30 PM. Does that work for you?\nPatient: Yes, that\'s fine.\nReceptionist: Can I have your name, please?\nPatient: It\'s Sarah Williams.\nReceptionist: And your date of birth?\nPatient: March 15th, 1995.\nReceptionist: Perfect. You\'re booked for Thursday at 2:30. Please arrive 10 minutes early to fill in some forms.\nPatient: Thank you.',
    questions: [
      { id: 'l3q1', type: 'multiple_choice', question: 'What is the patient\'s problem?', options: ['Stomach pain', 'A headache for three days', 'A broken arm', 'A cough'], correctAnswer: 'A headache for three days', explanation: 'The patient says "I\'ve had a headache for three days."' },
      { id: 'l3q2', type: 'multiple_choice', question: 'When is the appointment?', options: ['Monday at 10 AM', 'Wednesday at 3 PM', 'Thursday at 2:30 PM', 'Friday at 9 AM'], correctAnswer: 'Thursday at 2:30 PM', explanation: '"Doctor Chen is available on Thursday at 2:30 PM."' },
    ],
    tags: ['health', 'appointments']
  },
  {
    id: 'l4', title: 'Checking into a Hotel', level: 'A2', speechLang: 'en-US', durationEstimate: 30,
    transcript: 'Receptionist: Welcome to the Grand Hotel. How may I help you?\nGuest: Good afternoon. I have a reservation under the name Thompson.\nReceptionist: Let me check. Yes, Mr. Thompson, a double room for three nights. Is that correct?\nGuest: Yes, that\'s right.\nReceptionist: Your room is on the fourth floor, room 412. Here is your key card. Breakfast is served in the restaurant on the ground floor from 7 to 10 AM.\nGuest: Is there Wi-Fi in the room?\nReceptionist: Yes, the password is on the card in your room. Is there anything else you need?\nGuest: No, thank you. That\'s everything.',
    questions: [
      { id: 'l4q1', type: 'multiple_choice', question: 'How many nights will the guest stay?', options: ['One', 'Two', 'Three', 'Four'], correctAnswer: 'Three', explanation: '"A double room for three nights."' },
      { id: 'l4q2', type: 'fill_in_the_blank', question: 'The room number is ___.', correctAnswer: '412', explanation: '"Your room is on the fourth floor, room 412."' },
    ],
    tags: ['travel', 'hotel']
  },
  {
    id: 'l5', title: 'A University Lecture Introduction', level: 'B1', speechLang: 'en-US', durationEstimate: 45,
    transcript: 'Good morning, everyone. Welcome to Introduction to Environmental Science. My name is Professor Adams, and I\'ll be your instructor for this semester.\n\nThis course will cover several important topics. First, we\'ll look at ecosystems and biodiversity. Then we\'ll examine the causes and effects of climate change. In the second half of the course, we\'ll focus on pollution, water management, and sustainable development.\n\nAssessment for this course includes a midterm exam worth 30%, a final exam worth 40%, and a research project worth 30%. The research project requires you to investigate an environmental issue in your local area and propose solutions.\n\nPlease make sure to read Chapter 1 of the textbook before our next class. I\'ll also post additional reading materials on the course website.\n\nAre there any questions?',
    questions: [
      { id: 'l5q1', type: 'multiple_choice', question: 'What is the course about?', options: ['Computer Science', 'Environmental Science', 'Business', 'Psychology'], correctAnswer: 'Environmental Science', explanation: '"Introduction to Environmental Science."' },
      { id: 'l5q2', type: 'multiple_choice', question: 'How much is the final exam worth?', options: ['20%', '30%', '40%', '50%'], correctAnswer: '40%', explanation: '"A final exam worth 40%."' },
      { id: 'l5q3', type: 'fill_in_the_blank', question: 'The research project is about an environmental issue in the student\'s ___ area.', correctAnswer: 'local', explanation: '"Investigate an environmental issue in your local area."' },
    ],
    tags: ['education', 'academic']
  },
  {
    id: 'l6', title: 'Weather Forecast', level: 'B1', speechLang: 'en-GB', durationEstimate: 35,
    transcript: 'And now, the weather forecast for the coming week. Today will be mostly cloudy with temperatures reaching a high of 22 degrees Celsius. There is a 60 percent chance of rain in the afternoon, so don\'t forget your umbrella.\n\nTomorrow looks much better. Expect sunny skies with temperatures around 25 degrees. It will be a great day to spend time outdoors.\n\nHowever, from Wednesday onwards, a cold front is moving in from the north. Temperatures will drop to around 15 degrees, and we can expect heavy rain on Thursday and Friday. Weekend looks like it will improve, with partly cloudy skies and temperatures recovering to around 20 degrees.',
    questions: [
      { id: 'l6q1', type: 'multiple_choice', question: 'What is today\'s high temperature?', options: ['18°C', '20°C', '22°C', '25°C'], correctAnswer: '22°C', explanation: '"Temperatures reaching a high of 22 degrees Celsius."' },
      { id: 'l6q2', type: 'multiple_choice', question: 'When will heavy rain occur?', options: ['Monday and Tuesday', 'Wednesday and Thursday', 'Thursday and Friday', 'Saturday and Sunday'], correctAnswer: 'Thursday and Friday', explanation: '"Heavy rain on Thursday and Friday."' },
    ],
    tags: ['weather', 'daily life']
  },
  {
    id: 'l7', title: 'Job Interview', level: 'B2', speechLang: 'en-US', durationEstimate: 50,
    transcript: 'Interviewer: Thank you for coming in today. So, tell me a little about yourself.\nCandidate: Thank you for having me. I recently graduated from National University with a degree in Marketing. During my studies, I completed a six-month internship at a digital marketing agency where I managed social media campaigns for several clients.\nInterviewer: What attracted you to this position?\nCandidate: I\'ve always admired your company\'s innovative approach to marketing. The opportunity to work on global campaigns really excites me, and I believe my experience with social media analytics would be valuable to your team.\nInterviewer: Can you give an example of a challenge you faced and how you handled it?\nCandidate: During my internship, one of our client\'s campaigns wasn\'t performing well. I analysed the data and discovered that we were targeting the wrong demographic. I proposed a new targeting strategy, and within two weeks, engagement increased by 45 percent.\nInterviewer: That\'s impressive. What are your salary expectations?\nCandidate: Based on my research and the responsibilities of this role, I\'m looking for a salary in the range of 15 to 18 million dong per month.',
    questions: [
      { id: 'l7q1', type: 'multiple_choice', question: 'What did the candidate study?', options: ['Engineering', 'Marketing', 'Finance', 'Computer Science'], correctAnswer: 'Marketing', explanation: '"A degree in Marketing."' },
      { id: 'l7q2', type: 'multiple_choice', question: 'By how much did engagement increase?', options: ['15%', '25%', '35%', '45%'], correctAnswer: '45%', explanation: '"Engagement increased by 45 percent."' },
    ],
    tags: ['work', 'interview']
  },
  {
    id: 'l8', title: 'Museum Audio Guide', level: 'B1', speechLang: 'en-GB', durationEstimate: 40,
    transcript: 'Welcome to the National History Museum. You are now in Gallery Three, which is dedicated to Ancient Egypt.\n\nThe large statue in front of you is a replica of the Great Sphinx of Giza. The original Sphinx was carved from limestone approximately 4,500 years ago. It has the body of a lion and the head of a human, believed to represent the Pharaoh Khafre.\n\nTo your right, you can see a collection of hieroglyphics — the writing system used by ancient Egyptians. Hieroglyphics used pictures and symbols to represent sounds and ideas. It wasn\'t until 1822, when the French scholar Jean-François Champollion decoded the Rosetta Stone, that modern scholars could finally read these ancient texts.\n\nPlease proceed to Gallery Four to see our collection of Egyptian jewellery and pottery.',
    questions: [
      { id: 'l8q1', type: 'multiple_choice', question: 'How old is the original Sphinx approximately?', options: ['2,500 years', '3,500 years', '4,500 years', '5,500 years'], correctAnswer: '4,500 years', explanation: '"Carved from limestone approximately 4,500 years ago."' },
      { id: 'l8q2', type: 'fill_in_the_blank', question: 'Hieroglyphics used pictures and symbols to represent sounds and ___.', correctAnswer: 'ideas', explanation: '"Used pictures and symbols to represent sounds and ideas."' },
    ],
    tags: ['culture', 'history']
  },
  {
    id: 'l9', title: 'Radio News Report', level: 'B2', speechLang: 'en-GB', durationEstimate: 45,
    transcript: 'Good evening. Here are tonight\'s main stories.\n\nThe government has announced a new investment of 5 billion pounds in renewable energy infrastructure. The plan includes building 200 new wind turbines off the coast of Scotland and expanding solar panel installations across southern England. The Energy Minister said the investment would create approximately 50,000 new jobs over the next five years.\n\nIn other news, a new study from Oxford University has found that learning a musical instrument before the age of 10 significantly improves mathematical ability. Researchers followed 3,000 children over a period of 8 years and found that those who played instruments scored, on average, 15 percent higher in maths exams.\n\nAnd finally, the national football team has qualified for the World Cup after a dramatic 2-1 victory over Australia. The winning goal was scored in the 89th minute by striker James Wilson.',
    questions: [
      { id: 'l9q1', type: 'multiple_choice', question: 'How much is being invested in renewable energy?', options: ['1 billion', '3 billion', '5 billion', '10 billion'], correctAnswer: '5 billion', explanation: '"A new investment of 5 billion pounds."' },
      { id: 'l9q2', type: 'multiple_choice', question: 'What did the Oxford study find about music?', options: ['It improves reading', 'It improves maths', 'It improves sports', 'It improves memory'], correctAnswer: 'It improves maths', explanation: '"Learning a musical instrument significantly improves mathematical ability."' },
      { id: 'l9q3', type: 'fill_in_the_blank', question: 'The winning goal was scored in the ___th minute.', correctAnswer: '89', explanation: '"The winning goal was scored in the 89th minute."' },
    ],
    tags: ['news', 'current events']
  },
  {
    id: 'l10', title: 'TED Talk Summary: The Power of Introverts', level: 'B2', speechLang: 'en-US', durationEstimate: 50,
    transcript: 'In her famous TED talk, Susan Cain argues that the world is designed for extroverts, and that introverts are undervalued in our society.\n\nShe explains that one-third to one-half of the population are introverts. These are people who feel most alive and most switched-on in quieter, less stimulating environments. Yet our most important institutions — schools, workplaces, and governments — are designed for extroverts.\n\nCain presents research showing that introverts are often more creative and productive when given privacy and autonomy. She points out that many of the world\'s most transformative leaders and innovators were introverts — from Rosa Parks to Steve Wozniak to Gandhi.\n\nHer key message is that society needs to stop the "madness for constant group work" and instead create environments where people have the freedom to work alone when they need to. She doesn\'t argue that collaboration is bad, but rather that it needs to be balanced with solitude.\n\nThe talk concludes with three calls to action: stop the madness for constant group work, go to the wilderness occasionally to have your own revelations, and take a good look at what\'s inside your own suitcase — meaning, share your ideas with the world.',
    questions: [
      { id: 'l10q1', type: 'multiple_choice', question: 'What proportion of people are introverts?', options: ['One-tenth', 'One-quarter', 'One-third to one-half', 'Three-quarters'], correctAnswer: 'One-third to one-half', explanation: '"One-third to one-half of the population are introverts."' },
      { id: 'l10q2', type: 'multiple_choice', question: 'Susan Cain argues that all group work is bad.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"She doesn\'t argue that collaboration is bad, but rather that it needs to be balanced with solitude."' },
    ],
    tags: ['psychology', 'ielts']
  },
  {
    id: 'l11', title: 'Leaving a Voicemail', level: 'A2', speechLang: 'en-US', durationEstimate: 20,
    transcript: 'Hello, this is David Kim calling for Ms. Rodriguez. I\'m calling about the English tutoring sessions. I\'d like to change my lesson time from Tuesday at 3 PM to Wednesday at 4 PM, if that\'s available. Could you please call me back when you get this message? My number is 0909-555-1234. Thank you.',
    questions: [
      { id: 'l11q1', type: 'multiple_choice', question: 'What time does David want to change to?', options: ['Tuesday 3 PM', 'Wednesday 3 PM', 'Wednesday 4 PM', 'Thursday 4 PM'], correctAnswer: 'Wednesday 4 PM', explanation: '"I\'d like to change to Wednesday at 4 PM."' },
    ],
    tags: ['communication', 'phone']
  },
  {
    id: 'l12', title: 'Airport Announcements', level: 'B1', speechLang: 'en-US', durationEstimate: 25,
    transcript: 'Attention all passengers. This is a boarding announcement for flight VN 302 to Ho Chi Minh City. We are now boarding all rows. Please have your boarding pass and identification ready.\n\nPassengers on flight BA 215 to London Heathrow, please be advised that your departure has been delayed by approximately 45 minutes due to a technical issue. The new departure time is 3:15 PM. We apologise for any inconvenience.\n\nWould Mr. Nguyen Van Minh travelling to Singapore please report to Gate B7 immediately. This is the final call for boarding.',
    questions: [
      { id: 'l12q1', type: 'multiple_choice', question: 'Which flight is delayed?', options: ['VN 302', 'BA 215', 'SG 100', 'VN 500'], correctAnswer: 'BA 215', explanation: '"Flight BA 215 to London Heathrow has been delayed."' },
      { id: 'l12q2', type: 'fill_in_the_blank', question: 'The delay is approximately ___ minutes.', correctAnswer: '45', explanation: '"Delayed by approximately 45 minutes."' },
    ],
    tags: ['travel', 'airport']
  },
  {
    id: 'l13', title: 'Science Podcast: The Human Brain', level: 'C1', speechLang: 'en-US', durationEstimate: 55,
    transcript: 'Welcome back to Science Unlocked. Today we\'re discussing the human brain — arguably the most complex structure in the known universe.\n\nThe adult human brain weighs approximately 1.4 kilograms and contains roughly 86 billion neurons. Each neuron can form thousands of connections with other neurons, creating an estimated 100 trillion synapses. To put that in perspective, there are more synaptic connections in your brain than there are stars in the Milky Way.\n\nOne of the most fascinating discoveries in neuroscience in recent decades is neuroplasticity — the brain\'s ability to reorganise itself by forming new neural connections throughout life. This overturned the long-held belief that the adult brain was fixed and unchangeable.\n\nNeuroplasticity has profound implications for education and rehabilitation. Stroke patients can recover lost functions as healthy parts of the brain take over from damaged areas. Language learners physically alter their brain structure as they become proficient — bilingual individuals have been shown to have denser grey matter in regions associated with language processing.\n\nThe practical takeaway? Your brain is not fixed. Every time you learn something new, practice a skill, or even change a habit, you are literally rewiring your neural circuits.',
    questions: [
      { id: 'l13q1', type: 'multiple_choice', question: 'How many neurons does the adult brain contain?', options: ['8.6 billion', '86 billion', '860 billion', '8.6 trillion'], correctAnswer: '86 billion', explanation: '"Contains roughly 86 billion neurons."' },
      { id: 'l13q2', type: 'multiple_choice', question: 'What is neuroplasticity?', options: ['A brain disease', 'The brain\'s fixed structure', 'The brain\'s ability to reorganise itself', 'A type of surgery'], correctAnswer: 'The brain\'s ability to reorganise itself', explanation: '"Neuroplasticity — the brain\'s ability to reorganise itself by forming new neural connections."' },
    ],
    tags: ['science', 'academic', 'ielts']
  },
  {
    id: 'l14', title: 'Renting an Apartment', level: 'B1', speechLang: 'en-US', durationEstimate: 40,
    transcript: 'Agent: Hello, thanks for calling City Rentals. How can I help you?\nCaller: Hi, I saw your listing for the two-bedroom apartment on Nguyen Hue Street. Is it still available?\nAgent: Yes, it is. The rent is 12 million dong per month, including water but not electricity.\nCaller: Does it come furnished?\nAgent: It\'s partially furnished. There\'s a bed, wardrobe, and sofa, but you would need to bring your own kitchen appliances.\nCaller: Is there parking available?\nAgent: Yes, there\'s motorbike parking in the basement. Car parking is available but costs an additional 2 million per month.\nCaller: How long is the minimum lease?\nAgent: The minimum lease is 12 months, with a two-month security deposit required upfront.\nCaller: Can I schedule a viewing?\nAgent: Of course. How about Saturday at 10 AM?\nCaller: That works. Thank you.',
    questions: [
      { id: 'l14q1', type: 'multiple_choice', question: 'How much is the monthly rent?', options: ['8 million', '10 million', '12 million', '15 million'], correctAnswer: '12 million', explanation: '"The rent is 12 million dong per month."' },
      { id: 'l14q2', type: 'multiple_choice', question: 'Electricity is included in the rent.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"Including water but not electricity."' },
    ],
    tags: ['housing', 'daily life']
  },
  {
    id: 'l15', title: 'Conference Keynote: Future of Education', level: 'C1', speechLang: 'en-US', durationEstimate: 60,
    transcript: 'Good morning, ladies and gentlemen. Thank you for the warm welcome. Today, I want to share my vision for the future of education.\n\nWe are at a turning point. The traditional model of education — where students sit in rows, listen to lectures, memorise facts, and take standardised tests — was designed for the industrial age. But we are now in the age of artificial intelligence, and our education system must evolve accordingly.\n\nFirst, we need to shift from memorisation to critical thinking. In a world where any fact can be looked up in seconds, the ability to analyse, evaluate, and create is far more valuable than the ability to recall information.\n\nSecond, personalised learning powered by AI can transform education. Imagine a system that adapts to each student\'s pace, learning style, and interests. Students who struggle with a concept get additional support, while advanced learners are challenged with more complex material.\n\nThird, we must integrate collaboration and communication skills into every subject. The problems of the 21st century — climate change, public health, social inequality — cannot be solved by individuals working alone.\n\nFinally, lifelong learning must become the norm. The idea that education ends at graduation is obsolete. In a rapidly changing job market, continuous upskilling and reskilling will be essential.\n\nThank you. I look forward to your questions.',
    questions: [
      { id: 'l15q1', type: 'multiple_choice', question: 'According to the speaker, the traditional education model was designed for:', options: ['The digital age', 'The industrial age', 'The information age', 'The future'], correctAnswer: 'The industrial age', explanation: '"The traditional model was designed for the industrial age."' },
      { id: 'l15q2', type: 'multiple_choice', question: 'What should replace memorisation?', options: ['Speed reading', 'Critical thinking', 'Handwriting', 'Test-taking'], correctAnswer: 'Critical thinking', explanation: '"We need to shift from memorisation to critical thinking."' },
    ],
    tags: ['education', 'ielts', 'academic']
  },
  {
    id: 'l16', title: 'University Lecture: The Biology of Urban Foxes', level: 'IELTS_B7', speechLang: 'en-GB', durationEstimate: 240,
    transcript: 'Good morning, everyone. In today\'s biology lecture, we\'ll be examining a fascinating case of urban adaptation: the red fox. Now, historically, the red fox was exclusively a rural mammal, dwelling in woodlands and agricultural margins. However, since the 1930s, we have seen a significant demographic shift, with populations migrating into highly built-up metropolitan areas across the United Kingdom.\n\nSo, what triggered this urbanisation? Initially, it was driven by the inter-war housing boom. As cities expanded outward into the countryside, creating sprawling suburbs with large, mature gardens, foxes simply stayed put. These new suburban environments inadvertently provided an ideal habitat: abundant food sources and a distinct lack of natural predators.\n\nLet\'s discuss their diet. The popular misconception is that urban foxes survive entirely on scavenged human refuse—raiding dustbins and eating discarded takeaways. While anthropogenic food does make up a substantial portion of their diet, up to fifty percent, the other half consists of natural prey. Urban foxes are highly effective pest controllers, consuming vast numbers of rats, mice, pigeons, and even earthworms, which they extract from suburban lawns on damp nights.\n\nNow, regarding their territory and social structure, urban foxes behave somewhat differently from their rural counterparts. Because food is densely concentrated in cities, urban foxes require much smaller territories. A rural fox might roam across five hundred hectares, whereas an urban fox\'s territory might be restricted to just twenty or thirty hectares. This high population density leads to complex social hierarchies. Rather than living in simple breeding pairs, urban foxes often form extended family groups, with subordinate adults assisting in the rearing of cubs.\n\nDespite their success, urban foxes face several unique challenges. The primary cause of mortality is not disease or starvation, but road traffic accidents. Furthermore, they are highly susceptible to sarcoptic mange, a parasitic skin infection that can devastate local populations. Nevertheless, their incredible behavioural plasticity continues to ensure their survival in our concrete jungles.',
    questions: [
      { id: 'l16q1', type: 'multiple_choice', question: 'What initially caused foxes to begin living in cities?', options: ['A lack of food in rural areas.', 'The expansion of housing into the countryside.', 'A deliberate breeding program by city councils.', 'An increase in rural predators.'], correctAnswer: 'The expansion of housing into the countryside.', explanation: 'The lecturer states it was driven by the inter-war housing boom, and as cities expanded outward, "foxes simply stayed put."' },
      { id: 'l16q2', type: 'multiple_choice', question: 'According to the lecturer, what percentage of an urban fox\'s diet consists of natural prey?', options: ['Ten percent', 'Twenty-five percent', 'Fifty percent', 'Seventy-five percent'], correctAnswer: 'Fifty percent', explanation: 'The lecturer says anthropogenic food makes up "up to fifty percent" and "the other half consists of natural prey."' },
      { id: 'l16q3', type: 'multiple_choice', question: 'How does the territory size of an urban fox compare to a rural fox?', options: ['It is much larger.', 'It is roughly the same size.', 'It is significantly smaller.', 'They do not maintain territories in cities.'], correctAnswer: 'It is significantly smaller.', explanation: 'The lecturer states "urban foxes require much smaller territories" (20-30 hectares compared to 500 hectares).' },
      { id: 'l16q4', type: 'multiple_choice', question: 'What is the most common cause of death for urban foxes?', options: ['Sarcoptic mange', 'Starvation', 'Old age', 'Road traffic accidents'], correctAnswer: 'Road traffic accidents', explanation: 'The lecturer explicitly notes, "The primary cause of mortality is not disease or starvation, but road traffic accidents."' },
    ],
    tags: ['biology', 'ielts-academic', 'listening-section-4']
  },
  {
    id: 'l17', title: 'Tutorial Discussion: Evaluating Green Architecture', level: 'IELTS_B8', speechLang: 'en-AU', durationEstimate: 210,
    transcript: 'Tutor: Alright, Sarah and Mark, let\'s turn our attention to your upcoming research project on green architecture. Sarah, you proposed looking at the new municipal library. What\'s your specific angle?\n\nSarah: Well, Dr. Evans, I want to evaluate whether the library\'s "green" credentials are actually functional or just performative sustainability—you know, "greenwashing." The architects made a huge deal out of the extensive glass facade, claiming it maximises natural daylight and reduces the need for artificial lighting.\n\nMark: But isn\'t there a massive flaw in that design? I read that in summer, that much glass acts like a greenhouse, trapping solar radiation. The energy they save on lighting is completely offset by the immense amount of electricity required to power the air conditioning systems.\n\nSarah: Exactly, Mark. That\'s my central thesis. While the building achieved a platinum environmental rating on paper, the operational data from its first year suggests its actual energy consumption is thirty percent higher than a conventional brick-and-mortar building of the same size.\n\nTutor: That\'s a very strong analytical approach, Sarah. You\'re looking beyond the design specifications and examining the post-occupancy evaluation data. What about the materials used in construction?\n\nSarah: They did use locally sourced, recycled timber for the interior cladding, which significantly reduced the embodied energy—the energy consumed during the manufacturing and transport of materials. However, the steel framework was imported from overseas, which carries a massive carbon footprint.\n\nMark: Dr. Evans, for my section, I want to focus on the socioeconomic impact of the library. Green buildings are often praised for their environmental benefits, but they can inadvertently drive up local property values, leading to eco-gentrification. Long-term, lower-income residents might be priced out of the neighbourhood.\n\nTutor: An excellent point, Mark. The social dimension of sustainability is frequently overlooked. So, for your joint presentation next week, I suggest you structure it around this dichotomy: Sarah, you handle the environmental disparities between design intent and operational reality, and Mark, you critically assess the social equity implications of the development.',
    questions: [
      { id: 'l17q1', type: 'multiple_choice', question: 'What is Sarah\'s main criticism of the library\'s glass facade?', options: ['It breaks easily during storms.', 'It does not let in enough natural light.', 'It increases the need for air conditioning in summer.', 'It was too expensive to construct.'], correctAnswer: 'It increases the need for air conditioning in summer.', explanation: 'Mark points out it traps solar radiation and energy saved on lighting is offset by electricity for air conditioning, to which Sarah replies "Exactly, Mark. That\'s my central thesis."' },
      { id: 'l17q2', type: 'multiple_choice', question: 'Compared to a conventional building, the library\'s actual energy consumption is:', options: ['Thirty percent lower.', 'Exactly the same.', 'Thirty percent higher.', 'Impossible to measure.'], correctAnswer: 'Thirty percent higher.', explanation: 'Sarah states "its actual energy consumption is thirty percent higher than a conventional brick-and-mortar building".' },
      { id: 'l17q3', type: 'multiple_choice', question: 'What was the environmental drawback of the materials used?', options: ['The recycled timber was toxic.', 'The steel framework was imported from overseas.', 'The concrete took too long to dry.', 'They did not use enough glass.'], correctAnswer: 'The steel framework was imported from overseas.', explanation: 'Sarah notes "the steel framework was imported from overseas, which carries a massive carbon footprint."' },
      { id: 'l17q4', type: 'multiple_choice', question: 'What socioeconomic issue is Mark investigating?', options: ['The library doesn\'t have enough books for low-income residents.', 'The building might cause property values to rise, displacing residents.', 'The construction workers were underpaid.', 'The library charges high entry fees.'], correctAnswer: 'The building might cause property values to rise, displacing residents.', explanation: 'Mark says it can "drive up local property values, leading to eco-gentrification" and lower-income residents "might be priced out of the neighbourhood."' },
    ],
    tags: ['architecture', 'ielts-academic', 'listening-section-3']
  }
];
