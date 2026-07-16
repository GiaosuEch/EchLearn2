const fs = require('fs');

const path = 'src/components/lessons/LessonCompletionScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useTranslation')) {
  content = "import { useTranslation } from 'react-i18next';\n" + content;
  content = content.replace("export function LessonCompletionScreen", "export function LessonCompletionScreen");
  content = content.replace(/(export function LessonCompletionScreen\(.*\) \{)/, "$1\n  const { t } = useTranslation();");
}

const replacements = [
  { old: ">Lesson Complete!<", new: ">{t('lesson.completion.title') || 'Lesson Complete!'}<" },
  { old: ">Accuracy<", new: ">{t('lesson.completion.accuracy') || 'Accuracy'}<" },
  { old: ">XP Earned<", new: ">{t('lesson.completion.xpEarned') || 'XP Earned'}<" },
  { old: ">Coins<", new: ">{t('lesson.completion.coins') || 'Coins'}<" },
  { old: ">Try Again<", new: ">{t('lesson.buttons.tryAgain') || 'Try Again'}<" },
  { old: ">Continue<", new: ">{t('lesson.buttons.continue') || 'Continue'}<" }
];

for (const r of replacements) {
  content = content.replace(new RegExp(r.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r.new);
}

// Fix mascot messages
content = content.replace(
  "accuracy === 100 ? \"PERFECT! You're on fire today! 🔥\" :",
  "accuracy === 100 ? (t('lesson.completion.perfect') || \"PERFECT! You're on fire today! 🔥\") :"
);
content = content.replace(
  "accuracy >= 80 ? \"Great job! You're getting stronger! 💪\" :",
  "accuracy >= 80 ? (t('lesson.completion.great') || \"Great job! You're getting stronger! 💪\") :"
);
content = content.replace(
  "accuracy >= 50 ? \"Not bad! A little more practice and you'll nail it. 🐸\" :",
  "accuracy >= 50 ? (t('lesson.completion.good') || \"Not bad! A little more practice and you'll nail it. 🐸\") :"
);
content = content.replace(
  "\"Oops! Looks like we need to review this one. Don't give up! 🌱\";",
  "(t('lesson.completion.poor') || \"Oops! Looks like we need to review this one. Don't give up! 🌱\");"
);

fs.writeFileSync(path, content);
console.log('LessonCompletionScreen updated with i18n');
