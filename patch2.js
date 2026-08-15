import fs from 'fs';
let content = fs.readFileSync('src/components/layout/SidebarNav.tsx', 'utf8');

const target2 = `  ielts_writing_master: 'IELTS Writing',
  video_listening: 'Shadowing',
  practice_hub: 'Luyện tập',`;
const target2_win = `  ielts_writing_master: 'IELTS Writing',\r\n  video_listening: 'Shadowing',\r\n  practice_hub: 'Luyện tập',`;
const replacement2 = `  ielts_writing_master: 'IELTS Writing',
  japanese_dashboard: 'Tiếng Nhật (JLPT)',
  chinese_dashboard: 'Tiếng Trung (HSK)',
  korean_dashboard: 'Tiếng Hàn (TOPIK)',
  video_listening: 'Shadowing',
  practice_hub: 'Luyện tập',`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
} else if (content.includes(target2_win)) {
  content = content.replace(target2_win, replacement2);
} else {
  // If neither matches, try generic regex
  content = content.replace(/ielts_writing_master: 'IELTS Writing',[\r\n\s]*video_listening: 'Shadowing',/, "ielts_writing_master: 'IELTS Writing',\n  japanese_dashboard: 'Tiếng Nhật (JLPT)',\n  chinese_dashboard: 'Tiếng Trung (HSK)',\n  korean_dashboard: 'Tiếng Hàn (TOPIK)',\n  video_listening: 'Shadowing',");
}

fs.writeFileSync('src/components/layout/SidebarNav.tsx', content);
console.log("Patched 2");
