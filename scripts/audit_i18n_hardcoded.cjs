const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// List of exact strings or regexes to flag
const flagPatterns = [
  />\s*Vocabulary Trainer/i,
  />\s*Flashcards/i,
  />\s*Quiz/i,
  />\s*Fill in Blank/i,
  />\s*Match/i,
  />\s*Weak First/i,
  />\s*Next Question/i,
  />\s*Again/i,
  />\s*Hard/i,
  />\s*Good/i,
  />\s*Easy/i,
  />\s*Something went wrong/i,
  />\s*Go to Dashboard/i,
  />\s*Tap to Record/i,
  />\s*Local estimated score/i,
  />\s*Practice IELTS Writing Task 1/i,
  />\s*Level/i
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

console.log('--- RUNNING I18N HARDCODED AUDIT ---');
const totalIssues = scanDir(srcDir);

if (totalIssues > 0) {
  console.error(`\nFAILED: Found ${totalIssues} hardcoded strings. Please translate them via i18n.`);
  process.exit(1);
} else {
  console.log('\nPASS: No known hardcoded user-facing strings found in .tsx files.');
  process.exit(0);
}
