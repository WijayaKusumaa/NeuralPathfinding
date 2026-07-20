export interface GraphNode {
  id: number;
  position: [number, number, number];
  size?: number; // untuk custom scaling
}

export interface GraphEdge {
  id: string; // "from-to" format
  from: number;
  to: number;
  weight: number; // transmission cost
}

export interface AdjacencyElement {
  node: number;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Record<number, AdjacencyElement[]>;
  startNodeId: number;
  endNodeId: number;
  shortestPath: number[];
  shortestPathWeight: number;
}
