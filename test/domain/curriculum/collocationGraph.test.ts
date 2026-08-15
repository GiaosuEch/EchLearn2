import { describe, it, expect, beforeEach } from 'vitest';
import { CollocationGraph } from '../../../src/domain/curriculum/collocationGraph';

describe('CollocationGraph', () => {
  let graph: CollocationGraph;

  beforeEach(() => {
    graph = new CollocationGraph();
    
    // Add sample nodes
    graph.addNode({
      id: 'make_decision',
      phrase: 'make a decision',
      type: 'verb-noun',
      translations: { vi: 'đưa ra quyết định' },
      difficulty: 3,
      examples: []
    });
    
    graph.addNode({
      id: 'take_action',
      phrase: 'take action',
      type: 'verb-noun',
      translations: { vi: 'hành động' },
      difficulty: 3,
      examples: []
    });

    graph.addNode({
      id: 'take_steps',
      phrase: 'take steps',
      type: 'verb-noun',
      translations: { vi: 'tiến hành các bước' },
      difficulty: 4,
      examples: []
    });
  });

  it('adds and retrieves nodes correctly', () => {
    const node = graph.getNode('make_decision');
    expect(node).toBeDefined();
    expect(node?.phrase).toBe('make a decision');
  });

  it('adds edges and finds related nodes', () => {
    graph.addEdge({
      from: 'make_decision',
      to: 'take_action',
      relation: 'related',
      weight: 1
    });

    const related = graph.getRelated('make_decision');
    expect(related.length).toBe(1);
    expect(related[0].id).toBe('take_action');
  });

  it('finds path between nodes via BFS', () => {
    graph.addEdge({
      from: 'make_decision',
      to: 'take_action',
      relation: 'related',
      weight: 1
    });

    graph.addEdge({
      from: 'take_action',
      to: 'take_steps',
      relation: 'synonym',
      weight: 1
    });

    const path = graph.findPath('make_decision', 'take_steps');
    expect(path).toBeDefined();
    expect(path?.length).toBe(3); // make_decision -> take_action -> take_steps
    expect(path?.[0].id).toBe('make_decision');
    expect(path?.[1].id).toBe('take_action');
    expect(path?.[2].id).toBe('take_steps');
  });

  it('returns null when path does not exist', () => {
    const path = graph.findPath('make_decision', 'take_steps');
    expect(path).toBeNull();
  });
});
