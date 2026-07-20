import type { WorkerRequest } from './workerTypes';
import { generateProceduralGraph } from '../core/graph/GraphGenerator';
import { findShortestPath } from '../core/pathfinding/Dijkstra';

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;
  if (!data) return;

  switch (data.type) {
    case 'GENERATE_GRAPH': {
      const graph = generateProceduralGraph(data.numNodes);
      self.postMessage({ type: 'GRAPH_GENERATED', graph });
      break;
    }
    case 'SOLVE_PATH': {
      const { path, distance } = findShortestPath(data.adjacencyList, data.startNode, data.endNode);
      self.postMessage({ type: 'PATH_SOLVED', path, distance });
      break;
    }
  }
});
export {};
