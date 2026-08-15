import fs from 'fs';
let content = fs.readFileSync('src/components/layout/SidebarNav.tsx', 'utf8');

const target = `{ icon: <GraduationCap size={iconSize} />, key: 'ielts_dashboard', path: '/app/ielts' },`;
const replacement = `{ icon: <GraduationCap size={iconSize} />, key: 'ielts_dashboard', path: '/app/ielts' },
    { icon: <Languages size={iconSize} />, key: 'japanese_dashboard', path: '/app/roadmap?lang=ja' },
    { icon: <Languages size={iconSize} />, key: 'chinese_dashboard', path: '/app/roadmap?lang=zh' },
    { icon: <Languages size={iconSize} />, key: 'korean_dashboard', path: '/app/roadmap?lang=ko' },`;

content = content.replace(target, replacement);

const target2 = `  ielts_writing_master: 'IELTS Writing',
  video_listening: 'Shadowing',
  practice_hub: 'Luyện tập',`;
const replacement2 = `  ielts_writing_master: 'IELTS Writing',
  japanese_dashboard: 'Tiếng Nhật (JLPT)',
  chinese_dashboard: 'Tiếng Trung (HSK)',
  korean_dashboard: 'Tiếng Hàn (TOPIK)',
  video_listening: 'Shadowing',
  practice_hub: 'Luyện tập',`;
  
content = content.replace(target2, replacement2);

fs.writeFileSync('src/components/layout/SidebarNav.tsx', content);
console.log("Patched");
