const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;

  if (!content.includes('useTranslation')) {
    if (content.includes('react-i18next')) {
       // do nothing
    } else {
      content = "import { useTranslation } from 'react-i18next';\n" + content;
    }
  }

  if (!content.includes('const { t } = useTranslation()')) {
    // try to insert after the first component definition
    content = content.replace(/(export default function \w+\(.*\) \{)/, '$1\n  const { t } = useTranslation();');
    content = content.replace(/(export function \w+\(.*\) \{)/, '$1\n  const { t } = useTranslation();');
    content = content.replace(/(const \w+ = \(.*\) => \{)/, '$1\n  const { t } = useTranslation();');
  }

  for (const r of replacements) {
    if (content.includes(r.old)) {
      content = content.replace(r.old, r.new);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
}

replaceFile('src/components/layout/ErrorBoundary.tsx', [
  { old: '>Something went wrong<', new: '>{t("error.something_went_wrong") || "Something went wrong"}<' },
  { old: 'const { t } = useTranslation()', new: 'const { t } = useTranslation ? useTranslation() : { t: (k) => k }' } // Error boundary is a class component? Wait.
]);

// Let's rewrite ErrorBoundary.tsx manually if it's a class component.
let ebContent = fs.readFileSync('src/components/layout/ErrorBoundary.tsx', 'utf8');
if (ebContent.includes('class ErrorBoundary extends React.Component')) {
  // Can't use hooks in class components. Just fallback or use i18n instance.
  if (!ebContent.includes('import i18n')) {
     ebContent = "import i18n from '../../i18n';\n" + ebContent;
  }
  ebContent = ebContent.replace(/>Something went wrong</, '>{i18n.t("error.something_went_wrong", { defaultValue: "Something went wrong" })}<');
  fs.writeFileSync('src/components/layout/ErrorBoundary.tsx', ebContent);
}

replaceFile('src/pages/app/community/FriendsPage.tsx', [
  { old: '<span>Level {f.level || 1}</span>', new: '<span>{t("vocabulary.level")} {f.level || 1}</span>' }
]);

const ieltsReplacements = [
  { old: '<strong>Local estimated score — not an official IELTS score.</strong>', new: '<strong>{t("ielts.disclaimer_bold") || "Local estimated score — not an official IELTS score."}</strong>' },
  { old: 'Our AI tools evaluate based on simplified local heuristics and do not replace a certified examiner.', new: '{t("ielts.disclaimer_text") || "Our AI tools evaluate based on simplified local heuristics and do not replace a certified examiner."}' }
];

replaceFile('src/pages/ielts/IELTSPlacementPage.tsx', ieltsReplacements);
replaceFile('src/pages/app/ielts/IELTSSpeakingPage.tsx', ieltsReplacements);
replaceFile('src/pages/app/ielts/IELTSWritingPage.tsx', ieltsReplacements);

