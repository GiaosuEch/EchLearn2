const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mustExist = [
  'src/data/customization.ts',
  'src/services/customizationService.ts',
  'src/pages/app/customization/CustomizationPage.tsx',
  'src/components/mascot/Mascot.tsx',
  'supabase/migrations/009_cosmetic_customization.sql'
];

let failed = false;
for (const file of mustExist) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`FAIL: Missing ${file}`);
    failed = true;
  }
}

const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
if (!app.includes('CustomizationPage') || !app.includes('path="customize"')) {
  console.error('FAIL: /app/customize route is not registered.');
  failed = true;
}

const layout = fs.readFileSync(path.join(root, 'src/components/layout/AppLayout.tsx'), 'utf8');
if (!layout.includes("key: 'customize'") || !layout.includes('applyCosmeticSettings')) {
  console.error('FAIL: sidebar customization nav or runtime cosmetic application is missing.');
  failed = true;
}

const store = fs.readFileSync(path.join(root, 'src/stores/appStore.ts'), 'utf8');
for (const token of ['accentPaletteId', 'mascotSkinId', 'uiSurface', 'mascotAnimation', 'seasonalEffects']) {
  if (!store.includes(token)) {
    console.error(`FAIL: appStore missing ${token}.`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('PASS: customization system route, store, service, migration, and runtime application exist.');
