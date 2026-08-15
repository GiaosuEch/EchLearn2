import { type SRSData, SRSAlgorithm } from './srsAlgorithm';

export type CollocationType = string; // e.g., 'verb-noun', 'idiom', 'keigo', 'particle-noun'

export type EdgeRelation = 'synonym' | 'antonym' | 'prerequisite' | 'related' | 'collocates_with';

export interface CollocationNode {
  id: string; // e.g., "make_decision"
  phrase: string;
  type: CollocationType;
  translations: Record<string, string>; // e.g., { vi: 'đưa ra quyết định', es: 'tomar una decisión' }
  difficulty: number; // 1-10
  examples: string[];
  srsData?: SRSData; // Differential memory state
}

export interface CollocationEdge {
  from: string;
  to: string;
  relation: EdgeRelation;
  weight: number; // For graph traversal optimization
}

export class CollocationGraph {
  private nodes: Map<string, CollocationNode> = new Map();
  private edges: Map<string, CollocationEdge[]> = new Map();

  public addNode(node: CollocationNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  public addEdge(edge: CollocationEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error('Both nodes must exist before adding an edge');
    }
    this.edges.get(edge.from)?.push(edge);
  }

  public getNode(id: string): CollocationNode | undefined {
    return this.nodes.get(id);
  }

  public getRelated(id: string, relation?: EdgeRelation): CollocationNode[] {
    const nodeEdges = this.edges.get(id) || [];
    return nodeEdges
      .filter(e => !relation || e.relation === relation)
      .map(e => this.nodes.get(e.to)!)
      .filter(Boolean);
  }

  /**
   * Scan the entire graph and return nodes whose Retrievability (R) is below the threshold.
   * This powers the Infinite Routing Engine.
   */
  public getNodesForReview(currentTimeMs: number = Date.now(), rThreshold: number = 0.85): CollocationNode[] {
    const reviewNodes: CollocationNode[] = [];
    
    // Convert map to array to filter
    for (const node of this.nodes.values()) {
      if (!node.srsData) {
        // If it has no SRS data, it's treated as "new" and should be reviewed/learned.
        reviewNodes.push(node);
      } else {
        const { stability, lastReview } = node.srsData;
        const R = SRSAlgorithm.calculateRetrievability(stability, lastReview, currentTimeMs);
        if (R < rThreshold) {
          reviewNodes.push(node);
        }
      }
    }
    
    // Sort by most urgent (lowest R first), and then by new words
    return reviewNodes.sort((a, b) => {
      const rA = a.srsData ? SRSAlgorithm.calculateRetrievability(a.srsData.stability, a.srsData.lastReview, currentTimeMs) : -1;
      const rB = b.srsData ? SRSAlgorithm.calculateRetrievability(b.srsData.stability, b.srsData.lastReview, currentTimeMs) : -1;
      return rA - rB;
    });
  }

  /**
   * Deterministic graph search to find path between collocations (BFS)
   */
  public findPath(fromId: string, toId: string): CollocationNode[] | null {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return null;

    const queue: string[] = [fromId];
    const visited = new Set<string>([fromId]);
    const predecessors = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) break;

      const neighbors = this.edges.get(current) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          predecessors.set(edge.to, current);
          queue.push(edge.to);
        }
      }
    }

    if (!predecessors.has(toId)) return null;

    const path: CollocationNode[] = [];
    let curr: string | undefined = toId;
    while (curr) {
      path.unshift(this.nodes.get(curr)!);
      curr = predecessors.get(curr);
    }

    return path;
  }
}

// Initial 100 core collocations (Matrix Curriculum - Phase 4 Demo)
export const initializeCoreCollocations = (graph: CollocationGraph) => {
  const coreNodes: CollocationNode[] = [
    {
      id: 'make_decision',
      phrase: 'make a decision',
      type: 'verb-noun',
      translations: { vi: 'đưa ra quyết định' },
      difficulty: 3,
      examples: ['I need to make a decision by tomorrow.']
    },
    {
      id: 'take_action',
      phrase: 'take action',
      type: 'verb-noun',
      translations: { vi: 'hành động' },
      difficulty: 3,
      examples: ['The government must take action immediately.']
    },
    {
      id: 'highly_recommend',
      phrase: 'highly recommend',
      type: 'adverb-verb',
      translations: { vi: 'khuyên dùng mạnh mẽ' },
      difficulty: 4,
      examples: ['I highly recommend this book to everyone.']
    },
    {
      id: 'strongly_advise',
      phrase: 'strongly advise',
      type: 'adverb-verb',
      translations: { vi: 'khuyên bảo mạnh mẽ' },
      difficulty: 5,
      examples: ['We strongly advise against traveling at night.']
    },
    {
      id: 'bear_in_mind',
      phrase: 'bear in mind',
      type: 'idiom',
      translations: { vi: 'ghi nhớ' },
      difficulty: 6,
      examples: ['Bear in mind that the exam is next week.']
    }
    // Note: This array will be expanded to 3000 in production.
  ];

  for (const node of coreNodes) {
    graph.addNode(node);
  }

  // Define logical relations
  graph.addEdge({ from: 'make_decision', to: 'take_action', relation: 'related', weight: 1 });
  graph.addEdge({ from: 'highly_recommend', to: 'strongly_advise', relation: 'synonym', weight: 0.5 });
};
