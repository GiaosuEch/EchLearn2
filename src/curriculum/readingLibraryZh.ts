import { ReadingPassage } from './readingLibrary';

export const readingLibraryZh: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'zh_r1', title: '我的一天', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: '我叫小明。我是一个学生。每天早上七点我起床。我先刷牙，然后洗脸。我吃早饭，通常吃面包和鸡蛋，喝一杯牛奶。八点我坐公交车去学校。下午四点放学回家。晚上我做作业，然后看电视。十点我睡觉。',
    wordCount: 80,
    vocabularyHighlights: ['起床', '早饭', '公交车', '作业', '睡觉'],
    questions: [
      { id: 'zh_r1q1', type: 'multiple_choice', question: '小明几点起床？', options: ['六点', '七点', '八点', '九点'], correctAnswer: '七点', explanation: '文章说"每天早上七点我起床"。' },
      { id: 'zh_r1q2', type: 'true_false', question: '小明开车去学校。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章说"我坐公交车去学校"，不是开车。' },
      { id: 'zh_r1q3', type: 'multiple_choice', question: '小明早饭吃什么？', options: ['米饭和鱼', '面包和鸡蛋', '面条和蔬菜', '水果和酸奶'], correctAnswer: '面包和鸡蛋', explanation: '文章说"通常吃面包和鸡蛋"。' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'zh_r2', title: '在超市', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: '今天是星期六。我和妈妈去超市买东西。超市离我们家很近。我们先买水果，买了苹果、香蕉和橙子。然后我们买蔬菜，有西红柿和白菜。妈妈还买了米和鸡蛋。我想买巧克力，但是妈妈说不行。我们付了钱就回家了。',
    wordCount: 82,
    vocabularyHighlights: ['超市', '水果', '蔬菜', '巧克力'],
    questions: [
      { id: 'zh_r2q1', type: 'multiple_choice', question: '今天是星期几？', options: ['星期天', '星期六', '星期五', '星期一'], correctAnswer: '星期六', explanation: '文章开头说"今天是星期六"。' },
      { id: 'zh_r2q2', type: 'true_false', question: '他们买了巧克力。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章说"我想买巧克力，但是妈妈说不行"，所以没有买。' },
      { id: 'zh_r2q3', type: 'multiple_choice', question: '他们买了哪些水果？', options: ['草莓和葡萄', '苹果、香蕉和橙子', '西瓜和桃子', '梨和芒果'], correctAnswer: '苹果、香蕉和橙子', explanation: '文章说"买了苹果、香蕉和橙子"。' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'zh_r3', title: '北京旅游', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: '上个周末，我和朋友一起去北京旅游。我们坐高铁去的，只用了两个小时。到了北京以后，我们先去了天安门广场。天安门广场非常大，有很多游客在那里拍照。下午我们爬了长城。长城很长，爬起来很累，但是风景特别美。晚上我们去王府井大街吃了北京烤鸭。烤鸭的味道真好吃！第二天我们参观了故宫。故宫很大，我们走了三个小时。这次旅行让我了解了很多中国历史。',
    wordCount: 125,
    vocabularyHighlights: ['高铁', '天安门', '长城', '烤鸭', '故宫'],
    questions: [
      { id: 'zh_r3q1', type: 'multiple_choice', question: '他们怎么去北京的？', options: ['坐飞机', '坐高铁', '开车', '坐大巴'], correctAnswer: '坐高铁', explanation: '文章说"我们坐高铁去的"。' },
      { id: 'zh_r3q2', type: 'true_false', question: '他们在长城上吃了烤鸭。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章说他们在王府井大街吃了烤鸭，不是在长城上。' },
      { id: 'zh_r3q3', type: 'multiple_choice', question: '他们在故宫走了多长时间？', options: ['一个小时', '两个小时', '三个小时', '四个小时'], correctAnswer: '三个小时', explanation: '文章说"故宫很大，我们走了三个小时"。' },
    ],
    tags: ['travel', 'china']
  },
  {
    id: 'zh_r4', title: '中国美食', level: 'A2', topic: 'Food & Culture', sourceType: 'original',
    content: '中国是一个美食大国，不同地方有不同的菜系。四川菜以辣闻名，最有名的菜是麻婆豆腐和回锅肉。广东菜比较清淡，喜欢用新鲜的食材。广东人喜欢喝早茶，吃虾饺和烧卖。北方人爱吃面食，比如饺子和面条。南方人则以米饭为主食。在中国，吃饭不只是为了填饱肚子，更是家人和朋友聚在一起的重要时刻。逢年过节，家人会一起做饭，吃团圆饭。中国人常说"民以食为天"，这说明食物在中国文化中非常重要。',
    wordCount: 130,
    vocabularyHighlights: ['菜系', '清淡', '食材', '面食', '团圆饭'],
    questions: [
      { id: 'zh_r4q1', type: 'multiple_choice', question: '四川菜有什么特点？', options: ['很甜', '很辣', '很清淡', '很酸'], correctAnswer: '很辣', explanation: '文章说"四川菜以辣闻名"。' },
      { id: 'zh_r4q2', type: 'true_false', question: '北方人主要吃米饭。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章说"北方人爱吃面食"，"南方人则以米饭为主食"。' },
      { id: 'zh_r4q3', type: 'multiple_choice', question: '"民以食为天"说明了什么？', options: ['中国人吃得很多', '食物在中国文化中非常重要', '中国菜很贵', '天气影响食物'], correctAnswer: '食物在中国文化中非常重要', explanation: '文章说这句话"说明食物在中国文化中非常重要"。' },
    ],
    tags: ['food', 'culture', 'china']
  },

  // ═══ B1 ═══
  {
    id: 'zh_r5', title: '手机对生活的影响', level: 'B1', topic: 'Technology & Society', sourceType: 'original',
    content: '如今，智能手机已经成为人们生活中不可缺少的工具。根据统计，中国有超过十亿的智能手机用户。人们用手机购物、看新闻、社交聊天、叫外卖，甚至用手机支付一切费用。移动支付在中国非常普遍，很多人出门不再带现金和银行卡。\n\n然而，手机的过度使用也带来了一些问题。很多年轻人每天花五六个小时刷短视频，影响了学习和工作效率。一些人在吃饭时也不停地看手机，减少了和家人面对面交流的时间。医生指出，长时间低头看手机会导致颈椎问题和视力下降。\n\n专家建议大家合理使用手机，每天设定固定的"无手机时间"，多参加户外活动，保持身心健康。',
    wordCount: 160,
    vocabularyHighlights: ['智能手机', '移动支付', '效率', '颈椎', '合理'],
    questions: [
      { id: 'zh_r5q1', type: 'multiple_choice', question: '中国大约有多少智能手机用户？', options: ['五亿', '八亿', '超过十亿', '二十亿'], correctAnswer: '超过十亿', explanation: '文章说"中国有超过十亿的智能手机用户"。' },
      { id: 'zh_r5q2', type: 'true_false', question: '中国人出门都需要带现金。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章说"很多人出门不再带现金和银行卡"，因为使用移动支付。' },
      { id: 'zh_r5q3', type: 'multiple_choice', question: '专家建议怎么使用手机？', options: ['完全不用手机', '每天只用一分钟', '合理使用，设定无手机时间', '只用手机打电话'], correctAnswer: '合理使用，设定无手机时间', explanation: '文章说"专家建议大家合理使用手机，每天设定固定的无手机时间"。' },
    ],
    tags: ['technology', 'society', 'health']
  },

  // ═══ B2 ═══
  {
    id: 'zh_r6', title: '城市化与环境保护', level: 'B2', topic: 'Environment & Urbanization', sourceType: 'original',
    content: '过去四十年来，中国经历了世界上最大规模的城市化进程。数以亿计的农村人口涌入城市寻找更好的工作和生活机会。城市化带来了经济的快速增长，提高了人民的生活水平，促进了基础设施建设和科技创新。\n\n然而，快速的城市化也给环境带来了巨大的压力。大量的建设活动导致了耕地减少和生态系统破坏。工厂排放和汽车尾气使得空气污染成为许多大城市面临的严重问题。此外，城市的快速扩张加剧了水资源短缺，垃圾处理也成为一个棘手的难题。\n\n面对这些挑战，中国政府提出了"生态文明"的理念，强调经济发展必须与环境保护协调进行。近年来，中国大力发展可再生能源，推广电动汽车，实施严格的环保法规。许多城市开始建设"海绵城市"，利用自然系统来管理雨水。\n\n城市化的可持续发展需要在经济增长和环境保护之间找到平衡。只有坚持绿色发展道路，才能实现人与自然的和谐共生。',
    wordCount: 210,
    vocabularyHighlights: ['城市化', '基础设施', '生态系统', '可再生能源', '可持续发展'],
    questions: [
      { id: 'zh_r6q1', type: 'multiple_choice', question: '中国城市化带来了什么积极影响？', options: ['人口减少', '经济快速增长和生活水平提高', '农村更加繁荣', '环境明显改善'], correctAnswer: '经济快速增长和生活水平提高', explanation: '文章说"城市化带来了经济的快速增长，提高了人民的生活水平"。' },
      { id: 'zh_r6q2', type: 'true_false', question: '城市化对环境没有任何负面影响。', options: ['True', 'False'], correctAnswer: 'False', explanation: '文章详细讨论了城市化带来的空气污染、耕地减少、水资源短缺等环境问题。' },
      { id: 'zh_r6q3', type: 'multiple_choice', question: '文章的结论是什么？', options: ['应该停止城市化', '经济增长比环境保护更重要', '需要在经济增长和环境保护之间找到平衡', '所有人应该回到农村'], correctAnswer: '需要在经济增长和环境保护之间找到平衡', explanation: '文章最后说"需要在经济增长和环境保护之间找到平衡"。' },
    ],
    tags: ['environment', 'urbanization', 'society']
  },
];
