import type { DeepCurriculumData } from '../../curriculum/deepCurriculumTypes.ts';

export const hskChineseData: DeepCurriculumData = {
  languageFamily: 'zh',
  levels: [
    {
      id: 'HSK4',
      name: 'HSK 4 - Intermediate Proficiency',
      desc: 'Can converse in Chinese on a wide range of topics and communicate fluently with native speakers.',
      lessons: [
        { 
          title: 'Grammar: The nuances of 把 (Ba) sentences', 
          type: 'grammar', 
          officialRubricMapping: 'Hanban HSK4 Grammar', 
          targetGrammar: ['把'], 
          estimatedMinutes: 25,
          targetCollocations: ['把书放在桌子上', '把问题解决', '把钱交给老师', '把门关上'],
          assessmentPrompt: 'Rewrite the following sentence using the 把 (Ba) structure: 我做完了作业 (I finished the homework). Explain why 把 is appropriate here.',
          modelAnswer: '我把作业做完了 (Wǒ bǎ zuòyè zuò wán le). The 把 structure is appropriate here because it emphasizes the disposal or the result of an action on a specific, known object (the homework).',
          commonMistakes: ['Using 把 with verbs that don\'t imply a result or change of state (e.g., 我把知道...).', 'Forgetting the resultative complement after the verb.']
        },
        { 
          title: 'Reading: Argumentative Texts & Connectors', 
          type: 'reading', 
          officialRubricMapping: 'Hanban HSK4 Reading', 
          targetVocabLimit: 1200, 
          estimatedMinutes: 30,
          targetCollocations: ['不仅...而且', '既然...就', '即使...也'],
          assessmentPrompt: 'Read the short essay on modern technology. What relationship do the words "即使...也" establish between the two clauses?',
          modelAnswer: 'They establish a concessive conditional relationship, meaning "Even if [A happens], [B will still occur]".',
          commonMistakes: ['Confusing it with causal connectors like 因为...所以.', 'Translating it literally without understanding the conditional nuance.']
        },
        {
          title: 'Grammar: 被 (Bèi) Passive Construction & Emotional Tone',
          type: 'grammar',
          officialRubricMapping: 'Hanban HSK4 Grammar',
          targetGrammar: ['被', '让', '叫'],
          estimatedMinutes: 25,
          targetCollocations: ['被老师批评了', '被偷了', '让我很感动'],
          assessmentPrompt: 'Explain the emotional difference between 被, 让, and 叫 in passive sentences. When is 被 preferred over the colloquial 叫/让?',
          modelAnswer: '被 is the most formal and is often used for negative/undesirable events (被批评 = was criticized). 叫 and 让 are colloquial alternatives. 让 can also express causation (让我很高兴 = made me happy). In formal writing or HSK exams, 被 is always preferred.',
          commonMistakes: ['Using 被 for positive events in formal contexts (acceptable but less idiomatic than 被...所).', 'Omitting the agent between 被 and the verb when the agent is known.']
        },
        {
          title: 'Listening: Identifying Speaker Intent in Dialogues',
          type: 'listening',
          officialRubricMapping: 'Hanban HSK4 Listening',
          estimatedMinutes: 25,
          targetCollocations: ['是这样的', '不见得', '说到底'],
          assessmentPrompt: 'Listen to the conversation between two colleagues about a project deadline. What does Speaker B actually mean when they say "不见得能按时完成"?',
          modelAnswer: 'Speaker B is expressing polite disagreement/doubt, meaning "It may not necessarily be completed on time." This is an indirect way of saying the deadline is unrealistic without directly contradicting Speaker A.',
          commonMistakes: ['Interpreting 不见得 as a definitive negative ("cannot") rather than a hedging expression ("not necessarily").', 'Missing implied criticism conveyed through indirect speech patterns.']
        },
        {
          title: 'Vocabulary: Measure Words (量词) Mastery',
          type: 'vocabulary',
          officialRubricMapping: 'Hanban HSK4 Vocabulary',
          targetVocabLimit: 80,
          estimatedMinutes: 20,
          targetCollocations: ['一条鱼', '一张桌子', '一件事', '一场比赛', '一顿饭'],
          assessmentPrompt: 'Select the correct measure word for each: a) __鱼 (fish), b) __桌子 (table), c) __比赛 (match), d) __问题 (question), e) __饭 (meal)',
          modelAnswer: 'a) 条 (tiáo - long thin things), b) 张 (zhāng - flat surfaces), c) 场 (chǎng - events/performances), d) 个 (gè - general/default), e) 顿 (dùn - meals)',
          commonMistakes: ['Overusing 个 as a universal measure word (acceptable in speech but penalized in HSK writing).', 'Confusing 条 (long/thin) with 根 (thin/stick-like, more rigid).']
        }
      ]
    },
    {
      id: 'HSK5',
      name: 'HSK 5 - Advanced Fluency',
      desc: 'Can read Chinese newspapers and magazines, enjoy Chinese films and plays, and give a full-length speech in Chinese.',
      lessons: [
        { 
          title: 'Vocabulary: Synonyms and Semantic Nuance (发现 vs 发明)', 
          type: 'vocabulary', 
          officialRubricMapping: 'Hanban HSK5 Vocabulary', 
          targetVocabLimit: 2500, 
          estimatedMinutes: 35,
          targetCollocations: ['发现新大陆', '发明电灯', '发现问题', '发明家发明了电话'],
          assessmentPrompt: 'Explain the difference between 发现 (fāxiàn) and 发明 (fāmíng) and provide a context where using the wrong one changes the historical meaning.',
          modelAnswer: '发现 (fāxiàn) means "to discover" (something that already existed, like a continent). 发明 (fāmíng) means "to invent" (creating something new, like the lightbulb). Saying Columbus "invented" America would be historically absurd.',
          commonMistakes: ['Treating them as interchangeable words for "finding out".', 'Applying 发明 to abstract truths or natural phenomena.']
        },
        { 
          title: 'Writing: Formal Written Chinese (书面语)', 
          type: 'writing', 
          officialRubricMapping: 'Hanban HSK5 Writing', 
          estimatedMinutes: 40,
          targetCollocations: ['众所周知', '不可否认', '综上所述'],
          assessmentPrompt: 'Write a 80-word paragraph discussing the importance of environmental protection using formal connectors.',
          modelAnswer: '众所周知，环境保护是当今社会面临的重大课题。不可否认，经济发展给我们的生活带来了便利，但也破坏了生态平衡。综上所述，我们必须在发展经济的同时，采取有效措施保护环境。',
          commonMistakes: ['Using overly colloquial spoken Chinese (口语) in a formal essay.', 'Incorrect stroke order or character amnesia (提笔忘字) when typing is not allowed.']
        },
        {
          title: 'Grammar: Complex Complement Structures (补语)',
          type: 'grammar',
          officialRubricMapping: 'Hanban HSK5 Grammar',
          targetGrammar: ['得 (degree complement)', '结果补语', '趋向补语'],
          estimatedMinutes: 35,
          targetCollocations: ['高兴得跳了起来', '看不清楚', '走出去', '拿过来'],
          assessmentPrompt: 'Analyze the complement structure in each sentence: 1) 她高兴得哭了。2) 我看不清楚那个字。3) 他跑进来了。',
          modelAnswer: '1) 得 + degree complement (哭了 describes the degree of happiness). 2) Potential complement with 不 (看不清楚 = cannot see clearly). 3) Directional complement (跑进来 = ran in towards the speaker).',
          commonMistakes: ['Confusing 得 (degree complement marker) with 的 (attributive marker) and 地 (adverbial marker).', 'Incorrect placement of 了 with directional complements (她走了出去 vs 她走出去了).']
        },
        {
          title: 'Reading: Classical Allusions in Modern Editorials',
          type: 'reading',
          officialRubricMapping: 'Hanban HSK5 Reading',
          targetVocabLimit: 3000,
          estimatedMinutes: 40,
          targetCollocations: ['画蛇添足', '亡羊补牢', '掩耳盗铃'],
          assessmentPrompt: 'The editorial uses three Chengyu to criticize government policy. Identify each and explain how they function as literary criticism.',
          modelAnswer: '画蛇添足 (drawing legs on a snake = overcomplicating) criticizes excessive regulation. 亡羊补牢 (mending the pen after the sheep are lost = better late than never) acknowledges the belated policy response. 掩耳盗铃 (plugging ears while stealing a bell = self-deception) criticizes politicians who ignore the data.',
          commonMistakes: ['Knowing the literal meaning but missing the metaphorical application in context.', 'Confusing 亡羊补牢 (positive: still worth doing) with a purely negative idiom.']
        },
        {
          title: 'Listening: News Broadcast Comprehension (新闻听力)',
          type: 'listening',
          officialRubricMapping: 'Hanban HSK5 Listening',
          targetVocabLimit: 2000,
          estimatedMinutes: 35,
          targetCollocations: ['据报道', '有关部门', '引起了广泛关注'],
          assessmentPrompt: 'Listen to the CCTV-style news broadcast about a new education policy. What three specific measures does the government announce?',
          modelAnswer: '1) Reduce primary school homework to 60 minutes per day (减少小学生作业量). 2) Ban off-campus tutoring companies from operating on weekends (禁止周末校外培训). 3) Increase physical education class time to five hours per week (体育课时间增加到每周五小时).',
          commonMistakes: ['Confusing 有关部门 (relevant authorities) as a specific named department.', 'Missing numerical details because news broadcasts deliver them rapidly.']
        }
      ]
    },
    {
      id: 'HSK6',
      name: 'HSK 6 - Near-Native Mastery',
      desc: 'Can easily comprehend written and spoken information in Chinese and can effectively express themselves, both orally and on paper.',
      lessons: [
        { 
          title: 'Advanced Vocabulary: Chengyu (Idioms) in Socio-Political Context', 
          type: 'reading', 
          officialRubricMapping: 'Hanban HSK6 Reading & Vocab', 
          targetVocabLimit: 5000, 
          estimatedMinutes: 50,
          targetCollocations: ['拔苗助长', '不可思议', '半途而废', '破釜沉舟'],
          assessmentPrompt: 'Analyze the use of the Chengyu "破釜沉舟" (Break the woks, sink the boats) in the provided editorial about corporate restructuring.',
          modelAnswer: 'The editorial uses "破釜沉舟" to illustrate the CEO\'s absolute commitment to the risky restructuring plan, cutting off all avenues of retreat to force the company to innovate or perish.',
          commonMistakes: ['Taking the literal translation of the 4 characters instead of the historical metaphor.', 'Using the Chengyu in a grammatically incorrect position (e.g., as a verb instead of an adverbial modifier).']
        },
        {
          title: 'Writing: Abridged Writing (缩写) & Text Restructuring',
          type: 'writing',
          officialRubricMapping: 'Hanban HSK6 Writing',
          estimatedMinutes: 45,
          targetCollocations: ['概括', '梗概', '主旨', '删繁就简'],
          assessmentPrompt: 'Read the 1000-character narrative about a young entrepreneur. Rewrite it as a 400-character abridged version preserving the main plot points and conclusion.',
          modelAnswer: '本文讲述了一位年轻创业者从失败走向成功的经历。主人公最初创业失败，负债累累。然而，他并未放弃，通过反思错误、调整策略，最终建立了一家成功的科技公司。文章的主旨在于强调坚持不懈和从失败中学习的重要性。',
          commonMistakes: ['Adding personal opinions or interpretations not present in the original text.', 'Exceeding the word limit by failing to condense dialogue and descriptive passages.', 'Changing the narrative perspective from the original.']
        },
        {
          title: 'Grammar: Literary & Classical Grammar Patterns',
          type: 'grammar',
          officialRubricMapping: 'Hanban HSK6 Grammar',
          targetGrammar: ['非...不可', '岂不是', '何尝不是', '无非是'],
          estimatedMinutes: 40,
          targetCollocations: ['这件事非做不可', '岂不是自相矛盾', '这何尝不是一种进步'],
          assessmentPrompt: 'Use each literary grammar pattern in a sentence discussing the impact of social media on youth: 非...不可, 岂不是, 何尝不是, 无非是.',
          modelAnswer: '社会各界必须对青少年网络使用问题加强管控，这非做不可。如果放任不管，岂不是对下一代不负责任？当然，社交媒体的普及何尝不是信息民主化的体现。批评者所谓的"网络成瘾"，无非是技术进步带来的阵痛而已。',
          commonMistakes: ['Using 非...不可 in casual speech (it is literary/emphatic).', 'Confusing 岂不是 (rhetorical question expecting "yes") with 难道 (rhetorical question expecting "no").']
        }
      ]
    }
  ]
};

export const topikKoreanData: DeepCurriculumData = {
  languageFamily: 'ko',
  levels: [
    {
      id: 'TOPIK_II_L4',
      name: 'TOPIK II - Level 4 (Intermediate)',
      desc: 'Can comprehend the content of news broadcasts and newspapers, and understand relatively complex social issues.',
      lessons: [
        { 
          title: 'Grammar: Advanced Causality (-기 때문에 vs -아/어서 vs -(으)니까)', 
          type: 'grammar', 
          officialRubricMapping: 'TOPIK II Level 4 Grammar', 
          targetGrammar: ['-기 때문에', '-아/어서', '-(으)니까'], 
          estimatedMinutes: 30,
          targetCollocations: ['비가 오기 때문에', '바빠서', '추우니까'],
          assessmentPrompt: 'Explain why "-아/어서" cannot be used with imperative or propositive endings (e.g., -(으)세요, -(으)ㅂ시다). Which causal connector should be used instead?',
          modelAnswer: '"-아/어서" expresses a tight chronological or causal sequence that is objective. For subjective suggestions or commands (imperatives/propositives), "-(으)니까" must be used.',
          commonMistakes: ['Saying "비가 와서 우산을 쓰세요" (WRONG) instead of "비가 오니까 우산을 쓰세요" (CORRECT).']
        },
        { 
          title: 'Writing: Question 53 (Data Analysis)', 
          type: 'writing', 
          officialRubricMapping: 'TOPIK II Writing Q53', 
          estimatedMinutes: 40,
          targetCollocations: ['증가하다', '감소하다', '에 달하다', '차지하다'],
          assessmentPrompt: 'Write a 200-300 character objective report analyzing the provided line graph showing the youth unemployment rate from 2015 to 2020.',
          modelAnswer: '제시된 그래프에 따르면, 2015년부터 2020년까지 청년 실업률은 지속적인 변화를 보였다. 2015년 8%였던 실업률은 2018년에 10%로 꾸준히 증가하였다. 그러나 2019년부터는 하락세로 돌아서며 2020년에는 7.5%로 감소하였다...',
          commonMistakes: ['Using honorifics (해요체/하십시오체) instead of the objective written form (해라체/한다체).', 'Failing to include all data points provided in the prompt.']
        },
        {
          title: 'Grammar: Expressing Supposition & Conjecture',
          type: 'grammar',
          officialRubricMapping: 'TOPIK II Level 4 Grammar',
          targetGrammar: ['-(으)ㄹ 텐데', '-나 보다', '-(으)ㄹ 리가 없다'],
          estimatedMinutes: 25,
          targetCollocations: ['힘들 텐데', '피곤한가 보다', '그럴 리가 없다'],
          assessmentPrompt: 'Complete each sentence with the appropriate conjecture grammar: a) 혼자 여행하면 외로울 ____. b) 아이가 울고 있는 것을 보니 배가 고픈 ____. c) 그 사람이 거짓말을 할 ____.',
          modelAnswer: 'a) 텐데 (supposition with concern/empathy). b) 가 보다 (inference from observed evidence). c) 리가 없다 (strong denial of possibility).',
          commonMistakes: ['Using -나 보다 when the speaker has direct knowledge (it requires inference from indirect evidence).', 'Confusing -(으)ㄹ 텐데 (supposition about future/present) with -(으)ㄹ 걸 (retrospective regret).']
        },
        {
          title: 'Reading: Understanding Advertisements & Public Notices',
          type: 'reading',
          officialRubricMapping: 'TOPIK II Level 4 Reading',
          targetVocabLimit: 2000,
          estimatedMinutes: 25,
          targetCollocations: ['신청하다', '마감일', '유의사항', '문의하다'],
          assessmentPrompt: 'Read the university scholarship announcement. What are the three eligibility requirements and the application deadline?',
          modelAnswer: 'Requirements: 1) GPA of 3.5 or higher (학점 3.5 이상). 2) Enrolled for at least 2 semesters (2학기 이상 재학). 3) Annual household income below 50M won (가구 소득 5천만원 이하). Deadline: March 15th (3월 15일 마감).',
          commonMistakes: ['Confusing 재학 (currently enrolled) with 졸업 (graduated).', 'Missing the distinction between 필수 (mandatory) and 선택 (optional) requirements.']
        }
      ]
    },
    {
      id: 'TOPIK_II_L5',
      name: 'TOPIK II - Level 5 (Advanced)',
      desc: 'Can perform linguistic functions necessary for research and professional tasks in specific fields.',
      lessons: [
        { 
          title: 'Vocabulary & Reading: Socio-economic and Scientific Texts', 
          type: 'reading', 
          officialRubricMapping: 'TOPIK II Level 5 Reading', 
          targetVocabLimit: 4000, 
          estimatedMinutes: 45,
          targetCollocations: ['불가피하다', '초래하다', '대안을 모색하다'],
          assessmentPrompt: 'Read the academic excerpt on artificial intelligence ethics. What is the primary concern raised regarding algorithm bias?',
          modelAnswer: 'The text warns that algorithmic bias is "불가피하다" (inevitable) if the training data reflects historical prejudices, which can "초래하다" (bring about) systemic inequality in hiring practices.',
          commonMistakes: ['Misunderstanding advanced Hanja-based vocabulary.', 'Losing track of the complex relative clauses that modify the main subject.']
        },
        {
          title: 'Grammar: Formal Written Connectors (격식체 접속사)',
          type: 'grammar',
          officialRubricMapping: 'TOPIK II Level 5 Grammar',
          targetGrammar: ['-(으)ㅁ에 따라', '-는 바', '-(으)ㄴ/는 셈이다', '-다시피'],
          estimatedMinutes: 35,
          targetCollocations: ['사회가 변함에 따라', '앞서 언급한 바와 같이', '실패한 셈이다', '보시다시피'],
          assessmentPrompt: 'Rewrite these casual sentences into formal written Korean using the target grammar: a) "사회가 변하면 문화도 변한다" b) "이미 말한 것처럼" c) "사실상 실패했다"',
          modelAnswer: 'a) 사회가 변함에 따라 문화도 변화한다. b) 앞서 언급한 바와 같이. c) 사실상 실패한 셈이다.',
          commonMistakes: ['Using spoken connectors (그래서, 그런데) in formal TOPIK writing instead of 따라서, 그러나.', 'Incorrect nominalization (변하다 → 변함, not 변하기) before 에 따라.']
        },
        {
          title: 'Listening: Lecture Comprehension & Note-Taking',
          type: 'listening',
          officialRubricMapping: 'TOPIK II Level 5 Listening',
          targetVocabLimit: 3500,
          estimatedMinutes: 40,
          targetCollocations: ['핵심 논점', '반론을 제기하다', '결론적으로'],
          assessmentPrompt: 'Listen to the university lecture on Korean economic development (한강의 기적). What three factors does the professor attribute to Korea\'s rapid industrialization?',
          modelAnswer: '1) Government-led export promotion policies (수출주도형 경제정책). 2) Investment in education and human capital (교육투자와 인적자본). 3) Cultural emphasis on diligence and sacrifice (근면과 희생의 문화적 가치).',
          commonMistakes: ['Confusing the professor\'s cited counterarguments with the professor\'s own position.', 'Missing the transition word 결론적으로 that signals the main takeaway.']
        },
        {
          title: 'Vocabulary: Hanja-based Academic Vocabulary (한자어)',
          type: 'vocabulary',
          officialRubricMapping: 'TOPIK II Level 5 Vocabulary',
          targetVocabLimit: 100,
          estimatedMinutes: 30,
          targetCollocations: ['경제 성장 (經濟成長)', '환경 보호 (環境保護)', '국제 협력 (國際協力)'],
          assessmentPrompt: 'Group these Hanja-based words by their shared character and explain the meaning pattern: 경제, 경험, 경쟁 (all share 경/競/經/驚). Which 경 is which?',
          modelAnswer: '경제 (經濟) uses 經 meaning "pass through/manage." 경험 (經驗) also uses 經 meaning "experience/go through." 경쟁 (競爭) uses 競 meaning "compete." Understanding the root Hanja character unlocks vocabulary families.',
          commonMistakes: ['Assuming all words starting with 경 share the same Hanja root.', 'Ignoring Hanja study because Korean uses Hangul, when 60%+ of Korean vocabulary is Hanja-derived.']
        }
      ]
    },
    {
      id: 'TOPIK_II_L6',
      name: 'TOPIK II - Level 6 (Mastery)',
      desc: 'Can perform linguistic functions necessary for research and professional tasks fluently and accurately, without feeling difficulty.',
      lessons: [
        { 
          title: 'Writing: Question 54 (Logical Argumentation)', 
          type: 'writing', 
          officialRubricMapping: 'TOPIK II Writing Q54', 
          estimatedMinutes: 50,
          targetCollocations: ['찬반양론이 팽팽하다', '바람직하다', '재고할 필요가 있다'],
          assessmentPrompt: 'Write a 600-700 character argumentative essay on the topic: "Should the government implement a universal basic income?" Include your stance and two supporting arguments.',
          modelAnswer: '최근 기본소득제도 도입을 둘러싸고 사회적 찬반양론이 팽팽하다. 이는 기술 발전에 따른 일자리 감소에 대한 대안으로 모색되고 있다. 필자는 두 가지 이유에서 이 제도의 점진적 도입이 바람직하다고 본다. 첫째...',
          commonMistakes: ['Writing less than 600 characters, which results in a severe penalty.', 'Failing to structure the essay clearly (Introduction, Body Paragraph 1, Body Paragraph 2, Conclusion).', 'Using spoken Korean expressions.']
        },
        {
          title: 'Reading: Academic Paper Abstract & Thesis Analysis',
          type: 'reading',
          officialRubricMapping: 'TOPIK II Level 6 Reading',
          targetVocabLimit: 6000,
          estimatedMinutes: 50,
          targetCollocations: ['본 연구에서는', '유의미한 결과', '선행 연구에 따르면', '시사점을 제시하다'],
          assessmentPrompt: 'Read the abstract of an academic paper on multilingual education policy. What is the author\'s main argument and what evidence is cited?',
          modelAnswer: 'The author argues that early bilingual education (조기 이중언어 교육) produces statistically significant cognitive advantages (유의미한 인지적 이점), citing a longitudinal study of 500 students over 10 years. The abstract concludes with policy implications (시사점) recommending mandatory L2 instruction from age 6.',
          commonMistakes: ['Confusing 유의미한 (statistically significant) with 의미 있는 (meaningful in general sense).', 'Failing to distinguish between the author\'s claims and cited references.']
        },
        {
          title: 'Speaking: Formal Presentation & Debate (발표와 토론)',
          type: 'speaking',
          officialRubricMapping: 'TOPIK II Level 6 Speaking',
          estimatedMinutes: 45,
          targetCollocations: ['~에 대해 발표하겠습니다', '반론을 제기하자면', '양보하더라도', '요약하자면'],
          assessmentPrompt: 'Prepare a 3-minute formal presentation outline on "The impact of remote work on Korean corporate culture." Include an introduction, two main arguments, a counterargument, and a conclusion.',
          modelAnswer: '오늘 "원격 근무가 한국 기업 문화에 미치는 영향"에 대해 발표하겠습니다. 첫째, 원격 근무는 업무 효율성을 높이는 동시에 직원 만족도를 향상시킨다. 둘째, 수도권 집중 문제를 완화하는 데 기여한다. 물론, 반론을 제기하자면, 한국의 수직적 기업 문화와 원격 근무 간의 갈등은 무시할 수 없다. 이를 양보하더라도, 장기적으로 한국 기업 문화의 변혁은 불가피하다. 요약하자면, 원격 근무는 도전과 기회를 동시에 제공한다.',
          commonMistakes: ['Using 해요체 (polite conversational) instead of 하십시오체 (formal speech) in presentations.', 'Failing to structure the argument with clear transition markers (첫째, 둘째, 반면에, 요약하자면).', 'Presenting only one side without acknowledging counterarguments.']
        }
      ]
    }
  ]
};


export const frenchDelfData: DeepCurriculumData = {
  languageFamily: 'fr',
  levels: [
    {
      id: 'DELF_A1',
      name: 'DELF A1 - Découverte (Sơ cấp)',
      desc: 'Can understand and use familiar everyday expressions and very basic phrases for concrete needs.',
      lessons: [
        {
          title: 'Phonétique: Les voyelles nasales et la liaison',
          type: 'vocabulary',
          officialRubricMapping: 'CIEP DELF A1 Phonétique',
          estimatedMinutes: 20,
          targetCollocations: ['un grand homme [lɛ̃.zɔm]', 'en France [ɑ̃.fʁɑ̃s]', 'bonjour [bɔ̃.ʒuʁ]'],
          assessmentPrompt: 'Expliquez la règle de liaison entre "un grand" et "arbre". Pourquoi entend-on le son /t/?',
          modelAnswer: 'Dans la liaison obligatoire, le "d" final de "grand" se prononce /t/ devant une voyelle : "un grand arbre" [œ̃ ɡʁɑ̃.t‿aʁbʁ].',
          commonMistakes: ['Prononcer le d comme /d/ au lieu de /t/ dans la liaison.', 'Oublier la nasalité des voyelles.']
        },
        {
          title: 'Grammaire: Les articles définis, indéfinis et contractés',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A1 Grammaire',
          targetGrammar: ['du (de + le)', 'au (à + le)', 'des', 'aux'],
          estimatedMinutes: 25,
          targetCollocations: ['aller au cinéma', 'venir du bureau', 'parler aux professeurs'],
          assessmentPrompt: 'Complétez: Je vais ___ supermarché et je reviens ___ gare.',
          modelAnswer: 'Je vais au supermarché (à + le = au) et je reviens de la gare.',
          commonMistakes: ['Écrire "à le" au lieu de "au".', 'Confondre le genre des noms communs.']
        },
        {
          title: 'Production Orale: Se présenter et commander au café',
          type: 'speaking',
          officialRubricMapping: 'CIEP DELF A1 Speaking',
          estimatedMinutes: 25,
          targetCollocations: ['Je voudrais...', 'S\'il vous plaît', 'L\'addition, s\'il vous plaît'],
          assessmentPrompt: 'Commandez un café et un croissant dans une brasserie parisienne avec politesse.',
          modelAnswer: 'Bonjour monsieur, je voudrais un café noir et un croissant, s\'il vous plaît. Combien ça coûte ?',
          commonMistakes: ['Utiliser "Je veux" au lieu du conditionnel de politesse "Je voudrais".', 'Oublier les formules de politesse indispensables.']
        },
        {
          title: 'Écoute: Demander son chemin en ville',
          type: 'listening',
          officialRubricMapping: 'CIEP DELF A1 Écoute',
          estimatedMinutes: 20,
          targetCollocations: ['Excusez-moi, où est la gare ?', 'Tournez à gauche', 'Tout droit', 'C\'est à droite après la banque'],
          assessmentPrompt: 'Dans un dialogue dans la rue, un passant dit "C\'est tout droit, puis la deuxième à droite". Que doit faire le demandeur ?',
          modelAnswer: 'Aller tout droit, puis prendre la deuxième rue sur la droite. "La deuxième à droite" = la deuxième rue que vous rencontrez en tournant à droite.',
          commonMistakes: ['Confondre "à gauche" et "à droite" à l\'écoute rapide.', 'Comprendre "tout droit" (straight) comme "tout de suite" (immediately).']
        },
        {
          title: 'Grammaire: Le passé composé avec avoir',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A1 Grammaire',
          targetGrammar: ['avoir + participe passé', 'participes irréguliers (fait, pris, mis)'],
          estimatedMinutes: 25,
          targetCollocations: ['J\'ai fait mes devoirs', 'Tu as pris le bus ?', 'Elle a mis son manteau'],
          assessmentPrompt: 'Conjuguez au passé composé: (nous) manger au restaurant hier soir.',
          modelAnswer: 'Nous avons mangé au restaurant hier soir. Auxiliaire avoir au présent + participe passé (manger → mangé).',
          commonMistakes: ['Accorder le participe avec le sujet avec avoir ("nous avons mangés" est faux).', 'Confondre les participes irréguliers: mis/mettre, pris/prendre.']
        },
        {
          title: 'Lecture: Une annonce de location d\'appartement',
          type: 'reading',
          officialRubricMapping: 'CIEP DELF A1 Lecture',
          estimatedMinutes: 25,
          targetVocabLimit: 700,
          targetCollocations: ['appartement meublé', 'charges comprises', 'caution', 'disponible immédiatement'],
          assessmentPrompt: 'Dans une annonce, que signifie "charges comprises" et pourquoi est-ce important pour le budget ?',
          modelAnswer: '"Charges comprises" signifie que les frais d\'immeuble (eau, chauffage, entretien) sont inclus dans le loyer. Important pour comparer les loyers réels: 500 € charges comprises est souvent moins cher que 450 € + 80 € de charges.',
          commonMistakes: ['Comparer les loyers sans vérifier si les charges sont comprises.', 'Ignorer la caution (dépôt de garantie) dans le budget initial.']
        }
      ]
    },
    {
      id: 'DELF_A2',
      name: 'DELF A2 - Survie (Sơ trung cấp)',
      desc: 'Can handle short social exchanges and describe immediate environment, past events, and future plans.',
      lessons: [
        {
          title: 'Grammaire: Le passé composé avec être (les 17 verbes)',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A2 Grammaire',
          targetGrammar: ['être + participe passé (mouvement/état)', 'accord du participe avec le sujet'],
          estimatedMinutes: 30,
          targetCollocations: ['Elle est allée à Paris', 'Ils sont partis hier soir', 'Nous sommes arrivés en retard'],
          assessmentPrompt: 'Conjuguez au passé composé avec être : "Marie (aller) au marché et (revenir) à midi." Expliquez l\'accord.',
          modelAnswer: 'Marie est allée au marché et est revenue à midi. Le participe passé s\'accorde en genre et en nombre avec le sujet quand l\'auxiliaire est "être" : allée (féminin singulier), revenue (féminin singulier).',
          commonMistakes: ['Oublier l\'accord du participe passé avec le sujet féminin ou pluriel ("Elle est allé" au lieu de "allée").', 'Utiliser "avoir" au lieu de "être" avec les verbes de mouvement (aller, venir, partir).', 'Confondre la liste des verbes qui prennent "être" : les verbes pronominaux et les 17 verbes intransitifs de mouvement/état.']
        },
        {
          title: 'Grammaire: Les pronoms compléments COD et COI',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A2 Grammaire',
          targetGrammar: ['COD: le, la, les, l\'', 'COI: lui, leur', 'Place avant le verbe conjugué'],
          estimatedMinutes: 30,
          targetCollocations: ['Je le vois tous les jours', 'Elle lui parle souvent', 'Nous les avons achetés hier'],
          assessmentPrompt: 'Remplacez les compléments par des pronoms : "J\'ai donné le livre à Marie. J\'ai vu les enfants au parc."',
          modelAnswer: 'Je lui ai donné le livre. / Je le lui ai donné. Je les ai vus au parc. Le COI "à Marie" devient "lui" ; le COD "les enfants" devient "les" et le participe passé s\'accorde avec le COD placé avant ("vus").',
          commonMistakes: ['Placer le pronom après le verbe conjugué comme en anglais ("Je vois le" au lieu de "Je le vois").', 'Confondre COD et COI : "lui" remplace "à + personne", pas l\'objet direct.', 'Oublier l\'accord du participe passé avec le COD placé avant l\'auxiliaire avoir.']
        },
        {
          title: 'Grammaire: Le futur proche (aller + infinitif)',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A2 Grammaire',
          targetGrammar: ['aller au présent + infinitif', 'négation: ne + aller + pas + infinitif'],
          estimatedMinutes: 25,
          targetCollocations: ['Je vais partir demain', 'Nous allons manger au restaurant', 'Tu ne vas pas regretter'],
          assessmentPrompt: 'Transformez au futur proche : "Nous partons en vacances la semaine prochaine." Puis mettez à la forme négative.',
          modelAnswer: 'Futur proche : Nous allons partir en vacances la semaine prochaine. Négatif : Nous n\'allons pas partir en vacances la semaine prochaine. La négation encadre le verbe "aller" conjugué, pas l\'infinitif.',
          commonMistakes: ['Placer la négation autour de l\'infinitif ("Nous allons ne pas partir") au lieu d\'encadrer "aller".', 'Confondre futur proche et futur simple dans les contextes formels.', 'Oublier la contraction "n\'" devant voyelle : "Je n\'vais pas" → "Je ne vais pas".']
        },
        {
          title: 'Grammaire: L\'imparfait — description et habitude',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF A2 Grammaire',
          targetGrammar: ['radical de nous au présent + -ais, -ais, -ait, -ions, -iez, -aient', 'imparfait vs passé composé'],
          estimatedMinutes: 30,
          targetCollocations: ['Quand j\'étais petit, je jouais dehors', 'Il faisait beau ce jour-là', 'Nous habitions à Lyon avant'],
          assessmentPrompt: 'Dans la phrase "Il pleuvait quand je suis sorti", expliquez pourquoi "pleuvait" est à l\'imparfait et "suis sorti" au passé composé.',
          modelAnswer: '"Pleuvait" (imparfait) décrit le décor en cours, l\'arrière-plan continu. "Suis sorti" (passé composé) exprime l\'action ponctuelle qui se produit dans ce décor. L\'imparfait = toile de fond ; le passé composé = événement.',
          commonMistakes: ['Utiliser le passé composé pour les descriptions ("Il a fait beau" au lieu de "Il faisait beau" pour un décor).', 'Former l\'imparfait à partir de l\'infinitif au lieu du radical de "nous" au présent.', 'Oublier que "être" est la seule exception : radical "ét-" (j\'étais) ne vient pas de "nous sommes".']
        },
        {
          title: 'Lecture: Comprendre un courriel amical et répondre',
          type: 'reading',
          officialRubricMapping: 'CIEP DELF A2 Lecture',
          estimatedMinutes: 25,
          targetVocabLimit: 1000,
          targetCollocations: ['J\'espère que tu vas bien', 'Ça fait longtemps qu\'on ne s\'est pas vus', 'À bientôt', 'Grosses bises'],
          assessmentPrompt: 'Dans un courriel, votre ami écrit : "Ça fait longtemps qu\'on ne s\'est pas vus ! Tu me manques." Que signifie "tu me manques" et pourquoi la construction est-elle inversée par rapport à l\'anglais ?',
          modelAnswer: '"Tu me manques" = I miss you. En français, la personne absente est le sujet ("tu") et la personne qui ressent le manque est l\'objet indirect ("me"). C\'est l\'inverse de l\'anglais : "You are missing to me" → Tu me manques.',
          commonMistakes: ['Dire "Je te manque" en pensant dire "I miss you" (cela signifie en réalité "You miss me").', 'Confondre le registre des formules de fin : "Grosses bises" (amical) vs "Cordialement" (formel).', 'Négliger l\'accord dans "on ne s\'est pas vus" (accord avec le sens pluriel de "on" = nous).']
        }
      ]
    },
    {
      id: 'DELF_B1',
      name: 'DELF B1 - Autonomie (Trung cấp)',
      desc: 'Can understand the main points on familiar matters and produce simple connected text on topics of personal interest.',
      lessons: [
        {
          title: 'Grammaire: Introduction au subjonctif présent',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF B1 Grammaire',
          targetGrammar: ['Il faut que + subjonctif', 'vouloir que + subjonctif', 'formation: radical 3e pers. pluriel + -e, -es, -e, -ions, -iez, -ent'],
          estimatedMinutes: 35,
          targetCollocations: ['Il faut que je fasse mes devoirs', 'Je veux qu\'il vienne', 'Il est important que nous sachions'],
          assessmentPrompt: 'Conjuguez "faire" et "aller" au subjonctif présent pour "il faut que je..." et expliquez pourquoi le subjonctif est nécessaire après "il faut que".',
          modelAnswer: 'Il faut que je fasse (faire → fass-). Il faut que j\'aille (aller → aill-). Le subjonctif est requis car "il faut que" exprime une nécessité subjective, pas un fait établi. Les verbes irréguliers au subjonctif ont des radicaux spéciaux.',
          commonMistakes: ['Utiliser l\'indicatif après "il faut que" ("il faut que je fais" au lieu de "fasse").', 'Confondre les radicaux irréguliers du subjonctif : aller → aill-, faire → fass-, savoir → sach-, pouvoir → puiss-.', 'Oublier que les formes "nous" et "vous" au subjonctif ressemblent souvent à l\'imparfait (que nous fassions).']
        },
        {
          title: 'Grammaire: Les pronoms relatifs qui, que, dont, où',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF B1 Grammaire',
          targetGrammar: ['qui (sujet)', 'que (objet direct)', 'dont (complément de "de")', 'où (lieu/temps)'],
          estimatedMinutes: 30,
          targetCollocations: ['La fille qui parle est ma sœur', 'Le livre que j\'ai lu est passionnant', 'C\'est le pays dont je rêve', 'La ville où je suis né'],
          assessmentPrompt: 'Complétez avec qui, que, dont ou où : a) Le film ___ tu m\'as parlé est sorti. b) C\'est la raison ___ elle est partie. c) Le jour ___ nous nous sommes rencontrés.',
          modelAnswer: 'a) Le film dont tu m\'as parlé (parler de → dont). b) C\'est la raison pour laquelle elle est partie (ou "la raison qui explique"). c) Le jour où nous nous sommes rencontrés (où = temps/lieu).',
          commonMistakes: ['Utiliser "que" au lieu de "dont" quand le verbe est suivi de "de" (parler de, rêver de, avoir besoin de).', 'Confondre "qui" (sujet, jamais élidé) et "que" (objet direct, élidé devant voyelle : qu\').', 'Oublier que "où" peut exprimer le temps aussi bien que le lieu : "le jour où", "l\'année où".']
        },
        {
          title: 'Grammaire: Le plus-que-parfait et la chronologie du passé',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF B1 Grammaire',
          targetGrammar: ['avoir/être à l\'imparfait + participe passé', 'antériorité par rapport au passé composé'],
          estimatedMinutes: 30,
          targetCollocations: ['J\'avais déjà mangé quand il est arrivé', 'Elle était partie avant nous', 'Ils avaient fini leurs devoirs'],
          assessmentPrompt: 'Mettez les verbes au temps correct : "Quand je (arriver) à la gare, le train (partir) déjà." Justifiez l\'emploi du plus-que-parfait.',
          modelAnswer: 'Quand je suis arrivé à la gare, le train était déjà parti. Le plus-que-parfait ("était parti") exprime une action antérieure à une autre action passée ("suis arrivé"). C\'est le passé du passé.',
          commonMistakes: ['Utiliser le passé composé pour les deux actions sans marquer l\'antériorité.', 'Oublier l\'accord du participe passé avec être au plus-que-parfait ("elle était parti" → "partie").', 'Confondre le plus-que-parfait avec l\'imparfait : l\'imparfait décrit un état continu, le plus-que-parfait exprime un résultat accompli avant un autre passé.']
        },
        {
          title: 'Production Écrite: La lettre formelle de réclamation',
          type: 'writing',
          officialRubricMapping: 'CIEP DELF B1 Production Écrite',
          estimatedMinutes: 35,
          targetCollocations: ['Je me permets de vous écrire afin de', 'Suite à notre conversation téléphonique', 'Dans l\'attente de votre réponse', 'Veuillez agréer mes salutations distinguées'],
          assessmentPrompt: 'Rédigez le début d\'une lettre formelle pour signaler un problème avec une commande en ligne (mauvais produit reçu). Utilisez les formules de politesse appropriées.',
          modelAnswer: 'Madame, Monsieur, Je me permets de vous écrire afin de signaler un problème concernant ma commande n° 45892 du 15 janvier. En effet, j\'ai reçu un article qui ne correspond pas à celui commandé. Je souhaiterais obtenir un échange ou un remboursement dans les meilleurs délais. Dans l\'attente de votre réponse, veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
          commonMistakes: ['Utiliser "Cher Monsieur" dans une lettre de réclamation commerciale (trop familier ; "Madame, Monsieur" est neutre).', 'Mélanger le registre formel et informel dans la même lettre.', 'Omettre la formule de politesse de clôture qui est obligatoire dans les lettres formelles françaises.']
        },
        {
          title: 'Compréhension Orale: Écouter une émission de radio',
          type: 'listening',
          officialRubricMapping: 'CIEP DELF B1 Compréhension Orale',
          estimatedMinutes: 30,
          targetCollocations: ['Selon une étude récente', 'Les résultats montrent que', 'D\'après le journaliste', 'En revanche'],
          assessmentPrompt: 'Dans un reportage radio sur les habitudes alimentaires, le journaliste dit : "En revanche, les jeunes Français consomment de plus en plus de fast-food." Que signifie "en revanche" et quelle information le précède probablement ?',
          modelAnswer: '"En revanche" introduit un contraste/opposition. Il est probablement précédé d\'une information positive sur les habitudes alimentaires (par exemple : "Les adultes mangent davantage de légumes"). "En revanche" signale le contraire pour les jeunes.',
          commonMistakes: ['Confondre "en revanche" (contraste neutre) avec "par contre" (acceptable à l\'oral mais critiqué à l\'écrit).', 'Manquer les connecteurs logiques qui signalent la structure argumentative d\'un reportage.', 'Ne pas distinguer l\'opinion du journaliste des faits cités ("selon une étude" = fait ; "il me semble" = opinion).']
        }
      ]
    },
    {
      id: 'DELF_B2',
      name: 'DELF B2 - Indépendance & Argumentation (Trung cao cấp)',
      desc: 'Can understand the main ideas of complex text and produce clear, detailed argumentative texts.',
      lessons: [
        {
          title: 'Grammaire: Le Subjonctif Présent vs Indicatif',
          type: 'grammar',
          officialRubricMapping: 'CIEP DELF B2 Grammaire',
          targetGrammar: ['Il faut que + subj', 'Bien que + subj', 'Penser que + ind'],
          estimatedMinutes: 35,
          targetCollocations: ['bien qu\'il soit tard', 'il est primordial que nous agissions', 'je doute que cela suffise'],
          assessmentPrompt: 'Pourquoi utilise-t-on le subjonctif après "bien que" mais l\'indicatif après "parce que" ?',
          modelAnswer: '"Bien que" exprime une concession/opposition subjective et requiert le subjonctif. "Parce que" exprime une cause factuelle et objective, exigeant l\'indicatif.',
          commonMistakes: ['Mettre le subjonctif après "espérer que" (qui prend l\'indicatif futur).', 'Confondre les radicaux irréguliers du subjonctif (soit, ait, fasse, aille).']
        },
        {
          title: 'Production Écrite: L\'Essai Argumentatif et la Lettre Formelle',
          type: 'writing',
          officialRubricMapping: 'CIEP DELF B2 Writing',
          estimatedMinutes: 45,
          targetCollocations: ['En premier lieu', 'Force est de constater que', 'Par conséquent'],
          assessmentPrompt: 'Rédigez une lettre de réclamation au maire concernant l\'aménagement des pistes cyclables.',
          modelAnswer: 'Monsieur le Maire, En tant que citoyen engagé, je me permets d\'attirer votre attention sur l\'insuffisance des infrastructures cyclables...',
          commonMistakes: ['Manque de structure en paragraphes distincts.', 'Absence de connecteurs logiques de niveau B2.']
        }
      ]
    }
  ]
};

export const germanGoetheData: DeepCurriculumData = {
  languageFamily: 'de',
  levels: [
    {
      id: 'GOETHE_A1',
      name: 'Goethe-Zertifikat A1 - Start Deutsch',
      desc: 'Basic German communication: daily interactions, ordering, and asking for directions.',
      lessons: [
        {
          title: 'Grammatik: Die vier Fälle (Nominativ & Akkusativ)',
          type: 'grammar',
          officialRubricMapping: 'Goethe A1 Grammatik',
          targetGrammar: ['der/den', 'ein/einen', 'kein/keinen'],
          estimatedMinutes: 25,
          targetCollocations: ['Ich habe einen Hund', 'Ich brauche den Schlüssel', 'Ich kaufe keinen Apfelsaft', 'Der Lehrer sieht den Studenten'],
          assessmentPrompt: 'Erklären Sie den Unterschied zwischen "Der Tisch ist schön" und "Ich kaufe den Tisch".',
          modelAnswer: 'Im ersten Satz ist "Der Tisch" das Subjekt (Nominativ). Im zweiten Satz ist "den Tisch" das direkte Objekt (Akkusativ maskulin der -> den).',
          commonMistakes: ['Vergessen, den maskulinen Artikel im Akkusativ zu verändern.', 'Verwechslung von Dativ und Akkusativ.']
        },
        {
          title: 'Grammatik: Das Perfekt mit haben und sein',
          type: 'grammar',
          officialRubricMapping: 'Goethe A1 Grammatik',
          targetGrammar: ['haben + Partizip II (default)', 'sein + Partizip II (Bewegung/Zustandswechsel)'],
          estimatedMinutes: 30,
          targetCollocations: ['Ich habe Deutsch gelernt', 'Ich bin nach Berlin gefahren', 'Wir haben Pizza gegessen', 'Sie ist um 7 Uhr aufgestanden'],
          assessmentPrompt: 'Warum heißt es "Ich habe geschlafen" aber "Ich bin eingeschlafen"? Beide sind Schlaf-Verben.',
          modelAnswer: '"Schlafen" beschreibt eine Dauer/handlung → haben. "Einschlafen" ist ein Zustandswechsel (wach → schlafend) → sein. Bewegungs- und Wechselverben (fahren, gehen, aufstehen, einschlafen) nehmen sein; die meisten anderen nehmen haben.',
          commonMistakes: ['"Ich bin gegessen" — Essen ist kein Bewegungsverb, haben ist richtig.', 'Doppelte Vergangenheit: "Ich habe gegangen" statt "Ich bin gegangen".']
        },
        {
          title: 'Grammatik: Die Satzklammer — Verb an Position 2',
          type: 'grammar',
          officialRubricMapping: 'Goethe A1 Grammatik',
          targetGrammar: ['Verbzweitstellung (Hauptsatz)', 'Satzklammer mit Perfekt/Modalverb'],
          estimatedMinutes: 25,
          targetCollocations: ['Heute gehe ich ins Kino', 'Morgen muss ich früh aufstehen', 'Gestern habe ich meine Oma besucht'],
          assessmentPrompt: 'Bilden Sie zwei Sätze: (a) "wir / am Sonntag / wandern" (b) "letzte Woche / ich / einen Film / sehen (Perfekt)".',
          modelAnswer: '(a) Am Sonntag wandern wir. (b) Letzte Woche habe ich einen Film gesehen. Das konjugierte Verb steht immer an Position 2; bei Perfekt/Modalverben bildet es mit dem Partizip/Infinitiv am Ende die Satzklammer.',
          commonMistakes: ['Nach "Heute" das Verb an Position 1 oder 3 stellen.', 'Das Partizip II direkt neben das Hilfsverb stellen statt ans Satzende.']
        },
        {
          title: 'Hören: Beim Arzt einen Termin vereinbaren',
          type: 'listening',
          officialRubricMapping: 'Goethe A1 Hören',
          estimatedMinutes: 25,
          targetCollocations: ['Ich möchte einen Termin vereinbaren', 'Haben Sie noch einen Platz frei?', 'Das tut mir leid', 'Gute Besserung'],
          assessmentPrompt: 'In einem Telefonat mit der Arztpraxis sagt die Assistentin: "Montag ist leider voll, Dienstag um 10:30 geht noch." Was schlägt sie vor?',
          modelAnswer: 'Einen Termin am Dienstag um 10:30 Uhr. "Geht noch" heißt: dieser Zeitpunkt ist noch frei; Montag ist ausgebucht ("voll").',
          commonMistakes: ['"Voll" wörtlich (full) statt "ausgebucht" verstehen.', 'Uhrzeiten mit "halb" falsch deuten: "halb elf" = 10:30, nicht 11:30.']
        },
        {
          title: 'Sprechen: Sich vorstellen und Einkaufen',
          type: 'speaking',
          officialRubricMapping: 'Goethe A1 Sprechen',
          estimatedMinutes: 20,
          targetCollocations: ['Wie viel kostet das?', 'Ich möchte bitte...', 'Auf Wiedersehen'],
          assessmentPrompt: 'Fragen Sie auf dem Markt nach Äpfeln und dem Preis.',
          modelAnswer: 'Guten Tag! Ich möchte bitte zwei Kilo Äpfel. Wie viel kostet das zusammen?',
          commonMistakes: ['Verwendung von "Ich will" statt dem höflichen "Ich möchte".']
        }
      ]
    },
    {
      id: 'GOETHE_A2',
      name: 'Goethe-Zertifikat A2 - Grundstufe',
      desc: 'Elementary German: Dativ case, two-way prepositions, and Perfekt with movement verbs.',
      lessons: [
        {
          title: 'Grammatik: Der Dativ — Deklination und Verwendung',
          type: 'grammar',
          officialRubricMapping: 'Goethe A2 Grammatik',
          targetGrammar: ['dem/der/dem (bestimmt)', 'einem/einer/einem (unbestimmt)', 'Dativ nach mit, nach, bei, von, zu, aus, seit, gegenüber'],
          estimatedMinutes: 30,
          targetCollocations: ['Ich helfe dem Kind', 'Sie wohnt bei ihrer Mutter', 'Er fährt mit dem Bus', 'Das Buch gehört der Lehrerin'],
          assessmentPrompt: 'Setzen Sie den richtigen Artikel im Dativ ein: "Ich gehe zu ___ Arzt (m.)" und "Sie kommt aus ___ Schweiz (f.)". Erklären Sie die Dativ-Regel.',
          modelAnswer: 'Ich gehe zum Arzt (zu + dem = zum). Sie kommt aus der Schweiz. Im Dativ wird der maskuline/neutrale Artikel "dem", der feminine "der". Die Präpositionen mit, nach, bei, von, zu, aus, seit, gegenüber verlangen immer den Dativ.',
          commonMistakes: ['Akkusativ statt Dativ nach Dativpräpositionen ("mit den Bus" statt "mit dem Bus").', 'Vergessen der Dativ-Endung bei Adjektiven ("mit dem groß Hund" statt "mit dem großen Hund").', 'Verwechslung von "zu" (Richtung) und "bei" (Aufenthalt): "Ich gehe zu meiner Freundin" vs "Ich bin bei meiner Freundin".']
        },
        {
          title: 'Grammatik: Wechselpräpositionen — Akkusativ oder Dativ?',
          type: 'grammar',
          officialRubricMapping: 'Goethe A2 Grammatik',
          targetGrammar: ['an, auf, hinter, in, neben, über, unter, vor, zwischen', 'Wohin? → Akkusativ', 'Wo? → Dativ'],
          estimatedMinutes: 30,
          targetCollocations: ['Ich stelle das Buch auf den Tisch (Akk.)', 'Das Buch steht auf dem Tisch (Dat.)', 'Sie hängt das Bild an die Wand', 'Das Bild hängt an der Wand'],
          assessmentPrompt: 'Erklären Sie den Unterschied: "Die Katze springt auf den Tisch" vs "Die Katze sitzt auf dem Tisch". Welche Frage hilft bei der Wahl?',
          modelAnswer: '"Springt auf den Tisch" (Wohin? → Akkusativ) beschreibt die Richtung/Bewegung. "Sitzt auf dem Tisch" (Wo? → Dativ) beschreibt den Ort/Zustand. Die Eselsbrücke: Wohin = Akkusativ (Bewegung), Wo = Dativ (Ruhe).',
          commonMistakes: ['Immer Akkusativ bei Bewegungsverben, auch wenn keine Ortsveränderung stattfindet ("Ich schwimme in dem Pool" = Dativ, weil man im Pool bleibt).', 'Verwechslung der Verbpaare: stellen/stehen, legen/liegen, setzen/sitzen, hängen/hängen.', 'Vergessen, dass "in das" zu "ins" und "in dem" zu "im" kontrahiert werden.']
        },
        {
          title: 'Grammatik: Das Perfekt mit sein — Bewegungs- und Zustandsverben',
          type: 'grammar',
          officialRubricMapping: 'Goethe A2 Grammatik',
          targetGrammar: ['sein + Partizip II (Bewegung/Zustandswechsel)', 'fahren, fliegen, laufen, schwimmen, werden, passieren'],
          estimatedMinutes: 25,
          targetCollocations: ['Wir sind nach München geflogen', 'Er ist gestern Abend spät gekommen', 'Was ist passiert?', 'Sie ist Ärztin geworden'],
          assessmentPrompt: 'Warum sagt man "Ich bin gelaufen" aber "Ich habe Tennis gespielt"? Beide involvieren Bewegung.',
          modelAnswer: '"Laufen" beschreibt eine Fortbewegung von A nach B (Ortsveränderung) → sein. "Tennis spielen" ist eine Aktivität an einem Ort ohne Ortsveränderung → haben. Entscheidend ist nicht Bewegung an sich, sondern Ortswechsel oder Zustandswechsel.',
          commonMistakes: ['Verben wie "schwimmen" können beide Hilfsverben nehmen: "Ich bin über den See geschwommen" (Ortsveränderung) vs "Ich habe zwei Stunden geschwommen" (Aktivität).', 'Vergessen, dass "sein" und "bleiben" trotz keiner Bewegung mit "sein" konjugiert werden.', '"Passieren" nimmt "sein": "Es ist ein Unfall passiert" (nicht "hat passiert").']
        },
        {
          title: 'Grammatik: Nebensätze mit weil, dass, wenn',
          type: 'grammar',
          officialRubricMapping: 'Goethe A2 Grammatik',
          targetGrammar: ['Nebensatz: konjugiertes Verb am Ende', 'weil (Grund)', 'dass (Tatsache)', 'wenn (Bedingung/Zeit)'],
          estimatedMinutes: 30,
          targetCollocations: ['Ich bleibe zu Hause, weil ich krank bin', 'Ich glaube, dass er recht hat', 'Wenn es regnet, nehme ich einen Regenschirm'],
          assessmentPrompt: 'Verbinden Sie die Sätze mit "weil": "Ich kann nicht kommen. Ich muss arbeiten." Wo steht das Verb im Nebensatz?',
          modelAnswer: 'Ich kann nicht kommen, weil ich arbeiten muss. Im Nebensatz steht das konjugierte Verb ("muss") am Ende. Bei trennbaren Verben wird das Verb wieder zusammengeschrieben: "weil ich um 8 Uhr aufstehe".',
          commonMistakes: ['Das Verb im Nebensatz an Position 2 lassen wie im Hauptsatz ("weil ich muss arbeiten" → FALSCH).', 'Vergessen, dass "denn" (= weil) KEIN Nebensatz ist: "Ich kann nicht kommen, denn ich muss arbeiten" (Verb an Pos. 2).', 'Bei Perfekt im Nebensatz: Hilfsverb am Ende nach dem Partizip: "weil ich gearbeitet habe".']
        },
        {
          title: 'Grammatik: Konjunktiv II Grundlagen — hätte, wäre, würde',
          type: 'grammar',
          officialRubricMapping: 'Goethe A2 Grammatik',
          targetGrammar: ['hätte (Wunsch/irreale Bedingung)', 'wäre (irrealer Zustand)', 'würde + Infinitiv (Ersatzform)'],
          estimatedMinutes: 25,
          targetCollocations: ['Ich hätte gern einen Kaffee', 'Wenn ich reich wäre, würde ich reisen', 'An deiner Stelle würde ich zum Arzt gehen'],
          assessmentPrompt: 'Warum sagt man "Ich hätte gern einen Kaffee" statt "Ich habe gern einen Kaffee"? In welchen Alltagssituationen wird Konjunktiv II benutzt?',
          modelAnswer: '"Hätte gern" drückt einen höflichen Wunsch aus (Konjunktiv II als Höflichkeitsform). "Habe gern" wäre eine Tatsachenbeschreibung. Konjunktiv II wird im Alltag für höfliche Bitten (hätte, könnte), irreale Wünsche (wenn ich ... wäre) und Ratschläge (an deiner Stelle würde ich ...) verwendet.',
          commonMistakes: ['Konjunktiv II mit "würde" bei haben und sein verwenden ("würde haben" statt "hätte", "würde sein" statt "wäre").', 'Den Konjunktiv II mit dem Präteritum verwechseln (bei schwachen Verben identisch: "ich arbeitete" = Prät./Konj. II).', 'Die Konstruktion "Ich hätte gern" mit dem Partizip verwechseln (kein Perfekt!).']
        }
      ]
    },
    {
      id: 'GOETHE_B1',
      name: 'Goethe-Zertifikat B1 - Fortgeschrittene Grundstufe',
      desc: 'Independent German: passive voice, relative clauses, Plusquamperfekt, and formal communication.',
      lessons: [
        {
          title: 'Grammatik: Das Passiv — Vorgangspassiv und Zustandspassiv',
          type: 'grammar',
          officialRubricMapping: 'Goethe B1 Grammatik',
          targetGrammar: ['werden + Partizip II (Vorgangspassiv)', 'sein + Partizip II (Zustandspassiv)', 'Passiv in verschiedenen Zeiten'],
          estimatedMinutes: 35,
          targetCollocations: ['Das Haus wird gebaut', 'Das Haus ist gebaut (Zustand)', 'Die Briefe wurden gestern geschickt', 'Der Kuchen ist schon gebacken'],
          assessmentPrompt: 'Bilden Sie das Passiv: "Der Mechaniker repariert das Auto." Erklären Sie den Unterschied zwischen "Das Auto wird repariert" und "Das Auto ist repariert".',
          modelAnswer: 'Passiv: Das Auto wird (vom Mechaniker) repariert. "Wird repariert" = Vorgangspassiv (der Prozess läuft gerade). "Ist repariert" = Zustandspassiv (das Ergebnis: die Reparatur ist abgeschlossen). Das Agens wird mit "von + Dativ" eingefügt.',
          commonMistakes: ['Verwechslung von Vorgangspassiv (werden) und Zustandspassiv (sein): "Das Fenster ist geöffnet" (offen) vs "Das Fenster wird geöffnet" (jemand öffnet es gerade).', 'Vergessen des Partizip II am Satzende bei Nebensätzen: "..., weil das Auto repariert wird".', 'Das Passiv bei Verben ohne Akkusativobjekt falsch bilden (unpersönliches Passiv: "Es wird getanzt").']
        },
        {
          title: 'Grammatik: Relativsätze mit der, die, das, dem, den',
          type: 'grammar',
          officialRubricMapping: 'Goethe B1 Grammatik',
          targetGrammar: ['Relativpronomen = bestimmter Artikel (außer Dativ Plural "denen" und Genitiv)', 'Verb am Ende des Relativsatzes'],
          estimatedMinutes: 30,
          targetCollocations: ['Der Mann, der dort steht, ist mein Chef', 'Die Frau, die ich gestern getroffen habe', 'Das Buch, das auf dem Tisch liegt', 'Die Kinder, denen ich geholfen habe'],
          assessmentPrompt: 'Verbinden Sie: "Ich kenne eine Frau. Die Frau spricht fünf Sprachen." Und: "Das ist der Lehrer. Ich habe dem Lehrer eine E-Mail geschrieben."',
          modelAnswer: 'Ich kenne eine Frau, die fünf Sprachen spricht. (Nominativ: die = Subjekt). Das ist der Lehrer, dem ich eine E-Mail geschrieben habe. (Dativ: dem, weil "schreiben" + Dativperson). Das Verb im Relativsatz steht am Ende.',
          commonMistakes: ['Den Kasus des Relativpronomens vom Hauptsatz statt vom Relativsatz ableiten.', 'Vergessen, dass das Relativpronomen im Dativ Plural "denen" heißt, nicht "den".', 'Das Verb im Relativsatz nicht ans Ende stellen: "Der Mann, der steht dort" → FALSCH.']
        },
        {
          title: 'Grammatik: Das Plusquamperfekt — Vorvergangenheit',
          type: 'grammar',
          officialRubricMapping: 'Goethe B1 Grammatik',
          targetGrammar: ['hatte/war + Partizip II', 'Verwendung mit nachdem, bevor, als'],
          estimatedMinutes: 25,
          targetCollocations: ['Nachdem er gegessen hatte, ging er spazieren', 'Bevor sie ankam, hatte ich schon aufgeräumt', 'Als wir angekommen waren, hatte das Konzert schon begonnen'],
          assessmentPrompt: 'Bilden Sie einen Satz mit "nachdem" und Plusquamperfekt: Die Kinder machten die Hausaufgaben. Danach spielten sie draußen.',
          modelAnswer: 'Nachdem die Kinder die Hausaufgaben gemacht hatten, spielten sie draußen. "Nachdem" + Plusquamperfekt im Nebensatz drückt die zuerst abgeschlossene Handlung aus; der Hauptsatz steht im Präteritum.',
          commonMistakes: ['Beide Teilsätze im Präteritum lassen: "Nachdem die Kinder die Hausaufgaben machten, spielten sie draußen" — grammatisch akzeptabel, aber das Plusquamperfekt verdeutlicht die Chronologie.', 'Plusquamperfekt mit "sein" bei Bewegungsverben vergessen: "Nachdem er angekommen war" (nicht "hatte").', '"Nachdem" mit Konjunktiv verwechseln — es verlangt Indikativ.']
        },
        {
          title: 'Grammatik: Erweiterte Konjunktionen — obwohl, damit, falls, während',
          type: 'grammar',
          officialRubricMapping: 'Goethe B1 Grammatik',
          targetGrammar: ['obwohl (Konzession)', 'damit (Zweck)', 'falls (Bedingung)', 'während (Gleichzeitigkeit/Kontrast)'],
          estimatedMinutes: 30,
          targetCollocations: ['Obwohl es regnet, gehen wir spazieren', 'Ich lerne Deutsch, damit ich in Deutschland studieren kann', 'Falls du Hilfe brauchst, ruf mich an', 'Während er kocht, deckt sie den Tisch'],
          assessmentPrompt: 'Erklären Sie den Unterschied zwischen "damit" und "um...zu": "Ich lerne Deutsch, damit ich in Deutschland studieren kann" vs "Ich lerne Deutsch, um in Deutschland zu studieren."',
          modelAnswer: '"Um...zu + Infinitiv" kann nur verwendet werden, wenn das Subjekt in beiden Teilen identisch ist (ich...ich). "Damit" wird verwendet, wenn die Subjekte verschieden sind: "Ich lerne Deutsch, damit meine Kinder auch Deutsch lernen." Bei gleichem Subjekt sind beide Formen möglich, aber "um...zu" ist eleganter.',
          commonMistakes: ['"Um...zu" mit verschiedenen Subjekten verwenden: "Ich koche, um die Kinder zu essen" (falsch und unfreiwillig komisch!) → "damit die Kinder essen".', '"Obwohl" mit "aber" oder "trotzdem" im selben Satz doppelt markieren.', 'Vergessen, dass "während" auch Kontrast ausdrücken kann: "Während er fleißig ist, ist sein Bruder faul."']
        },
        {
          title: 'Schreiben: Formelle Geschäftskorrespondenz',
          type: 'writing',
          officialRubricMapping: 'Goethe B1 Schreiben',
          estimatedMinutes: 35,
          targetCollocations: ['Sehr geehrte Damen und Herren', 'Ich schreibe Ihnen bezüglich...', 'Ich würde mich freuen, von Ihnen zu hören', 'Mit freundlichen Grüßen'],
          assessmentPrompt: 'Schreiben Sie den Anfang einer formellen Beschwerde-E-Mail an ein Hotel wegen eines falschen Rechnungsbetrags. Verwenden Sie die korrekte Anrede und formelle Wendungen.',
          modelAnswer: 'Sehr geehrte Damen und Herren, ich schreibe Ihnen bezüglich meines Aufenthalts in Ihrem Hotel vom 5. bis 8. März (Reservierungsnummer 78432). Leider musste ich feststellen, dass mir ein Betrag von 45 Euro für eine Minibar berechnet wurde, die ich nicht benutzt habe. Ich bitte Sie höflich, die Rechnung zu überprüfen und den Betrag zu erstatten. Für Rückfragen stehe ich Ihnen gerne zur Verfügung. Mit freundlichen Grüßen, [Name].',
          commonMistakes: ['Die informelle Anrede "Hallo" oder "Liebe/r" in einer Beschwerde verwenden.', '"Sie" (Höflichkeitsform) kleinschreiben — im Deutschen wird die Anrede "Sie/Ihnen/Ihr" immer großgeschrieben.', 'Zu direkt formulieren: "Sie haben einen Fehler gemacht" statt der höflichen Umschreibung "Leider musste ich feststellen, dass..."']
        }
      ]
    },
    {
      id: 'GOETHE_B2',
      name: 'Goethe-Zertifikat B2 - Mittelstufe',
      desc: 'Advanced German fluency: professional discourse, passives, and complex conjunctions.',
      lessons: [
        {
          title: 'Grammatik: Passiv & Passiversatzformen (Zustandspassiv)',
          type: 'grammar',
          officialRubricMapping: 'Goethe B2 Grammatik',
          targetGrammar: ['werden + Partizip II', 'sein + zu + Infinitiv', 'sich lassen + Infinitiv'],
          estimatedMinutes: 35,
          targetCollocations: ['Die Arbeit muss erledigt werden', 'Das Problem lässt sich lösen', 'Das Haus ist renoviert (Zustandspassiv)', 'Der Antrag ist bis Freitag einzureichen'],
          assessmentPrompt: 'Formulieren Sie den Satz um: "Man kann das Problem nicht lösen" -> Verwenden Sie "lässt sich".',
          modelAnswer: 'Das Problem lässt sich nicht lösen (Passiversatzform).',
          commonMistakes: ['Verwechslung von Vorgangspassiv (werden) und Zustandspassiv (sein).']
        }
      ]
    }
  ]
};

export const spanishDeleData: DeepCurriculumData = {
  languageFamily: 'es',
  levels: [
    {
      id: 'DELE_A1',
      name: 'DELE A1 - Acceso',
      desc: 'Comprender y utilizar expresiones cotidianas de uso muy frecuente y frases sencillas.',
      lessons: [
        {
          title: 'Gramática: Ser vs Estar y las conjugaciones básicas',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A1',
          targetGrammar: ['Ser (identidad)', 'Estar (ubicación y estado)'],
          estimatedMinutes: 25,
          targetCollocations: ['Soy de Vietnam', 'Estoy cansado', 'Madrid está en España'],
          assessmentPrompt: 'Explica por qué decimos "Soy profesor" pero "Estoy en la escuela".',
          modelAnswer: '"Ser" se usa para profesiones, origen y características permanentes. "Estar" se usa para ubicación física y estados temporales.',
          commonMistakes: ['Confundir "es bueno" (calidad/bondad) con "está bueno" (sabor/atractivo).']
        },
        {
          title: 'Vocabulario y Conversación: En el restaurante',
          type: 'speaking',
          officialRubricMapping: 'Instituto Cervantes DELE A1 Speaking',
          estimatedMinutes: 20,
          targetCollocations: ['¿Me trae la cuenta, por favor?', 'De primero quiero...', 'Para beber, agua'],
          assessmentPrompt: 'Pide una mesa para dos personas y ordena la comida en un restaurante.',
          modelAnswer: 'Buenas tardes, una mesa para dos personas, por favor. De primero quiero paella y de beber agua con gas.',
          commonMistakes: ['No usar fórmulas de cortesía al ordenar.']
        },
        {
          title: 'Gramática: Pretérito indefinido vs imperfecto',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A1/A2 Gramática',
          targetGrammar: ['indefinido (acción puntual)', 'imperfecto (fondo/hábito)'],
          estimatedMinutes: 30,
          targetCollocations: ['Ayer comí paella', 'Cuando era niño, jugaba al fútbol', 'Llovía cuando llegamos', 'Estuve dos años en Madrid'],
          assessmentPrompt: 'Explica los tiempos en: "Llovía cuando llegamos". ¿Por qué "llovía" y no "llovió"?',
          modelAnswer: '"Llovía" (imperfecto) pinta el escenario en curso; "llegamos" (indefinido) marca el evento puntual que ocurre dentro de esa escena. El indefinido cierra la acción; el imperfecto mantiene la escena abierta.',
          commonMistakes: ['Usar indefinido para hábitos ("Ano pasado fui a la playa todos los días" → iba).', 'Confundir las terminaciones -aba/-ió del imperfecto e indefinido.']
        },
        {
          title: 'Gramática: Ser vs Estar con adjetivos que cambian de sentido',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A1 Gramática',
          targetGrammar: ['ser + esencia/identidad', 'estar + estado/resultado'],
          estimatedMinutes: 25,
          targetCollocations: ['Es listo (es inteligente)', 'Está listo (ya terminó)', 'Es aburrido / Está aburrido', 'Es listo / Está lista la comida'],
          assessmentPrompt: 'Contrasta "Pedro es aburrido" y "Pedro está aburrido". ¿Qué significa cada uno?',
          modelAnswer: '"Es aburrido" describe un rasgo permanente de carácter: Pedro es una persona aburrida. "Está aburrido" describe su estado actual: ahora mismo se siente aburrido (quizá en clase). Con "listo": "es listo" = inteligente; "está listo" = terminado/preparado.',
          commonMistakes: ['Elegir ser/estar por el adjetivo y no por el significado que se quiere expresar.', 'Traducir directamente del inglés "is bored/is boring" sin ajustar la distinción.']
        },
        {
          title: 'Escucha: Comprar un billete de tren en la estación',
          type: 'listening',
          officialRubricMapping: 'Instituto Cervantes DELE A1 Escucha',
          estimatedMinutes: 20,
          targetCollocations: ['Un billete a Sevilla, por favor', '¿Ida y vuelta?', '¿A qué hora sale el próximo?', 'Andén 6'],
          assessmentPrompt: 'El empleado pregunta: "¿Ida y vuelta?" y el viajero responde "Solo ida". ¿Qué ha comprado el viajero?',
          modelAnswer: 'Solo el trayecto de ida, sin billete de retorno. "Ida y vuelta" es la fórmula fija para round-trip; responder "solo ida" la reduce a one-way.',
          commonMistakes: ['Confundir "ida" y "vuelta" y comprar el billete equivocado.', 'Entender "andén" (platform) como "andar" (to walk).']
        },
        {
          title: 'Lectura: Un correo para reservar alojamiento',
          type: 'reading',
          officialRubricMapping: 'Instituto Cervantes DELE A1 Lectura',
          estimatedMinutes: 25,
          targetVocabLimit: 700,
          targetCollocations: ['Quedaría reservar', 'habitación doble con vistas', 'media pensión', 'confirmar la reserva'],
          assessmentPrompt: 'En el correo el cliente escribe "Quedaría reservar una habitación doble del 3 al 7 de marzo". ¿Qué estructura usa y qué registra?',
          modelAnswer: 'Usa el condicional "quedaría" como cortesía en una petición formal por escrito, y registra: tipo de habitación (doble) y fechas exactas (del 3 al 7 de marzo). Reservar fechas explícitas es lo esencial que el hotel debe confirmar.',
          commonMistakes: ['Interpretar el condicional como pasado en vez de cortesía.', 'No identificar las fechas como el dato clave de la reserva.']
        }
      ]
    },
    {
      id: 'DELE_A2',
      name: 'DELE A2 - Plataforma',
      desc: 'Puede comunicarse en tareas habituales que requieran un intercambio simple de información sobre temas familiares.',
      lessons: [
        {
          title: 'Gramática: Pretérito perfecto compuesto (he + participio)',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A2 Gramática',
          targetGrammar: ['haber en presente + participio pasado', 'participios irregulares (hecho, dicho, escrito, visto, puesto)'],
          estimatedMinutes: 30,
          targetCollocations: ['Hoy he comido paella', 'Esta semana hemos trabajado mucho', 'Nunca he viajado a Japón'],
          assessmentPrompt: '¿Por qué decimos "Esta semana he trabajado mucho" (perfecto) pero "La semana pasada trabajé mucho" (indefinido)? Explica la regla temporal.',
          modelAnswer: 'El pretérito perfecto compuesto se usa con marcadores temporales que incluyen el presente (hoy, esta semana, este año, nunca, ya, todavía). El indefinido se usa con periodos cerrados (ayer, la semana pasada, en 2020). En España, "esta mañana he desayunado"; en Latinoamérica, el indefinido se usa también en estos contextos.',
          commonMistakes: ['Usar el indefinido con "hoy" o "esta semana" en español peninsular ("Hoy comí" es correcto en Latinoamérica pero no en España).', 'Olvidar los participios irregulares: hacer → hecho, escribir → escrito, ver → visto.', 'Separar el auxiliar del participio: "He ayer comido" → INCORRECTO; "Ayer he comido" → correcto.']
        },
        {
          title: 'Gramática: Pronombres de objeto directo e indirecto',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A2 Gramática',
          targetGrammar: ['OD: lo, la, los, las', 'OI: le, les', 'Combinación: se lo/la/los/las'],
          estimatedMinutes: 30,
          targetCollocations: ['¿El libro? Lo tengo aquí', 'Le di el regalo a María', 'Se lo dije ayer', 'Las compré en el mercado'],
          assessmentPrompt: 'Sustituya por pronombres: "Di el libro a mi hermana." ¿Por qué "le" se transforma en "se" cuando se combina con "lo"?',
          modelAnswer: 'Se lo di. Cuando el pronombre de OI "le/les" precede a un pronombre de OD "lo/la/los/las", se transforma en "se" por razones fonéticas (evitar "le lo"). La secuencia es siempre OI + OD + verbo: "Se lo di a mi hermana."',
          commonMistakes: ['Decir "le lo di" en vez de "se lo di".', 'Confundir "lo" (objeto directo masculino) con "le" (objeto indirecto): leísmo es aceptado en España para persona masculina pero no en escritura formal.', 'Colocar los pronombres después del verbo conjugado: "Dilo" solo es válido con imperativo, infinitivo o gerundio.']
        },
        {
          title: 'Gramática: Futuro simple — predicciones y planes',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A2 Gramática',
          targetGrammar: ['infinitivo + -é, -ás, -á, -emos, -éis, -án', 'irregulares: tendré, podré, sabré, haré, diré, querré'],
          estimatedMinutes: 25,
          targetCollocations: ['Mañana iré al médico', 'El año que viene viajaremos a España', 'Creo que lloverá esta tarde'],
          assessmentPrompt: 'Conjugue "tener" y "hacer" en futuro simple para todas las personas. ¿Qué tienen en común los verbos irregulares del futuro?',
          modelAnswer: 'Tener: tendré, tendrás, tendrá, tendremos, tendréis, tendrán. Hacer: haré, harás, hará, haremos, haréis, harán. Los irregulares cambian el radical pero mantienen las mismas terminaciones regulares (-é, -ás, -á, -emos, -éis, -án). Los radicales irregulares se agrupan: -dr (tendré, pondré, vendré, saldré), pérdida de vocal (sabré, habré, podré, querré), contracción (haré, diré).',
          commonMistakes: ['Conjugar el futuro a partir de una forma incorrecta: "haceré" en vez de "haré".', 'Confundir el futuro simple con "ir a + infinitivo" en contextos formales.', 'Olvidar que el futuro también se usa para conjeturas en el presente: "¿Qué hora será?" = I wonder what time it is.']
        },
        {
          title: 'Gramática: Por vs Para — usos y diferencias',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE A2 Gramática',
          targetGrammar: ['por (causa, intercambio, duración, movimiento a través)', 'para (finalidad, destinatario, plazo, dirección)'],
          estimatedMinutes: 30,
          targetCollocations: ['Lo hice por ti (causa/motivación)', 'Esto es para ti (destinatario)', 'Caminamos por el parque (a través de)', 'Salimos para Madrid (dirección)'],
          assessmentPrompt: 'Explique la diferencia entre "Lo hice por ti" y "Lo hice para ti". Dé un contexto donde el significado cambie radicalmente.',
          modelAnswer: '"Lo hice por ti" = Lo hice a causa de ti / en tu nombre (motivación/causa). "Lo hice para ti" = Lo hice con el propósito de dártelo (finalidad/beneficio). Ejemplo: "Trabajo por mi hermano" = sustituyo a mi hermano en el trabajo. "Trabajo para mi hermano" = mi hermano es mi jefe.',
          commonMistakes: ['Traducir siempre "for" como "para", ignorando los contextos de "por" (causa, intercambio, duración).', 'Confundir "por" temporal (duración: "por dos horas") con "para" temporal (plazo: "para el viernes").', 'Olvidar expresiones fijas: "por favor", "por ejemplo", "para siempre", "por fin".']
        },
        {
          title: 'Lectura: Comprensión de un anuncio de alquiler',
          type: 'reading',
          officialRubricMapping: 'Instituto Cervantes DELE A2 Lectura',
          estimatedMinutes: 25,
          targetVocabLimit: 1000,
          targetCollocations: ['Se alquila piso', 'gastos incluidos', 'fianza de un mes', 'a estrenar'],
          assessmentPrompt: 'En un anuncio: "Se alquila piso reformado, 3 habitaciones, gastos incluidos, 800€/mes. Fianza: un mes." ¿Qué significa "gastos incluidos" y cuánto pagaría el inquilino el primer mes?',
          modelAnswer: '"Gastos incluidos" significa que los costes de comunidad, agua y a veces calefacción están dentro del precio de 800€. El primer mes el inquilino pagaría 1600€: 800€ de alquiler + 800€ de fianza (depósito de garantía equivalente a un mes que se devuelve al final del contrato).',
          commonMistakes: ['No distinguir entre "gastos incluidos" y "gastos aparte" al comparar precios de alquiler.', 'Confundir "fianza" (depósito devolvible) con "primera mensualidad".', 'No reconocer "a estrenar" como sinónimo de "nuevo, sin usar".']
        }
      ]
    },
    {
      id: 'DELE_B1',
      name: 'DELE B1 - Umbral',
      desc: 'Puede comprender los puntos principales de textos claros sobre temas conocidos y producir textos sencillos y coherentes.',
      lessons: [
        {
          title: 'Gramática: Introducción al subjuntivo presente',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE B1 Gramática',
          targetGrammar: ['Quiero que + subjuntivo', 'Es necesario que + subjuntivo', 'Formación: radical 1ª persona presente + -e/-a terminaciones invertidas'],
          estimatedMinutes: 35,
          targetCollocations: ['Quiero que vengas a la fiesta', 'Es importante que estudies', 'Espero que te mejores pronto'],
          assessmentPrompt: '¿Por qué decimos "Quiero que vengas" (subjuntivo) pero "Quiero venir" (infinitivo)? Explique la regla del cambio de sujeto.',
          modelAnswer: 'Cuando el sujeto del verbo principal y el subordinado son diferentes, se usa "que + subjuntivo": "Yo quiero que tú vengas." Cuando el sujeto es el mismo, se usa infinitivo: "Yo quiero venir (yo)." El subjuntivo expresa deseo, necesidad o duda sobre una acción de otra persona.',
          commonMistakes: ['Usar indicativo después de "quiero que": "Quiero que vienes" → INCORRECTO, "Quiero que vengas" → CORRECTO.', 'Olvidar que las terminaciones del subjuntivo son "invertidas": verbos en -ar toman -e, verbos en -er/-ir toman -a.', 'No reconocer los irregulares del subjuntivo: ser → sea, ir → vaya, haber → haya, saber → sepa.']
        },
        {
          title: 'Gramática: El condicional simple — hipótesis y cortesía',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE B1 Gramática',
          targetGrammar: ['infinitivo + -ía, -ías, -ía, -íamos, -íais, -ían', 'irregulares: tendría, haría, diría, podría'],
          estimatedMinutes: 30,
          targetCollocations: ['Me gustaría viajar a Japón', '¿Podrías ayudarme?', 'Si tuviera dinero, compraría una casa', 'Yo en tu lugar, hablaría con el jefe'],
          assessmentPrompt: 'Explique tres usos diferentes del condicional en español con ejemplos: cortesía, hipótesis y consejo.',
          modelAnswer: 'Cortesía: "¿Podría indicarme el camino?" (más suave que "puede"). Hipótesis: "Si pudiera, viajaría por el mundo" (situación irreal). Consejo: "Yo que tú, estudiaría más" / "En tu lugar, hablaría con el jefe." El condicional suaviza y aleja la afirmación de la realidad.',
          commonMistakes: ['Usar el radical del futuro irregular mal: "hacería" en vez de "haría".', 'Confundir el condicional con el imperfecto de indicativo en contextos hipotéticos: "Si tendría" → INCORRECTO, "Si tuviera" (imperfecto de subjuntivo) → CORRECTO.', 'No usar el condicional de cortesía en situaciones formales: "Quiero un café" → "Querría/Me gustaría un café".']
        },
        {
          title: 'Gramática: Oraciones de relativo con indicativo y subjuntivo',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE B1 Gramática',
          targetGrammar: ['que, quien, donde, el/la/los/las que', 'indicativo (antecedente conocido) vs subjuntivo (antecedente desconocido/inexistente)'],
          estimatedMinutes: 30,
          targetCollocations: ['Busco un piso que tenga terraza (subjuntivo: no sé si existe)', 'Tengo un piso que tiene terraza (indicativo: existe)', 'No conozco a nadie que hable ruso'],
          assessmentPrompt: 'Compare: "Busco una secretaria que habla inglés" vs "Busco una secretaria que hable inglés". ¿Cuál implica que ya la conoces?',
          modelAnswer: '"Que habla inglés" (indicativo): busco a una persona específica que ya conozco y que habla inglés. "Que hable inglés" (subjuntivo): busco a cualquier persona con esa cualificación, no tengo a nadie concreto en mente. El subjuntivo marca la indefinitud del antecedente.',
          commonMistakes: ['Usar siempre indicativo en las relativas por transferencia del inglés (que no distingue este contraste).', 'No reconocer que las frases negativas fuerzan el subjuntivo: "No hay nadie que sepa" (nunca indicativo).', 'Confundir "el que" (pronombre relativo) con "lo que" (lo abstracto/neutro): "Lo que dijiste" vs "El que vino".']
        },
        {
          title: 'Producción Escrita: Carta formal y expresión de opinión',
          type: 'writing',
          officialRubricMapping: 'Instituto Cervantes DELE B1 Producción Escrita',
          estimatedMinutes: 35,
          targetCollocations: ['Me dirijo a usted para', 'En relación con su anuncio', 'Quedo a la espera de su respuesta', 'Atentamente'],
          assessmentPrompt: 'Redacte el inicio de una carta formal para solicitar información sobre un curso de español en una academia. Use las fórmulas de cortesía apropiadas.',
          modelAnswer: 'Estimados señores: Me dirijo a ustedes en relación con el curso intensivo de español B1 que anuncian en su página web. Me gustaría recibir información detallada sobre las fechas de inicio, los horarios y las tarifas. Asimismo, quisiera saber si ofrecen alojamiento para estudiantes internacionales. Quedo a la espera de su respuesta. Atentamente, [Nombre].',
          commonMistakes: ['Usar "Querido/a" en una carta formal comercial (es solo para relaciones personales).', 'Mezclar "tú" y "usted" en la misma carta.', 'Olvidar las fórmulas de cierre obligatorias: "Atentamente", "Un cordial saludo", "Quedo a su disposición".']
        },
        {
          title: 'Comprensión Auditiva: Entender instrucciones y avisos',
          type: 'listening',
          officialRubricMapping: 'Instituto Cervantes DELE B1 Comprensión Auditiva',
          estimatedMinutes: 25,
          targetCollocations: ['Se ruega a los pasajeros', 'A continuación', 'Les informamos de que', 'En caso de emergencia'],
          assessmentPrompt: 'En un anuncio de aeropuerto: "Se ruega a los pasajeros del vuelo IB3456 con destino a Buenos Aires que se dirijan a la puerta 23. Embarque inmediato." ¿Qué información clave debe extraer el pasajero?',
          modelAnswer: 'Información clave: número de vuelo (IB3456), destino (Buenos Aires), puerta de embarque (23), urgencia (embarque inmediato = deben ir ya). "Se ruega" es una fórmula impersonal de cortesía habitual en avisos públicos, equivalente a "por favor".',
          commonMistakes: ['No reconocer "se ruega" como petición formal/impersonal.', 'Confundir "con destino a" (hacia donde va) con "procedente de" (de donde viene).', 'Perderse los números de vuelo y puerta por la velocidad del anuncio; practicar la toma de notas rápida.']
        }
      ]
    },
    {
      id: 'DELE_B2',
      name: 'DELE B2 - Avanzado y Subjuntivo',
      desc: 'Capacidad de interactuar con hablantes nativos con un grado suficiente de fluidez y naturalidad.',
      lessons: [
        {
          title: 'Gramática: Subjuntivo de duda, deseo y opinión negativa',
          type: 'grammar',
          officialRubricMapping: 'Instituto Cervantes DELE B2',
          targetGrammar: ['No creo que + subj', 'Es necesario que + subj', 'Ojalá + subj'],
          estimatedMinutes: 35,
          targetCollocations: ['No pienso que sea verdad', 'Es imprescindible que hagamos...', 'Ojalá llueva pronto'],
          assessmentPrompt: '¿Por qué "Creo que viene" usa indicativo pero "No creo que venga" usa subjuntivo?',
          modelAnswer: 'La afirmación "Creo que" expresa certeza para el hablante (indicativo). La negación "No creo que" introduce duda o descreimiento, exigiendo subjuntivo.',
          commonMistakes: ['Usar subjuntivo después de "Creo que" afirmativo.']
        }
      ]
    }
  ]
};

export const italianCeliData: DeepCurriculumData = {
  languageFamily: 'it',
  levels: [
    {
      id: 'CELI_1',
      name: 'CELI 1 - Livello Base (A2)',
      desc: 'Capacità di comunicare in compiti semplici e di routine che richiedono un semplice scambio di informazioni.',
      lessons: [
        {
          title: 'Grammatica: Il Passato Prossimo con Essere e Avere',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 1 Grammatica',
          targetGrammar: ['Essere (verbi di movimento/stato)', 'Avere (verbi transitivi)'],
          estimatedMinutes: 25,
          targetCollocations: ['Sono andato a Roma', 'Ho mangiato una pizza', 'Siamo partiti ieri'],
          assessmentPrompt: 'Perché diciamo "Ho mangiato" ma "Sono andato"? Spiega l\'accordo del participio passato.',
          modelAnswer: 'Con "avere", il participio non cambia di norma. Con "essere", il participio si accorda in genere e numero col soggetto (andato / andata / andati / andate).',
          commonMistakes: ['Dimenticare l\'accordo del participio passato con l\'ausiliare essere.']
        },
        {
          title: 'Vocabolario: Connettivi di Base (e, ma, però, quindi, perché)',
          type: 'vocabulary',
          officialRubricMapping: 'CVCL CELI 1 Lessico',
          estimatedMinutes: 20,
          targetCollocations: ['Vorrei un caffè, ma senza zucchero', 'Sono stanco, quindi vado a dormire', 'Studio l\'italiano perché amo la musica italiana'],
          assessmentPrompt: 'Completa: "Non ho tempo oggi, ____ ci vediamo domani." Spiega la differenza tra "ma" e "però".',
          modelAnswer: '"Non ho tempo oggi, però ci vediamo domani." "Ma" e "però" sono entrambi avversativi e spesso intercambiabili; "però" è leggermente più enfatico e tende a stare dopo la prima informazione, mentre "ma" apre spesso la frase.',
          commonMistakes: ['Usare "e" (additivo) al posto di "ma" (avversativo).', 'Confondere "perché" causale con "perché" interrogativo nella pronuncia (accento finale nelle domande indirette).']
        },
        {
          title: 'Ascolto: Prenotare un tavolo al ristorante',
          type: 'listening',
          officialRubricMapping: 'CVCL CELI 1 Ascolto',
          estimatedMinutes: 20,
          targetCollocations: ['Vorrei prenotare un tavolo per due', 'A che ora aprite?', 'Avete un tavolo libero?', 'Il conto, per favore'],
          assessmentPrompt: 'Ascolta il dialogo tra un cliente e un cameriere. Quale informazione il cliente chiede per ultima e perché è importante?',
          modelAnswer: 'Il cliente chiede "Il conto, per favore" alla fine. È la formula standard per chiedere lo scontrino in Italia, dove il coperto è spesso incluso.',
          commonMistakes: ['Usare "io voglio" (scortese) invece del condizionale "vorrei".', 'Dimenticare che in Italia si paga spesso il "coperto" (ricarico fisso per persona).']
        }
      ]
    },
    {
      id: 'CELI_2',
      name: 'CELI 2 - Livello Intermedio (B1)',
      desc: 'Capacità di sostenere una conversazione su temi familiari e di esprimere opinioni con semplicità.',
      lessons: [
        {
          title: 'Grammatica: Imperfetto vs Passato Prossimo',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 2 Grammatica',
          targetGrammar: ['Imperfetto (descrizione/abitudine)', 'Passato prossimo (evento concluso)'],
          estimatedMinutes: 30,
          targetCollocations: ['Mentre studiavo, è arrivata mia sorella', 'Da bambino giocavo a calcio', 'Ieri ho visto un film'],
          assessmentPrompt: 'Spiega perché si dice "Mentre studiavo, è arrivata mia sorella" e non "Mentre ho studiato, arrivava mia sorella".',
          modelAnswer: 'L\'imperfetto descrive un\'azione in corso sullo sfondo (studiavo), mentre il passato prossimo riporta l\'evento puntuale che la interrompe (è arrivata). L\'ordine inverso confonderebbe sfondo e evento.',
          commonMistakes: ['Usare il passato prossimo per le descrizioni al passato ("Il cielo ha essere azzurro").', 'Usare l\'imperfetto per eventi conclusi una sola volta ("Ieri andavo al cinema").']
        },
        {
          title: 'Lettura: Annunci di Lavoro e Loro Struttura',
          type: 'reading',
          officialRubricMapping: 'CVCL CELI 2 Lettura',
          estimatedMinutes: 30,
          targetVocabLimit: 1600,
          targetCollocations: ['cercasi', 'requisiti richiesti', 'inviare il curriculum', 'contratto a tempo determinato'],
          assessmentPrompt: 'In un annuncio di lavoro italiano, quale differenza c\'è tra "requisiti richiesti" e "requisiti preferibili"?',
          modelAnswer: '"Requisiti richiesti" sono obbligatori: senza di essi la candidatura viene scartata. "Requisiti preferibili" sono un vantaggio competitivo ma non eliminatori.',
          commonMistakes: ['Interpretare "requisiti preferibili" come obbligatori e non candidarsi.', 'Non riconoscere "cercasi" come formula fissa degli annunci ("si cercano" passivo-impersonale).']
        },
        {
          title: 'Produzione Orale: Esprimere Opinioni con Mi Piace che',
          type: 'speaking',
          officialRubricMapping: 'CVCL CELI 2 Produzione Orale',
          estimatedMinutes: 25,
          targetCollocations: ['Secondo me', 'Mi piace che', 'Sono convinto che', 'La penso diversamente'],
          assessmentPrompt: 'Esprimi la tua opinione in 4-5 frasi su: "Le città italiane dovrebbero limitare il traffico nel centro storico?"',
          modelAnswer: 'Secondo me, le città italiane dovrebbero limitare il traffico nel centro storico. Sono convinto che l\'inquinamento danneggi sia i monumenti sia la salute dei residenti. Mi piace che alcune città abbiano già creato zone a traffico limitato (ZTL). Capisco però chi vive in centro e ha bisogno dell\'auto.',
          commonMistakes: ['Usare "Io piace" invece di "Mi piace".', 'Dimenticare il congiuntivo dopo "Sono convinto che" (danno / danneggi).']
        }
      ]
    },
    {
      id: 'CELI_3',
      name: 'CELI 3 - Livello Avanzato (B2)',
      desc: 'Capacità di comprendere le idee principali di testi complessi e produrre testi chiari e dettagliati su argomenti diversi.',
      lessons: [
        {
          title: 'Grammatica: Il Congiuntivo Presente — forma e uso',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 3 Grammatica',
          targetGrammar: ['Congiuntivo presente regolare (-i, -i, -i, -iamo, -iate, -ino / -a, -a, -a, -iamo, -iate, -ano)', 'Dopo: credo che, penso che, è necessario che, benché, sebbene, affinché'],
          estimatedMinutes: 35,
          targetCollocations: ['Credo che lui abbia ragione', 'È importante che tu faccia attenzione', 'Benché piova, esco lo stesso', 'Penso che sia una buona idea'],
          assessmentPrompt: 'Perché si dice "Credo che lui abbia ragione" (congiuntivo) ma "So che lui ha ragione" (indicativo)? Spiega la regola della certezza.',
          modelAnswer: '"Credere" esprime opinione/incertezza soggettiva → congiuntivo. "Sapere" esprime certezza fattuale → indicativo. In italiano, il congiuntivo si usa dopo verbi di opinione (credere, pensare, ritenere), dubbio (dubitare), volontà (volere, desiderare), emozione (essere contento che) e dopo congiunzioni concessive (benché, sebbene, nonostante).',
          commonMistakes: ['Usare l\'indicativo dopo "penso che" ("Penso che è bello" → "Penso che sia bello").', 'Confondere le forme irregolari del congiuntivo: essere → sia, avere → abbia, fare → faccia, andare → vada, dire → dica.', 'Dimenticare che "secondo me" + indicativo è corretto, ma "credo che" + congiuntivo è obbligatorio.']
        },
        {
          title: 'Grammatica: Pronomi Combinati (doppi pronomi)',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 3 Grammatica',
          targetGrammar: ['me lo, te lo, glielo, ce lo, ve lo', 'Posizione: prima del verbo coniugato, attaccati a infinitivo/gerundio/imperativo'],
          estimatedMinutes: 30,
          targetCollocations: ['Me lo ha detto ieri', 'Glielo regalo per Natale', 'Posso dirtelo domani', 'Daglielo subito!'],
          assessmentPrompt: 'Trasformi: "Ho dato il libro a Maria." Sostituisca entrambi i complementi con pronomi combinati. Spieghi la fusione di "le + lo".',
          modelAnswer: 'Gliel\'ho dato. (Glielo + ho dato). "Le" (a Maria, OI femminile) si trasforma in "glie-" quando si combina con un pronome di OD (lo/la/li/le). Questo "glie-" è uguale per lui, lei e loro (a lui, a lei, a loro → glielo). Con infinitivo: "Voglio darglielo."',
          commonMistakes: ['Scrivere "gli lo" separato invece di "glielo" fuso.', 'Dimenticare che "glielo" vale per maschile, femminile e plurale (a lui, a lei, a loro) — il contesto chiarisce.', 'Con l\'imperativo negativo: "Non glielo dare" (separato) vs "Non darglielo" (attaccato) — entrambi corretti.']
        },
        {
          title: 'Grammatica: Il Condizionale Passato — rimpianti e ipotesi irreali',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 3 Grammatica',
          targetGrammar: ['avrei/sarei + participio passato', 'Periodo ipotetico del III tipo: Se + congiuntivo trapassato, condizionale passato'],
          estimatedMinutes: 30,
          targetCollocations: ['Avrei voluto viaggiare di più', 'Se avessi studiato, avrei superato l\'esame', 'Sarebbe stato meglio partire prima', 'Non avrei mai immaginato'],
          assessmentPrompt: 'Completate: "Se io (sapere) la verità, (comportarsi) diversamente." Spiegate perché si usa il congiuntivo trapassato nella protasi e il condizionale passato nell\'apodosi.',
          modelAnswer: 'Se avessi saputo la verità, mi sarei comportato/a diversamente. Il congiuntivo trapassato ("avessi saputo") esprime una condizione irreale nel passato; il condizionale passato ("mi sarei comportato") esprime la conseguenza che non si è realizzata. È il periodo ipotetico dell\'irrealtà passata (III tipo).',
          commonMistakes: ['Usare il condizionale nella protasi: "Se avrei saputo" → SBAGLIATO (errore molto comune anche tra italiani del Sud).', 'Dimenticare l\'accordo del participio passato con "essere": "mi sarei comportato" (maschile) / "mi sarei comportata" (femminile).', 'Confondere il II tipo (presente irreale: Se sapessi, farei) con il III tipo (passato irreale: Se avessi saputo, avrei fatto).']
        },
        {
          title: 'Grammatica: Il Passato Remoto — narrazione storica e letteraria',
          type: 'grammar',
          officialRubricMapping: 'CVCL CELI 3 Grammatica',
          targetGrammar: ['Forme regolari: -ai, -asti, -ò, -ammo, -aste, -arono (I conj.)', 'Forme irregolari: fui, ebbi, feci, dissi, scrissi, vissi'],
          estimatedMinutes: 30,
          targetCollocations: ['Dante nacque a Firenze nel 1265', 'L\'Italia divenne una repubblica nel 1946', 'Garibaldi sbarcò in Sicilia nel 1860', 'Cristoforo Colombo scoprì l\'America'],
          assessmentPrompt: 'Perché si usa il passato remoto per "Dante nacque a Firenze" e non il passato prossimo? In quale regione d\'Italia si usa il passato remoto anche nel parlato quotidiano?',
          modelAnswer: 'Il passato remoto si usa per eventi storici senza connessione con il presente del parlante, specialmente nella narrazione letteraria e storiografica. Nel parlato quotidiano, il passato remoto è ancora vivo nel Centro-Sud (Roma, Napoli, Sicilia, Sardegna), dove si dice "Ieri mangiai" invece di "Ieri ho mangiato" (Nord). Per il CELI, è essenziale nella comprensione di testi letterari.',
          commonMistakes: ['Confondere le forme irregolari: fare → feci (non "fai"), dire → dissi (non "dicei"), scrivere → scrissi.', 'Usare il passato remoto nel parlato del Nord Italia, dove suona letterario o arcaico.', 'Non riconoscere il passato remoto nella lettura perché non si usa nella propria varietà regionale.']
        }
      ]
    }
  ]
};

export const russianTorkiData: DeepCurriculumData = {
  languageFamily: 'ru',
  levels: [
    {
      id: 'TORFL_1',
      name: 'ТРКИ-1 / TORFL-1 (B1 Intermediate)',
      desc: 'Competence in daily communication and basic academic discussions in Russian.',
      lessons: [
        {
          title: 'Грамматика: Падежная система (Шесть падежей)',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ',
          targetGrammar: ['Родительный', 'Дательный', 'Винительный', 'Творительный', 'Предложный'],
          estimatedMinutes: 35,
          targetCollocations: ['Я живу в Москве (Предложный)', 'Я читаю интересную книгу (Винительный)', 'Я горжусь страной (Творительный)'],
          assessmentPrompt: 'Объясните разницу между "Я иду в школу" (Винительный) и "Я учусь в школе" (Предложный).',
          modelAnswer: '"В школу" (Винительный падеж) обозначает направление движения (Куда?). "В школе" (Предложный падеж) обозначает местонахождение (Где?).',
          commonMistakes: ['Путать падежные окончания для одушевленных и неодушевленных существительных.']
        },
        {
          title: 'Грамматика: Глаголы движения (идти/ходить, ехать/ездить)',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ',
          targetGrammar: ['идти (однонаправленное)', 'ходить (многонаправленное)', 'ехать (транспорт)', 'ездить (повторяющиеся поездки)'],
          estimatedMinutes: 30,
          targetCollocations: ['Я иду в магазин (сейчас)', 'Я хожу в магазин каждый день', 'Мы едем в Москву на поезде', 'Мы ездим в Москву раз в месяц'],
          assessmentPrompt: 'Объясните разницу между "Я иду в школу" и "Я хожу в школу".',
          modelAnswer: '"Я иду в школу" — однонаправленное движение в конкретный момент (сейчас двигаюсь туда). "Я хожу в школу" — многонаправленный глагол, выражающий регулярность/факт посещения (обычно, регулярно).',
          commonMistakes: ['Использовать "ехать" для пешего движения.', 'Использовать однонаправленный глагол для повторяющегося действия.']
        },
        {
          title: 'Грамматика: Вид глагола (несовершенный/совершенный)',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ',
          targetGrammar: ['читать/прочитать', 'писать/написать', 'делать/сделать'],
          estimatedMinutes: 30,
          targetCollocations: ['Я читал книгу (процесс)', 'Я прочитал книгу (результат)', 'Что ты делал вчера?', 'Я написал письмо за час'],
          assessmentPrompt: 'Чем отличаются ответы "Я читал книгу" и "Я прочитал книгу" на вопрос "Что ты делал вчера?"',
          modelAnswer: '"Я читал книгу" описывает процесс без указания завершённости (возможно, не дочитал). "Я прочитал книгу" подчёркивает достигнутый результат — книга дочитана полностью.',
          commonMistakes: ['Употреблять совершенный вид для описания длительного процесса.', 'Забывать, что будущее время от несовершенного вида образуется настоями формами ("буду читать").']
        },
        {
          title: 'Аудирование: Покупка билета на вокзале',
          type: 'listening',
          officialRubricMapping: 'Головной центр ТРКИ',
          estimatedMinutes: 25,
          targetCollocations: ['Один билет до Санкт-Петербурга, пожалуйста', 'На какое число?', 'Сколько стоит?', 'Отправление в 8:40, платформа 3'],
          assessmentPrompt: 'Какая информация обязательна при покупке билета на вокзале в России? Перечислите минимум четыре элемента.',
          modelAnswer: 'Пункт назначения, дата и время отправления, тип вагона/места (купе, плацкарт), имя пассажира (билет именной) и паспортные данные.',
          commonMistakes: ['Забывать, что билеты на поезда в России именные (нужен паспорт).', 'Путать "платформа" и "вагон".']
        }
      ]
    },
    {
      id: 'TORFL_2',
      name: 'ТРКИ-2 / TORFL-2 (B2 Upper-Intermediate)',
      desc: 'Уверенная коммуникация в социальных и академических дискуссиях, работа с публицистическими текстами.',
      lessons: [
        {
          title: 'Грамматика: Причастия и деепричастия',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ',
          targetGrammar: ['действительное причастие', 'страдательное причастие', 'деепричастие совершенного/несовершенного вида'],
          estimatedMinutes: 35,
          targetCollocations: ['Студент, читающий книгу', 'Книга, прочитанная студентом', 'Читая книгу, он делал заметки', 'Прочитав книгу, он написал рецензию'],
          assessmentPrompt: 'Преобразуйте: "Он закончил работу и пошёл домой" в предложение с деепричастием.',
          modelAnswer: '"Закончив работу, он пошёл домой." Деепричастие совершенного вида "закончив" выражает действие, предшествующее основному.',
          commonMistakes: ['Деепричастие, относящееся к другому субъекту, чем главное сказуемое ("Подъезжая к станции, у меня слетела шляпа" — классическая ошибка).', 'Смешение времени деепричастия и глагола-сказуемого.']
        },
        {
          title: 'Чтение: Структура публицистической статьи',
          type: 'reading',
          officialRubricMapping: 'Головной центр ТРКИ',
          estimatedMinutes: 35,
          targetVocabLimit: 4000,
          targetCollocations: ['по мнению экспертов', 'следует отметить, что', 'в заключение', 'как сообщает'],
          assessmentPrompt: 'Какие языковые маркеры отличают публицистический стиль от разговорного? Приведите три примера.',
          modelAnswer: 'Клише и вводные конструкции ("по мнению экспертов", "следует отметить, что"), пассивные конструкции и терминология, а также отсутствие разговорных частиц и эмоционально сниженной лексики.',
          commonMistakes: ['Переносить разговорные выражения в письменный анализ.', 'Игнорировать вводные слова как источник позиции автора.']
        },
        {
          title: 'Говорение: Аргументация в дискуссии',
          type: 'speaking',
          officialRubricMapping: 'Головной центр ТРКИ',
          estimatedMinutes: 30,
          targetCollocations: ['Я не совсем согласен с тем, что', 'С одной стороны... с другой стороны', 'Хотел бы добавить', 'Иначе говоря'],
          assessmentPrompt: 'Аргументируйте позицию за или против: "Электронные книги вытеснят бумажные". Используйте минимум три связочных элемента.',
          modelAnswer: 'Я не совсем согласен с тем, что электронные книги полностью вытеснят бумажные. С одной стороны, электронные книги удобны в поездках. С другой стороны, бумажная книга не требует батареи и лучше для длительного чтения. Хотел бы добавить, что коллекционная ценность бумажных изданий сохраняется. Иначе говоря, сосуществование форматов более вероятно.',
          commonMistakes: ['Повтор одного и того же аргумента разными словами.', 'Отсутствие связочных элементов между аргументами.']
        }
      ]
    },
    {
      id: 'TORFL_3',
      name: 'ТРКИ-3 / TORFL-3 (C1 Advanced)',
      desc: 'Свободное владение языком в профессиональных и академических контекстах, сложные грамматические конструкции.',
      lessons: [
        {
          title: 'Грамматика: Сложные союзные конструкции',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ-3',
          targetGrammar: ['несмотря на то что', 'в связи с тем что', 'ввиду того что', 'по мере того как', 'вследствие того что'],
          estimatedMinutes: 35,
          targetCollocations: ['Несмотря на то что шёл дождь, мы продолжили путь', 'В связи с тем что сроки изменились, необходимо пересмотреть план', 'По мере того как растёт инфляция, снижается покупательная способность'],
          assessmentPrompt: 'Объясните разницу между "несмотря на то что" и "хотя". Перестройте предложение "Хотя экономика растёт, безработица не снижается" с использованием "несмотря на то что".',
          modelAnswer: '"Хотя" — нейтральный уступительный союз, допустимый в любом стиле. "Несмотря на то что" — книжный синоним, характерный для публицистического и научного стилей, подчёркивающий противоречие. Пример: "Несмотря на то что экономика растёт, безработица не снижается." Предлог "несмотря на + существительное" ещё более формален: "Несмотря на рост экономики, безработица не снижается."',
          commonMistakes: ['Путать "несмотря на" (предлог + сущ.) и "несмотря на то что" (союз + глагол).', 'Использовать "не смотря на" (деепричастие от "смотреть") вместо слитного "несмотря на" (уступительный предлог).', 'Избыточно комбинировать уступительные маркеры: "Несмотря на то что..., но..." — "но" лишнее.']
        },
        {
          title: 'Грамматика: Причастные формы — полные и краткие',
          type: 'grammar',
          officialRubricMapping: 'Головной центр ТРКИ-3',
          targetGrammar: ['действительные причастия настоящего времени (-ущ/-ющ, -ащ/-ящ)', 'действительные причастия прошедшего времени (-вш, -ш)', 'страдательные причастия (-ем/-им, -нн/-т)', 'краткие формы страдательных причастий'],
          estimatedMinutes: 40,
          targetCollocations: ['Учёный, исследующий проблему', 'Прочитанная книга лежит на столе', 'Проблема решена (краткая форма)', 'Изучающий русский язык студент'],
          assessmentPrompt: 'Преобразуйте придаточное предложение в причастный оборот: "Студенты, которые изучают лингвистику, сдают экзамен в июне." Объясните, почему краткая форма "решена" предпочтительна в научном стиле.',
          modelAnswer: '"Студенты, изучающие лингвистику, сдают экзамен в июне." Действительное причастие настоящего времени "изучающие" заменяет придаточное с "которые". Краткая форма "решена" (от "решённая") предпочтительна в научном стиле, потому что она выполняет функцию сказуемого и звучит лаконичнее: "Проблема решена" вместо "Проблема является решённой."',
          commonMistakes: ['Образовывать причастие настоящего времени от глаголов совершенного вида (у них нет этой формы: "прочитающий" — не существует).', 'Путать -нн- в полной форме (решённая) и -н- в краткой (решена): "книга прочитана" (одна н), "прочитанная книга" (две нн).', 'Использовать причастные обороты в разговорной речи, где они звучат неестественно.']
        },
        {
          title: 'Письмо: Официально-деловой стиль — заявление и служебная записка',
          type: 'writing',
          officialRubricMapping: 'Головной центр ТРКИ-3',
          estimatedMinutes: 40,
          targetCollocations: ['Прошу Вас рассмотреть', 'В соответствии с', 'Довожу до Вашего сведения', 'На основании вышеизложенного'],
          assessmentPrompt: 'Напишите начало служебной записки директору о необходимости изменения графика работы отдела. Используйте официально-деловой стиль с соответствующими клише.',
          modelAnswer: 'Директору ООО «Прогресс» Иванову И.И. от начальника отдела маркетинга Петровой А.С. Служебная записка. Довожу до Вашего сведения, что в связи с увеличением объёма заказов в текущем квартале возникла необходимость пересмотра графика работы отдела маркетинга. Прошу Вас рассмотреть возможность перехода на гибкий график работы с 1 октября текущего года. На основании вышеизложенного прошу принять соответствующее решение.',
          commonMistakes: ['Использовать разговорную лексику в служебной записке ("Хочу сказать, что..." вместо "Довожу до Вашего сведения").', 'Писать "Вы/Вашего" с маленькой буквы в официальной переписке (в русском деловом стиле "Вы" пишется с заглавной).', 'Не соблюдать структуру "шапки" документа: адресат, отправитель, тип документа.']
        },
        {
          title: 'Аудирование: Академическая лекция и конспектирование',
          type: 'listening',
          officialRubricMapping: 'Головной центр ТРКИ-3',
          estimatedMinutes: 40,
          targetCollocations: ['Как было отмечено ранее', 'Обратите внимание на то, что', 'Подводя итоги', 'Из этого следует, что'],
          assessmentPrompt: 'Прослушайте фрагмент лекции о глобализации. Какие три ключевых тезиса выдвигает лектор и какими сигнальными словами он обозначает переход к новой теме?',
          modelAnswer: 'Типичные сигнальные слова перехода в академических лекциях: "Во-первых" / "Во-вторых" / "В-третьих" (перечисление), "Обратите внимание на то, что" (акцентирование), "Подводя итоги" (заключение). Для конспектирования необходимо фиксировать тезисы после каждого сигнального слова: 1) Глобализация ускоряет культурный обмен. 2) Экономическая интеграция создаёт неравенство. 3) Необходим баланс между открытостью и защитой национальных интересов.',
          commonMistakes: ['Пытаться записывать лекцию дословно, упуская логическую структуру.', 'Не распознавать сигнальные слова ("итак", "следовательно", "таким образом"), которые маркируют выводы.', 'Путать мнение лектора с цитируемыми чужими позициями ("по мнению ряда учёных" ≠ позиция лектора).']
        }
      ]
    }
  ]
};

export const thaiStandardData: DeepCurriculumData = {
  languageFamily: 'th',
  levels: [
    {
      id: 'THAI_FOUNDATION',
      name: 'Thai Foundation (Sơ cấp tiếng Thái)',
      desc: 'Tones, consonants classes, vowel length and daily conversational survival.',
      lessons: [
        {
          title: 'Ngữ âm: 5 Thanh điệu và 3 Nhóm phụ âm',
          type: 'vocabulary',
          officialRubricMapping: 'Chulalongkorn CU-TFL Baseline',
          estimatedMinutes: 30,
          targetCollocations: ['สวัสดีครับ/ค่ะ [sa-wat-dee]', 'ขอบคุณ [khop-khun]', 'ไม่เป็นไร [mai-pen-rai]'],
          assessmentPrompt: 'Giải thích quy tắc xác định thanh điệu của từ khi kết hợp phụ âm trung với nguyên âm dài.',
          modelAnswer: 'Phụ âm trung kết hợp nguyên âm dài và không có dấu thanh điệu sẽ phát ra thanh Ngang (Mid tone).',
          commonMistakes: ['Bỏ quên đuôi lịch sự ครับ (nam) / ค่ะ (nữ).', 'Phát âm sai thanh điệu làm thay đổi hoàn toàn nghĩa của từ (vd: mai = không, gỗ, mới, cháy).']
        },
        {
          title: 'Ngữ âm: Độ dài nguyên âm phân biệt nghĩa',
          type: 'vocabulary',
          officialRubricMapping: 'Chulalongkorn CU-TFL Baseline',
          estimatedMinutes: 25,
          targetCollocations: ['มา [maa: đến] vs ม้า [má: ngựa]', 'เขียน [khǐan: viết] vs ขี้น [khîan: bẩn]', 'ปา [paa: ném] vs ป่า [pàa: rừng]'],
          assessmentPrompt: 'Giải thích tại sao độ dài nguyên âm trong tiếng Thái được coi là âm vị phân biệt nghĩa. Cho ví dụ cặp tối thiểu.',
          modelAnswer: 'Trong tiếng Thái, độ dài nguyên âm là âm vị (phonemic), không phải nét phụ trợ. Cặp tối thiểu điển hình: รัก /rák/ (yêu, nguyên âm ngắn) vs ราก /râak/ (gốc/rễ, nguyên âm dài) — chỉ khác độ dài nhưng nghĩa hoàn toàn khác. Tương tự: บัด /bát/ (khoảnh khắc) vs บาด /bàat/ (vết thương).',
          commonMistakes: ['Đọc nguyên âm dài như ngắn làm sai nghĩa (รัก "yêu" → ราก "rễ").', 'Không nhận ra ký tự nguyên âm tiếng Thái có thể viết quanh phụ âm cuối, không theo trật tự trái→phải (ví dụ บัด cóั นằm trước ด).']
        },
        {
          title: 'Giao tiếp: Mua bán và mặc cả ở chợ',
          type: 'listening',
          officialRubricMapping: 'Chulalongkorn CU-TFL Baseline',
          estimatedMinutes: 25,
          targetCollocations: ['เท่าไหร่ [thao-rài: bao nhiêu]', 'แพงไป [phēeng pai: đắt quá]', 'ลดหน่อยได้ไหม [lót nòi dâi mǎi: giảm chút được không]', 'ถูกกว่านี้มีไหม'],
          assessmentPrompt: 'Trong đoạn hội thoại mặc cả, người mua dùng cụm nào để xin giảm giá một cách lịch sự và đuôi từ nào làm mềm câu hỏi?',
          modelAnswer: 'Người mua nói "ลดหน่อยได้ไหม" (giảm chút được không) — đuôi "ไหม [mǎi]" biến câu thành câu hỏi có/không mềm mại, và "หน่อย" làm giảm mạnh mệnh đề yêu cầu.',
          commonMistakes: ['Nói "แพง" trần trụi mà không có "ไป" hoặc cười — bị coi là thô.', 'Quên rằng từ chối thẳng "ไม่เอา" cần kèm đuôi lịch sự ครับ/ค่ะ.']
        }
      ]
    },
    {
      id: 'THAI_PRE_INTERMEDIATE',
      name: 'Thai Pre-Intermediate (Trung cấp sơ cấp)',
      desc: 'Cấu trúc câu cơ bản, biểu thị thời gian bằng phân từ, và đọc đoạn văn ngắn.',
      lessons: [
        {
          title: 'Ngữ pháp: Trật tự từ và mệnh đề quan hệ ที่',
          type: 'grammar',
          officialRubricMapping: 'Chulalongkorn CU-TFL Level 2',
          targetGrammar: ['SVO cơ bản', 'ที่ (mệnh đề quan hệ)', 'ของ (sở hữu cách)'],
          estimatedMinutes: 30,
          targetCollocations: ['หนังสือที่ฉันซื้อ (cuốn sách mà tôi đã mua)', 'ครูที่สอนภาษาไทย', 'บ้านของคุณ'],
          assessmentPrompt: 'Dịch sang tiếng Thái: "Cuốn sách mà tôi đã mua hôm qua rất hay". Giải thích vị trí của mệnh đề ที่.',
          modelAnswer: 'หนังสือที่ฉันซื้อเมื่อวานสนุกมาก. Mệnh đề quan hệ với ที่ đứng TRƯỚC danh từ được bổ nghĩa (trái với tiếng Anh), và tính từ cũng đứng sau danh từ (หนังสือสีแดง = sách màu đỏ).',
          commonMistakes: ['Đặt mệnh đề quan hệ sau danh từ như tiếng Anh.', 'Quên rằng tính từ tiếng Thái đứng sau danh từ.']
        },
        {
          title: 'Ngữ pháp: Thời gian qua phân từ กำลัง / แล้ว / จะ',
          type: 'grammar',
          officialRubricMapping: 'Chulalongkorn CU-TFL Level 2',
          targetGrammar: ['กำลัง (đang)', 'แล้ว (rồi/hoàn thành)', 'จะ (sẽ)', 'เคย (từng/quá khứ kinh nghiệm)'],
          estimatedMinutes: 30,
          targetCollocations: ['ฉันกำลังกินข้าว (tôi đang ăn cơm)', 'ฉันกินข้าวแล้ว (tôi ăn rồi)', 'ฉันจะกินข้าว (tôi sẽ ăn)', 'ฉันเคยไปเชียงใหม่ (tôi từng đi Chiang Mai)'],
          assessmentPrompt: 'Giải thích sự khác nhau giữa "กินแล้ว" và "เคยกิน".',
          modelAnswer: '"กินแล้ว" chỉ hành động hoàn thành gần đây (perfect gần). "เคย" chỉ kinh nghiệm trong quá khứ (từng... ít nhất một lần). "ฉันกินข้าวแล้ว" = tôi vừa ăn xong; "ฉันเคยกินข้าวเหนียว" = tôi từng ăn xôi.',
          commonMistakes: ['Dùng แล้ว cho kinh nghiệm xa xưa thay vì เคย.', 'Đặt แล้ว sai vị trí (cuối câu, không phải sau chủ ngữ).']
        },
        {
          title: 'Đọc hiểu: Đoạn văn giới thiệu bản thân',
          type: 'reading',
          officialRubricMapping: 'Chulalongkorn CU-TFL Level 2',
          estimatedMinutes: 30,
          targetVocabLimit: 600,
          targetCollocations: ['สวัสดีครับ ผมชื่อ...', 'ผมมาจากเวียดนาม', 'ผมเรียนภาษาไทยมาสามเดือน', 'ยินดีที่ได้รู้จัก'],
          assessmentPrompt: 'Trong đoạn giới thiệu bản thân, cụm "มาสามเดือน" sau động từ "เรียน...มา" biểu thị ý nghĩa gì?',
          modelAnswer: '"มา" đặt sau động từ chỉ thời lượng kéo dài liên tục đến hiện tại — tương tự "đã... được" trong tiếng Việt: "ผมเรียนภาษาไทยมาสามเดือน" = tôi học tiếng Thái được 3 tháng (và vẫn đang học).',
          commonMistakes: ['Hiểu "มา" như động từ "đến" thay vì trợ từ thời lượng.', 'Bỏ mất đuôi lịch sự khi viết đoạn giới thiệu trang trọng.']
        }
      ]
    }
  ]
};

export const arabicStandardData: DeepCurriculumData = {
  languageFamily: 'ar',
  levels: [
    {
      id: 'ARABIC_MSA_1',
      name: 'Modern Standard Arabic - Al-Kitaab Level 1',
      desc: 'Arabic script phonology, emphatic consonants, root-and-pattern morphology.',
      lessons: [
        {
          title: 'Phonology: Emphatic Consonants & Roots (جذر)',
          type: 'grammar',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          estimatedMinutes: 30,
          targetCollocations: ['السلام عليكم [As-salāmu ʿalaykum]', 'شكراً جزيلاً [Shukran jazīlan]', 'كتاب / كاتب / مكتبة (Root: k-t-b)'],
          assessmentPrompt: 'How does the root system (Jithr) create related vocabulary in Arabic? Provide examples from K-T-B.',
          modelAnswer: 'The 3-consonant root K-T-B (ك-ت-ب) relating to "writing" generates: Kitāb (Book), Kātib (Writer), Maktab (Office/Desk), Maktaba (Library).',
          commonMistakes: ['Confusing non-emphatic /t/ (ت) with emphatic /ṭ/ (ط).', 'Omitting short vowels (Harakat) in formal reading.']
        },
        {
          title: 'Grammar: Sun & Moon Letters (الحروف الشمسية والقمرية)',
          type: 'grammar',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          targetGrammar: ['ال + assimilation', 'Sun letters (ت ث د ذ ر ز س ش ص ض ط ظ ل ن)', 'Moon letters (rest)'],
          estimatedMinutes: 25,
          targetCollocations: ['الشمس [ash-shams: mặt trời]', 'القمر [al-qamar: mặt trăng]', 'الدرس [ad-dars: bài học]', 'البيت [al-bayt: ngôi nhà]'],
          assessmentPrompt: 'Explain why "الشمس" is pronounced "ash-shams" and not "al-shams". Which letter class causes this?',
          modelAnswer: 'ش is a sun letter: the /l/ of the definite article ال assimilates into the following consonant, which is then doubled (shaddah): ash-shams. With moon letters like ق in القمر, the /l/ is retained: al-qamar.',
          commonMistakes: ['Pronouncing the lam in sun-letter words (al-shams instead of ash-shams).', 'Writing the shaddah but not pronouncing the gemination.']
        },
        {
          title: 'Grammar: The Construct State (الإضافة)',
          type: 'grammar',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          targetGrammar: ['Idafa (possession)', 'Definiteness through the final term'],
          estimatedMinutes: 30,
          targetCollocations: ['كتاب الطالب [kitāb aṭ-ṭālib: sách của sinh viên]', 'باب البيت [bāb al-bayt: cửa nhà]', 'مدرسة اللغة'],
          assessmentPrompt: 'Why is there no "ال" on the first word of "كتاب الطالب", yet the whole phrase is definite?',
          modelAnswer: 'In an idafa chain, the first term (muḍāf) never takes the definite article; definiteness is inherited from the final term (muḍāf ilayhi). Since الطالب is definite, "كتاب الطالب" means "the student\'s book". "كتاب طالب" (both indefinite) would mean "a student\'s book".',
          commonMistakes: ['Adding ال to the first term of an idafa.', 'Breaking the chain by inserting another word between muḍāf and muḍāf ilayhi (e.g., adjective must follow the whole chain).']
        },
        {
          title: 'Reading & Listening: At the Market (في السوق)',
          type: 'reading',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          estimatedMinutes: 30,
          targetVocabLimit: 400,
          targetCollocations: ['بكم هذا؟ [bi-kam hādhā: cái này bao nhiêu]', 'أريد كيلو طماطم [urīdu kīlū ṭamāṭim]', 'غالي جداً [ghālī jiddan: đắt quá]', 'الحساب لو سمحت'],
          assessmentPrompt: 'In a market dialogue, the buyer says "غالي جداً، خفّض السعر". What negotiation strategy is being used and what does خفّض demand?',
          modelAnswer: 'The buyer rejects the price as too expensive (غالي جداً) and demands the seller lower it (خفّض السعر - imperative of خفّض). Bargaining is expected in Arab markets; the opening price is rarely final.',
          commonMistakes: ['Using أريد bluntly without لو سمحت (xin vui lòng) in polite requests.', 'Misreading numbers because Arabic matches gender-reversed numerals (خمسة vs خمس).']
        }
      ]
    },
    {
      id: 'ARABIC_MSA_2',
      name: 'Modern Standard Arabic - Al-Kitaab Level 2',
      desc: 'Broken plurals, verb conjugation across roots, and short authentic texts.',
      lessons: [
        {
          title: 'Grammar: Broken Plurals (جمع التكسير)',
          type: 'grammar',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          targetGrammar: ['Sound plurals (ون/ين، ات)', 'Broken plural patterns (أفعال، فعول، أفعلة)'],
          estimatedMinutes: 35,
          targetCollocations: ['كتاب → كتب [kitāb → kutub: sách]', 'مدرسة → مدارس [madrasa → madāris: trường]', 'معلم → معلمون [muʿallim → muʿallimūn: giáo viên]',
          ],
          assessmentPrompt: 'Distinguish when Arabic uses sound plurals versus broken plurals. Why can "معلمون" not be used for "teachers" in an idafa?',
          modelAnswer: 'Sound plurals (ات for feminine, ون/ين for masculine rational beings) attach suffixes; broken plurals change the word\'s internal pattern. In an idafa, the masculine sound plural loses its final ن (معلمو المدرسة), so many words prefer the broken plural (أساتذة المدرسة) to avoid this truncation.',
          commonMistakes: ['Assuming a regular plural rule and inventing forms like كتابات for ordinary books.', 'Keeping the ن of ون after an idafa.']
        },
        {
          title: 'Grammar: Past-Tense Verb Conjugation (الفعل الماضي)',
          type: 'grammar',
          officialRubricMapping: 'ACTFL Arabic Guidelines',
          targetGrammar: ['Root ك-ت-ب past paradigm', 'Suffix agreement (تُ، تَ، تِ، نا، وا، نَ)'],
          estimatedMinutes: 30,
          targetCollocations: ['كتبتُ الدرس [katabtu: tôi đã viết]', 'كتبتَ الدرس [katabta: anh đã viết]', 'كتبنا الدرس [katabnā: chúng tôi đã viết]', 'كتبوا الدرس [katabū: họ đã viết]'],
          assessmentPrompt: 'Explain how Arabic encodes person, gender and number in a past-tense verb without pronouns. Conjugate كتب for "she wrote".',
          modelAnswer: 'The past-tense verb carries suffixes marking person/gender/number: كتبتُ (I), كتبتَ (you m.), كتبتِ (you f.), كتبَ (he), كتبتْ (she), كتبنا (we), كتبوا (they m.), كتبنَ (they f.). "She wrote" = كتبتْ الدرس.',
          commonMistakes: ['Adding an explicit pronoun (هي كتبت) where the suffix already encodes it — grammatical for emphasis but wrong as default.', 'Confusing كتبتَ (you) and كتبتُ (I), distinguished only by final vowel.']
        }
      ]
    }
  ]
};

export const vietnameseVslData: DeepCurriculumData = {
  languageFamily: 'vi',
  levels: [
    {
      id: 'VSL_A1',
      name: 'Vietnamese as a Second Language - A1 Sơ cấp',
      desc: 'Hệ thống 6 thanh điệu, xưng hô đại từ nhân thân và giao tiếp hàng ngày.',
      lessons: [
        {
          title: 'Ngữ âm: 6 Thanh điệu và sự phân biệt Dấu Hỏi / Dấu Ngã',
          type: 'vocabulary',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          estimatedMinutes: 25,
          targetCollocations: ['Xin chào', 'Cảm ơn', 'Không có chi', 'Bao nhiêu tiền?'],
          assessmentPrompt: 'Giải thích sự khác biệt giữa "ma, mà, má, mả, mã, mạ" theo 6 thanh điệu tiếng Việt.',
          modelAnswer: 'Ma (ngang - ma quỷ), Mà (huyền - liên từ), Má (sắc - mẹ/má), Mả (hỏi - mồ mả), Mã (ngã - ngựa/mã số), Mạ (nặng - lúa non). Thanh điệu thay đổi tạo thành từ vựng hoàn toàn khác biệt.',
          commonMistakes: ['Người nước ngoài thường nuốt thanh ngã thành thanh sắc.', 'Lúng túng trong hệ thống đại từ xưng hô (anh, chị, em, cô, chú, bác).']
        },
        {
          title: 'Ngữ pháp: Hệ thống đại từ nhân thân xưng hô',
          type: 'grammar',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          targetGrammar: ['Đại từ gia tộc (anh, chị, em, cô, chú, bác)', 'Đại từ tôi / mình / tớ', 'Xưng hô theo thứ bậc tuổi'],
          estimatedMinutes: 30,
          targetCollocations: ['Cháu chào cô ạ', 'Anh giúp em một chút nhé', 'Tôi muốn hỏi một câu', 'Mình đi cùng nhé'],
          assessmentPrompt: 'Giải thích vì sao câu "Bạn giúp tôi một chút" với người lớn tuổi có thể bị coi là thiếu lịch sự, và cách sửa.',
          modelAnswer: 'Tiếng Việt dùng đại từ gia tộc thay cho "bạn/tôi" trung tính: với người lớn tuổi, người nói tự xưng "cháu/em" và gọi đối phương "cô/chú/bác": "Cô giúp cháu một chút ạ". "Bạn" + "tôi" chỉ phù hợp với người ngang tuổi, quen biết trong môi trường trẻ.',
          commonMistakes: ['Dùng "ông/bà" với người lạ trẻ hơn (bị hiểu là mỉa mai).', 'Giữ xưng "tôi" với mọi bối cảnh trang trọng-thân mật khác nhau.']
        },
        {
          title: 'Ngữ pháp: Câu so sánh "hơn / nhất / như"',
          type: 'grammar',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          targetGrammar: ['hơn (so sánh hơn)', 'nhất (so sánh nhất)', 'như / bằng (so sánh ngang)'],
          estimatedMinutes: 25,
          targetCollocations: ['Hà Nội lạnh hơn Sài Gòn', 'Đây là món ngon nhất', 'Cô ấy cao như anh ấy', 'Sách này rẻ bằng sách kia'],
          assessmentPrompt: 'Dịch hai câu sang tiếng Việt và giải thích vị trí của "hơn": "This book is more interesting than that film" và "He runs faster than me".',
          modelAnswer: '"Quyển sách này hay hơn bộ phim đó" — "hơn" đứng sau tính từ. "Anh ấy chạy nhanh hơn tôi" — "hơn" đứng sau phó từ, trước đối tượng so sánh. Khác tiếng Anh, tiếng Việt không có biến đổi hình thức của tính từ (no "more").',
          commonMistakes: ['Nói "hay hơn là" thừa từ "là" trong so sánh trực tiếp.', 'Đặt "hơn" trước tính từ theo trật tự tiếng Anh.']
        },
        {
          title: 'Đọc hiểu: Đoạn văn giới thiệu bản thân và gia đình',
          type: 'reading',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          estimatedMinutes: 25,
          targetVocabLimit: 500,
          targetCollocations: ['Tôi tên là...', 'Tôi đến từ Nhật Bản', 'Tôi học tiếng Việt được sáu tháng', 'Gia đình tôi có bốn người'],
          assessmentPrompt: 'Trong câu "Tôi học tiếng Việt được sáu tháng", từ "được" biểu thị ý nghĩa gì? So sánh với "Tôi học tiếng Việt sáu tháng rồi".',
          modelAnswer: '"được" sau động từ chỉ thời lượng kéo dài liên tục đến hiện tại (đã... được). "sáu tháng rồi" nhấn mạnh mốc hoàn thành/mức độ đạt được. Hai câu gần nghĩa nhưng câu với "rồi" hơi nhấn mạnh kết quả.',
          commonMistakes: ['Hiểu "được" như bị động thay vì trợ từ thời lượng.', 'Quên classifier khi đếm: "bốn người" chứ không phải "bốn".']
        }
      ]
    },
    {
      id: 'VSL_A2',
      name: 'Vietnamese as a Second Language - A2 Sơ trung cấp',
      desc: 'Câu bị động, câu hỏi nghi vấn, liên kết đoạn văn và giao tiếp trong nhà hàng, đi lại.',
      lessons: [
        {
          title: 'Ngữ pháp: Câu bị động "được / bị"',
          type: 'grammar',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          targetGrammar: ['được + V (bị động thuận lợi)', 'bị + V (bị động bất lợi)', 'do... mà'],
          estimatedMinutes: 30,
          targetCollocations: ['Tôi được công ty khen', 'Cậu ấy bị cô giáo phê bình', 'Bữa cơm được nấu bởi mẹ tôi', 'Xe bị hỏng giữa đường'],
          assessmentPrompt: 'Giải thích khác biệt nghĩa giữa "Tôi được tăng lương" và "Tôi bị tăng lương" (nếu câu sau chấp nhận được).',
          modelAnswer: '"được" đánh dấu sự việc có lợi/được mong muốn; "bị" đánh dấu sự việc bất lợi/không mong muốn. "Tôi bị tăng lương" chỉ hợp lệ trong ngữ cảnh đặc biệt (tăng lương kéo theo trách nhiệm nặng hơn khiến người nói coi là bất lợi), cho thấy bị động tiếng Việt gắn chặt với đánh giá chủ quan.',
          commonMistakes: ['Dùng "bởi" ở vị trí sai: đúng là "được nấu bởi mẹ" hoặc "do mẹ nấu".', 'Dùng bị động tiếng Việt như tiếng Anh cho mọi câu trung tính.']
        },
        {
          title: 'Giao tiếp: Đặt món trong nhà hàng',
          type: 'listening',
          officialRubricMapping: 'VSL Khung Năng Lực Tiếng Việt',
          estimatedMinutes: 25,
          targetCollocations: ['Cho tôi một phần phở bò', 'Không cay nhé', 'Lấy thêm một chai nước', 'Tính tiền giúp tôi'],
          assessmentPrompt: 'Trong hội thoại ở quán phở, khách nói "Cho tôi một phần phở bò, không hành nhé". Hai từ nào làm câu mềm mại và lịch sự?',
          modelAnswer: '"Cho tôi" (thay vì "Tôi muốn") là công thức yêu cầu mềm; đuôi "nhé" biến mệnh đề thành lời dặn dò thân thiện. Kết hợp lại, câu vừa rõ yêu cầu vừa giữ sắc thái dễ chịu.',
          commonMistakes: ['Dùng "Tôi muốn..." liên tục bị coi là cứng.', 'Quên classifier "một phần / một tô" khi gọi món.']
        }
      ]
    }
  ]
};

export const portugueseCelpeData: DeepCurriculumData = {
  languageFamily: 'pt',
  levels: [
    {
      id: 'PORTUGUESE_A1',
      name: 'Português Básico (A1) - CELPE-Bras Intermediário track',
      desc: 'Saudações, present indicative, artigos e genero, e sobrevivência em diálogos cotidianos.',
      lessons: [
        {
          title: 'Gramática: Presente do Indicativo - verbos regulares em -ar/-er/-ir',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras / CAPLE A1 Gramática',
          targetGrammar: ['falar (eu falo)', 'comer (eu como)', 'abrir (eu abro)'],
          estimatedMinutes: 25,
          targetCollocations: ['Eu falo português', 'Você come arroz e feijão', 'Eles abrem a loja às oito'],
          assessmentPrompt: 'Conjugue "falar", "comer" e "abrir" na 1ª pessoa do singular e explique o padrão das terminações.',
          modelAnswer: 'Eu falo (-ar → -o), eu como (-er → -o), eu abro (-ir → -o). Na 1ª pessoa do singular todas terminam em -o; a diferença aparece nas outras pessoas: tu falas/comes/abres, ele fala/come/abre, nós falamos/comemos/abrimos.',
          commonMistakes: ['Usar a terminação errada por interferência do espanhol (eu hablo vs eu falo).', 'Esquecer que "tu" e "você" usam conjugações diferentes (tu falas / você fala).']
        },
        {
          title: 'Vocabulário: Gênero e Artigos (o/a, um/uma)',
          type: 'vocabulary',
          officialRubricMapping: 'CELPE-Bras / CAPLE A1 Léxico',
          estimatedMinutes: 20,
          targetCollocations: ['o problema (masculino!)', 'a mão', 'um lápis', 'uma caneta'],
          assessmentPrompt: 'Por que "o problema" é masculino apesar de terminar em -a? Cite mais duas exceções comuns.',
          modelAnswer: 'O gênero em português é gramatical, não fonético: palavras gregas terminadas em -ma são normalmente masculinas (o problema, o sistema, o tema, o programa). Outras exceções: a mão (feminina irregular), o dia (masculino apesar do -a).',
          commonMistakes: ['Assumir que toda palavra terminada em -a é feminina (o dia, o mapa).', 'Contrair errado: "no Brazil" (em + o) e não "em o Brazil".']
        },
        {
          title: 'Escuta: Pedir comida numa padaria',
          type: 'listening',
          officialRubricMapping: 'CELPE-Bras / CAPLE A1 Escuta',
          estimatedMinutes: 20,
          targetCollocations: ['Bom dia, vou querer um pão francês', 'Quanto custa?', 'Pode aquecer, por favor?', 'Obrigado / Obrigada'],
          assessmentPrompt: 'Numa padaria, o cliente diz "Vou querer um café com leite, por favor". Que estratégia de polidez "vou querer" realiza em vez de "quero"?',
          modelAnswer: '"Vou querer" (futuro próximo) suaviza o pedido, enquanto "quero" soa direto demais. Combinado com "por favor", mantém o tom cordial esperado no atendimento brasileiro.',
          commonMistakes: ['Usar "quero" sem "por favor" em atendimentos formais.', 'Confundir "obrigado" (homem fala) com "obrigada" (mulher fala).']
        }
      ]
    },
    {
      id: 'PORTUGUESE_A2',
      name: 'Português Pré-Intermediário (A2)',
      desc: 'Pretérito perfeito vs imperfeito, pronomes oblíquos e narrativa de rotina e viagem.',
      lessons: [
        {
          title: 'Gramática: Pretérito Perfeito vs Imperfeito',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras / CAPLE A2 Gramática',
          targetGrammar: ['pretérito perfeito (evento pontual)', 'pretérito imperfeito (fundo/hábito)'],
          estimatedMinutes: 30,
          targetCollocations: ['Ontem fui ao mercado', 'Quando era criança, morava no litoral', 'Chovia quando ela chegou'],
          assessmentPrompt: 'Explique a diferença temporal e aspectual em "Chovia quando ela chegou": por que "chovia" e não "choveu"?',
          modelAnswer: '"Chovia" (imperfeito) descreve o cenário em curso — chuva contínua de fundo; "chegou" (perfeito) marca o evento pontual que acontece dentro desse cenário. O perfeito abre e fecha a ação; o imperfeito mantém a cena aberta.',
          commonMistakes: ['Usar o perfeito para hábitos passados ("Ano passado fui à praia todo dia" → ia).', 'Usar o imperfeito para ações únicas concluídas.']
        },
        {
          title: 'Gramática: Pronomes Oblíquos (me, te, se, o/a, lhe)',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras / CAPLE A2 Gramática',
          targetGrammar: ['próclise', 'ênclise', 'o/a/os/as como objeto direto'],
          estimatedMinutes: 30,
          targetCollocations: ['Me dá um minuto? (próclise coloquial)', 'Eu te vi ontem', 'Eu vi-a na festa (formal)', 'Eu lhe disse a verdade'],
          assessmentPrompt: 'Por que "Me dá um minuto?" é natural no Brasil falado, mas "Me dá" viola a norma formal escrita? Qual a forma normativa?',
          modelAnswer: 'A norma escrita exige próclise apenas com atrator (negativa, advérbio, pronome relativo): "Não me dá", "Ninguém me viu". Sem atrator, a ênclise é obrigatória na escrita formal: "Dá-me um minuto". Na fala brasileira, a próclise generalizou-se e é aceita.',
          commonMistakes: ['Iniciar frase formal escrita com ênclise ausente ("Me informe os dados" em documento formal).', 'Usar "lhe" para objeto direto ("Eu lhe vi" → Eu a vi / Eu vi ela coloquial).']
        },
        {
          title: 'Leitura: Narrativa de viagem curta',
          type: 'reading',
          officialRubricMapping: 'CELPE-Bras / CAPLE A2 Leitura',
          estimatedMinutes: 30,
          targetVocabLimit: 800,
          targetCollocations: ['pegar a estrada', 'ficar hospedado', 'valer a pena', 'dar uma volta'],
          assessmentPrompt: 'Num relato de viagem, a frase "Valia a pena acordar às cinco" usa imperfeito. Que efeito de sentido isso cria em vez de "Valeu a pena"?',
          modelAnswer: 'O imperfeito generaliza a avaliação: a cada dia da viagem, acordar cedo valia a pena — avaliação repetida, não um único balanço final. "Valeu a pena" fecharia uma conclusão única ao final.',
          commonMistakes: ['Ler "valia" como erro de conjugação.', 'Não reconhecer "pegar" como verbo polissêmico (pegar a estrada, pegar um resfriado, pegar no sono).']
        }
      ]
    },
    {
      id: 'CELPE_B1',
      name: 'Português Intermediário (B1) - CELPE-Bras Intermediário',
      desc: 'Subjuntivo futuro, pronomes relativos, regência verbal e compreensão de textos autênticos.',
      lessons: [
        {
          title: 'Gramática: Subjuntivo Futuro — quando, se, assim que',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras Intermediário Gramática',
          targetGrammar: ['Subjuntivo futuro (radical do pretérito perfeito + -r, -res, -r, -rmos, -rdes, -rem)', 'Uso com quando, se, assim que, enquanto (futuro)'],
          estimatedMinutes: 35,
          targetCollocations: ['Quando eu puder, vou te ajudar', 'Se você quiser, podemos sair', 'Assim que ele chegar, começamos'],
          assessmentPrompt: 'Por que se diz "Quando eu puder" (subjuntivo futuro) e não "Quando eu posso" (indicativo presente)? Em que situação o subjuntivo futuro é obrigatório?',
          modelAnswer: 'O subjuntivo futuro é obrigatório após conjunções temporais e condicionais (quando, se, assim que, enquanto, logo que) referindo-se a ações futuras e incertas. "Quando eu puder" = When I can (in the future, uncertain). O indicativo "quando eu posso" refere-se a um hábito presente. A formação vem do radical da 3ª pessoa do pretérito perfeito: puderam → puder, quiserem → quiser, fizerem → fizer.',
          commonMistakes: ['Usar o subjuntivo presente em vez do futuro: "Quando eu possa" (espanhol) vs "Quando eu puder" (português).', 'Não reconhecer que o subjuntivo futuro é exclusivo do português entre as línguas românicas.', 'Confundir o radical: o subjuntivo futuro de "fazer" é "fizer" (do pretérito "fizeram"), não "fazer".']
        },
        {
          title: 'Gramática: Pronomes Relativos — que, quem, onde, cujo, o qual',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras Intermediário Gramática',
          targetGrammar: ['que (sujeito/objeto)', 'quem (pessoa, após preposição)', 'onde (lugar)', 'cujo/a/os/as (posse)', 'o/a qual, os/as quais (formal)'],
          estimatedMinutes: 30,
          targetCollocations: ['O livro que eu li é ótimo', 'A pessoa de quem falei', 'A cidade onde nasci', 'O aluno cujas notas são altas'],
          assessmentPrompt: 'Complete com o pronome relativo correto: a) "A professora ___ livros são famosos..." b) "A empresa para ___ trabalho..." c) "O lugar ___ moro..."',
          modelAnswer: 'a) A professora cujos livros são famosos... ("cujos" concorda com "livros", masculino plural, não com "professora"). b) A empresa para a qual trabalho... ("para quem" só para pessoas; com preposição e antecedente não-pessoal, usa-se "o/a qual"). c) O lugar onde/em que moro... ("onde" = em que, para lugar).',
          commonMistakes: ['Concordar "cujo" com o possuidor em vez do possuído: "a professora cuja livros" → ERRADO; "cujos livros" (concorda com livros).', 'Usar "onde" para tempo ou situação abstrata: "o momento onde" → "o momento em que".', 'Confundir "que" com "quem" após preposição: "a pessoa com que falei" (informal) vs "a pessoa com quem falei" (correto).']
        },
        {
          title: 'Gramática: Regência Verbal — preposições que mudam o sentido',
          type: 'grammar',
          officialRubricMapping: 'CELPE-Bras Intermediário Gramática',
          targetGrammar: ['assistir a (ver)', 'assistir (prestar assistência)', 'visar a (objetivar)', 'aspirar a (desejar)', 'preferir X a Y'],
          estimatedMinutes: 30,
          targetCollocations: ['Assisti ao jogo ontem (ver)', 'O médico assistiu o paciente (ajudar)', 'Aspiro a uma vida melhor', 'Prefiro café a chá'],
          assessmentPrompt: 'Explique a diferença entre "assistir o paciente" e "assistir ao filme". Por que a preposição muda o significado?',
          modelAnswer: '"Assistir o paciente" (sem preposição) = prestar assistência, ajudar. "Assistir ao filme" (com preposição "a") = ver, ser espectador. A regência verbal em português é semântica: a preposição não é ornamental, ela altera o significado do verbo. Outros exemplos: "chegar a" (atingir) vs "chegar em" (coloquial para local), "implicar" (transitivo direto na norma culta) vs "implicar em" (uso coloquial).',
          commonMistakes: ['Omitir a preposição "a" com "assistir" no sentido de ver: "Assisti o jogo" (coloquial) vs "Assisti ao jogo" (norma culta).', 'Usar "preferir X do que Y" em vez de "preferir X a Y" na escrita formal.', 'Não reconhecer que a regência pode diferir entre português brasileiro e europeu.']
        },
        {
          title: 'Leitura: Compreensão de Texto Jornalístico',
          type: 'reading',
          officialRubricMapping: 'CELPE-Bras Intermediário Leitura',
          estimatedMinutes: 35,
          targetVocabLimit: 2000,
          targetCollocations: ['De acordo com especialistas', 'No entanto', 'Diante desse cenário', 'Vale ressaltar que'],
          assessmentPrompt: 'Num artigo sobre sustentabilidade, o jornalista escreve: "Diante desse cenário, vale ressaltar que as medidas adotadas até agora se mostraram insuficientes." Que função discursiva "vale ressaltar que" desempenha e o que "diante desse cenário" indica?',
          modelAnswer: '"Vale ressaltar que" é um marcador discursivo de ênfase — chama a atenção do leitor para uma informação que o autor considera particularmente importante. "Diante desse cenário" é um conector de contextualização que retoma o panorama descrito anteriormente e posiciona a frase seguinte como consequência ou avaliação dele. Juntos, criam uma estrutura argumentativa: contexto → destaque → avaliação crítica.',
          commonMistakes: ['Interpretar "vale ressaltar" como opinião pessoal do jornalista quando pode ser fato consensual.', 'Não conectar "desse cenário" com o parágrafo anterior — pronome demonstrativo "desse" exige referência anafórica.', 'Confundir conectores de contraste: "no entanto" (no obstante) com "portanto" (por lo tanto/therefore).']
        }
      ]
    }
  ]
};

export const ieltsEnglishData: DeepCurriculumData = {
  languageFamily: 'en',
  levels: [
    {
      id: 'IELTS_Band_7_8',
      name: 'IELTS Academic Master (Band 7.0 - 8.5+)',
      desc: 'Advanced lexical resource, grammatical range and accuracy, academic task response.',
      lessons: [
        {
          title: 'Writing Task 2: Advanced Cohesion & Hedging',
          type: 'writing',
          officialRubricMapping: 'British Council IELTS Band 8.0 Rubric',
          estimatedMinutes: 45,
          targetCollocations: ['It is widely contended that', 'A plethora of empirical evidence', 'Exert a profound influence upon'],
          assessmentPrompt: 'Write an introductory hook and thesis statement for: "Should university education be free for all citizens?" Use academic hedging language.',
          modelAnswer: 'While proponents argue that tertiary education should be fully state-subsidized to foster meritocracy, it is arguably more pragmatic for governments to adopt a means-tested tuition model to ensure fiscal sustainability.',
          commonMistakes: ['Making sweeping overgeneralizations ("All people think...") instead of hedging ("It is widely asserted...").', 'Using informal transition words like "Also", "Besides" in formal essays.']
        },
        {
          title: 'Speaking Part 3: Abstract Evaluation & Speculation',
          type: 'speaking',
          officialRubricMapping: 'IDP IELTS Speaking Band 8.5 Descriptor',
          estimatedMinutes: 35,
          targetCollocations: ['From a socio-economic standpoint', 'In all likelihood', 'Substantiate this assertion'],
          assessmentPrompt: 'Respond to: "How might artificial intelligence transform traditional white-collar professions over the next decade?"',
          modelAnswer: 'From a macro-economic perspective, AI is unlikely to entirely supplant cognitive labor; rather, it will fundamentally redefine professional workflows by automating redundant analytical tasks, thereby compelling professionals to pivot toward high-order strategic synthesis.',
          commonMistakes: ['Giving short, simplistic Part 1 answers in Part 3.', 'Speaking with a flat monotone without sentence stress and pragmatic intonation.']
        },
        {
          title: 'Writing Task 1: Academic Data Analysis (Graph/Chart Description)',
          type: 'writing',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Writing Task 1',
          estimatedMinutes: 40,
          examBand: '7.0-8.5',
          examComponent: 'Academic Writing Task 1',
          targetCollocations: ['witnessed a marked increase', 'fluctuated between X and Y', 'remained relatively stable', 'peaked at approximately'],
          assessmentPrompt: 'Describe the following data in 150+ words: "Internet usage among adults aged 18-65 rose from 35% in 2005 to 89% in 2020, with the sharpest increase (20 percentage points) between 2010 and 2015." Include an overview and specific data.',
          modelAnswer: 'The line graph illustrates the proportion of adults aged 18 to 65 who used the internet between 2005 and 2020. Overall, internet adoption witnessed a marked upward trajectory over the 15-year period, more than doubling from its initial figure. In 2005, approximately 35% of adults were internet users. This figure rose steadily to around 50% by 2010. The most pronounced surge occurred between 2010 and 2015, during which usage climbed by roughly 20 percentage points to approximately 70%. Subsequently, growth decelerated, with the proportion reaching 89% by 2020. Notably, the rate of increase diminished as saturation approached, suggesting a natural ceiling effect.',
          commonMistakes: ['Omitting the overview paragraph that summarizes the key trend before describing specific data.', 'Using "the graph shows" repeatedly instead of varying report verbs (illustrates, depicts, demonstrates).', 'Including personal opinions or explanations for why the trend occurred — Task 1 is purely descriptive.']
        },
        {
          title: 'Writing Task 1: Process Diagram Description',
          type: 'writing',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Writing Task 1',
          estimatedMinutes: 40,
          examBand: '7.0-8.0',
          examComponent: 'Academic Writing Task 1',
          targetCollocations: ['At the initial stage', 'Subsequently, the material undergoes', 'The process culminates in', 'is then transferred to'],
          assessmentPrompt: 'Describe in 150+ words a 5-stage recycling process: Collection → Sorting → Cleaning → Processing → Manufacturing new products. Use passive voice and sequencing language.',
          modelAnswer: 'The diagram illustrates the five-stage process by which recyclable materials are converted into new products. At the initial stage, recyclable waste is collected from households and commercial premises through designated bins and collection services. Subsequently, the collected materials are sorted into categories — namely glass, plastic, paper, and metal — either manually or through automated sorting machinery. Following this, the sorted items undergo a thorough cleaning process to remove contaminants and residual waste. Once cleaned, the materials are processed and broken down into raw components; for instance, paper is pulped and plastic is melted into pellets. At the final stage, these processed raw materials are used in the manufacturing of new products, thereby completing the recycling loop.',
          commonMistakes: ['Using active voice throughout instead of the passive, which is natural for process descriptions ("Workers collect the waste" → "Waste is collected").', 'Failing to use sequencing connectors: firstly, subsequently, following this, at the final stage.', 'Describing only some stages and skipping others — all stages in the diagram must be covered.']
        },
        {
          title: 'Reading: Matching Headings Strategy',
          type: 'reading',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Reading',
          estimatedMinutes: 35,
          examBand: '6.5-8.0',
          examComponent: 'Academic Reading',
          targetCollocations: ['the primary focus of the paragraph', 'the overarching theme', 'a supporting detail rather than the main idea', 'distinguish between scope and example'],
          assessmentPrompt: 'A paragraph discusses how coral reefs support marine biodiversity but then focuses primarily on the economic impact of reef degradation on fishing communities. Which heading is correct: (A) "Marine biodiversity in coral reefs" or (B) "Economic consequences of reef decline"? Explain your strategy.',
          modelAnswer: 'Heading (B) "Economic consequences of reef decline" is correct. The strategy: identify the MAIN topic that occupies the majority of the paragraph, not the introductory sentence. Biodiversity is mentioned as context/background (topic sentence), but the paragraph\'s primary focus — where most sentences and detail are directed — is the economic impact on fishing communities. Key strategy: read the first AND last sentences, then scan for which topic receives the most detailed treatment.',
          commonMistakes: ['Choosing a heading based only on the first sentence without reading the entire paragraph.', 'Confusing a supporting detail or example with the main idea — the heading should capture the paragraph\'s overall purpose.', 'Not eliminating headings through the process of elimination; some headings are designed as distractors that match a detail but not the main theme.']
        },
        {
          title: 'Reading: True/False/Not Given Strategy',
          type: 'reading',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Reading',
          estimatedMinutes: 35,
          examBand: '6.5-8.5',
          examComponent: 'Academic Reading',
          targetCollocations: ['the text explicitly states', 'there is no information regarding', 'the statement contradicts the passage', 'inference versus explicit information'],
          assessmentPrompt: 'The passage states: "Most experts agree that solar energy will play a significant role in the future energy mix." The statement to evaluate: "All experts support solar energy." Is this True, False, or Not Given? Explain the critical distinction.',
          modelAnswer: 'FALSE. The passage says "most experts" — the statement says "all experts." "Most" explicitly excludes "all," making the statement a direct contradiction of the text. Key distinction: FALSE means the text contains information that directly contradicts the statement. NOT GIVEN means the text simply does not address the topic. Here, the text does address expert opinion on solar energy, but with a different quantifier.',
          commonMistakes: ['Confusing FALSE with NOT GIVEN: FALSE = the text says the opposite; NOT GIVEN = the text does not mention this at all.', 'Using outside knowledge to determine the answer instead of relying solely on what the passage states.', 'Missing subtle quantifier differences: "some" vs "most" vs "all" vs "a few" — these distinctions determine T/F/NG.']
        },
        {
          title: 'Listening: Section 1 — Social Survival Dialogue',
          type: 'listening',
          officialRubricMapping: 'British Council IELTS Band 6.5+ Listening',
          estimatedMinutes: 25,
          examBand: '6.5-7.5',
          examComponent: 'Listening Section 1',
          targetCollocations: ['Could you spell that for me?', 'The reference number is', 'That comes to a total of', 'double-check the details'],
          assessmentPrompt: 'In a Section 1 dialogue, the caller says: "My postcode is N-W-3, space, 4-T-B." The form shows "NW3 ___." What common errors should candidates avoid when completing this answer?',
          modelAnswer: 'The answer is "4TB" (completing the postcode NW3 4TB). Common errors to avoid: (1) Writing the full postcode including "NW3" which is already on the form — only write the missing part. (2) Mishearing letters: T and D sound similar, B and P sound similar. (3) Forgetting that British postcodes have a specific format (letters-numbers SPACE number-letters). Strategy: read ahead on the form before the audio plays to predict answer types.',
          commonMistakes: ['Writing more than what is required — if the form already shows part of the answer, only fill in the blank.', 'Confusing similar-sounding letters (B/P, T/D, M/N, S/F) without the phonetic alphabet context.', 'Not reading ahead: Section 1 gives 30 seconds before the audio; use this time to predict answer types (name, number, date, address).']
        },
        {
          title: 'Listening: Section 3 — Academic Discussion',
          type: 'listening',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Listening',
          estimatedMinutes: 35,
          examBand: '7.0-8.0',
          examComponent: 'Listening Section 3',
          targetCollocations: ['The tutor suggested that', 'On reflection, I think we should', 'That ties in with what Professor X said', 'The key takeaway from the study was'],
          assessmentPrompt: 'In a Section 3 academic discussion between two students and a tutor, Student A says: "I initially thought qualitative methods were better, but after reading the Smith study, I\'ve changed my mind." What is the student\'s FINAL position, and what trap does this create?',
          modelAnswer: 'The student\'s FINAL position is that qualitative methods are NOT necessarily better — they changed their mind after reading the Smith study (implying quantitative methods may be more appropriate or both are needed). The trap: IELTS Section 3 frequently presents opinion changes. Candidates must listen for the FINAL opinion, not the initial one. Signal phrases: "but after...", "on second thought", "actually, I now think", "I\'ve come to realize."',
          commonMistakes: ['Recording the speaker\'s initial opinion instead of their revised/final position.', 'Missing hedging language that signals partial agreement: "to some extent," "not entirely," "with certain reservations."', 'Confusing which speaker holds which opinion when multiple speakers discuss — track by voice, not by assumption.']
        },
        {
          title: 'Listening: Section 4 — Academic Lecture',
          type: 'listening',
          officialRubricMapping: 'British Council IELTS Band 7.0+ Listening',
          estimatedMinutes: 40,
          examBand: '7.0-8.5',
          examComponent: 'Listening Section 4',
          targetCollocations: ['This brings us to the crux of the matter', 'What is particularly noteworthy is', 'The implications of this finding are', 'To recapitulate the key points'],
          assessmentPrompt: 'A lecturer says: "What is particularly noteworthy is that the 2019 study found a correlation — not causation — between screen time and reduced attention span." Complete the note: "2019 study: screen time and attention span show ___, not causation." Why is this distinction critical?',
          modelAnswer: 'Answer: "correlation." The distinction is critical because IELTS tests precise academic vocabulary. "Correlation" means two variables are related statistically but one does not necessarily cause the other. The lecturer explicitly marks this distinction with "not causation," testing whether candidates can capture the exact academic term. Section 4 demands note-completion with precise academic language.',
          commonMistakes: ['Writing "relationship" or "connection" instead of the exact word "correlation" used by the speaker — IELTS requires the exact word heard.', 'Exceeding the word limit: if instructions say "ONE WORD ONLY," writing "a correlation" (two words) loses the mark.', 'Missing the answer because Section 4 plays without a break — candidates must keep pace with continuous monologue.']
        },
        {
          title: 'Speaking Part 1: Personal Questions & Fluency',
          type: 'speaking',
          officialRubricMapping: 'IDP IELTS Speaking Band 7.0+ Descriptor',
          estimatedMinutes: 25,
          examBand: '7.0-8.0',
          examComponent: 'Speaking Part 1',
          targetCollocations: ['I\'m particularly fond of', 'It really depends on the situation', 'I\'d say that on the whole', 'More often than not'],
          assessmentPrompt: 'Answer the Part 1 question: "Do you prefer reading books or watching films?" Give a Band 7+ response that demonstrates lexical range and natural fluency.',
          modelAnswer: 'Honestly, it really depends on the situation. If I\'m looking to unwind after a long day, I\'d gravitate towards watching a film because it\'s more of a passive experience. However, when I have a stretch of free time — say, on a weekend — I\'m particularly fond of diving into a good novel. There\'s something about getting absorbed in a character\'s inner world that a film can\'t quite replicate. So I\'d say, on the whole, I lean slightly towards reading, but I wouldn\'t dismiss films by any means.',
          commonMistakes: ['Giving a one-sentence answer ("I prefer books.") without elaboration — Part 1 expects 3-4 sentences.', 'Over-preparing memorized answers that sound rehearsed and unnatural, triggering examiner suspicion.', 'Using overly formal or academic vocabulary in Part 1 ("I am predisposed towards literary pursuits") — this section rewards natural, conversational fluency.']
        },
        {
          title: 'Speaking Part 2: Long Turn — Cue Card Strategy',
          type: 'speaking',
          officialRubricMapping: 'IDP IELTS Speaking Band 7.0+ Descriptor',
          estimatedMinutes: 35,
          examBand: '7.0-8.5',
          examComponent: 'Speaking Part 2',
          targetCollocations: ['I\'d like to talk about', 'What made it particularly memorable was', 'Looking back on it now', 'The reason this stands out is'],
          assessmentPrompt: 'Cue card: "Describe a time you helped someone. You should say: who you helped, how you helped them, why they needed help, and explain how you felt afterwards." Plan your 1-minute preparation and deliver a 2-minute response.',
          modelAnswer: 'I\'d like to talk about a time I helped my elderly neighbour, Mrs. Chen, during a particularly harsh winter last year. She had slipped on ice outside her house and sprained her ankle quite badly, which meant she couldn\'t get to the shops or carry groceries. What I did was set up a simple routine: every other day after work, I\'d pick up her essentials from the supermarket and drop them off. I also helped her arrange a physiotherapy appointment because she wasn\'t comfortable navigating the online booking system. What made it particularly memorable was her reaction — she was incredibly grateful but also quite embarrassed about needing help, which taught me a lot about the importance of offering assistance tactfully. Looking back on it now, I feel it strengthened our relationship significantly and made me more attuned to the needs of people around me.',
          commonMistakes: ['Not covering all bullet points on the cue card — the examiner notes if you miss one.', 'Running out of content after 60 seconds; use the 1-minute prep to jot down keywords for each bullet point and plan an anecdote.', 'Speaking in a monotone without narrative arc; Band 7+ responses have a beginning, development, and reflective conclusion.']
        },
        {
          title: 'Grammar: Academic Collocations and Nominalization',
          type: 'grammar',
          officialRubricMapping: 'British Council IELTS Band 7.5+ Lexical Resource',
          estimatedMinutes: 35,
          examBand: '7.5-8.5',
          examComponent: 'Writing & Speaking',
          targetCollocations: ['The implementation of new policies', 'A significant reduction in emissions', 'The proliferation of misinformation', 'conduct an investigation into'],
          assessmentPrompt: 'Nominalize the following sentence to make it more academic: "The government decided to invest more in renewable energy, which reduced carbon emissions significantly." Transform the verbs into noun phrases.',
          modelAnswer: '"The government\'s decision to increase investment in renewable energy led to a significant reduction in carbon emissions." Key transformations: "decided" → "decision" (nominalization), "invest more" → "increase investment" (noun phrase), "reduced...significantly" → "significant reduction" (adjective + nominalized verb). Nominalization creates denser, more formal academic prose characteristic of Band 8+ writing.',
          commonMistakes: ['Over-nominalizing to the point of incomprehensibility — balance is key; not every verb needs to become a noun.', 'Using weak verb + nominalization combos: "make a decision" (weak) vs "decide" (strong) — nominalize only when it adds precision or density.', 'Confusing nominalization suffixes: "investigate" → "investigation" (not "investigatement"), "reduce" → "reduction" (not "reducation").']
        }
      ]
    }
  ]
};
