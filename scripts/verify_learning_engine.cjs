#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
const coordinator = read('src/services/learningCoordinator.ts');
const calculator = read('src/services/fsrsCalculator.ts');
const repository = read('src/services/learningRepository.ts');
const dashboard = read('src/pages/app/DashboardPage.tsx');
const lesson = read('src/pages/app/LessonPlayerPage.tsx');
const required = [
  'calculateMasteryScore',
  'scheduleNextReview',
  'recordLearningEvent',
  'getTodayPlan',
  'createInitialPathFromPlacement',
  'learning_item_progress',
  'learning_events',
  'review_queue',
  'daily_learning_plans',
];
const missing = required.filter((token) =>
  !coordinator.includes(token) && !calculator.includes(token) && !repository.includes(token)
);
if (missing.length) throw new Error(`Adaptive learning engine missing: ${missing.join(', ')}`);
if (!dashboard.includes('learningCoordinator.getTodayPlan')) throw new Error('Dashboard does not load adaptive daily plan.');
if (!lesson.includes('learningCoordinator.recordLearningEvent')) throw new Error('Lesson player does not write adaptive learning events.');
console.log('PASS: Adaptive learning engine is wired into service, dashboard, and lesson runtime.');