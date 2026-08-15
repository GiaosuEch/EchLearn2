import type { DeepCurriculumData } from '../../curriculum/deepCurriculumTypes.ts';

export const ieltsAcademicData: DeepCurriculumData = {
  languageFamily: 'en',
  levels: [
    {
      id: 'IELTS_B6',
      name: 'IELTS Academic - Band 6.0-6.5 (Competent)',
      desc: 'Generally effective command of the language despite some inaccuracies.',
      lessons: [
        {
          title: 'Writing Task 2: Opinion Essays Structure',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 2 Band 6.0',
          targetGrammar: ['Complex sentences', 'Linking words'],
          examBand: '6.0',
          examComponent: 'Writing Task 2',
          estimatedMinutes: 30,
          targetCollocations: ['firmly believe', 'takes into consideration', 'play a crucial role'],
          assessmentPrompt: 'Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both views and give your opinion.',
          modelAnswer: 'It is a common belief that universities have two distinct purposes: practical career preparation and the pursuit of knowledge for its own sake. While vocational training is important for the economy, I firmly believe that the primary role of higher education is to expand human understanding irrespective of immediate workplace demands.',
          commonMistakes: ['Lack of clear progression.', 'Inadequate paragraphing.', 'Using informal vocabulary like "kids" or "lots of".']
        },
        {
          title: 'Reading: True/False/Not Given Trap Avoidance',
          type: 'reading',
          officialRubricMapping: 'IELTS Reading Band 6.0',
          examBand: '6.0',
          examComponent: 'Reading Section 2',
          estimatedMinutes: 30,
          targetCollocations: ['widely debated', 'fundamental differences', 'contradictory evidence'],
          assessmentPrompt: 'Read the passage about climate change. Statement: "The author believes all coastal cities will be flooded by 2050." Is this True, False, or Not Given based on the text: "If current trends continue, some low-lying coastal regions may face severe inundation mid-century."',
          modelAnswer: 'False. The text says "some low-lying coastal regions" (not all coastal cities) and "may face severe inundation" (not definitively will be flooded).',
          commonMistakes: ['Confusing False with Not Given.', 'Applying outside knowledge instead of sticking strictly to the text provided.']
        },
        {
          title: 'Writing Task 1: Describing a Process Diagram',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 1 Band 6.0',
          targetGrammar: ['Passive voice', 'Sequencing language (firstly, subsequently, finally)'],
          examBand: '6.0',
          examComponent: 'Writing Task 1',
          estimatedMinutes: 25,
          targetCollocations: ['the process begins with', 'is then subjected to', 'the final stage involves'],
          assessmentPrompt: 'The diagram below shows how chocolate is produced. Summarise the information by selecting and reporting the main features.',
          modelAnswer: 'The diagram illustrates the step-by-step process of manufacturing chocolate, from harvesting cocoa beans to the finished product. The process begins with the collection of ripe cocoa pods, which are subsequently split open to extract the beans. These beans are then subjected to a fermentation period of approximately five to seven days, after which they are dried in direct sunlight.',
          commonMistakes: ['Writing in bullet points instead of connected prose.', 'Failing to use passive voice for a process description.', 'Describing the process out of sequence.']
        },
        {
          title: 'Listening: Section 3 - Academic Discussion Comprehension',
          type: 'listening',
          officialRubricMapping: 'IELTS Listening Band 6.0',
          examBand: '6.0',
          examComponent: 'Listening Section 3',
          estimatedMinutes: 25,
          targetCollocations: ['research methodology', 'sample size', 'draw conclusions from'],
          assessmentPrompt: 'Listen to a discussion between two students and a tutor about a research project on urban green spaces. What was the main limitation of their survey methodology? Answer in no more than three words.',
          modelAnswer: 'Small sample size. The tutor explicitly states that the 30-person survey was insufficient to generalize findings across the entire metropolitan area.',
          commonMistakes: ['Writing more than the word limit allows.', 'Confusing similar-sounding details from different speakers.']
        },
        {
          title: 'Speaking Part 2: Developing a Coherent Long Turn',
          type: 'speaking',
          officialRubricMapping: 'IELTS Speaking Part 2 Band 6.0',
          examBand: '6.0',
          examComponent: 'Speaking Part 2',
          estimatedMinutes: 20,
          targetCollocations: ['it was particularly memorable because', 'what struck me most was', 'looking back on it'],
          assessmentPrompt: 'Describe a time when you helped someone. You should say: Who you helped, How you helped them, What the result was, and explain how you felt about it.',
          modelAnswer: 'I would like to talk about a time I helped my younger cousin prepare for her university entrance exam. She was struggling with mathematics, so I dedicated every weekend for two months to tutoring her. What struck me most was her determination despite finding the subject challenging. Looking back on it, the experience was particularly memorable because she ultimately passed with a score that exceeded her expectations.',
          commonMistakes: ['Stopping after 30 seconds instead of speaking for the full 2 minutes.', 'Not addressing all the bullet points on the cue card.', 'Excessive pausing and self-correction.']
        }
      ]
    },
    {
      id: 'IELTS_B7',
      name: 'IELTS Academic - Band 7.0-7.5 (Good/Very Good)',
      desc: 'Operational command of the language, handles complex language well.',
      lessons: [
        {
          title: 'Writing Task 2: Advanced Cohesion & Hedging',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 2 Band 7.5',
          targetGrammar: ['Inversion', 'Cleft sentences', 'Hedging verbs (tend to, appear to)'],
          targetVocabLimit: 50,
          examBand: '7.5',
          examComponent: 'Writing Task 2',
          estimatedMinutes: 40,
          targetCollocations: ['not only... but also', 'it is undeniable that', 'a growing consensus'],
          assessmentPrompt: 'In some countries, the aging population is increasing rapidly. What are the causes of this and what are the effects on society?',
          modelAnswer: 'The phenomenon of an aging demographic has become increasingly prevalent in developed nations. This demographic shift is primarily driven by advancements in medical technology and a declining birth rate. Consequently, it tends to place an unprecedented strain on healthcare systems and pension funds, necessitating urgent policy reform.',
          commonMistakes: ['Overusing basic, mechanical transition words (First, Second, Lastly).', 'Making absolute claims (e.g., "This will destroy the economy") instead of nuanced hedging (e.g., "This could potentially destabilize economic growth").']
        },
        {
          title: 'Speaking Part 3: Abstract Reasoning and Extension',
          type: 'speaking',
          officialRubricMapping: 'IELTS Speaking Part 3 Band 7.5',
          targetVocabLimit: 40,
          examBand: '7.5',
          examComponent: 'Speaking Part 3',
          estimatedMinutes: 25,
          targetCollocations: ['broader implications', 'shift in perspective', 'societal norms'],
          assessmentPrompt: 'How do you think artificial intelligence will change the landscape of the arts in the next two decades?',
          modelAnswer: 'Well, looking at the broader implications, I suspect we\'ll see a significant paradigm shift. While AI can certainly generate aesthetically pleasing images or compose basic melodies, it lacks the lived human experience that gives art its emotional resonance. Therefore, rather than replacing artists, it will likely serve as a sophisticated tool that pushes human creativity into uncharted territories.',
          commonMistakes: ['Personalizing answers too much ("I don\'t use AI") instead of speaking generally about society.', 'Failing to extend the answer beyond a single sentence.']
        },
        {
          title: 'Reading: Matching Headings & Paragraph Purpose',
          type: 'reading',
          officialRubricMapping: 'IELTS Reading Band 7.0',
          examBand: '7.0',
          examComponent: 'Reading Section 3',
          estimatedMinutes: 35,
          targetCollocations: ['overarching theme', 'subsidiary argument', 'implicit assumption'],
          assessmentPrompt: 'Match the following headings to Paragraphs A-F of the passage about neuroplasticity. Heading options include: "The commercial misuse of brain science," "Early misconceptions about brain development," "Evidence from rehabilitation studies."',
          modelAnswer: 'Paragraph A: "Early misconceptions about brain development" — the paragraph opens with the historical belief that the adult brain was fixed. Paragraph D: "Evidence from rehabilitation studies" — it cites Taub\'s constraint-induced therapy as direct evidence of adult neural reorganization.',
          commonMistakes: ['Matching headings based on a single keyword rather than the overall paragraph theme.', 'Selecting headings that are too specific or too general for the paragraph scope.']
        },
        {
          title: 'Writing Task 1: Comparing Two Maps Over Time',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 1 Band 7.5',
          targetGrammar: ['Past simple passive', 'Present perfect for changes', 'Comparative structures'],
          examBand: '7.5',
          examComponent: 'Writing Task 1',
          estimatedMinutes: 30,
          targetCollocations: ['underwent significant transformation', 'was converted into', 'the most striking change', 'remained largely unchanged'],
          assessmentPrompt: 'The two maps below show the village of Stokeford in 1930 and 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
          modelAnswer: 'The maps reveal that Stokeford underwent significant transformation between 1930 and 2010, evolving from a small rural settlement into a semi-urbanized locality. The most striking change was the conversion of farmland in the south-western quadrant into a large housing estate. While the primary school remained largely unchanged in location, a new supermarket and car park were constructed on land formerly occupied by individual shops.',
          commonMistakes: ['Listing every single detail rather than selecting the most significant changes.', 'Using present tense to describe the 1930 map instead of past tense.']
        },
        {
          title: 'Listening: Section 4 - Academic Lecture Note Completion',
          type: 'listening',
          officialRubricMapping: 'IELTS Listening Band 7.0',
          examBand: '7.0',
          examComponent: 'Listening Section 4',
          estimatedMinutes: 30,
          targetCollocations: ['empirical evidence suggests', 'this phenomenon is attributed to', 'in stark contrast to'],
          assessmentPrompt: 'Complete the notes: "The lecturer explains that coral bleaching is primarily caused by ____. In stark contrast to tropical reefs, deep-water corals are threatened by ____."',
          modelAnswer: 'Rising sea surface temperatures / ocean acidification. The lecturer distinguishes between the thermal stress mechanism (surface corals) and the pH-driven dissolution mechanism (deep-water corals).',
          commonMistakes: ['Misspelling technical terms heard in the lecture.', 'Writing a full sentence when only a noun phrase is required.']
        },
        {
          title: 'Speaking Part 1: Fluency Through Topic Expansion',
          type: 'speaking',
          officialRubricMapping: 'IELTS Speaking Part 1 Band 7.0',
          examBand: '7.0',
          examComponent: 'Speaking Part 1',
          estimatedMinutes: 15,
          targetCollocations: ['to be perfectly honest', 'that being said', 'I suppose it depends on'],
          assessmentPrompt: 'Do you prefer reading physical books or e-books?',
          modelAnswer: 'To be perfectly honest, I have a strong preference for physical books. There is something irreplaceable about the tactile sensation of turning pages and the distinct smell of a new paperback. That being said, I do acknowledge the convenience of e-books, particularly when travelling, so I suppose it depends on the context.',
          commonMistakes: ['Giving a one-word answer ("Physical books.") without any elaboration.', 'Abruptly switching topics instead of developing the point organically.']
        }
      ]
    },
    {
      id: 'IELTS_B8',
      name: 'IELTS Academic - Band 8.0-9.0 (Expert Mastery)',
      desc: 'Fully operational command with highly sophisticated, idiomatic control and nuanced argumentation.',
      lessons: [
        {
          title: 'Writing Task 1: Complex Multi-chart Synthesization',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 1 Band 9.0',
          targetVocabLimit: 80,
          examBand: '9.0',
          examComponent: 'Writing Task 1',
          estimatedMinutes: 45,
          targetCollocations: ['inverse correlation', 'striking disparity', 'notable fluctuation', 'plateaued', 'exponential growth'],
          assessmentPrompt: 'The charts below show the percentage of water used for different purposes in six areas of the world. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
          modelAnswer: 'The provided pie charts delineate the allocation of water resources across six distinct global regions, categorized into industrial, agricultural, and domestic usage. A striking disparity is immediately apparent: while developing regions allocate the overwhelming majority of their water to agriculture, industrialized nations demonstrate a pronounced skew towards industrial consumption. Notably, domestic water usage constitutes a minority share across all surveyed demographics, rarely exceeding 15%.',
          commonMistakes: ['Failing to synthesize data (writing separate paragraphs for each chart without linking them).', 'Mechanical listing of numbers rather than grouping data logically to highlight overarching trends.']
        },
        {
          title: 'Writing Task 2: Flawless Lexical Resource & Argumentative Nuance',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 2 Band 9.0',
          targetVocabLimit: 120,
          examBand: '9.0',
          examComponent: 'Writing Task 2',
          estimatedMinutes: 45,
          targetCollocations: ['paradigm shift', 'inherently problematic', 'catalyst for change', 'ostensibly', 'panacea'],
          assessmentPrompt: 'Some people argue that technological inventions, such as mobile phones, are making people socially less interactive. To what extent do you agree or disagree?',
          modelAnswer: 'While it is ostensibly true that digital communication has supplanted traditional face-to-face interaction in many contexts, characterizing this shift as a holistic decline in social interactivity is a reductionist viewpoint. Rather than isolating individuals, modern technology serves as a catalyst for redefining social paradigms, enabling hyper-connectivity across geographical boundaries. However, this transition is not without its caveats, as the superficial nature of online engagement can occasionally erode the depth of intimate relationships.',
          commonMistakes: ['Forcing complex vocabulary incorrectly, resulting in malapropisms (e.g., using "ubiquitous" inappropriately).', 'Lacking a clear, sustained position throughout the essay.']
        },
        {
          title: 'Reading: Summary Completion with Precise Paraphrasing',
          type: 'reading',
          officialRubricMapping: 'IELTS Reading Band 8.5',
          targetVocabLimit: 60,
          examBand: '8.5',
          examComponent: 'Reading Section 3',
          estimatedMinutes: 40,
          targetCollocations: ['semantic equivalence', 'circumvent the trap', 'lexical substitution'],
          assessmentPrompt: 'Complete the summary using words from the passage about epigenetics: "Environmental factors can modify gene expression through a process known as ____, which does not alter the underlying ____ sequence but can be passed to subsequent ____."',
          modelAnswer: 'Methylation / DNA / generations. The passage uses "heritable modifications" as a paraphrase for "passed to subsequent generations," requiring the candidate to recognize the lexical substitution.',
          commonMistakes: ['Copying a phrase verbatim from the passage when the instructions require paraphrasing.', 'Selecting a word that fits grammatically but contradicts the passage meaning.']
        },
        {
          title: 'Speaking Part 3: Speculative & Hypothetical Discourse',
          type: 'speaking',
          officialRubricMapping: 'IELTS Speaking Part 3 Band 8.5',
          targetVocabLimit: 60,
          examBand: '8.5',
          examComponent: 'Speaking Part 3',
          estimatedMinutes: 30,
          targetCollocations: ['were that to happen', 'one could argue that', 'it remains to be seen whether', 'a compelling case can be made'],
          assessmentPrompt: 'If governments made university education free for everyone, what do you think the consequences would be for society?',
          modelAnswer: 'Were that to happen, I think the immediate consequence would be a dramatic surge in enrollment, which, while democratizing access, could paradoxically dilute the perceived value of a degree. One could argue that if everyone holds a bachelor\'s qualification, employers would simply raise the bar to master\'s level, perpetuating the credentialism spiral. That said, a compelling case can be made that free education would reduce intergenerational poverty cycles, though it remains to be seen whether the fiscal burden on taxpayers would be politically sustainable.',
          commonMistakes: ['Using only "I think" and "maybe" instead of sophisticated hypothetical language.', 'Failing to consider multiple perspectives before arriving at a balanced conclusion.']
        },
        {
          title: 'Writing Task 2: Problem-Solution with Evaluation',
          type: 'writing',
          officialRubricMapping: 'IELTS Writing Task 2 Band 8.0',
          targetGrammar: ['Conditional structures (Type 2 & 3)', 'Nominalization', 'Relative clauses'],
          targetVocabLimit: 90,
          examBand: '8.0',
          examComponent: 'Writing Task 2',
          estimatedMinutes: 40,
          targetCollocations: ['mitigate the adverse effects', 'a multifaceted approach', 'the onus falls on', 'an untenable situation'],
          assessmentPrompt: 'In many cities, the increasing number of private cars is causing serious problems for residents. What problems does this cause? What solutions can you suggest?',
          modelAnswer: 'The proliferation of private vehicles in urban centers has precipitated an untenable situation characterized by chronic congestion, deteriorating air quality, and a diminished quality of life for residents. A multifaceted approach is required to mitigate these adverse effects. Were governments to invest substantially in integrated public transport networks — encompassing rapid transit, dedicated cycling infrastructure, and congestion pricing — the reliance on private automobiles could be meaningfully reduced. The onus falls on both policymakers and citizens to embrace sustainable mobility paradigms.',
          commonMistakes: ['Listing problems without analysis.', 'Proposing unrealistic or vague solutions (e.g., "The government should do something").', 'Not connecting the proposed solutions back to the identified problems.']
        },
        {
          title: 'Listening: Inference & Speaker Attitude Detection',
          type: 'listening',
          officialRubricMapping: 'IELTS Listening Band 8.5',
          examBand: '8.5',
          examComponent: 'Listening Section 4',
          estimatedMinutes: 35,
          targetCollocations: ['implication rather than explicit statement', 'tone of cautious optimism', 'underlying skepticism'],
          assessmentPrompt: 'What is the speaker\'s attitude towards the proposed carbon capture technology? Choose: (A) Unreservedly enthusiastic, (B) Cautiously optimistic, (C) Deeply skeptical, (D) Entirely dismissive.',
          modelAnswer: '(B) Cautiously optimistic. The speaker uses hedging language ("this could prove transformative, provided the scalability challenges are addressed") indicating qualified support rather than unconditional endorsement or rejection.',
          commonMistakes: ['Confusing the speaker\'s reporting of others\' opinions with the speaker\'s own stance.', 'Selecting the most extreme option when the speaker\'s language indicates nuance.']
        }
      ]
    }
  ]
};
