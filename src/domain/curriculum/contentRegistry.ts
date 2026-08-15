import { CollocationGraph } from './collocationGraph';
import type { CollocationNode } from './collocationGraph';
import { ieltsSpeakingCueCards, ieltsWritingPrompts } from '../../data/ieltsData';

export class ContentRegistry {
  private static instance: ContentRegistry;
  private memoryGraph: CollocationGraph;

  private constructor() {
    this.memoryGraph = new CollocationGraph();
  }

  public static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  public getGraph(): CollocationGraph {
    return this.memoryGraph;
  }

  /**
   * Translates static IELTS Speaking Cue Cards into Memory Graph Nodes.
   * This allows the Infinite Router to route IELTS speaking tasks based on SRS.
   */
  public loadIELTSSpeakingRegistry(): void {
    ieltsSpeakingCueCards.forEach(card => {
      const node: CollocationNode = {
        id: `speaking_${card.id}`,
        phrase: card.title, // Treat the prompt title as the phrase to recall
        type: 'ielts-speaking-cue',
        translations: { vi: card.cueCard?.topic || card.title },
        difficulty: 6,
        examples: card.cueCard?.bulletPoints || []
      };
      
      // Only add if it doesn't exist to prevent overwriting SRS data
      if (!this.memoryGraph.getNode(node.id)) {
        this.memoryGraph.addNode(node);
      }
    });
  }

  /**
   * Translates static IELTS Writing Prompts into Memory Graph Nodes.
   */
  public loadIELTSWritingRegistry(): void {
    ieltsWritingPrompts.forEach(prompt => {
      const node: CollocationNode = {
        id: `writing_${prompt.id}`,
        phrase: `Task: ${prompt.taskType}`,
        type: 'ielts-writing-prompt',
        translations: { vi: prompt.prompt },
        difficulty: 7,
        examples: []
      };

      if (!this.memoryGraph.getNode(node.id)) {
        this.memoryGraph.addNode(node);
      }
    });
  }
}
