import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { KnowledgeGraph } from '../../src/curriculum/knowledgeGraph.ts';
import type { SemanticNode } from '../../src/curriculum/knowledgeGraph.ts';

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
    assert.deepStrictEqual(graph.getNode('A'), nodeA);
    assert.throws(() => graph.addNode(nodeA));
  });

  it('should build edges and find prerequisites correctly', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);

    // C requires B, B requires A
    graph.addEdge({ from: 'A', to: 'B', type: 'prerequisite', weight: 1 });
    graph.addEdge({ from: 'B', to: 'C', type: 'prerequisite', weight: 1 });

    const prereqsOfC = graph.getPrerequisites('C');
    assert.ok(prereqsOfC.includes('B'));
    assert.ok(prereqsOfC.includes('A')); // transitive prerequisite
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
    assert.strictEqual(nextNode?.id, 'A');
  });

  it('evaluateNextOptimalNode: should prioritize node whose FSRS memory retrievability has decayed over time', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);

    const now = Date.now();
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    const masteryStore = new Map([
      ['A', { probabilityKnown: 0.95, stability: 2.0, lastReviewedAt: tenDaysAgo }]
    ]);

    // 10 days elapsed with stability 2.0 will decay effective mastery below 0.8
    const nextNode = graph.evaluateNextOptimalNode(masteryStore, now);
    assert.strictEqual(nextNode?.id, 'A');
  });

  it('evaluateNextOptimalNode: should not suggest a node if its prerequisites are not met', () => {
    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addNode(nodeC);
    
    graph.addEdge({ from: 'A', to: 'B', type: 'prerequisite', weight: 1 });
    graph.addEdge({ from: 'B', to: 'C', type: 'prerequisite', weight: 1 });

    const masteryStore = new Map([
      ['A', { probabilityKnown: 0.9 }] // A is mastered.
    ]);

    const nextNode = graph.evaluateNextOptimalNode(masteryStore);
    // C cannot be learned because B is not mastered.
    // B CAN be learned because A is mastered.
    assert.strictEqual(nextNode?.id, 'B');
  });

  it('recordAttempt: should update Bayesian knowledge tracing state', () => {
    graph.addNode(nodeA);
    
    const state1 = graph.recordAttempt(undefined, 'A', true);
    assert.ok(state1.probabilityKnown > 0.15);
    
    const state2 = graph.recordAttempt(state1, 'A', true);
    assert.ok(state2.probabilityKnown > state1.probabilityKnown);
  });
});
