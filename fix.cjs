const fs = require('fs');

const corrupted = fs.readFileSync('src/curriculum/englishSurvival30.corrupted.ts', 'latin1');
const corruptedUtf8 = Buffer.from(corrupted, 'latin1').toString('utf8');

const retrievals = [];
// Strictly match the object literal with the specific keys in order.
const regex = /retrieval:\s*\{\s*promptVi:\s*'.*?',\s*cueVi:\s*'.*?',\s*patterns:\s*\[.*?\],\s*hintVi:\s*'.*?'\s*\}/g;
let match;
while ((match = regex.exec(corruptedUtf8)) !== null) {
  retrievals.push(match[0]);
}

if (retrievals.length !== 30) {
  throw new Error('Expected 30 retrievals, found ' + retrievals.length);
}

let clean = fs.readFileSync('src/curriculum/englishSurvival30.ts', 'utf8');

clean = clean.replace('slots: string[]; exemplar: string;', 'slots: string[]; exemplar: string;\n  retrieval: RetrievalSeed;');

const typeDefs = `export type RetrievalPattern = {
  /** Core phrase fragments the learner must reproduce. Case-insensitive, normalized. All must be present. */
  requiredFragments: string[];
  /** Literal names from the exemplar that should NOT appear (learner must use own name). */
  rejectedNames?: string[];
};

type RetrievalSeed = {
  promptVi: string;
  cueVi: string;
  patterns: RetrievalPattern[];
  hintVi: string;
};
`;

clean = clean.replace('export type EnglishSurvivalLesson = {', typeDefs + '\nexport type EnglishSurvivalLesson = {');

let seedIndex = 0;
clean = clean.replace(/(exemplar: '.*?',\s*\})/g, (m, p1) => {
  return p1.replace('}', '  ' + retrievals[seedIndex++] + ',\n  }');
});

clean = clean.replace(
  /retrieval:\s*\{\s*promptVi:\s*'Không nhìn mẫu: bạn sẽ nói câu nào trong tình huống này\?',\s*acceptedAnswers:\s*\[seed\.answer,\s*seed\.chunks\[0\]\[0\]\],\s*answerHintVi:\s*`Gợi ý: bắt đầu bằng “\$\{seed\.chunks\[0\]\[0\]\}” hoặc dùng ý tương đương\.`,\s*\},/,
  `retrieval: {
      promptVi: seed.retrieval.promptVi,
      cueVi: seed.retrieval.cueVi,
      acceptedPatterns: seed.retrieval.patterns,
      answerHintVi: seed.retrieval.hintVi,
    },`
);

clean = clean.replace(
  /retrieval:\s*\{\s*promptVi:\s*string;\s*acceptedAnswers:\s*string\[\];\s*answerHintVi:\s*string;\s*\};/,
  `retrieval: {
    promptVi: string;
    cueVi: string;
    acceptedPatterns: RetrievalPattern[];
    answerHintVi: string;
  };`
);

fs.writeFileSync('src/curriculum/englishSurvival30.ts', clean, 'utf8');
console.log('Fixed seeds. Added ' + seedIndex + ' retrievals.');
