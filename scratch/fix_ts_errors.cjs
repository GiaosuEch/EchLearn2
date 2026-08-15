const fs = require('fs');
const path = require('path');

const projectRoot = 'd:\\dự án GPT\\ANTI_Phase20_avatar_mascot_fix';

const fixes = [
  {
    file: 'src/lib/dsp/fft.ts',
    replace: (content) => content.replace(
      /constructor\(public re: number, public im: number\) \{\}/g,
      'public re: number;\n  public im: number;\n  constructor(re: number, im: number) {\n    this.re = re;\n    this.im = im;\n  }'
    )
  },
  {
    file: 'src/lib/nlp/lexer.ts',
    replace: (content) => content.replace(
      /export enum TokenType \{([^}]+)\}/g,
      "export const TokenType = {$1} as const;\nexport type TokenType = keyof typeof TokenType;"
    )
  },
  {
    file: 'src/components/curriculum/MemoryDecayChart.tsx',
    replace: (content) => content.replace(/import \{ SRSData \} from/g, 'import type { SRSData } from')
  },
  {
    file: 'src/domain/curriculum/collocationGraph.ts',
    replace: (content) => content.replace(/import \{ SRSData \} from/g, 'import type { SRSData } from')
  },
  {
    file: 'src/domain/curriculum/contentRegistry.ts',
    replace: (content) => content.replace(/import \{ CollocationGraph, CollocationNode \} from/g, 'import { CollocationGraph } from \'./collocationGraph\';\nimport type { CollocationNode } from')
  },
  {
    file: 'src/domain/curriculum/ieltsEvaluator.ts',
    replace: (content) => content.replace(/import \{ ASTNode \} from/g, 'import type { ASTNode } from')
  },
  {
    file: 'src/domain/curriculum/infiniteRouter.ts',
    replace: (content) => content.replace(/import \{ CollocationGraph, CollocationNode \}/g, 'import { CollocationGraph } from \'./collocationGraph\';\nimport type { CollocationNode }')
  },
  {
    file: 'src/lib/nlp/parser.ts',
    replace: (content) => content.replace(/import \{ Token, TokenType \} from/g, 'import { TokenType } from \'./lexer\';\nimport type { Token } from')
  },
  {
    file: 'src/pages/app/InfinityDemoPage.tsx',
    replace: (content) => content.replace(/import \{ SRSData \}/g, 'import type { SRSData }')
  },
  {
    file: 'src/pages/app/InfinityIntegrationPage.tsx',
    replace: (content) => {
      let c = content.replace(/import \{ RouteSession \} from/g, 'import type { RouteSession } from');
      c = c.replace(/import \{ InfiniteRouter, CollocationNode \}/g, 'import { InfiniteRouter } from \'../../domain/curriculum/infiniteRouter\';\nimport type { CollocationNode }');
      return c;
    }
  },
  {
    file: 'src/services/localDatabase.ts',
    replace: (content) => content.replace(/import \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from')
  },
  {
    file: 'src/services/syncQueueService.ts',
    replace: (content) => content.replace(/import \{ CollocationNode, SRSData \} from/g, 'import type { CollocationNode, SRSData } from')
  },
  {
    file: 'src/components/immersion/StrictWritingInput.tsx',
    replace: (content) => content.replace(/import \{ syncQueueService \} from/g, 'import { SyncQueueService } from').replace(/syncQueueService\.enqueue/g, 'SyncQueueService.getInstance().addOperation')
  },
  {
    file: 'src/components/immersion/SyntaxPlayground.tsx',
    replace: (content) => content.replace(/import \{ ASTNode \} from/g, 'import type { ASTNode } from')
  },
  {
    file: 'src/components/layout/TopBar.tsx',
    replace: (content) => content.replace(/import \{ syncQueueService \} from/g, 'import { SyncQueueService } from').replace(/syncQueueService\.getQueueStatus/g, 'SyncQueueService.getInstance().getQueueStatus')
  },
  {
    file: 'src/hooks/usePronunciationChallenge.ts',
    replace: (content) => content.replace(/import \{ syncQueueService \} from/g, 'import { SyncQueueService } from').replace(/syncQueueService\.enqueue/g, 'SyncQueueService.getInstance().addOperation')
  },
  {
    file: 'src/services/learningRepository.ts',
    replace: (content) => content.replace(/import \{ syncQueueService \} from/g, 'import { SyncQueueService } from').replace(/syncQueueService\.enqueue/g, 'SyncQueueService.getInstance().addOperation')
  },
  {
    file: 'src/services/progressService.ts',
    replace: (content) => content.replace(/import \{ syncQueueService \} from/g, 'import { SyncQueueService } from').replace(/syncQueueService\.enqueue/g, 'SyncQueueService.getInstance().addOperation')
  },
  {
    file: 'src/stores/mistakeNotebookStore.ts',
    replace: (content) => content.replace(/import \{ syncQueueService \}/g, 'import { SyncQueueService }').replace(/syncQueueService\.enqueue/g, 'SyncQueueService.getInstance().addOperation')
  },
  {
    file: 'src/hooks/useMicrophoneDSP.ts',
    replace: (content) => content.replace(/import \{ FFT \} from '\.\.\/lib\/dsp\/fft';/g, '').replace(/const prev = /g, '')
  },
  {
    file: 'src/domain/curriculum/srsAlgorithm.ts',
    replace: (content) => content.replace(/const elapsedDays = /g, 'const _elapsedDays = ')
  },
  {
    file: 'src/App.tsx',
    replace: (content) => content.replace(/const syncQueue = /g, 'const _syncQueue = ')
  },
  {
    file: 'src/pages/app/ielts/IELTSSpeakingPage.tsx',
    replace: (content) => content.replace(/import \{ Mic, Square, RotateCcw, Sparkles \}/g, 'import { Mic, Sparkles }')
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

