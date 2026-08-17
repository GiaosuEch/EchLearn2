/**
 * Generative Linguistic Architecture - Knowledge Graph Foundation
 * 
 * This module integrates Directed Acyclic Graph (DAG) structures with
 * Bayesian Knowledge Tracing (BKT) and FSRS v5 memory models for continuous
 * cognitive state evaluation and adaptive optimal node routing.
 */

import {
  type CognitiveState,
  type BKTParameters,
  DEFAULT_BKT_PARAMS,
  calculateRetrievability,
  stepCognitiveState
} from './cognitiveModel.ts';

export type NodeId = string;

export type CognitiveDependencyType = 
  | 'prerequisite' // Hard requirement (e.g. knowing 'Be' verb before 'Present Continuous')
  | 'reinforces'   // Soft requirement (e.g. 'Vocabulary: Food' reinforces 'Ordering at restaurant')
  | 'contrasts';   // Differentiation (e.g. 'Present Simple' vs 'Present Continuous')

export interface SemanticNode {
  id: NodeId;
  type: 'grammar' | 'vocabulary' | 'pragmatic' | 'phonology';
  titleVi: string;
  coreMeaning: string;
  // A threshold of exposure/success needed to consider this node 'acquired'
  acquisitionThreshold: number; 
}

export interface CognitiveEdge {
  from: NodeId;
  to: NodeId;
  type: CognitiveDependencyType;
  weight: number; // 0.0 to 1.0 (how strong the dependency is)
}

export class KnowledgeGraph {
  private nodes: Map<NodeId, SemanticNode> = new Map();
  private edges: CognitiveEdge[] = [];

  public addNode(node: SemanticNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id ${node.id} already exists in the KnowledgeGraph.`);
    }
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: CognitiveEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error(`Cannot add edge: Both nodes (${edge.from}, ${edge.to}) must exist in the KnowledgeGraph.`);
    }
    this.edges.push(edge);
  }

  public getNode(id: NodeId): SemanticNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): SemanticNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Performs a BFS to find all prerequisites required before learning a target node.
   * Returns a list of node IDs.
   */
  public getPrerequisites(targetId: NodeId): NodeId[] {
    if (!this.nodes.has(targetId)) return [];

    const prerequisites = new Set<NodeId>();
    const queue: NodeId[] = [targetId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      const incomingEdges = this.edges.filter(e => e.to === current && e.type === 'prerequisite');
      for (const edge of incomingEdges) {
        if (!prerequisites.has(edge.from)) {
          prerequisites.add(edge.from);
          queue.push(edge.from);
        }
      }
    }

    return Array.from(prerequisites);
  }

  /**
   * Suggests the next best node to learn based on the user's current acquired nodes.
   * Uses a greedy approach: finds a node where all its prerequisites are met.
   */
  public suggestNextNode(acquiredNodeIds: Set<NodeId>): SemanticNode | null {
    const unacquiredNodes = Array.from(this.nodes.values()).filter(n => !acquiredNodeIds.has(n.id));
    
    for (const node of unacquiredNodes) {
      const prereqs = this.getPrerequisites(node.id);
      const allPrereqsMet = prereqs.every(p => acquiredNodeIds.has(p));
      if (allPrereqsMet) {
        return node;
      }
    }
    
    return null;
  }

  /**
   * Evaluates the next optimal node by querying mastery probabilities.
   * Prioritizes:
   * 1. Decay/Lapse Review: Nodes whose retrievability R(t) or P(L_t) has dropped below threshold.
   * 2. Next Unacquired Frontier: New nodes whose all prerequisites are fully mastered.
   * 3. Fallback Root Nodes.
   */
  public evaluateNextOptimalNode(
    masteryStore: Map<string, { probabilityKnown: number; stability?: number; lastReviewedAt?: number }>,
    nowMs: number = Date.now(),
    threshold: number = 0.8
  ): SemanticNode | null {
    // 1. Check for memory decay (FSRS Retrievability or low probability)
    for (const node of this.nodes.values()) {
      const mastery = masteryStore.get(node.id);
      if (mastery) {
        let currentEffectiveMastery = mastery.probabilityKnown;
        if (mastery.stability && mastery.lastReviewedAt) {
          const elapsedDays = (nowMs - mastery.lastReviewedAt) / (1000 * 60 * 60 * 24);
          const retrievability = calculateRetrievability(mastery.stability, elapsedDays);
          currentEffectiveMastery = mastery.probabilityKnown * retrievability;
        }

        if (currentEffectiveMastery < threshold) {
          return node;
        }
      }
    }

    // 2. Frontier exploration: unacquired nodes whose prerequisites are ALL mastered
    const unacquiredNodes = Array.from(this.nodes.values()).filter(n => {
      const m = masteryStore.get(n.id);
      return !m || m.probabilityKnown < threshold;
    });
    
    for (const node of unacquiredNodes) {
      const prereqs = this.getPrerequisites(node.id);
      const allPrereqsMastered = prereqs.every(p => {
        const m = masteryStore.get(p);
        return m && m.probabilityKnown >= threshold;
      });

      if (allPrereqsMastered) {
        return node;
      }
    }

    // 3. Fallback: unacquired root nodes
    const rootNodes = unacquiredNodes.filter(n => this.getPrerequisites(n.id).length === 0);
    return rootNodes[0] || null;
  }

  /**
   * Records a response event and returns the updated cognitive state for a node.
   */
  public recordAttempt(
    prevState: CognitiveState | undefined,
    nodeId: string,
    isCorrect: boolean,
    nowMs: number = Date.now(),
    bktParams: BKTParameters = DEFAULT_BKT_PARAMS
  ): CognitiveState {
    return stepCognitiveState(prevState, nodeId, isCorrect, nowMs, bktParams);
  }
}

export function createStarterKnowledgeGraph(): KnowledgeGraph {
  const kg = new KnowledgeGraph();
  const starterNodes: SemanticNode[] = [
    { id: 'be_verb', type: 'grammar', titleVi: 'Động từ To-Be', coreMeaning: 'Trạng thái bản chất, nhận dạng chủ ngữ', acquisitionThreshold: 0.8 },
    { id: 'pronouns', type: 'grammar', titleVi: 'Đại từ nhân xưng', coreMeaning: 'Chủ ngữ I, You, He, She, We, They', acquisitionThreshold: 0.8 },
    { id: 'present_simple', type: 'grammar', titleVi: 'Hiện tại đơn', coreMeaning: 'Thói quen, sự thật hiển nhiên', acquisitionThreshold: 0.8 },
    { id: 'present_continuous', type: 'grammar', titleVi: 'Hiện tại tiếp diễn', coreMeaning: 'Hành động đang diễn ra', acquisitionThreshold: 0.8 },
    { id: 'survival_greetings', type: 'pragmatic', titleVi: 'Chào hỏi sinh tồn', coreMeaning: 'Mở lời tự nhiên, tránh dịch word-by-word', acquisitionThreshold: 0.8 },
    { id: 'polite_requests', type: 'pragmatic', titleVi: 'Yêu cầu lịch sự (Could/Would)', coreMeaning: 'Dùng I would like và Please thay vì I want', acquisitionThreshold: 0.8 },
    { id: 'phonology_stress', type: 'phonology', titleVi: 'Trọng âm từ & Ngữ điệu', coreMeaning: 'Nhấn âm tiết hạt nhân và ngữ điệu câu', acquisitionThreshold: 0.8 },
    { id: 'collocations_core', type: 'vocabulary', titleVi: 'Cụm từ cố định cốt lõi', coreMeaning: 'Tránh lỗi kết hợp từ L1', acquisitionThreshold: 0.8 }
  ];

  starterNodes.forEach(n => kg.addNode(n));
  kg.addEdge({ from: 'pronouns', to: 'be_verb', type: 'prerequisite', weight: 1.0 });
  kg.addEdge({ from: 'be_verb', to: 'present_simple', type: 'prerequisite', weight: 0.9 });
  kg.addEdge({ from: 'be_verb', to: 'present_continuous', type: 'prerequisite', weight: 1.0 });
  kg.addEdge({ from: 'present_simple', to: 'survival_greetings', type: 'reinforces', weight: 0.8 });
  kg.addEdge({ from: 'present_simple', to: 'polite_requests', type: 'prerequisite', weight: 0.9 });
  kg.addEdge({ from: 'survival_greetings', to: 'phonology_stress', type: 'reinforces', weight: 0.7 });
  kg.addEdge({ from: 'present_simple', to: 'collocations_core', type: 'reinforces', weight: 0.8 });

  return kg;
}

export const globalKnowledgeGraph = createStarterKnowledgeGraph();
