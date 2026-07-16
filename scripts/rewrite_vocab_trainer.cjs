const fs = require('fs');
let content = fs.readFileSync('src/pages/app/practice/VocabularyTrainerPage.tsx', 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import { useAppStore } from '../../../stores/appStore';", "import { useAppStore } from '../../../stores/appStore';\nimport { useTranslation } from 'react-i18next';");
  
  content = content.replace("const targetLanguage = useAppStore(s => s.currentLanguage);", "const targetLanguage = useAppStore(s => s.currentLanguage);\n  const nativeLanguage = useAppStore(s => s.nativeLanguage);\n  const { t } = useTranslation();");
}

// Update meaning selection
content = content.replace(/w\.translation \|\| w\.meaning/g, 'nativeLanguage === "vi" ? (w as any).meaningVietnamese : (w as any).meaningEnglish');
content = content.replace(/currentCard\.translation/g, 'nativeLanguage === "vi" ? (currentCard as any).meaningVietnamese : (currentCard as any).meaningEnglish');
content = content.replace(/currentCard\.meaning/g, 'nativeLanguage === "vi" ? (currentCard as any).meaningVietnamese : (currentCard as any).meaningEnglish');
content = content.replace(/quizWord\.translation \|\| quizWord\.meaning/g, 'nativeLanguage === "vi" ? (quizWord as any).meaningVietnamese : (quizWord as any).meaningEnglish');
content = content.replace(/fillWord\.translation/g, 'nativeLanguage === "vi" ? (fillWord as any).meaningVietnamese : (fillWord as any).meaningEnglish');
content = content.replace(/fillWord\.meaning/g, 'nativeLanguage === "vi" ? (fillWord as any).meaningVietnamese : (fillWord as any).meaningEnglish');

// Update UI text replacements
content = content.replace(/>Vocabulary Trainer</g, '>{t("vocabulary.title")}<');
content = content.replace(/"Vocabulary Trainer"/g, 't("vocabulary.title")');
content = content.replace(/"Master essential vocabulary with real practice"/g, 't("vocabulary.description")');
content = content.replace(/🃏 Flashcards/g, '🃏 {t("vocabulary.flashcards")}');
content = content.replace(/❓ Quiz/g, '❓ {t("vocabulary.quiz")}');
content = content.replace(/✏️ Fill in Blank/g, '✏️ {t("vocabulary.fill_blank")}');
content = content.replace(/🔗 Match/g, '🔗 {t("vocabulary.match")}');

content = content.replace(/> Weak First/g, '> {t("vocabulary.review_weak")}');
content = content.replace(/> Level/g, '> {t("vocabulary.level")}');
content = content.replace(/>Next Question /g, '>{t("vocabulary.next_question")} ');
content = content.replace(/>Again</g, '>{t("vocabulary.mastery_again")}<');
content = content.replace(/>Hard</g, '>{t("vocabulary.mastery_hard")}<');
content = content.replace(/>Good</g, '>{t("vocabulary.mastery_good")}<');
content = content.replace(/>Easy</g, '>{t("vocabulary.mastery_easy")}<');
content = content.replace(/>Loading vocabulary...</g, '>{t("vocabulary.loading")}<');
content = content.replace(/"Loading vocabulary..."/g, 't("vocabulary.loading")');
content = content.replace(/>No vocabulary available for this language yet\.</g, '>{t("vocabulary.no_vocab")}<');
content = content.replace(/"No vocabulary found"/g, 't("vocabulary.no_vocab")');
content = content.replace(/>Tap to reveal</g, '>{t("vocabulary.tap_to_reveal")}<');
content = content.replace(/>Meaning Quiz</g, '>{t("vocabulary.meaning_quiz")}<');
content = content.replace(/>Score: /g, '>{t("vocabulary.score")}: ');
content = content.replace(/>Fill in the Blank</g, '>{t("vocabulary.fill_instruction")}<');
content = content.replace(/>Meaning: /g, '>{t("vocabulary.meaning")} ');
content = content.replace(/>Translation: /g, '>{t("vocabulary.translation")} ');
content = content.replace(/>Level: /g, '>{t("vocabulary.level")} ');
content = content.replace(/>Part of speech: /g, '>{t("vocabulary.pos")} ');
content = content.replace(/>Check</g, '>{t("vocabulary.check")}<');
content = content.replace(/> Next</g, '> {t("vocabulary.next")}');
content = content.replace(/>Match Words to Meanings</g, '>{t("vocabulary.match_instruction")}<');
content = content.replace(/ Matched</g, ' {t("vocabulary.matched")}<');
content = content.replace(/>Great Job!</g, '>{t("vocabulary.great_job")}<');
content = content.replace(/>Play Again</g, '>{t("vocabulary.play_again")}<');

content = content.replace(/What does \&ldquo;<span className="text-primary-400">\{quizWord\.word\}<\/span>\&rdquo; mean\?/, '{t("vocabulary.what_does_mean").replace("{{word}}", quizWord.word)}');
content = content.replace(/Example:/g, '{t("vocabulary.example")}');

// Update to use target language example and native translation
content = content.replace(/<p className="text-xs text-dark-400 mt-2 italic">\&ldquo;\{currentCard\.example\}\&rdquo;<\/p>/, '<p className="text-sm text-dark-300 mt-2 italic">\&ldquo;{currentCard.example}\&rdquo;</p><p className="text-xs text-dark-500 mt-1">{nativeLanguage === "vi" ? (currentCard as any).exampleTranslation : (currentCard as any).exampleTranslation}</p>');

fs.writeFileSync('src/pages/app/practice/VocabularyTrainerPage.tsx', content);
console.log('VocabularyTrainerPage updated');
