#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { findAssessmentRandomness } from '../src/platform/quality/randomAssessmentScan.ts';

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const ALLOWED_EXCEPTION_SCOPES = new Set([
  'cosmetic',
  'content-variation',
  'operational-identifier',
]);
const SOURCE_RISK_TERMS =
  /\b(?:AssessmentResult|EvaluationBenchmark|EvaluationResult|RubricCriterion|Evidence|Confidence|SkillFeedback|Score|Feedback|Rubric|Evaluation)\b/i;
const SOURCE_RISK_BEHAVIOR =
  /Math\.random\s*\(|\brandomInt\s*\(|\brandomFloat\s*\(|\bshuffle\s*\(|\bisAiGenerated\s*:\s*true\b|\bmode\s*:\s*['"`](?:mock|random|hardcoded|canned|simulated|fake)['"`]/i;

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const ledgerPath = path.join(root, 'quality', 'randomAssessmentExceptions.json');

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(absolutePath)));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }
  return files;
}

function inferRiskScope(relativePath, source) {
  const normalizedPath = relativePath.toLowerCase();
  if (normalizedPath.includes('assessment')) return 'assessment';
  if (normalizedPath.includes('evaluation')) return 'evaluation';
  if (normalizedPath.includes('scoring') || normalizedPath.includes('score')) return 'scoring';
  if (normalizedPath.includes('feedback')) return 'feedback';
  if (SOURCE_RISK_TERMS.test(source) && SOURCE_RISK_BEHAVIOR.test(source)) return 'assessment';
  return null;
}

function isPlatformPath(relativePath) {
  return relativePath.startsWith('src/platform/') || relativePath.startsWith('src/learning/');
}

function validateLedger(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.exceptions)) {
    throw new Error('Random-assessment exception ledger must use version 1 with an exceptions array.');
  }

  const ids = new Set();
  for (const entry of value.exceptions) {
    if (
      !entry ||
      typeof entry.id !== 'string' ||
      ids.has(entry.id) ||
      typeof entry.path !== 'string' ||
      !Number.isInteger(entry.line) ||
      entry.line < 1 ||
      typeof entry.pattern !== 'string' ||
      typeof entry.lineContains !== 'string' ||
      entry.lineContains.length === 0 ||
      !ALLOWED_EXCEPTION_SCOPES.has(entry.scope) ||
      typeof entry.reason !== 'string' ||
      entry.reason.trim().length < 20
    ) {
      throw new Error(`Invalid random-assessment exception: ${entry?.id ?? 'unknown'}.`);
    }
    ids.add(entry.id);
  }
  return value.exceptions;
}

function findException(exceptions, relativePath, sourceLines, violation) {
  const sourceLine = sourceLines[violation.line - 1] ?? '';
  return exceptions.find(
    (entry) =>
      entry.path === relativePath &&
      entry.line === violation.line &&
      entry.pattern === violation.pattern &&
      sourceLine.includes(entry.lineContains),
  );
}

const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
const exceptions = validateLedger(ledger);
const files = await collectSourceFiles(sourceRoot);
const findings = [];
const appliedExceptions = [];
const usedExceptionIds = new Set();
let scannedFiles = 0;

for (const absolutePath of files) {
  const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/');
  if (relativePath === 'src/platform/quality/randomAssessmentScan.ts') continue;

  const source = await readFile(absolutePath, 'utf8');
  const scope = inferRiskScope(relativePath, source);
  if (!scope) continue;
  scannedFiles += 1;
  const sourceLines = source.split('\n');

  for (const violation of findAssessmentRandomness(source, scope)) {
    const exception = findException(exceptions, relativePath, sourceLines, violation);
    if (exception) {
      usedExceptionIds.add(exception.id);
      appliedExceptions.push({ exception, relativePath, violation });
      continue;
    }

    findings.push({
      classification: isPlatformPath(relativePath) ? 'platform-blocking' : 'legacy',
      relativePath,
      violation,
    });
  }
}

for (const applied of appliedExceptions) {
  const { exception, relativePath, violation } = applied;
  console.log(
    `[exception:${exception.scope}] ${relativePath}:${violation.line}:${violation.column} ${exception.id}`,
  );
}

for (const finding of findings) {
  const { classification, relativePath, violation } = finding;
  console.error(
    `[${classification}] ${relativePath}:${violation.line}:${violation.column} ${violation.pattern} — ${violation.message}`,
  );
}

const staleExceptions = exceptions.filter((entry) => !usedExceptionIds.has(entry.id));
for (const exception of staleExceptions) {
  console.error(`[stale-exception] ${exception.id} no longer matches source.`);
}

const platformCount = findings.filter(
  (finding) => finding.classification === 'platform-blocking',
).length;
const legacyCount = findings.length - platformCount;
console.log(
  `Random-assessment scan: ${scannedFiles} risk-scoped files; ${platformCount} platform-blocking; ${legacyCount} legacy; ${appliedExceptions.length} explicit exceptions.`,
);

if (findings.length > 0 || staleExceptions.length > 0) {
  console.error('FAIL: random or canned assessment risks require removal or a current explicit exception.');
  process.exitCode = 1;
} else {
  console.log('PASS: no unclassified random or canned assessment risk found.');
}
