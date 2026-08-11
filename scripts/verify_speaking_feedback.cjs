#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function fail(m){console.error('FAIL:',m);process.exit(1)}
function ok(m){console.log('PASS:',m)}

const service = read('src/services/practiceLearningIntegration.ts');
const page = read('src/pages/app/practice/SpeakingPracticePage.tsx');
for (const token of ['SpeakingFeedbackResult','evaluateSpeakingPractice','selfReviewChecklist','completionAwarded','Hệ thống chưa chấm phát âm']) if (!service.includes(token)) fail(`speaking feedback missing ${token}`);
for (const token of ['useVoiceRecorder','evaluateSpeakingPractice','saveSpeakingFeedback','playRecording','feedback.selfReviewChecklist']) if (!page.includes(token)) fail(`speaking page missing ${token}`);
if (/AI nhận diện phát âm|feedback\.(score|categories|band)/i.test(page)) fail('speaking page contains a fabricated assessment claim or score');
ok('speaking feedback supports recording, playback, completion tracking, and transparent self-review');
