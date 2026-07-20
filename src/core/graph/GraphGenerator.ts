import type { Graph, GraphNode, GraphEdge, AdjacencyElement } from './GraphTypes';
import { findShortestPath } from '../pathfinding/Dijkstra';

// Helper to calculate distance in 3D
function getDistance(p1: [number, number, number], p2: [number, number, number]): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function generateProceduralGraph(numNodes: number): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const adjacencyList: Record<number, AdjacencyElement[]> = {};

  // 1. Position Nodes
  // We want to distribute nodes from left (Start) to right (End)
  // Bounding box size: X: [-10, 10], Y: [-6, 6], Z: [-5, 5]
  const startPos: [number, number, number] = [-9, 0, 0];
  const endPos: [number, number, number] = [9, 0, 0];

  nodes.push({ id: 0, position: startPos });

  // Distribute intermediate nodes
  const minDistance = Math.max(1.2, 15 / Math.sqrt(numNodes)); // scaling min distance by density

  for (let i = 1; i < numNodes - 1; i++) {
    let position: [number, number, number] = [0, 0, 0];
    let attempts = 0;
    let valid = false;

    // We can distribute them in columns along X to ensure progression
    const progress = i / (numNodes - 1);
    const targetX = -8 + progress * 16;

    while (!valid && attempts < 50) {
      // Add some jitter to X, Y, Z
      const x = targetX + (Math.random() - 0.5) * (16 / (numNodes / 5));
      const y = (Math.random() - 0.5) * 11;
      const z = (Math.random() - 0.5) * 8;
      position = [x, y, z];

      // Check distance to all existing nodes
      valid = true;
      for (const node of nodes) {
        if (getDistance(position, node.position) < minDistance) {
          valid = false;
          break;
        }
      }
      attempts++;
    }

    nodes.push({ id: i, position });
  }

  nodes.push({ id: numNodes - 1, position: endPos });

  // Initialize adjacency list
  for (let i = 0; i < numNodes; i++) {
    adjacencyList[i] = [];
  }

  // Helper to add edge
  const addEdge = (from: number, to: number) => {
    const key = from < to ? `${from}-${to}` : `${to}-${from}`;
    if (edges.some((e) => e.id === key)) return;

    const dist = getDistance(nodes[from].position, nodes[to].position);
    // Weight is transmission cost: distance + random variance (dynamic weight)
    const weight = Math.round(dist * (1 + Math.random() * 0.8) * 10) / 10;

    edges.push({ id: key, from, to, weight });
    adjacencyList[from].push({ node: to, weight });
    adjacencyList[to].push({ node: from, weight });
  };

  // 2. Connect Nodes
  // Guarantee at least one direct path by chain-connecting a backbone path from Start to End
  const backboneLength = Math.min(10, Math.max(3, Math.floor(Math.sqrt(numNodes))));
  const backboneIndices: number[] = [0];
  
  // Choose random intermediate nodes that progress from left to right
  for (let j = 1; j < backboneLength - 1; j++) {
    const minIdx = Math.floor((j / (backboneLength - 1)) * numNodes * 0.8);
    const maxIdx = Math.floor(((j + 1) / (backboneLength - 1)) * numNodes * 0.9);
    let chosen = Math.floor(minIdx + Math.random() * (maxIdx - minIdx));
    if (chosen <= 0) chosen = 1;
    if (chosen >= numNodes - 1) chosen = numNodes - 2;
    if (!backboneIndices.includes(chosen)) {
      backboneIndices.push(chosen);
    }
  }
  backboneIndices.push(numNodes - 1);
  backboneIndices.sort((a, b) => nodes[a].position[0] - nodes[b].position[0]);

  // Connect the backbone
  for (let i = 0; i < backboneIndices.length - 1; i++) {
    addEdge(backboneIndices[i], backboneIndices[i + 1]);
  }

  // Connect other nodes to their nearest neighbors
  // For larger graphs, limit search to keep it fast
  const kNeighbors = numNodes > 200 ? 3 : 4;
  
  for (let i = 0; i < numNodes; i++) {
    const dists = nodes
      .map((n) => ({ id: n.id, dist: getDistance(nodes[i].position, n.position) }))
      .filter((d) => d.id !== i)
      .sort((a, b) => a.dist - b.dist);

    // Connect to the nearest k neighbors
    let connectionsMade = 0;
    for (const d of dists) {
      if (connectionsMade >= kNeighbors) break;
      // Limit edge length to avoid long intersecting lines
      if (d.dist < 8.0) {
        addEdge(i, d.id);
        connectionsMade++;
      }
    }
  }

  // 3. Solve shortest path using Dijkstra
  const startNodeId = 0;
  const endNodeId = numNodes - 1;
  const result = findShortestPath(adjacencyList, startNodeId, endNodeId);

  return {
    nodes,
    edges,
    adjacencyList,
    startNodeId,
    endNodeId,
    shortestPath: result.path,
    shortestPathWeight: result.distance,
  };
}
