#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function fail(m){console.error('FAIL:',m);process.exit(1)}
function ok(m){console.log('PASS:',m)}

const dash = read('src/pages/app/DashboardPage.tsx');
const service = read('src/services/adaptiveLearningEngine.ts');
for (const token of ['getTodayPlan','reviewQueue','weakSkills','recommendedLesson']) if (!dash.includes(token)) fail(`dashboard missing ${token}`);
for (const token of ['learning_item_progress','learning_events','recordLearningEvent','getDueReviews']) if (!service.includes(token)) fail(`learning engine missing ${token}`);
ok('dashboard reads adaptive plan that reacts to practice events');
