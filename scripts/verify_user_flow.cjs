#!/usr/bin/env node
const fs = require('fs');
const failures = [];
const register = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
const login = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
const ai = fs.readFileSync('src/pages/app/onboarding/AIOnboardingPage.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/app/DashboardPage.tsx', 'utf8');
const engine = fs.readFileSync('src/services/adaptiveLearningEngine.ts', 'utf8');
if (!register.includes('/app/ai-onboarding?fresh=1')) failures.push('Register success must send new users to AI onboarding.');
if (!register.includes('setNativeLanguage(nativeLang)') || !register.includes('setCurrentLanguage(targetLang)')) failures.push('Register must persist native and target language choices before signup.');
if (!login.includes('personalizedLearningService.hasCompleted')) failures.push('Login must route users based on onboarding completion.');
if (!ai.includes('selfRatedLevel') && !ai.includes('level')) failures.push('AI onboarding must capture a self-rated level before placement.');
if (!ai.includes('generate') || !ai.includes('placement')) failures.push('AI onboarding must generate a placement test.');
if (!ai.includes('createInitialPathFromPlacement') && !ai.includes('learning profile')) failures.push('AI onboarding must connect result to adaptive learning path.');
if (!dashboard.includes('todayPlan') && !dashboard.includes('recommendedLesson')) failures.push('Dashboard must show adaptive plan output.');
if (!engine.includes('reviewQueue') || !engine.includes('masteryScore')) failures.push('Adaptive engine must expose mastery/review queue.');
if (failures.length) { console.error('FAIL verify_user_flow'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: registration to dashboard user flow is wired.');
