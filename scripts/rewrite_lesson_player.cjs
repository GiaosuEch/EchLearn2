const fs = require('fs');
let content = fs.readFileSync('src/pages/app/LessonPlayerPage.tsx', 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import { useAppStore } from '../../stores/appStore';", "import { useAppStore } from '../../stores/appStore';\nimport { useTranslation } from 'react-i18next';");
  
  content = content.replace("const currentLanguage = useAppStore(s => s.currentLanguage);", "const currentLanguage = useAppStore(s => s.currentLanguage);\n  const { t } = useTranslation();");
}

content = content.replace(/>Generating lesson...</, '>{t("lesson.generating") || "Generating lesson..."}<');

// Adding fallback UI for missing data
const fallbackUI = `  if (!isLoading && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden items-center justify-center text-center p-4">
        <BlobBackground colors={['bg-error/10', 'bg-dark-800/10', 'bg-dark-900/10']} />
        <h2 className="text-xl font-bold text-white mb-2 z-10">{t('lesson.missing_data') || "Bài học này đang thiếu dữ liệu."}</h2>
        <p className="text-dark-400 z-10">{t('lesson.choose_another') || "Hãy chọn bài khác."}</p>
      </div>
    );
  }

  if (isLoading || !exercise) {`;

content = content.replace('  if (isLoading || !exercise) {', fallbackUI);

fs.writeFileSync('src/pages/app/LessonPlayerPage.tsx', content);
console.log('LessonPlayerPage updated');
