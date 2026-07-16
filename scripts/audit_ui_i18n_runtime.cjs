const fs = require('fs');
const path = require('path');

const flagPatterns = [
  />\s*MULTIPLE CHOICE/i,
  />\s*Choose the correct meaning/i,
  />\s*What is the meaning of/i,
  />\s*Check\s*</i,
  />\s*Check\s*</i,
  />\s*Continue\s*</i,
  />\s*Try Again\s*</i,
  />\s*Step \d/i,
  />\s*Next Question/i,
  />\s*Flashcards/i,
  />\s*Quiz/i,
  />\s*Fill in Blank/i,
  />\s*Match/i,
  />\s*Weak First/i,
  />\s*Level/i,
  />\s*Something went wrong/i,
  />\s*Go to Dashboard/i,
  />\s*Tap to Record/i,
  />\s*Practice Hub\s*</i,
  />\s*Choose a skill to practice\s*</i,
  />\s*Listening Practice\s*</i,
  />\s*Reading Practice\s*</i,
  />\s*Course Roadmap\s*</i,
  />\s*Your path from beginner to mastery\s*</i,
  />\s*Full IELTS preparation\s*</i,
  />\s*Audio Player\s*</i,
  />\s*Comprehension Questions\s*</i,
];

function scanDir(dir) {
  let issues = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      issues += scanDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      let lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of flagPatterns) {
          if (pattern.test(line)) {
            // Check if it's commented out
            if (line.trim().startsWith('//') || line.trim().startsWith('{/*')) continue;
            
            console.log(`FAIL [${file}:${i+1}] Contains hardcoded string matching ${pattern}:`);
            console.log(`   ${line.trim()}`);
            issues++;
          }
        }
      }
    }
  }
  return issues;
}

console.log('--- RUNNING UI I18N RUNTIME AUDIT ---');
const totalIssues = scanDir(path.join(__dirname, '../src'));

if (totalIssues > 0) {
  console.error(`\nFAILED: Found ${totalIssues} hardcoded strings. Please translate them via i18n.`);
  process.exit(1);
} else {
  console.log('\nPASS: No known hardcoded user-facing strings found in .tsx files.');
  process.exit(0);
}
