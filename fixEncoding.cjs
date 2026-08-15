const fs = require('fs');
let code = fs.readFileSync('src/curriculum/englishSurvival30.ts', 'utf8');

code = code.replace(/promptVi:\s*'([^']+)'/g, (m, p1) => "promptVi: '" + Buffer.from(p1, 'latin1').toString('utf8') + "'");
code = code.replace(/cueVi:\s*'([^']+)'/g, (m, p1) => "cueVi: '" + Buffer.from(p1, 'latin1').toString('utf8') + "'");
code = code.replace(/hintVi:\s*'([^']+)'/g, (m, p1) => "hintVi: '" + Buffer.from(p1, 'latin1').toString('utf8') + "'");

fs.writeFileSync('src/curriculum/englishSurvival30.ts', code, 'utf8');
console.log('Fixed encoding in englishSurvival30.ts');
