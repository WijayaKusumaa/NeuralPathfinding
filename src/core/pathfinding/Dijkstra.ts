import type { AdjacencyElement } from '../graph/GraphTypes';

export interface DijkstraResult {
  path: number[];
  distance: number;
}

export function findShortestPath(
  adjacencyList: Record<number, AdjacencyElement[]>,
  startNode: number,
  endNode: number
): DijkstraResult {
  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const nodes = Object.keys(adjacencyList).map(Number);

  // Initialize
  for (const node of nodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;

  // Simple Priority Queue / Set
  const unvisited = new Set<number>(nodes);

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let minNode: number | null = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        minNode = node;
      }
    }

    if (minNode === null || minNode === endNode) {
      break; // Destination reached or unreachable
    }

    unvisited.delete(minNode);

    const neighbors = adjacencyList[minNode] || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.node)) continue;

      const alt = distances[minNode] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = minNode;
      }
    }
  }

  // Reconstruct path
  const path: number[] = [];
  let current: number | null = endNode;

  if (previous[current] !== null || current === startNode) {
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
  }

  return {
    path: path.length > 0 && path[0] === startNode ? path : [],
    distance: distances[endNode] === Infinity ? -1 : distances[endNode],
  };
}
