const fs = require('fs');
let c = fs.readFileSync('src/curriculum/courses/japaneseN5Course.ts', 'utf8');
c = c.replace(/'ja-n5-u2-daily-checkpoint'/g, "'ja-n5-u2-checkpoint'");
c = c.replace(/'ja-n5-u3-describe-checkpoint'/g, "'ja-n5-u3-checkpoint'");
c = c.replace(/'ja-n5-u4-desire-checkpoint'/g, "'ja-n5-u4-checkpoint'");
c = c.replace(/'ja-n5-u5-permission-checkpoint'/g, "'ja-n5-u5-checkpoint'");

// Unit 2
c = c.replace(/assessedOutcomeId: 'u2-use-particles' \},/g, 
  "assessedOutcomeId: 'u2-use-particles' },\n      { id: 'u2-cp-4', prompt: 'Từ vựng daily', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'vocabulary-recognition', assessedOutcomeId: 'u2-vocab-daily' },\n      { id: 'u2-cp-5', prompt: 'Đọc hiểu schedule', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u2-read-schedule' },");

// Unit 3
c = c.replace(/assessedOutcomeId: 'u3-use-na-adj' \},/g, 
  "assessedOutcomeId: 'u3-use-na-adj' },\n      { id: 'u3-cp-4', prompt: 'i-adj', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u3-use-i-adj' },\n      { id: 'u3-cp-5', prompt: 'Đọc hiểu desc', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u3-read-description' },");

// Unit 4
c = c.replace(/assessedOutcomeId: 'u4-use-tai' \},/g, 
  "assessedOutcomeId: 'u4-use-tai' },\n      { id: 'u4-cp-4', prompt: 'masenka', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u4-use-masenka' },\n      { id: 'u4-cp-5', prompt: 'Đọc hiểu plan', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u4-read-plan' },");

// Unit 5
c = c.replace(/assessedOutcomeId: 'u5-use-te-kudasai' \},/g, 
  "assessedOutcomeId: 'u5-use-te-kudasai' },\n      { id: 'u5-cp-4', prompt: 'dekimasu', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u5-use-dekimasu' },\n      { id: 'u5-cp-5', prompt: 'kara', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u5-use-kara' },\n      { id: 'u5-cp-6', prompt: 'Đọc hiểu rules', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u5-read-rules' },");

// Study Tactics Unit 4 & 5
c = c.replace(/estimatedMinutes: 20,\n      commonMistakes/g, "estimatedMinutes: 20,\n      studyTactics: ['Học theo mẫu câu.'],\n      commonMistakes");
c = c.replace(/estimatedMinutes: 15,\n      commonMistakes/g, "estimatedMinutes: 15,\n      studyTactics: ['Luyện nghe và điền từ.'],\n      commonMistakes");

fs.writeFileSync('src/curriculum/courses/japaneseN5Course.ts', c);
