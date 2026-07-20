import type { Graph, AdjacencyElement } from '../core/graph/GraphTypes';

export type WorkerRequest =
  | { type: 'GENERATE_GRAPH'; numNodes: number }
  | { type: 'SOLVE_PATH'; adjacencyList: Record<number, AdjacencyElement[]>; startNode: number; endNode: number };

export type WorkerResponse =
  | { type: 'GRAPH_GENERATED'; graph: Graph }
  | { type: 'PATH_SOLVED'; path: number[]; distance: number };
