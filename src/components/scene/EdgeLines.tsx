import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export function EdgeLines() {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const graph = useGameStore((state) => state.graph);
  const selectedPath = useGameStore((state) => state.selectedPath);
  const showHint = useGameStore((state) => state.showHint);
  const colorblindMode = useGameStore((state) => state.colorblindMode);

  // Parse path relationships for quick lookup
  const playerEdges = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < selectedPath.length - 1; i++) {
      const u = selectedPath[i];
      const v = selectedPath[i + 1];
      set.add(u < v ? `${u}-${v}` : `${v}-${u}`);
    }
    return set;
  }, [selectedPath]);

  const hintEdges = useMemo(() => {
    const set = new Set<string>();
    if (!showHint || !graph) return set;
    for (let i = 0; i < graph.shortestPath.length - 1; i++) {
      const u = graph.shortestPath[i];
      const v = graph.shortestPath[i + 1];
      set.add(u < v ? `${u}-${v}` : `${v}-${u}`);
    }
    return set;
  }, [showHint, graph]);

  // Color constants
  const cPlayer = colorblindMode ? new THREE.Color('#0072B2') : new THREE.Color('#00f0ff'); // bright cyan
  const cHint = new THREE.Color('#d946ef'); // bright magenta/purple
  const cLowWeight = new THREE.Color('#334155'); // dim slate
  const cHighWeight = new THREE.Color('#94a3b8'); // bright slate

  // Re-generate positions and colors buffers when graph or selection changes
  const { positions, colors } = useMemo(() => {
    if (!graph) return { positions: new Float32Array(0), colors: new Float32Array(0) };

    const posArray: number[] = [];
    const colArray: number[] = [];

    // Find max edge weight for normalization
    let maxWeight = 1;
    graph.edges.forEach((e) => {
      if (e.weight > maxWeight) maxWeight = e.weight;
    });

    graph.edges.forEach((edge) => {
      const nodeFrom = graph.nodes.find((n) => n.id === edge.from);
      const nodeTo = graph.nodes.find((n) => n.id === edge.to);

      if (!nodeFrom || !nodeTo) return;

      // Add segment positions
      posArray.push(...nodeFrom.position);
      posArray.push(...nodeTo.position);

      // Determine segment color
      const edgeKey = edge.from < edge.to ? `${edge.from}-${edge.to}` : `${edge.to}-${edge.from}`;
      
      let color = new THREE.Color();
      if (playerEdges.has(edgeKey)) {
        color.copy(cPlayer);
      } else if (hintEdges.has(edgeKey)) {
        color.copy(cHint);
      } else {
        // Interp based on weight
        const t = edge.weight / maxWeight;
        color.copy(cLowWeight).lerp(cHighWeight, t);
      }

      colArray.push(color.r, color.g, color.b);
      colArray.push(color.r, color.g, color.b);
    });

    return {
      positions: new Float32Array(posArray),
      colors: new Float32Array(colArray),
    };
  }, [graph, playerEdges, hintEdges, colorblindMode]);

  useEffect(() => {
    if (geomRef.current) {
      geomRef.current.attributes.position.needsUpdate = true;
      geomRef.current.attributes.color.needsUpdate = true;
    }
  }, [positions, colors]);

  if (!graph || positions.length === 0) return null;

  return (
    <lineSegments castShadow receiveShadow>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.8}
        linewidth={1} // Note: linewidth > 1 is not supported by WebGL implementations in standard lines
      />
    </lineSegments>
  );
}
export default EdgeLines;
