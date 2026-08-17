/**
 * Generative Linguistic Architecture - Knowledge Graph Foundation
 * 
 * This module replaces linear curriculum sequencing with a Directed Acyclic Graph (DAG).
 * It enables adaptive learning paths, cognitive tracing, and semantic evaluation.
 */

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

  /**
   * Performs a topological sort or BFS to find all prerequisites required before learning a target node.
   * Returns a list of node IDs.
   */
  public getPrerequisites(targetId: NodeId): NodeId[] {
    if (!this.nodes.has(targetId)) return [];

    const prerequisites = new Set<NodeId>();
    const queue: NodeId[] = [targetId];
    
    // Reverse BFS to find all dependencies pointing TO the target
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
   * If an acquired node drops below the mastery threshold, it is prioritized for review.
   */
  public evaluateNextOptimalNode(
    masteryStore: Map<string, { probabilityKnown: number }>
  ): SemanticNode | null {
    const threshold = 0.8; // 80% mastery required

    // First priority: Decay/Forgetting (nodes previously learned but mastery dropped)
    for (const node of this.nodes.values()) {
      const mastery = masteryStore.get(node.id);
      if (mastery && mastery.probabilityKnown < threshold) {
        return node;
      }
    }

    // Second priority: New nodes where all prerequisites have high mastery
    const unacquiredNodes = Array.from(this.nodes.values()).filter(n => !masteryStore.has(n.id) || masteryStore.get(n.id)!.probabilityKnown < threshold);
    
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

    // Fallback: If nothing is fully mastered, return the root nodes (no prereqs) that are unacquired
    const rootNodes = unacquiredNodes.filter(n => this.getPrerequisites(n.id).length === 0);
    return rootNodes[0] || null;
  }
}
