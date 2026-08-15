const fs = require('fs');
const path = require('path');

const projectRoot = 'd:\\dự án GPT\\ANTI_Phase20_avatar_mascot_fix';

const fixes = [
  {
    file: 'src/lib/nlp/lexer.ts',
    replace: (content) => content.replace(
      /NOUN = 'NOUN',\s+VERB = 'VERB',\s+ADJECTIVE = 'ADJECTIVE',\s+ADVERB = 'ADVERB',\s+ARTICLE = 'ARTICLE',\s+PREPOSITION = 'PREPOSITION',\s+PRONOUN = 'PRONOUN',\s+PUNCTUATION = 'PUNCTUATION',\s+UNKNOWN = 'UNKNOWN',\s+EOF = 'EOF',/g,
      "NOUN: 'NOUN',\n  VERB: 'VERB',\n  ADJECTIVE: 'ADJECTIVE',\n  ADVERB: 'ADVERB',\n  ARTICLE: 'ARTICLE',\n  PREPOSITION: 'PREPOSITION',\n  PRONOUN: 'PRONOUN',\n  PUNCTUATION: 'PUNCTUATION',\n  UNKNOWN: 'UNKNOWN',\n  EOF: 'EOF',"
    )
  },
  {
    file: 'src/components/immersion/StrictWritingInput.tsx',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.addOperation/g, 'syncQueueService.enqueue').replace(/import \{ SyncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueueService } from \'../../services/syncQueueService\';')
  },
  {
    file: 'src/components/layout/TopBar.tsx',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.getQueueStatus/g, 'syncQueueService.getQueueStatus').replace(/import \{ SyncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueueService } from \'../../services/syncQueueService\';').replace(/syncQueueService\.getQueueStatus/g, 'syncQueueService.getQueueStatus').replace(/syncQueueService/g, 'syncQueueService')
  },
  {
    file: 'src/hooks/usePronunciationChallenge.ts',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.addOperation/g, 'syncQueueService.enqueue').replace(/import \{ SyncQueueService \} from '\.\.\/\.\.\/services\/syncQueueService';/g, 'import { syncQueueService } from \'../../services/syncQueueService\';')
  },
  {
    file: 'src/services/learningRepository.ts',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.addOperation/g, 'syncQueueService.enqueue').replace(/import \{ SyncQueueService \} from '\.\/syncQueueService';/g, 'import { syncQueueService } from \'./syncQueueService\';')
  },
  {
    file: 'src/services/progressService.ts',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.addOperation/g, 'syncQueueService.enqueue').replace(/import \{ SyncQueueService \} from '\.\/syncQueueService';/g, 'import { syncQueueService } from \'./syncQueueService\';')
  },
  {
    file: 'src/stores/mistakeNotebookStore.ts',
    replace: (content) => content.replace(/SyncQueueService\.getInstance\(\)\.addOperation/g, 'syncQueueService.enqueue').replace(/import \{ SyncQueueService \} from '\.\.\/services\/syncQueueService';/g, 'import { syncQueueService } from \'../services/syncQueueService\';')
  },
  {
    file: 'src/domain/curriculum/srsAlgorithm.ts',
    replace: (content) => content.replace(/const _elapsedDays = /g, 'const elapsedDays = ').replace(/const elapsedDays = \(/g, 'const _elapsedDays = (').replace(/elapsedDays;/g, '_elapsedDays;')
  },
  {
    file: 'src/hooks/useMicrophoneDSP.ts',
    replace: (content) => content.replace(/prev =\> \[\]/g, '() => []')
  },
  {
    file: 'src/pages/app/InfinityIntegrationPage.tsx',
    replace: (content) => content.replace(/import type \{ RouteSession \} from/g, 'import type { RouteSession } from').replace(/import type \{ CollocationNode \} from/g, '').replace(/import \{ InfiniteRouter \} from '\.\.\/\.\.\/domain\/curriculum\/infiniteRouter';/, 'import { InfiniteRouter } from \'../../domain/curriculum/infiniteRouter\';\nimport type { CollocationNode } from \'../../domain/curriculum/collocationGraph\';')
  },
  {
    file: 'src/services/localDatabase.ts',
    replace: (content) => content.replace(/import type \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from').replace(/import \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from')
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
  } else {
    console.log('Not found', fix.file);
  }
});
