import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryKo: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'ko_r1', title: '나의 하루', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: '저는 민수입니다. 저는 학생입니다. 매일 아침 일곱 시에 일어납니다. 세수를 하고 이를 닦습니다. 아침밥으로 밥과 김치를 먹습니다. 우유도 마십니다. 여덟 시에 버스를 타고 학교에 갑니다. 학교에서 한국어와 수학을 공부합니다. 오후 네 시에 집에 옵니다. 저녁에는 숙제를 하고 텔레비전을 봅니다. 밤 열한 시에 잡니다.',
    wordCount: 100,
    vocabularyHighlights: ['일어납니다', '아침밥', '버스', '공부', '숙제'],
    questions: [
      { id: 'ko_r1q1', type: 'multiple_choice', question: '민수는 몇 시에 일어납니까?', options: ['여섯 시', '일곱 시', '여덟 시', '아홉 시'], correctAnswer: '일곱 시', explanation: '"매일 아침 일곱 시에 일어납니다"라고 했습니다.' },
      { id: 'ko_r1q2', type: 'true_false', question: '민수는 지하철을 타고 학교에 갑니다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"버스를 타고 학교에 갑니다"라고 했습니다. 지하철이 아닙니다.' },
      { id: 'ko_r1q3', type: 'multiple_choice', question: '민수는 아침에 무엇을 먹습니까?', options: ['빵과 계란', '밥과 김치', '과일과 요구르트', '국수와 만두'], correctAnswer: '밥과 김치', explanation: '"아침밥으로 밥과 김치를 먹습니다"라고 했습니다.' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'ko_r2', title: '시장에서', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: '오늘은 토요일입니다. 저는 어머니와 함께 시장에 갑니다. 시장은 우리 집에서 가깝습니다. 먼저 과일을 삽니다. 사과, 배, 귤을 삽니다. 그다음에 야채를 삽니다. 배추와 당근을 삽니다. 어머니는 고기와 생선도 삽니다. 저는 과자를 사고 싶습니다. 하지만 어머니가 안 된다고 합니다. 우리는 돈을 내고 집에 돌아옵니다. 저는 어머니를 도와서 음식을 냉장고에 넣습니다.',
    wordCount: 105,
    vocabularyHighlights: ['시장', '과일', '야채', '냉장고', '도와서'],
    questions: [
      { id: 'ko_r2q1', type: 'multiple_choice', question: '오늘은 무슨 요일입니까?', options: ['일요일', '토요일', '금요일', '월요일'], correctAnswer: '토요일', explanation: '"오늘은 토요일입니다"라고 했습니다.' },
      { id: 'ko_r2q2', type: 'true_false', question: '과자를 샀습니다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '과자를 사고 싶었지만, 어머니가 안 된다고 했습니다.' },
      { id: 'ko_r2q3', type: 'multiple_choice', question: '어떤 과일을 샀습니까?', options: ['딸기와 포도', '사과, 배, 귤', '수박과 복숭아', '바나나와 망고'], correctAnswer: '사과, 배, 귤', explanation: '"사과, 배, 귤을 삽니다"라고 했습니다.' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'ko_r3', title: '서울 여행', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: '지난 주말에 친구와 함께 서울에 여행을 갔습니다. 우리는 KTX를 타고 갔습니다. 두 시간쯤 걸렸습니다. 서울에 도착해서 먼저 경복궁에 갔습니다. 경복궁은 조선 시대의 궁궐입니다. 아주 크고 아름다웠습니다. 한복을 빌려서 입고 사진을 많이 찍었습니다. 오후에는 명동에 갔습니다. 명동에서 떡볶이와 호떡을 먹었습니다. 아주 맛있었습니다. 저녁에는 남산 타워에 올라갔습니다. 서울의 야경이 정말 멋있었습니다. 다음 날에는 인사동에서 전통 찻집에 갔습니다. 한국 전통 차를 마시고, 기념품도 샀습니다. 정말 즐거운 여행이었습니다.',
    wordCount: 145,
    vocabularyHighlights: ['경복궁', '한복', '떡볶이', '야경', '기념품'],
    questions: [
      { id: 'ko_r3q1', type: 'multiple_choice', question: '서울까지 어떻게 갔습니까?', options: ['비행기', 'KTX', '버스', '자동차'], correctAnswer: 'KTX', explanation: '"KTX를 타고 갔습니다"라고 했습니다.' },
      { id: 'ko_r3q2', type: 'true_false', question: '경복궁에서 한복을 샀습니다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '한복을 "빌려서" 입었다고 했습니다. 사지 않았습니다.' },
      { id: 'ko_r3q3', type: 'multiple_choice', question: '남산 타워에서 무엇을 봤습니까?', options: ['바다', '산', '서울의 야경', '불꽃놀이'], correctAnswer: '서울의 야경', explanation: '"서울의 야경이 정말 멋있었습니다"라고 했습니다.' },
    ],
    tags: ['travel', 'korea']
  },
  {
    id: 'ko_r4', title: '한국 음식', level: 'A2', topic: 'Food & Culture', sourceType: 'original',
    content: '한국 음식은 세계적으로 유명합니다. 한국 음식의 가장 대표적인 것은 김치입니다. 김치는 배추에 고춧가루, 마늘, 생강 등을 넣어서 만듭니다. 한국 사람들은 거의 매 끼니마다 김치를 먹습니다. 김치찌개, 된장찌개, 불고기, 비빔밥도 인기 있는 음식입니다.\n\n한국에서는 밥을 먹을 때 숟가락과 젓가락을 사용합니다. 어른이 먼저 먹기 시작한 후에 다른 사람들이 먹기 시작합니다. 이것은 한국의 중요한 예절입니다. 한국 사람들은 식사를 할 때 "잘 먹겠습니다"라고 말하고, 다 먹은 후에는 "잘 먹었습니다"라고 말합니다.\n\n최근에는 한국 음식이 다른 나라에서도 인기가 많습니다. 특히 불고기와 비빔밥은 외국인들이 좋아하는 음식입니다.',
    wordCount: 150,
    vocabularyHighlights: ['김치', '고춧가루', '예절', '숟가락', '젓가락'],
    questions: [
      { id: 'ko_r4q1', type: 'multiple_choice', question: '한국 음식에서 가장 대표적인 것은 무엇입니까?', options: ['불고기', '비빔밥', '김치', '된장찌개'], correctAnswer: '김치', explanation: '"한국 음식의 가장 대표적인 것은 김치입니다"라고 했습니다.' },
      { id: 'ko_r4q2', type: 'true_false', question: '한국에서는 누구나 동시에 먹기 시작합니다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"어른이 먼저 먹기 시작한 후에 다른 사람들이 먹기 시작합니다"라고 했습니다.' },
      { id: 'ko_r4q3', type: 'multiple_choice', question: '식사 전에 한국 사람들은 뭐라고 말합니까?', options: ['감사합니다', '잘 먹겠습니다', '잘 먹었습니다', '안녕하세요'], correctAnswer: '잘 먹겠습니다', explanation: '"식사를 할 때 잘 먹겠습니다라고 말합니다"라고 했습니다.' },
    ],
    tags: ['food', 'culture', 'korea']
  },

  // ═══ B1 ═══
  {
    id: 'ko_r5', title: '한국의 교육 문화', level: 'B1', topic: 'Education', sourceType: 'original',
    content: '한국은 교육열이 높은 나라로 유명합니다. 한국의 교육 제도는 초등학교 6년, 중학교 3년, 고등학교 3년, 대학교 4년으로 이루어져 있습니다. 초등학교와 중학교는 의무 교육입니다.\n\n한국 학생들은 학교 수업이 끝난 후에도 학원에 다니는 경우가 많습니다. 학원은 영어, 수학, 과학 등 여러 과목을 가르치는 사설 교육 기관입니다. 많은 학생들이 밤 열 시까지 학원에서 공부합니다. 이러한 현상의 가장 큰 원인은 대학 입시 경쟁입니다.\n\n매년 11월에 치러지는 수능 시험은 한국 학생들에게 매우 중요한 시험입니다. 이 시험 하루 동안 비행기 이착륙이 제한되고, 시험장으로 늦는 학생들을 위해 경찰차가 동원되기도 합니다. 이것은 한국 사회가 교육을 얼마나 중요하게 생각하는지를 보여줍니다.\n\n그러나 지나친 교육 경쟁은 학생들의 정신 건강에 부정적인 영향을 미칠 수 있습니다. 최근에는 창의력과 비판적 사고를 강조하는 교육 개혁이 논의되고 있습니다.',
    wordCount: 185,
    vocabularyHighlights: ['교육열', '의무 교육', '학원', '수능', '교육 개혁'],
    questions: [
      { id: 'ko_r5q1', type: 'multiple_choice', question: '한국의 의무 교육은 몇 년입니까?', options: ['6년', '9년', '12년', '16년'], correctAnswer: '9년', explanation: '초등학교 6년과 중학교 3년이 의무 교육이므로 합계 9년입니다.' },
      { id: 'ko_r5q2', type: 'true_false', question: '수능 시험 날에는 비행기 이착륙에 제한이 없습니다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"비행기 이착륙이 제한되고"라고 했습니다.' },
      { id: 'ko_r5q3', type: 'multiple_choice', question: '최근 교육 개혁은 무엇을 강조합니까?', options: ['암기력', '창의력과 비판적 사고', '체육', '외국어'], correctAnswer: '창의력과 비판적 사고', explanation: '"창의력과 비판적 사고를 강조하는 교육 개혁이 논의되고 있습니다"라고 했습니다.' },
    ],
    tags: ['education', 'society', 'korea']
  },

  // ═══ B2 ═══
  {
    id: 'ko_r6', title: '인공지능과 일자리', level: 'B2', topic: 'Technology & Society', sourceType: 'original',
    content: '인공지능(AI) 기술의 급속한 발전은 노동 시장에 근본적인 변화를 가져오고 있다. 자동화와 기계 학습의 발전으로 이전에는 사람만이 할 수 있다고 여겨졌던 많은 업무가 이제 AI에 의해 수행되고 있다. 제조업에서는 로봇이 조립 라인을 담당하고, 금융 분야에서는 AI가 투자 분석과 리스크 관리를 수행한다.\n\n맥킨지 연구소의 보고서에 따르면, 2030년까지 전 세계적으로 약 8억 개의 일자리가 자동화의 영향을 받을 수 있다고 한다. 특히 반복적이고 예측 가능한 업무를 수행하는 직종이 가장 큰 영향을 받을 것으로 예상된다. 그러나 동시에 AI 관련 새로운 직업도 대거 생겨날 것으로 전망된다.\n\n이러한 변화에 대응하기 위해서는 교육 시스템의 전환이 필요하다. 단순한 지식 암기보다는 비판적 사고력, 창의성, 그리고 기술과의 협업 능력을 키우는 교육이 중요해지고 있다. 평생 학습의 개념도 더욱 중요해질 것이다.\n\n또한 AI의 윤리적 사용에 대한 논의도 활발하다. AI 알고리즘의 편향성, 개인 정보 보호, 그리고 AI가 내린 결정에 대한 책임 소재 등은 사회가 풀어야 할 중요한 과제이다. 기술 발전의 혜택이 소수에게만 집중되지 않고 사회 전체에 고르게 분배되는 방안도 모색해야 한다.',
    wordCount: 225,
    vocabularyHighlights: ['인공지능', '자동화', '노동 시장', '편향성', '평생 학습'],
    questions: [
      { id: 'ko_r6q1', type: 'multiple_choice', question: '맥킨지 보고서에 따르면 2030년까지 몇 개의 일자리가 영향을 받습니까?', options: ['약 1억 개', '약 5억 개', '약 8억 개', '약 15억 개'], correctAnswer: '약 8억 개', explanation: '"약 8억 개의 일자리가 자동화의 영향을 받을 수 있다"라고 했습니다.' },
      { id: 'ko_r6q2', type: 'true_false', question: 'AI 기술의 발전은 새로운 직업을 만들지 않는다.', options: ['True', 'False'], correctAnswer: 'False', explanation: '"AI 관련 새로운 직업도 대거 생겨날 것으로 전망된다"라고 했습니다.' },
      { id: 'ko_r6q3', type: 'multiple_choice', question: '글에 따르면 AI 윤리와 관련된 과제가 아닌 것은?', options: ['알고리즘의 편향성', '개인 정보 보호', 'AI 결정에 대한 책임', 'AI의 전력 소비'], correctAnswer: 'AI의 전력 소비', explanation: '글에서는 편향성, 개인 정보 보호, 책임 소재를 과제로 언급했지만, 전력 소비는 언급하지 않았습니다.' },
    ],
    tags: ['technology', 'society', 'work']
  },
];
