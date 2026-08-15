const fs = require('fs');
const path = require('path');

const projectRoot = 'd:\\dự án GPT\\ANTI_Phase20_avatar_mascot_fix';

const fixes = [
  {
    file: 'src/components/immersion/StrictWritingInput.tsx',
    replace: (content) => content.replace(/syncQueueService\.enqueue/g, 'syncQueue.pushChange').replace(/import \{ syncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueue } from \'../../services/syncQueueService\';')
  },
  {
    file: 'src/components/layout/TopBar.tsx',
    replace: (content) => content.replace(/syncQueueService\.getQueueStatus/g, 'syncQueue.getPendingCount').replace(/import \{ syncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueue } from \'../../services/syncQueueService\';').replace(/syncQueueService/g, 'syncQueue')
  },
  {
    file: 'src/hooks/usePronunciationChallenge.ts',
    replace: (content) => content.replace(/syncQueueService\.enqueue/g, 'syncQueue.pushChange').replace(/import \{ syncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueue } from \'../../services/syncQueueService\';')
  },
  {
    file: 'src/services/learningRepository.ts',
    replace: (content) => content.replace(/syncQueueService\.enqueue/g, 'syncQueue.pushChange').replace(/import \{ syncQueueService \} from '\.\/syncQueueService';/g, 'import { syncQueue } from \'./syncQueueService\';')
  },
  {
    file: 'src/services/progressService.ts',
    replace: (content) => content.replace(/syncQueueService\.enqueue/g, 'syncQueue.pushChange').replace(/import \{ syncQueueService \} from '\.\/syncQueueService';/g, 'import { syncQueue } from \'./syncQueueService\';')
  },
  {
    file: 'src/stores/mistakeNotebookStore.ts',
    replace: (content) => content.replace(/syncQueueService\.enqueue/g, 'syncQueue.pushChange').replace(/import \{ syncQueueService \} from '\.\.\/services\/syncQueueService';/g, 'import { syncQueue } from \'../services/syncQueueService\';')
  },
  {
    file: 'src/domain/curriculum/srsAlgorithm.ts',
    replace: (content) => content.replace(/const _elapsedDays/g, 'const elapsedDays').replace(/elapsedDays = \(/g, 'elapsedDays = (')
  },
  {
    file: 'src/pages/app/InfinityIntegrationPage.tsx',
    replace: (content) => content.replace(/import type \{ RouteSession \} from/g, 'import type { RouteSession } from').replace(/import type \{ CollocationNode \} from/g, '').replace(/import \{ InfiniteRouter \} from '\.\.\/\.\.\/domain\/curriculum\/infiniteRouter';/g, 'import { InfiniteRouter } from \'../../domain/curriculum/infiniteRouter\';\nimport type { CollocationNode } from \'../../domain/curriculum/collocationGraph\';')
  },
  {
    file: 'src/services/syncQueueService.ts',
    replace: (content) => content.replace(/import type \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from').replace(/import \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from')
  },
  {
    file: 'src/lib/nlp/parser.ts',
    replace: (content) => content.replace(/import \{ TokenType \} from '\.\/lexer';\nimport type \{ Token \} from '\.\/lexer';/g, 'import { TokenType } from \'./lexer\';\nimport type { Token } from \'./lexer\';')
  }
];

fixes.forEach(fix => {
  const fullPath = path.join(projectRoot, fix.file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = fix.replace(content);
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent);
      console.log('Fixed', fix.file);
    }
  }
});
