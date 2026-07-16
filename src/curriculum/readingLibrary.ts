export interface ReadingPassage {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  sourceType: 'original' | 'public-domain' | 'legal-summary';
  content: string;
  wordCount: number;
  vocabularyHighlights?: string[];
  questions: {
    id: string;
    type: 'multiple_choice' | 'true_false' | 'matching';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  tags: string[];
}

export const readingLibrary: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'r1', title: 'My Morning Routine', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'My name is Lan. I am 20 years old. I am a student in Ho Chi Minh City. Every morning, I wake up at 6:30. I brush my teeth and take a shower. Then I eat breakfast. I usually have bread and milk. After breakfast, I take the bus to university. My first class starts at 8:00. I study English and Business. I like English because my teacher is very kind. After class, I go to the library to study. I go home at 5:00 PM. In the evening, I cook dinner with my sister. We eat together and talk about our day. I go to bed at 11:00 PM.',
    wordCount: 112,
    vocabularyHighlights: ['wake up', 'breakfast', 'university', 'library'],
    questions: [
      { id: 'r1q1', type: 'multiple_choice', question: 'What time does Lan wake up?', options: ['6:00', '6:30', '7:00', '7:30'], correctAnswer: '6:30', explanation: 'The text says "I wake up at 6:30."' },
      { id: 'r1q2', type: 'true_false', question: 'Lan drives a car to university.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The text says "I take the bus to university."' },
      { id: 'r1q3', type: 'multiple_choice', question: 'Why does Lan like English?', options: ['It is easy', 'Her teacher is kind', 'She has many friends', 'The class is short'], correctAnswer: 'Her teacher is kind', explanation: 'The text says "I like English because my teacher is very kind."' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'r2', title: 'At the Supermarket', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Today is Saturday. I go to the supermarket with my mother. We need to buy food for the week. First, we go to the fruit section. We buy apples, bananas, and oranges. Then we go to the vegetable section. My mother buys tomatoes, carrots, and lettuce. Next, we buy rice and noodles. I want some chocolate, but my mother says I should eat more fruit. We also buy milk and eggs. The total is 350,000 VND. We pay and go home. I help my mother put the food in the refrigerator.',
    wordCount: 97,
    vocabularyHighlights: ['supermarket', 'fruit', 'vegetable', 'refrigerator'],
    questions: [
      { id: 'r2q1', type: 'multiple_choice', question: 'What day do they go shopping?', options: ['Sunday', 'Saturday', 'Friday', 'Monday'], correctAnswer: 'Saturday', explanation: 'The first sentence says "Today is Saturday."' },
      { id: 'r2q2', type: 'true_false', question: 'They buy chocolate at the supermarket.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The narrator wants chocolate, but the mother says to eat more fruit. They don\'t buy it.' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'r3', title: 'A Weekend Trip to Da Lat', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'Last weekend, my friends and I took a trip to Da Lat. Da Lat is a beautiful city in the mountains of Vietnam. The weather was cool and pleasant, about 18 degrees Celsius. We stayed at a small hotel near the centre. On the first day, we visited the Flower Garden. There were many beautiful flowers — roses, orchids, and sunflowers. In the afternoon, we went to the night market. We tried strawberry jam, artichoke tea, and local coffee. The coffee in Da Lat is very famous. On the second day, we rented bicycles and rode around Xuan Huong Lake. The lake was peaceful and surrounded by pine trees. We took many photos. I really enjoyed the trip because the scenery was amazing and my friends were great company. I want to go back soon.',
    wordCount: 140,
    vocabularyHighlights: ['mountains', 'pleasant', 'market', 'scenery', 'peaceful'],
    questions: [
      { id: 'r3q1', type: 'multiple_choice', question: 'What is the weather like in Da Lat?', options: ['Hot and humid', 'Cool and pleasant', 'Rainy', 'Very cold'], correctAnswer: 'Cool and pleasant', explanation: 'The text says the weather was "cool and pleasant, about 18 degrees."' },
      { id: 'r3q2', type: 'true_false', question: 'They drove cars around Xuan Huong Lake.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'They "rented bicycles and rode around" the lake.' },
      { id: 'r3q3', type: 'multiple_choice', question: 'What is famous in Da Lat?', options: ['Tea', 'Rice', 'Coffee', 'Bread'], correctAnswer: 'Coffee', explanation: '"The coffee in Da Lat is very famous."' },
    ],
    tags: ['travel', 'vietnam']
  },
  {
    id: 'r4', title: 'My Favourite Hobby', level: 'A2', topic: 'Hobbies', sourceType: 'original',
    content: 'My favourite hobby is cooking. I started cooking when I was 15 years old. At first, I could only make simple dishes like fried rice and scrambled eggs. But now I can cook many different things. I often watch cooking videos on YouTube to learn new recipes. Last month, I learned how to make pasta carbonara. It was delicious! I cook dinner for my family three times a week. My parents and my younger brother always say my food is tasty. Cooking makes me happy because I can be creative. I also like trying food from different countries. In the future, I want to take a cooking class and learn to make French pastries.',
    wordCount: 118,
    vocabularyHighlights: ['hobby', 'recipe', 'delicious', 'creative', 'pastries'],
    questions: [
      { id: 'r4q1', type: 'multiple_choice', question: 'When did the writer start cooking?', options: ['At 10', 'At 13', 'At 15', 'At 18'], correctAnswer: 'At 15', explanation: '"I started cooking when I was 15 years old."' },
      { id: 'r4q2', type: 'multiple_choice', question: 'How often does the writer cook for the family?', options: ['Every day', 'Once a week', 'Three times a week', 'On weekends'], correctAnswer: 'Three times a week', explanation: '"I cook dinner for my family three times a week."' },
    ],
    tags: ['hobbies', 'food']
  },

  // ═══ B1 ═══
  {
    id: 'r5', title: 'The Benefits of Learning a Second Language', level: 'B1', topic: 'Education', sourceType: 'original',
    content: 'Learning a second language offers numerous benefits beyond simple communication. Research has shown that bilingual individuals tend to be better at multitasking and problem-solving. When you learn a new language, your brain forms new neural connections, which can improve memory and cognitive function.\n\nMoreover, knowing a second language can significantly enhance career opportunities. In today\'s globalised economy, companies increasingly value employees who can communicate with international clients and partners. Studies suggest that bilingual workers earn 5-20% more than their monolingual colleagues.\n\nLanguage learning also opens doors to understanding different cultures. When you learn a language, you learn about the people who speak it — their traditions, values, and worldview. This cultural awareness promotes empathy and tolerance.\n\nAdditionally, learning a language can be enjoyable and rewarding. Many learners report a sense of achievement when they can have their first conversation in a new language or understand a foreign film without subtitles. The journey of language learning is challenging but ultimately fulfilling.',
    wordCount: 160,
    vocabularyHighlights: ['bilingual', 'cognitive', 'globalised', 'empathy', 'tolerance'],
    questions: [
      { id: 'r5q1', type: 'multiple_choice', question: 'According to the passage, what happens to the brain when learning a language?', options: ['It gets smaller', 'It forms new neural connections', 'It becomes less active', 'Nothing changes'], correctAnswer: 'It forms new neural connections', explanation: 'The text states that "your brain forms new neural connections."' },
      { id: 'r5q2', type: 'true_false', question: 'Bilingual workers earn the same salary as monolingual workers.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"Bilingual workers earn 5-20% more than their monolingual colleagues."' },
      { id: 'r5q3', type: 'multiple_choice', question: 'What does language learning promote according to the passage?', options: ['Competition', 'Isolation', 'Empathy and tolerance', 'Financial problems'], correctAnswer: 'Empathy and tolerance', explanation: '"This cultural awareness promotes empathy and tolerance."' },
    ],
    tags: ['education', 'language', 'ielts']
  },
  {
    id: 'r6', title: 'Plastic Pollution in the Oceans', level: 'B1', topic: 'Environment', sourceType: 'original',
    content: 'Plastic pollution has become one of the most pressing environmental issues of our time. Every year, approximately 8 million metric tons of plastic waste enters the world\'s oceans. This is equivalent to dumping a garbage truck of plastic into the ocean every minute.\n\nThe effects on marine life are devastating. Sea turtles mistake plastic bags for jellyfish and eat them. Seabirds get tangled in fishing nets and six-pack rings. Scientists have found microplastics — tiny plastic particles — in the stomachs of fish, which means plastics are entering the food chain and potentially affecting human health.\n\nSeveral solutions are being proposed. Many countries have banned single-use plastic bags. Some companies are developing biodegradable alternatives. Beach clean-up programmes are organised worldwide. However, experts agree that the most effective solution is to reduce plastic consumption at the source.\n\nIndividuals can also make a difference by using reusable bags, bottles, and containers. Every small action counts in the fight against plastic pollution.',
    wordCount: 166,
    vocabularyHighlights: ['pollution', 'marine', 'microplastics', 'biodegradable', 'consumption'],
    questions: [
      { id: 'r6q1', type: 'multiple_choice', question: 'How much plastic enters the oceans each year?', options: ['1 million tons', '5 million tons', '8 million tons', '12 million tons'], correctAnswer: '8 million tons', explanation: '"Approximately 8 million metric tons of plastic waste enters the world\'s oceans."' },
      { id: 'r6q2', type: 'true_false', question: 'Microplastics have been found in fish.', options: ['True', 'False'], correctAnswer: 'True', explanation: '"Scientists have found microplastics in the stomachs of fish."' },
      { id: 'r6q3', type: 'multiple_choice', question: 'According to experts, what is the most effective solution?', options: ['Beach clean-ups', 'Banning bags', 'Reducing plastic consumption at the source', 'Using more recycled plastic'], correctAnswer: 'Reducing plastic consumption at the source', explanation: '"The most effective solution is to reduce plastic consumption at the source."' },
    ],
    tags: ['environment', 'ielts']
  },

  // ═══ B2 ═══
  {
    id: 'r7', title: 'The Future of Renewable Energy', level: 'B2', topic: 'Technology', sourceType: 'original',
    content: 'The global energy landscape is undergoing a profound transformation. As concerns about climate change intensify, nations are increasingly investing in renewable energy sources such as solar, wind, and hydroelectric power.\n\nSolar energy has seen the most dramatic cost reductions. The price of solar panels has fallen by approximately 89% since 2010, making solar power cheaper than coal in many regions. China leads the world in solar panel manufacturing, while countries like Germany and Australia have achieved high rates of solar adoption.\n\nWind energy is also expanding rapidly. Offshore wind farms, particularly in the North Sea, are generating significant amounts of electricity. Denmark already produces around 50% of its electricity from wind power, demonstrating that renewables can reliably meet a substantial portion of a nation\'s energy needs.\n\nHowever, the transition to renewable energy is not without challenges. The intermittent nature of solar and wind power requires investment in energy storage technologies, such as advanced batteries. Grid infrastructure also needs to be upgraded to handle distributed energy generation.\n\nDespite these challenges, the trend is clear: the world is moving towards a cleaner energy future. The International Energy Agency projects that renewables will account for 90% of new power capacity additions globally by 2025.',
    wordCount: 195,
    vocabularyHighlights: ['renewable', 'transformation', 'intermittent', 'infrastructure', 'distributed'],
    questions: [
      { id: 'r7q1', type: 'multiple_choice', question: 'By how much has the price of solar panels fallen since 2010?', options: ['50%', '70%', '89%', '95%'], correctAnswer: '89%', explanation: '"The price of solar panels has fallen by approximately 89% since 2010."' },
      { id: 'r7q2', type: 'true_false', question: 'Denmark produces about 50% of its electricity from solar power.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Denmark produces 50% from WIND power, not solar.' },
      { id: 'r7q3', type: 'multiple_choice', question: 'What is a challenge of renewable energy?', options: ['It is too expensive', 'It is intermittent', 'No countries want it', 'It causes more pollution'], correctAnswer: 'It is intermittent', explanation: '"The intermittent nature of solar and wind power requires investment in energy storage."' },
    ],
    tags: ['technology', 'environment', 'ielts']
  },
  {
    id: 'r8', title: 'The Impact of Social Media on Mental Health', level: 'B2', topic: 'Society', sourceType: 'original',
    content: 'Social media has fundamentally changed how we communicate and interact with others. Platforms like Instagram, TikTok, and Facebook have billions of users worldwide. While these platforms offer many benefits — connecting people, sharing information, and enabling creative expression — growing evidence suggests they may also have negative effects on mental health.\n\nResearchers have found correlations between heavy social media use and increased rates of anxiety, depression, and loneliness, particularly among young people. The constant comparison with carefully curated images of others\' lives can lead to feelings of inadequacy and low self-esteem. The addictive design of these platforms, with features like infinite scrolling and push notifications, can also disrupt sleep patterns and reduce time spent on face-to-face interactions.\n\nHowever, it is important to note that the relationship between social media and mental health is complex. Social media can also provide support communities, raise awareness about mental health issues, and help people feel less isolated, especially during times of crisis.\n\nExperts recommend setting boundaries on social media use, being mindful of how it makes you feel, and prioritising real-world connections.',
    wordCount: 184,
    vocabularyHighlights: ['correlations', 'curated', 'inadequacy', 'addictive', 'mindful'],
    questions: [
      { id: 'r8q1', type: 'multiple_choice', question: 'What is linked to heavy social media use?', options: ['Better sleep', 'Increased anxiety and depression', 'More friendships', 'Higher grades'], correctAnswer: 'Increased anxiety and depression', explanation: '"Researchers have found correlations between heavy social media use and increased rates of anxiety, depression."' },
      { id: 'r8q2', type: 'true_false', question: 'Social media has only negative effects on mental health.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The passage says the relationship is "complex" and social media can also provide support.' },
      { id: 'r8q3', type: 'multiple_choice', question: 'What do experts recommend?', options: ['Delete all social media', 'Set boundaries on use', 'Use social media more', 'Ignore the research'], correctAnswer: 'Set boundaries on use', explanation: '"Experts recommend setting boundaries on social media use."' },
    ],
    tags: ['society', 'health', 'ielts']
  },
  {
    id: 'r9', title: 'Remote Work: The New Normal?', level: 'B2', topic: 'Work', sourceType: 'original',
    content: 'The COVID-19 pandemic accelerated a trend that had been slowly developing for years: remote work. When lockdowns forced millions of workers to operate from home, both employers and employees discovered advantages and disadvantages of this arrangement.\n\nOn the positive side, remote workers often report higher productivity. Without the distractions of a busy office and the time lost to commuting, many employees find they can accomplish more in less time. Companies benefit from reduced overhead costs, as they need less office space. Workers enjoy greater flexibility, allowing them to better balance professional and personal responsibilities.\n\nHowever, remote work also presents significant challenges. Many workers experience feelings of isolation and disconnection from colleagues. The boundary between work and personal life can become blurred, leading to burnout. Communication can be less effective when conducted entirely through digital channels, and creative collaboration may suffer without in-person interaction.\n\nAs a result, many organisations are adopting hybrid models, where employees split their time between home and office. This approach attempts to capture the benefits of both arrangements while minimising the drawbacks.',
    wordCount: 180,
    vocabularyHighlights: ['accelerated', 'productivity', 'overhead', 'burnout', 'hybrid'],
    questions: [
      { id: 'r9q1', type: 'multiple_choice', question: 'What benefit do remote workers often report?', options: ['More meetings', 'Higher productivity', 'Better office space', 'Lower salaries'], correctAnswer: 'Higher productivity', explanation: '"Remote workers often report higher productivity."' },
      { id: 'r9q2', type: 'true_false', question: 'Remote work has no challenges according to the passage.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The passage discusses several challenges including isolation, blurred boundaries, and burnout.' },
    ],
    tags: ['work', 'society', 'ielts']
  },

  // ═══ C1 ═══
  {
    id: 'r10', title: 'Artificial Intelligence and the Future of Employment', level: 'C1', topic: 'Technology', sourceType: 'original',
    content: 'The rapid advancement of artificial intelligence (AI) has sparked intense debate about its implications for the labour market. While some economists predict that AI will create more jobs than it eliminates, others warn of mass unemployment as machines increasingly outperform humans in a widening range of tasks.\n\nHistorically, technological revolutions have always generated anxiety about job losses, from the Luddites who destroyed textile machinery in the 19th century to fears about automation in the manufacturing sector. In each case, new industries and roles emerged that could not have been foreseen. The question is whether AI represents a continuation of this pattern or a fundamentally different disruption.\n\nWhat distinguishes AI from previous technological shifts is its potential to automate cognitive tasks — not just physical labour. Machine learning algorithms can now diagnose diseases, draft legal documents, analyse financial data, and even create art. This means that white-collar professionals, traditionally considered safe from automation, may also face displacement.\n\nNevertheless, there are tasks that remain distinctly human: those requiring emotional intelligence, creativity, complex social interaction, and ethical judgement. The challenge for education systems is to prepare future workers for a labour market where collaboration with AI is the norm rather than the exception.\n\nAdaptability and lifelong learning will be essential skills in this new landscape.',
    wordCount: 210,
    vocabularyHighlights: ['implications', 'displacement', 'cognitive', 'algorithms', 'adaptability'],
    questions: [
      { id: 'r10q1', type: 'multiple_choice', question: 'What distinguishes AI from previous technological shifts?', options: ['It is faster', 'It can automate cognitive tasks', 'It only affects factories', 'It creates no new jobs'], correctAnswer: 'It can automate cognitive tasks', explanation: '"What distinguishes AI is its potential to automate cognitive tasks — not just physical labour."' },
      { id: 'r10q2', type: 'true_false', question: 'The passage suggests emotional intelligence cannot be automated.', options: ['True', 'False'], correctAnswer: 'True', explanation: 'The passage lists emotional intelligence as a "distinctly human" task.' },
      { id: 'r10q3', type: 'multiple_choice', question: 'What will be essential skills according to the author?', options: ['Manual labour', 'Memorisation', 'Adaptability and lifelong learning', 'Speed reading'], correctAnswer: 'Adaptability and lifelong learning', explanation: '"Adaptability and lifelong learning will be essential skills."' },
    ],
    tags: ['technology', 'work', 'ielts']
  },

  // ═══ Additional B1–C1 passages for variety ═══
  {
    id: 'r11', title: 'Coffee: From Bean to Cup', level: 'B1', topic: 'Culture', sourceType: 'original',
    content: 'Coffee is one of the most popular beverages in the world. Over 2 billion cups are consumed every day. But how does coffee get from a farm to your morning cup?\n\nCoffee plants grow in tropical regions near the equator, in countries like Brazil, Colombia, Ethiopia, and Vietnam. Vietnam is the world\'s second-largest coffee producer. The coffee fruit, called a cherry, turns red when it is ripe and ready to harvest. Inside each cherry are two seeds — the coffee beans.\n\nAfter harvesting, the beans go through processing, which involves removing the fruit and drying the beans. They are then exported to roasting companies around the world. Roasting transforms the green beans into the brown, aromatic beans we recognise. Different roast levels — light, medium, and dark — produce different flavours.\n\nFinally, the roasted beans are ground and brewed to make the coffee we drink. Whether you prefer espresso, cappuccino, or Vietnamese iced coffee (cà phê sữa đá), each method of preparation brings out unique characteristics of the bean.',
    wordCount: 170,
    vocabularyHighlights: ['beverages', 'tropical', 'harvest', 'aromatic', 'brewed'],
    questions: [
      { id: 'r11q1', type: 'multiple_choice', question: 'How many cups of coffee are consumed daily worldwide?', options: ['1 billion', '2 billion', '3 billion', '5 billion'], correctAnswer: '2 billion', explanation: '"Over 2 billion cups are consumed every day."' },
      { id: 'r11q2', type: 'true_false', question: 'Vietnam is the world\'s largest coffee producer.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Vietnam is the "second-largest coffee producer."' },
    ],
    tags: ['culture', 'food']
  },
  {
    id: 'r12', title: 'The History of the Internet', level: 'B2', topic: 'Technology', sourceType: 'original',
    content: 'The internet, which now seems indispensable to modern life, has a relatively short history. Its origins can be traced back to ARPANET, a project funded by the US Department of Defense in the late 1960s. ARPANET was designed to allow researchers at different universities to share computing resources and communicate more efficiently.\n\nThe World Wide Web, often confused with the internet itself, was invented by British computer scientist Tim Berners-Lee in 1989 while working at CERN in Switzerland. The Web made the internet accessible to ordinary people by providing a user-friendly way to navigate and share information through web pages and hyperlinks.\n\nThe 1990s saw explosive growth. The first commercial web browsers, such as Netscape Navigator, made the internet available to millions. E-commerce emerged, with companies like Amazon and eBay launching in 1995. By the early 2000s, social media platforms began to appear, transforming how people connected and shared information.\n\nToday, approximately 5 billion people use the internet — roughly 63% of the world\'s population. The internet has reshaped virtually every aspect of modern life, from how we work and learn to how we shop and socialise.',
    wordCount: 190,
    vocabularyHighlights: ['indispensable', 'ARPANET', 'hyperlinks', 'e-commerce', 'reshaped'],
    questions: [
      { id: 'r12q1', type: 'multiple_choice', question: 'Who invented the World Wide Web?', options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'], correctAnswer: 'Tim Berners-Lee', explanation: '"The World Wide Web was invented by British computer scientist Tim Berners-Lee in 1989."' },
      { id: 'r12q2', type: 'true_false', question: 'The internet and the World Wide Web are the same thing.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The passage says the Web is "often confused with the internet itself" — they are different.' },
    ],
    tags: ['technology', 'history']
  },
  {
    id: 'r13', title: 'Why Sleep Matters', level: 'B1', topic: 'Health', sourceType: 'original',
    content: 'Sleep is essential for our physical and mental health, yet many people do not get enough of it. Adults need between 7 and 9 hours of sleep per night, but studies show that one in three adults regularly sleeps less than the recommended amount.\n\nDuring sleep, your body repairs muscles, consolidates memories, and releases hormones that regulate growth and appetite. Without adequate sleep, your immune system weakens, making you more likely to get sick. Poor sleep has also been linked to weight gain, as lack of sleep affects the hormones that control hunger.\n\nSleep also plays a crucial role in learning and memory. When you sleep, your brain processes information from the day and moves it from short-term to long-term memory. This is why getting a good night\'s sleep before an exam is more effective than staying up all night to study.\n\nTo improve sleep quality, experts recommend maintaining a consistent sleep schedule, avoiding screens before bedtime, keeping the bedroom cool and dark, and limiting caffeine intake in the afternoon.',
    wordCount: 175,
    vocabularyHighlights: ['consolidates', 'hormones', 'immune', 'crucial', 'consistent'],
    questions: [
      { id: 'r13q1', type: 'multiple_choice', question: 'How much sleep do adults need?', options: ['5-6 hours', '6-7 hours', '7-9 hours', '10-12 hours'], correctAnswer: '7-9 hours', explanation: '"Adults need between 7 and 9 hours of sleep per night."' },
      { id: 'r13q2', type: 'true_false', question: 'Studying all night before an exam is more effective than sleeping.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The passage says "getting a good night\'s sleep before an exam is more effective than staying up all night."' },
    ],
    tags: ['health', 'science']
  },
  {
    id: 'r14', title: 'Urban Green Spaces', level: 'B2', topic: 'Environment', sourceType: 'original',
    content: 'As urbanisation accelerates worldwide, the importance of green spaces in cities has gained increasing recognition. Parks, gardens, tree-lined streets, and rooftop gardens not only enhance the aesthetic appeal of urban areas but also provide significant environmental, social, and health benefits.\n\nFrom an environmental perspective, urban green spaces help mitigate the "heat island" effect, where built-up areas become significantly hotter than surrounding rural regions. Trees and vegetation provide shade, absorb carbon dioxide, and filter air pollutants. Green spaces also manage stormwater runoff, reducing the risk of urban flooding.\n\nThe health benefits are equally compelling. Studies have consistently shown that access to green spaces reduces stress, anxiety, and depression. Physical activity in parks — walking, jogging, or simply sitting on a bench — contributes to cardiovascular health and overall well-being. Children who grow up near green spaces tend to have better cognitive development and lower rates of obesity.\n\nUrban planners are increasingly incorporating green infrastructure into city design. Singapore\'s "City in a Garden" vision and Copenhagen\'s emphasis on public parks demonstrate that sustainability and urban living can coexist. However, ensuring equitable access to green spaces remains a challenge, as wealthier neighbourhoods often have more parks than lower-income areas.',
    wordCount: 200,
    vocabularyHighlights: ['urbanisation', 'mitigate', 'vegetation', 'cardiovascular', 'equitable'],
    questions: [
      { id: 'r14q1', type: 'multiple_choice', question: 'What is the "heat island" effect?', options: ['Islands getting hotter', 'Built-up areas becoming hotter than rural areas', 'Oceans warming', 'Parks getting warmer'], correctAnswer: 'Built-up areas becoming hotter than rural areas', explanation: 'The passage defines it as "where built-up areas become significantly hotter than surrounding rural regions."' },
      { id: 'r14q2', type: 'true_false', question: 'Access to green spaces in cities is always equal across all neighbourhoods.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"Wealthier neighbourhoods often have more parks than lower-income areas."' },
    ],
    tags: ['environment', 'urbanisation', 'ielts']
  },
  {
    id: 'r15', title: 'The Rise of E-Learning', level: 'B2', topic: 'Education', sourceType: 'original',
    content: 'Electronic learning, or e-learning, has transformed education from a process confined to physical classrooms into a flexible, accessible global experience. While online courses existed before 2020, the pandemic dramatically accelerated their adoption.\n\nPlatforms like Coursera, Duolingo, and Khan Academy have democratised access to knowledge. A student in rural Vietnam can now access lectures from MIT or Cambridge. Language learning apps use AI-powered algorithms to personalise lessons based on individual progress and mistakes.\n\nHowever, e-learning is not without drawbacks. Many students report lower motivation and engagement when studying online compared to in-person classes. The lack of face-to-face interaction can lead to feelings of isolation. Additionally, not all students have equal access to technology and reliable internet connections, creating a "digital divide" that can exacerbate existing educational inequalities.\n\nExperts suggest that the most effective approach combines online and offline learning — a "blended learning" model. This approach leverages the flexibility and scalability of digital tools while maintaining the social and motivational benefits of face-to-face instruction.',
    wordCount: 170,
    vocabularyHighlights: ['democratised', 'algorithms', 'personalise', 'exacerbate', 'blended'],
    questions: [
      { id: 'r15q1', type: 'multiple_choice', question: 'What is the "digital divide"?', options: ['A type of computer', 'Unequal access to technology', 'A learning method', 'A software update'], correctAnswer: 'Unequal access to technology', explanation: 'The passage describes it as unequal access to technology and internet creating educational inequalities.' },
      { id: 'r15q2', type: 'true_false', question: 'The passage recommends using only online learning.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The passage recommends a "blended learning" model combining online and offline.' },
    ],
    tags: ['education', 'technology', 'ielts']
  },
  // A few more to round out diversity
  {
    id: 'r16', title: 'Traditional Markets in Southeast Asia', level: 'A2', topic: 'Culture', sourceType: 'original',
    content: 'Traditional markets are an important part of culture in Southeast Asian countries. In Vietnam, the market is called "chợ". In Thailand, floating markets are very popular with tourists. In Indonesia, the "pasar" sells everything from fresh vegetables to clothes.\n\nAt a typical Vietnamese market, you can buy fresh fruits, vegetables, meat, and seafood. The sellers are usually women who wake up very early — sometimes at 3 or 4 AM — to prepare their goods. Bargaining is common, and prices are often lower than in supermarkets.\n\nTraditional markets are more than just places to buy food. They are social spaces where people meet, chat, and share news. Many elderly people go to the market every morning as part of their daily routine.\n\nHowever, modern supermarkets and convenience stores are becoming more popular, especially among young people who prefer the convenience of air conditioning and fixed prices. Some people worry that traditional markets may disappear in the future.',
    wordCount: 160,
    vocabularyHighlights: ['traditional', 'bargaining', 'convenience', 'elderly', 'routine'],
    questions: [
      { id: 'r16q1', type: 'multiple_choice', question: 'What time do market sellers usually wake up?', options: ['5-6 AM', '7-8 AM', '3-4 AM', '9-10 AM'], correctAnswer: '3-4 AM', explanation: '"The sellers wake up very early — sometimes at 3 or 4 AM."' },
      { id: 'r16q2', type: 'true_false', question: 'Young people prefer traditional markets to supermarkets.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Young people "prefer the convenience" of supermarkets.' },
    ],
    tags: ['culture', 'vietnam', 'asia']
  },
  {
    id: 'r17', title: 'Climate Change: Causes and Solutions', level: 'C1', topic: 'Environment', sourceType: 'original',
    content: 'Climate change, driven primarily by the combustion of fossil fuels and deforestation, represents arguably the most significant challenge facing humanity. The Intergovernmental Panel on Climate Change (IPCC) has concluded with high confidence that human activities have caused approximately 1.0°C of global warming above pre-industrial levels, and this figure is projected to reach 1.5°C between 2030 and 2052 if current trends continue.\n\nThe consequences of this warming are already visible: rising sea levels threatening coastal communities, more frequent and intense extreme weather events, disrupted agricultural patterns, and accelerating biodiversity loss. Small island nations face existential threats from rising waters.\n\nMitigation strategies focus on reducing greenhouse gas emissions through a transition to renewable energy, improving energy efficiency, and protecting forests. Carbon capture technology, while promising, remains expensive and unproven at scale. The Paris Agreement of 2015 established a framework for international cooperation, with nations pledging to limit warming to well below 2°C.\n\nAdaptation is equally critical. Communities must prepare for impacts that are already inevitable, including investing in flood defences, developing drought-resistant crops, and redesigning urban infrastructure to withstand extreme heat.',
    wordCount: 195,
    vocabularyHighlights: ['combustion', 'existential', 'mitigation', 'pledging', 'adaptation'],
    questions: [
      { id: 'r17q1', type: 'multiple_choice', question: 'How much has global temperature risen above pre-industrial levels?', options: ['0.5°C', '1.0°C', '1.5°C', '2.0°C'], correctAnswer: '1.0°C', explanation: '"Human activities have caused approximately 1.0°C of global warming above pre-industrial levels."' },
      { id: 'r17q2', type: 'true_false', question: 'The Paris Agreement aims to limit warming to 3°C.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The Paris Agreement aims to limit warming to "well below 2°C."' },
    ],
    tags: ['environment', 'ielts', 'academic']
  },
  {
    id: 'r18', title: 'The Psychology of Procrastination', level: 'B2', topic: 'Psychology', sourceType: 'original',
    content: 'Procrastination — the act of delaying tasks despite knowing the delay is counterproductive — affects virtually everyone to some degree. Research suggests that approximately 20% of adults are chronic procrastinators, meaning it significantly impacts their daily functioning.\n\nContrary to popular belief, procrastination is not simply a matter of laziness or poor time management. Psychologists now understand it primarily as an emotional regulation problem. We procrastinate not because we don\'t know what to do, but because the task triggers negative emotions — anxiety, boredom, frustration, or self-doubt. Putting off the task provides temporary emotional relief.\n\nThe consequences, however, are significant. Chronic procrastination is associated with higher levels of stress, anxiety, and depression. Academic performance suffers, professional opportunities are missed, and relationships can be strained when commitments are not met.\n\nEffective strategies for overcoming procrastination include breaking large tasks into smaller, manageable steps; using the "two-minute rule" (if it takes less than two minutes, do it now); setting specific deadlines; and practising self-compassion rather than self-criticism when setbacks occur.',
    wordCount: 175,
    vocabularyHighlights: ['counterproductive', 'chronic', 'emotional regulation', 'self-compassion', 'setbacks'],
    questions: [
      { id: 'r18q1', type: 'multiple_choice', question: 'What percentage of adults are chronic procrastinators?', options: ['5%', '10%', '20%', '50%'], correctAnswer: '20%', explanation: '"Approximately 20% of adults are chronic procrastinators."' },
      { id: 'r18q2', type: 'multiple_choice', question: 'According to psychologists, procrastination is primarily:', options: ['A time management problem', 'An emotional regulation problem', 'A sign of laziness', 'A physical issue'], correctAnswer: 'An emotional regulation problem', explanation: '"Psychologists now understand it primarily as an emotional regulation problem."' },
    ],
    tags: ['psychology', 'ielts']
  },
  {
    id: 'r19', title: 'Space Exploration: Is It Worth It?', level: 'C1', topic: 'Science', sourceType: 'original',
    content: 'Space exploration has captivated human imagination since the first satellite, Sputnik, orbited Earth in 1957. Since then, humanity has landed on the Moon, sent rovers to Mars, and launched telescopes that peer into the farthest reaches of the universe. However, with each mission costing billions of dollars, a persistent question remains: is space exploration worth the investment?\n\nProponents argue that space programmes yield substantial practical benefits. Satellite technology underpins weather forecasting, GPS navigation, and global telecommunications. Medical breakthroughs, including water purification systems and advanced prosthetics, have emerged from space research. Moreover, the pursuit of space exploration inspires scientific careers and technological innovation.\n\nCritics contend that the enormous financial resources allocated to space programmes could be better spent addressing terrestrial problems — poverty, disease, and climate change. They argue that private companies like SpaceX and Blue Origin, rather than governments, should bear the financial risk of space ventures.\n\nA middle ground suggests that space exploration and solving Earth\'s problems are not mutually exclusive. Indeed, understanding our planet from space — through climate monitoring satellites and Earth observation systems — directly contributes to addressing environmental challenges.',
    wordCount: 185,
    vocabularyHighlights: ['captivated', 'underpins', 'prosthetics', 'terrestrial', 'mutually exclusive'],
    questions: [
      { id: 'r19q1', type: 'multiple_choice', question: 'When was the first satellite launched?', options: ['1945', '1957', '1969', '1975'], correctAnswer: '1957', explanation: '"The first satellite, Sputnik, orbited Earth in 1957."' },
      { id: 'r19q2', type: 'true_false', question: 'Critics believe only private companies should fund space exploration.', options: ['True', 'False'], correctAnswer: 'True', explanation: '"Critics argue that private companies, rather than governments, should bear the financial risk."' },
    ],
    tags: ['science', 'ielts']
  },
  {
    id: 'r20', title: 'The Power of Habits', level: 'B1', topic: 'Psychology', sourceType: 'original',
    content: 'Habits play a huge role in our daily lives. Scientists estimate that about 40% of our actions each day are habits, not conscious decisions. This means that almost half of what you do every day happens automatically.\n\nA habit has three parts: a cue, a routine, and a reward. The cue is what triggers the habit — for example, feeling bored. The routine is the behaviour itself — maybe checking your phone. The reward is the feeling you get — perhaps entertainment or connection. This is called the "habit loop".\n\nGood habits, like exercising regularly or reading before bed, can improve your health and knowledge over time. Bad habits, like smoking or eating too much sugar, can harm you. The good news is that habits can be changed.\n\nTo build a new good habit, start very small. If you want to exercise more, begin with just 5 minutes a day. Make it easy and enjoyable. Over time, the behaviour becomes automatic. To break a bad habit, identify the cue and find a healthier routine that gives you a similar reward.',
    wordCount: 178,
    vocabularyHighlights: ['conscious', 'triggers', 'automatic', 'routine', 'identify'],
    questions: [
      { id: 'r20q1', type: 'multiple_choice', question: 'What percentage of daily actions are habits?', options: ['10%', '25%', '40%', '60%'], correctAnswer: '40%', explanation: '"About 40% of our actions each day are habits."' },
      { id: 'r20q2', type: 'multiple_choice', question: 'What are the three parts of a habit?', options: ['Start, middle, end', 'Cue, routine, reward', 'Morning, afternoon, evening', 'Think, act, reflect'], correctAnswer: 'Cue, routine, reward', explanation: '"A habit has three parts: a cue, a routine, and a reward."' },
    ],
    tags: ['psychology', 'self-improvement']
  },
];
