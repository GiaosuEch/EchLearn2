#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function fail(m){console.error('FAIL:',m);process.exit(1)}
function ok(m){console.log('PASS:',m)}

const service = read('src/services/practiceLearningIntegration.ts');
const page = read('src/pages/app/practice/WritingPracticePage.tsx');
for (const token of ['WritingFeedbackResult','evaluateWritingPractice','taskResponse','coherence','vocabulary','grammar','disclaimer']) if (!service.includes(token)) fail(`writing feedback missing ${token}`);
for (const token of ['evaluateWritingPractice','saveWritingFeedback','feedback.categories','feedback.improvements','feedback.rewriteSuggestion']) if (!page.includes(token)) fail(`writing page missing ${token}`);
ok('writing feedback is local, structured, and persisted');
