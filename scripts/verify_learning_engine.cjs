const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
const service = read('src/services/adaptiveLearningEngine.ts');
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
const missing = required.filter((token)=>!service.includes(token));
if (missing.length) throw new Error(`Adaptive learning engine missing: ${missing.join(', ')}`);
if (!dashboard.includes('adaptiveLearningEngine.getTodayPlan')) throw new Error('Dashboard does not load adaptive daily plan.');
if (!lesson.includes('adaptiveLearningEngine.recordLearningEvent')) throw new Error('Lesson player does not write adaptive learning events.');
console.log('PASS: Adaptive learning engine is wired into service, dashboard, and lesson runtime.');
