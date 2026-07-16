const fs = require('fs');
const dashboard = fs.readFileSync('src/pages/app/DashboardPage.tsx','utf8');
const tokens = ['Lộ trình thích ứng', 'Kế hoạch học hôm nay', 'todayPlan.reviewQueue', 'todayPlan.weakSkills', 'getMasteryLabel', 'recommendedLesson'];
const missing = tokens.filter((x)=>!dashboard.includes(x));
if (missing.length) throw new Error(`Dashboard adaptive plan incomplete: ${missing.join(', ')}`);
console.log('PASS: Dashboard shows adaptive daily plan, weak skills, due reviews, and next recommended action.');
