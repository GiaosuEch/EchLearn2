const fs = require('fs');
const path = require('path');

const cwd = 'd:/dự án GPT/ANTI_Phase20_avatar_mascot_fix';

const replacements = [
  // 1. TS1484 (type-only imports)
  {
    file: 'src/components/curriculum/MemoryDecayChart.tsx',
    replace: (content) => content.replace(/import \{ SRSData \}/g, 'import type { SRSData }')
  },
  {
    file: 'src/components/immersion/SyntaxPlayground.tsx',
    replace: (content) => content.replace(/import \{ ASTNode \}/g, 'import type { ASTNode }')
  },
  {
    file: 'src/domain/curriculum/collocationGraph.ts',
    replace: (content) => content.replace(/import \{ SRSData \}/g, 'import type { SRSData }')
  },
  {
    file: 'src/lib/nlp/parser.ts',
    replace: (content) => content.replace(/import \{ Token \}/g, 'import type { Token }')
  },
  {
    file: 'src/pages/app/InfinityIntegrationPage.tsx',
    replace: (content) => content
      .replace(/import \{ InfiniteRouter, RouteSession \}/g, 'import { InfiniteRouter, type RouteSession }')
      .replace(/import \{ CollocationGraph, initializeCoreCollocations, CollocationNode \}/g, 'import { CollocationGraph, initializeCoreCollocations }')
  },
  {
    file: 'src/services/localDatabase.ts',
    replace: (content) => content.replace(/import \{ CollocationNode \}/g, 'import type { CollocationNode }')
  },
  {
    file: 'src/services/syncQueueService.ts',
    replace: (content) => content
      .replace(/import \{ CollocationNode \}/g, 'import type { CollocationNode }')
      .replace(/private async mockSupabaseSync\(node: CollocationNode\)/g, 'private async mockSupabaseSync(_node: CollocationNode)')
  },

  // 2. TS2339 (enqueue -> pushChange)
  {
    file: 'src/components/immersion/StrictWritingInput.tsx',
    replace: (content) => content.replace(/\.enqueue\(/g, '.pushChange(')
  },
  {
    file: 'src/hooks/usePronunciationChallenge.ts',
    replace: (content) => content.replace(/\.enqueue\(/g, '.pushChange(')
  },

  // 3. TS2307 (import path typo)
  {
    file: 'src/components/layout/TopBar.tsx',
    replace: (content) => content.replace(/from '\.\.\/\.\.\/services\/syncQueue'/g, "from '../../services/syncQueueService'")
  },

  // 4. TS6133 (unused vars)
  {
    file: 'src/domain/curriculum/srsAlgorithm.ts',
    replace: (content) => content.replace(/const elapsedDays =/g, 'const _elapsedDays =')
  },
  {
    file: 'src/hooks/useMicrophoneDSP.ts',
    replace: (content) => content.replace(/prev => \(\{/g, '() => ({')
  },

  // 5. TS2554 (Expected 1 arg, got 2 in progressService, learningRepository, mistakeNotebookStore)
  {
    file: 'src/services/learningRepository.ts',
    replace: (content) => content
      .replace(/recordStudySession\(.*?,/g, 'recordStudySession(')
      .replace(/incrementLessonCompletion\(.*?,/g, 'incrementLessonCompletion(')
      .replace(/updateLessonProgress\(.*?,/g, 'updateLessonProgress(')
  },
  {
    file: 'src/services/progressService.ts',
    replace: (content) => content
      .replace(/progressStore\.getState\(\)\.incrementLessonCompletion\(lessonId, \{[^}]*\}\)/g, 'progressStore.getState().incrementLessonCompletion(lessonId)')
      .replace(/progressStore\.getState\(\)\.updateLessonProgress\(lessonId, \{[^}]*\}\)/g, 'progressStore.getState().updateLessonProgress(lessonId)')
  },
  {
    file: 'src/stores/mistakeNotebookStore.ts',
    replace: (content) => content.replace(/learningRepository\.recordStudySession\(item\.id, \{[^}]*\}\)/g, 'learningRepository.recordStudySession(item.id)')
  }
];

let filesChanged = 0;

for (const task of replacements) {
  const fullPath = path.join(cwd, task.file);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf8');
    const modified = task.replace(original);
    if (original !== modified) {
      fs.writeFileSync(fullPath, modified, 'utf8');
      console.log(`Fixed: ${task.file}`);
      filesChanged++;
    } else {
      console.log(`No changes made to: ${task.file}`);
    }
  } else {
    console.error(`File not found: ${task.file}`);
  }
}

console.log(`Total files changed: ${filesChanged}`);
