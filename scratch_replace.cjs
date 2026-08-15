const fs = require('fs');
let content = fs.readFileSync('src/components/layout/SidebarNav.tsx', 'utf8');
content = content.replace("path: '/app/japanese'", "path: '/app/roadmap?lang=ja'");
content = content.replace("path: '/app/chinese'", "path: '/app/roadmap?lang=zh'");
content = content.replace("path: '/app/korean'", "path: '/app/roadmap?lang=ko'");
fs.writeFileSync('src/components/layout/SidebarNav.tsx', content);
console.log("Done");
