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
          targetCollocations: ['把书放在桌子上', '把问题解决'],
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
          targetCollocations: ['发现新大陆', '发明电灯'],
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
