#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs']);

const AI_SAFETY_DIRECTORY_TARGETS = [
  'src/platform/ai',
  'src/components/ai',
];

const AI_SAFETY_FILE_TARGETS = [
  'src/pages/app/AICoachHubPage.tsx',
  'src/pages/app/AIRequestAuditPage.tsx',
  'src/pages/app/AITutorPage.tsx',
  'src/pages/app/PracticeGeneratorPage.tsx',
  'src/pages/app/WritingCoachPage.tsx',
  'src/pages/app/SpeakingCoachPage.tsx',
];

const PROTECTED_PATH_PREFIXES = [
  '.env',
  'secrets',
  '.agents/',
  'docs/superpowers/',
  'public/audio/',
  'public/data/',
  'src/curriculum/',
  'supabase/migrations/',
  'test/',
  'scripts/',
];

const FORBIDDEN_CLAIMS = [
  'unlimited AI',
  'ChatGPT-like',
  'official IELTS score',
  'guaranteed band',
  'stronger than ELSA',
  'AI-powered scoring',
  'instant perfect feedback',
  'cloud AI',
  'OpenAI',
  'Claude',
  'Gemini',
  'API key',
  'band score',
  'TOEIC',
  'TOEFL',
  'Speaking Part',
  'Writing Task',
];

const FORBIDDEN_AUDIT_FIELDS = [
  'rawPrompt',
  'prompt',
  'rawOutput',
  'output',
  'essayText',
  'transcript',
  'answerText',
  'generatedContent',
  'learnerMemoryContent',
];

function normalizePath(value) {
  return value.split(path.sep).join('/').replace(/^\.\//, '');
}

function isProtectedPath(relativePath) {
  const normalized = normalizePath(relativePath);
  return PROTECTED_PATH_PREFIXES.some((prefix) => (
    normalized === prefix.replace(/\/$/, '') || normalized.startsWith(prefix)
  ));
}

function stripComments(source) {
  let result = '';
  let index = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (current === '\n') {
        lineComment = false;
        result += current;
      } else {
        result += ' ';
      }
      index += 1;
      continue;
    }

    if (blockComment) {
      if (current === '*' && next === '/') {
        result += '  ';
        blockComment = false;
        index += 2;
      } else {
        result += current === '\n' ? '\n' : ' ';
        index += 1;
      }
      continue;
    }

    if (quote) {
      result += current;
      if (escaped) {
        escaped = false;
      } else if (current === '\\') {
        escaped = true;
      } else if (current === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }

    if (current === '/' && next === '/') {
      result += '  ';
      lineComment = true;
      index += 2;
      continue;
    }

    if (current === '/' && next === '*') {
      result += '  ';
      blockComment = true;
      index += 2;
      continue;
    }

    if (current === "'" || current === '"' || current === '`') {
      quote = current;
    }

    result += current;
    index += 1;
  }

  return result;
}

function addViolation(violations, relativePath, ruleId, message) {
  if (violations.some((item) => item.path === relativePath && item.ruleId === ruleId)) return;
  violations.push({ path: relativePath, ruleId, message });
}

function scanAISafetySource(relativePath, source) {
  const normalizedPath = normalizePath(relativePath);
  if (isProtectedPath(normalizedPath)) return [];

  const violations = [];
  const runtimeSource = stripComments(source);

  for (const claim of FORBIDDEN_CLAIMS) {
    if (runtimeSource.toLowerCase().includes(claim.toLowerCase())) {
      addViolation(
        violations,
        normalizedPath,
        'forbidden-claim',
        `Contains forbidden runtime claim or exam/provider term: ${claim}`,
      );
    }
  }

  if (/\bMath\.random\s*\(/.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'non-deterministic-random', 'Uses Math.random in AI platform logic.');
  }

  if (/\bsetTimeout\s*\(/.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'fake-delay', 'Uses setTimeout in AI-facing logic.');
  }

  if (/\bDate\.now\s*\(/.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'non-injectable-clock', 'Uses Date.now instead of an injectable clock.');
  }

  if (/\b(?:fake[-\s]?stream(?:ing)?|typing[-\s]?(?:delay|simulation)|streaming\s*:\s*true|setInterval\s*\()/i.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'fake-streaming', 'Contains fake streaming or typing simulation behavior.');
  }

  if (/\b(?:score|pronunciationScore|fluencyScore|writingScore|speakingScore|bandScore|overallScore)\s*[:=]\s*-?\d+(?:\.\d+)?\b/i.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'fake-score', 'Contains a hardcoded learner-facing score.');
  }

  if (/\brecommendation\s*[:=]\s*(['"`])(?:(?!\1)[^\r\n])*\1/i.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'fake-recommendation', 'Contains a hardcoded recommendation.');
  }

  const generatedOutputAfterStatus = /status\s*:\s*['"]success['"][\s\S]{0,600}?(?:output|feedback|exercise|generatedContent)\s*:\s*(['"`])(?:(?!\1)[^\r\n]){2,}\1[\s\S]{0,600}?isAiGenerated\s*:\s*true/i;
  const generatedOutputAfterFlag = /isAiGenerated\s*:\s*true[\s\S]{0,600}?(?:output|feedback|exercise|generatedContent)\s*:\s*(['"`])(?:(?!\1)[^\r\n]){2,}\1/i;
  if (generatedOutputAfterStatus.test(runtimeSource) || generatedOutputAfterFlag.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'hardcoded-generated-output', 'Contains hardcoded output marked as AI-generated.');
  }

  if (/\b(?:auditStore|requestAuditStore|store)\.record\s*\(\s*\{[\s\S]{0,800}?status\s*:\s*['"]completed['"]/i.test(runtimeSource)) {
    addViolation(violations, normalizedPath, 'fake-completed-audit', 'Records a completed AI request directly in runtime UI logic.');
  }

  if (/aiRequestAudit(?:Types|Store)\.ts$/i.test(normalizedPath)) {
    const fieldPattern = new RegExp(
      `(?:readonly\\s+)?(?:${FORBIDDEN_AUDIT_FIELDS.join('|')})\\??\\s*:|['\"](?:${FORBIDDEN_AUDIT_FIELDS.join('|')})['\"]\\s*:`,
      'i',
    );
    if (fieldPattern.test(runtimeSource)) {
      addViolation(violations, normalizedPath, 'audit-raw-content-field', 'Audit schema/store exposes a forbidden raw-content field.');
    }
  }

  return violations;
}

function walkSourceDirectory(root, relativeDirectory, files) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory) || !fs.statSync(absoluteDirectory).isDirectory()) return;

  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = normalizePath(path.join(relativeDirectory, entry.name));
    if (isProtectedPath(relativePath)) continue;
    if (entry.isDirectory()) {
      walkSourceDirectory(root, relativePath, files);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.add(relativePath);
    }
  }
}

function collectAISafetySourceFiles(root) {
  const files = new Set();

  for (const relativeDirectory of AI_SAFETY_DIRECTORY_TARGETS) {
    walkSourceDirectory(root, relativeDirectory, files);
  }

  for (const relativePath of AI_SAFETY_FILE_TARGETS) {
    const absolutePath = path.join(root, relativePath);
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
      files.add(relativePath);
    }
  }

  const learningDirectory = path.join(root, 'src/platform/learning');
  if (fs.existsSync(learningDirectory) && fs.statSync(learningDirectory).isDirectory()) {
    for (const entry of fs.readdirSync(learningDirectory, { withFileTypes: true })) {
      if (
        entry.isFile()
        && entry.name.startsWith('learnerMemory')
        && SOURCE_EXTENSIONS.has(path.extname(entry.name))
      ) {
        files.add(normalizePath(path.join('src/platform/learning', entry.name)));
      }
    }
  }

  return [...files].sort();
}

function readIfPresent(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : undefined;
}

function verifyShellOutputGates(root, violations) {
  const shells = [
    ['src/components/ai/AITutorShell.tsx', 'output'],
    ['src/components/ai/PracticeGeneratorShell.tsx', 'output'],
    ['src/components/ai/WritingCoachShell.tsx', 'feedback'],
    ['src/components/ai/SpeakingCoachShell.tsx', 'feedback'],
  ];

  for (const [relativePath, outputField] of shells) {
    const source = readIfPresent(root, relativePath);
    if (source === undefined) continue;
    const gate = /state\.status\s*===\s*['"]success['"]\s*&&\s*state\.isAiGenerated\s*===\s*true/;
    if (!gate.test(stripComments(source))) {
      addViolation(
        violations,
        relativePath,
        'shell-output-gate',
        `The ${outputField} render path must require success and isAiGenerated === true.`,
      );
    }
  }
}

function extractFeatureBlock(source, id) {
  const marker = `id: '${id}'`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return undefined;
  const start = source.lastIndexOf('{', markerIndex);
  const end = source.indexOf('\n  },', markerIndex);
  if (start < 0 || end < 0) return undefined;
  return source.slice(start, end + 4);
}

function verifyRegistryContracts(root, violations) {
  const relativePath = 'src/platform/ai/aiFeatureRegistry.ts';
  const source = readIfPresent(root, relativePath);
  if (source === undefined) return;

  const modelDependent = ['ai-tutor', 'practice-generator', 'writing-coach', 'speaking-coach'];
  for (const id of modelDependent) {
    const block = extractFeatureBlock(source, id);
    if (!block || !/requiresLocalModel:\s*true/.test(block)) {
      addViolation(violations, relativePath, 'registry-model-requirement', `${id} must require a local model.`);
    }
  }

  const learnerMemory = extractFeatureBlock(source, 'learner-memory');
  if (!learnerMemory || !/requiresLocalModel:\s*false/.test(learnerMemory)) {
    addViolation(violations, relativePath, 'registry-model-requirement', 'Learner Memory must not require a local model.');
  }
  if (!learnerMemory || !/does not generate coaching output/i.test(learnerMemory)) {
    addViolation(violations, relativePath, 'learner-memory-output-claim', 'Learner Memory must explicitly state that it does not generate coaching output.');
  }
}

function verifyAuditContracts(root, violations) {
  const relativePath = 'src/platform/ai/aiRequestAuditStore.ts';
  const source = readIfPresent(root, relativePath);
  if (source === undefined) return;
  const runtimeSource = stripComments(source);

  if (!/function\s+normalizeStoredEntry\s*\(/.test(runtimeSource)) {
    addViolation(violations, relativePath, 'audit-sanitizer-missing', 'Audit store must sanitize stored entries through normalizeStoredEntry.');
  }
  if (!/exportJSON:\s*\(\)\s*=>\s*JSON\.stringify\(read\(\),\s*null,\s*2\)/.test(runtimeSource)) {
    addViolation(violations, relativePath, 'audit-export-not-sanitized', 'Audit export must serialize the sanitized read() result only.');
  }
}

function scanAISafetyRegression({ root = process.cwd() } = {}) {
  const files = collectAISafetySourceFiles(root);
  const violations = [];

  for (const relativePath of files) {
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    violations.push(...scanAISafetySource(relativePath, source));
  }

  verifyShellOutputGates(root, violations);
  verifyRegistryContracts(root, violations);
  verifyAuditContracts(root, violations);

  violations.sort((left, right) => (
    left.path.localeCompare(right.path) || left.ruleId.localeCompare(right.ruleId)
  ));

  return { files, violations };
}

function run() {
  const result = scanAISafetyRegression({ root: process.cwd() });
  if (result.violations.length > 0) {
    for (const violation of result.violations) {
      console.error(`FAIL [${violation.ruleId}] ${violation.path}: ${violation.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: AI safety regression scan checked ${result.files.length} scoped source files.`);
}

module.exports = {
  AI_SAFETY_DIRECTORY_TARGETS,
  AI_SAFETY_FILE_TARGETS,
  FORBIDDEN_AUDIT_FIELDS,
  FORBIDDEN_CLAIMS,
  PROTECTED_PATH_PREFIXES,
  collectAISafetySourceFiles,
  scanAISafetyRegression,
  scanAISafetySource,
  stripComments,
};

if (require.main === module) run();
