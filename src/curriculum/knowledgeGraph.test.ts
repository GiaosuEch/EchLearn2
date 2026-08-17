import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeGraph } from './knowledgeGraph';
import type { SemanticNode } from './knowledgeGraph';

describe('KnowledgeGraph', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = new KnowledgeGraph();
  });

  const nodeA: SemanticNode = { id: 'A', type: 'vocabulary', titleVi: 'A', coreMeaning: 'A', acquisitionThreshold: 0.8 };
  const nodeB: SemanticNode = { id: 'B', type: 'vocabulary', titleVi: 'B', coreMeaning: 'B', acquisitionThreshold: 0.8 };
  const nodeC: SemanticNode = { id: 'C', type: 'vocabulary', titleVi: 'C', coreMeaning: 'C', acquisitionThreshold: 0.8 };

  it('should add nodes and retrieve them', () => {
    graph.addNode(nodeA);
    expect(graph.getNode('A')).toEqual(nodeA);
    expect(() => graph.addNode(nodeA)).toThrowError();
  });

  it('should build edges and find prerequisites correctly', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);

    // C requires B, B requires A
    graph.addEdge({ from: 'A', to: 'B', type: 'prerequisite', weight: 1 });
    graph.addEdge({ from: 'B', to: 'C', type: 'prerequisite', weight: 1 });

    const prereqsOfC = graph.getPrerequisites('C');
    expect(prereqsOfC).toContain('B');
    expect(prereqsOfC).toContain('A'); // transitive prerequisite
  });

  it('evaluateNextOptimalNode: should prioritize decayed nodes over new nodes', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    
    // A and B have no prereqs.
    // A was learned but decayed to 0.7. B is completely new.
    const masteryStore = new Map([
      ['A', { probabilityKnown: 0.7 }]
    ]);

    const nextNode = graph.evaluateNextOptimalNode(masteryStore);
    // Since A decayed (< 0.8), it must be prioritized for review before learning new B
    expect(nextNode?.id).toBe('A');
  });

  it('evaluateNextOptimalNode: should not suggest a node if its prerequisites are not met', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);
    
    graph.addEdge({ from: 'A', to: 'B', type: 'prerequisite', weight: 1 });
    graph.addEdge({ from: 'B', to: 'C', type: 'prerequisite', weight: 1 });

    const masteryStore = new Map([
      ['A', { probabilityKnown: 0.9 }] // A is mastered.
      // B is not learned yet.
    ]);

    const nextNode = graph.evaluateNextOptimalNode(masteryStore);
    // C cannot be learned because B is not mastered.
    // B CAN be learned because A is mastered.
    expect(nextNode?.id).toBe('B');
  });

  it('evaluateNextOptimalNode: should suggest fallback root nodes if no prerequisites are met and nothing decayed', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);
    
    graph.addEdge({ from: 'B', to: 'C', type: 'prerequisite', weight: 1 });

    const masteryStore = new Map();
    // B has no prereqs, A has no prereqs. A is first root node.
    
    const nextNode = graph.evaluateNextOptimalNode(masteryStore);
    expect(['A', 'B']).toContain(nextNode?.id);
  });
});
