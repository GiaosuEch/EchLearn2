const fs = require('fs');

const path = 'src/pages/app/LessonPlayerPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Pass nativeLanguage and t
content = content.replace(
  "const currentLanguage = useAppStore(s => s.currentLanguage);",
  "const currentLanguage = useAppStore(s => s.currentLanguage);\n  const nativeLanguage = useAppStore(s => s.nativeLanguage);"
);

content = content.replace(
  "generateExercisesForModule(moduleId, currentLanguage)",
  "generateExercisesForModule(moduleId, currentLanguage, nativeLanguage, t)"
);

// Translate UI elements
const replacements = [
  { old: ">Step {currentEx + 1} of {exercises.length}<", new: ">{t('lesson.progress.step', { current: currentEx + 1, total: exercises.length }) || `Step ${currentEx + 1} of ${exercises.length}`}<" },
  { old: "{exercise.type.replace(/-/g, ' ')}", new: "{t(`lesson.types.${exercise.type.replace(/-/g, '')}`, { defaultValue: exercise.type.replace(/-/g, ' ') })}" },
  { old: ">{t('lesson.missing_data') || \"Bài học này đang thiếu dữ liệu.\"}<", new: ">{t('lesson.missing_data') || \"This lesson is missing data.\"}<" },
  { old: ">{t('lesson.choose_another') || \"Hãy chọn bài khác.\"}<", new: ">{t('lesson.choose_another') || \"Please choose another lesson.\"}<" },
  { old: ">Check<", new: ">{t('lesson.buttons.check') || 'Check'}<" },
  { old: ">Continue<", new: ">{t('lesson.buttons.continue') || 'Continue'}<" },
  { old: ">Try Again<", new: ">{t('lesson.buttons.tryAgain') || 'Try Again'}<" },
  { old: ">Correct!<", new: ">{t('lesson.feedback.correct') || 'Correct!'}<" },
  { old: ">Incorrect<", new: ">{t('lesson.feedback.incorrect') || 'Incorrect'}<" },
  { old: 'placeholder="Type your answer..."', new: 'placeholder={t("lesson.placeholders.typeAnswer") || "Type your answer..."}' },
  { old: ">Skip<", new: ">{t('lesson.buttons.skip') || 'Skip'}<" }
];

for (const r of replacements) {
  content = content.replace(new RegExp(r.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r.new);
}

// Add validation to fallback UI if answer options are missing
const optionValidation = `  if (!isLoading && exercises.length > 0 && exercises[currentEx]) {
    const ex = exercises[currentEx];
    if ((ex.type === 'multiple-choice' || ex.type === 'listen-choose') && (!ex.options || ex.options.length === 0 || ex.options.some((o: string) => !o))) {
      return (
        <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden items-center justify-center text-center p-4">
          <BlobBackground colors={['bg-error/10', 'bg-dark-800/10', 'bg-dark-900/10']} />
          <h2 className="text-xl font-bold text-white mb-2 z-10">{t('lesson.missing_options') || "Bài học này đang thiếu lựa chọn trả lời."}</h2>
          <p className="text-dark-400 z-10">{t('lesson.choose_another') || "Please choose another lesson."}</p>
        </div>
      );
    }
  }

  return (`;

content = content.replace("  return (", optionValidation);

fs.writeFileSync(path, content);
console.log('LessonPlayerPage updated with i18n');
