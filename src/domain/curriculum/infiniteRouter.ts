import { CollocationGraph } from './collocationGraph';
import type { CollocationNode } from './collocationGraph';
import { SRSAlgorithm } from './srsAlgorithm';

export interface RouteSession {
  sessionId: string;
  nodesToReview: CollocationNode[];
  newNodes: CollocationNode[];
}

export class InfiniteRouter {
  private graph: CollocationGraph;

  constructor(graph: CollocationGraph) {
    this.graph = graph;
  }

  /**
   * Generates a study session based on mathematically computed retrievability.
   * Total items per session usually limited (e.g. 10).
   */
  public generateSession(maxItems: number = 10, rThreshold: number = 0.85): RouteSession {
    const nodes = this.graph.getNodesForReview(Date.now(), rThreshold);
    
    const nodesToReview: CollocationNode[] = [];
    const newNodes: CollocationNode[] = [];

    for (const node of nodes) {
      if (nodesToReview.length + newNodes.length >= maxItems) break;

      if (!node.srsData) {
        newNodes.push(node);
      } else {
        nodesToReview.push(node);
      }
    }

    return {
      sessionId: `sess_${Date.now()}`,
      nodesToReview,
      newNodes
    };
  }

  /**
   * Handles user submission of a node review.
   * Mutates the graph node's SRS data.
   */
  public processReview(nodeId: string, dtwScore: number): void {
    const node = this.graph.getNode(nodeId);
    if (!node) return;

    node.srsData = SRSAlgorithm.review(node.srsData, dtwScore);
  }
}
