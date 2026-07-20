import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useFrame, useThree } from '@react-three/fiber';
import { AudioManager } from '../../core/audio/AudioManager';

export function NodeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hitMeshRef = useRef<THREE.InstancedMesh>(null);
  const { size } = useThree();
  const aspect = size.width / size.height;
  const mobileScaleMultiplier = aspect < 1.0 ? 1.6 : 1.0;
  
  const graph = useGameStore((state) => state.graph);
  const selectedPath = useGameStore((state) => state.selectedPath);
  const showHint = useGameStore((state) => state.showHint);
  const nodeScale = useGameStore((state) => state.nodeScale);
  const colorblindMode = useGameStore((state) => state.colorblindMode);
  const selectNode = useGameStore((state) => state.selectNode);

  const hoverIdRef = useRef<number | null>(null);

  // Colors based on game settings
  const colorPalette = {
    start: new THREE.Color(colorblindMode ? '#009E73' : '#10b981'), // Green
    end: new THREE.Color(colorblindMode ? '#D55E00' : '#f43f5e'),   // Red/Orange
    selected: new THREE.Color(colorblindMode ? '#0072B2' : '#06b6d4'), // Cyan
    hint: new THREE.Color('#a855f7'), // Purple
    default: new THREE.Color('#334155'), // Slate 700
    hover: new THREE.Color('#ffffff'), // White
  };

  const updateInstances = () => {
    const mesh = meshRef.current;
    const hitMesh = hitMeshRef.current;
    if (!mesh || !hitMesh || !graph) return;

    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();

    graph.nodes.forEach((node, i) => {
      // Position
      tempObject.position.set(node.position[0], node.position[1], node.position[2]);

      // Scale based on type and hover state
      let scaleMultiplier = nodeScale * mobileScaleMultiplier;
      const isStart = node.id === graph.startNodeId;
      const isEnd = node.id === graph.endNodeId;
      const isSelected = selectedPath.includes(node.id);
      const isHint = showHint && graph.shortestPath.includes(node.id);
      const isHovered = hoverIdRef.current === node.id;

      if (isStart || isEnd) {
        scaleMultiplier *= 1.4;
      } else if (isSelected) {
        scaleMultiplier *= 1.25;
      } else if (isHovered) {
        scaleMultiplier *= 1.2;
      }

      tempObject.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
      tempObject.updateMatrix();

      // Set matrix for both visible and invisible hitmesh
      mesh.setMatrixAt(i, tempObject.matrix);
      hitMesh.setMatrixAt(i, tempObject.matrix);

      // Color selection
      if (isStart) {
        tempColor.copy(colorPalette.start);
      } else if (isEnd) {
        tempColor.copy(colorPalette.end);
      } else if (isHovered) {
        tempColor.copy(colorPalette.hover);
      } else if (isSelected) {
        tempColor.copy(colorPalette.selected);
      } else if (isHint) {
        tempColor.copy(colorPalette.hint);
      } else {
        tempColor.copy(colorPalette.default);
      }

      mesh.setColorAt(i, tempColor);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    
    hitMesh.instanceMatrix.needsUpdate = true;
  };

  // Update whenever graph, selectedPath, hint mode, scale, or colorblindMode changes
  useEffect(() => {
    updateInstances();
  }, [graph, selectedPath, showHint, nodeScale, colorblindMode]);

  // Keep a pulse effect for selected/start/end nodes
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !graph) return;

    const time = clock.getElapsedTime();
    const pulse = 1 + Math.sin(time * 6) * 0.08; // pulse factor

    const tempObject = new THREE.Object3D();
    const tempMatrix = new THREE.Matrix4();

    graph.nodes.forEach((node, i) => {
      const isStart = node.id === graph.startNodeId;
      const isEnd = node.id === graph.endNodeId;
      const isSelected = selectedPath.includes(node.id);

      if (isStart || isEnd || isSelected) {
        mesh.getMatrixAt(i, tempMatrix);
        tempObject.position.set(node.position[0], node.position[1], node.position[2]);
        
        let scale = nodeScale * mobileScaleMultiplier * (isStart || isEnd ? 1.4 : 1.25);
        // apply pulse
        scale *= pulse;
        
        tempObject.scale.set(scale, scale, scale);
        tempObject.updateMatrix();
        mesh.setMatrixAt(i, tempObject.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!graph) return null;

  return (
    <>
      {/* Visual Mesh: Small, elegant nodes */}
      <instancedMesh
        ref={meshRef}
        args={[null as any, null as any, graph.nodes.length]}
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          console.log("meshRef onClick triggered, instanceId:", e.instanceId);
          if (e.instanceId !== undefined && graph) {
            const node = graph.nodes[e.instanceId];
            if (node) {
              selectNode(node.id);
            }
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && graph) {
            const node = graph.nodes[e.instanceId];
            if (node) {
              if (hoverIdRef.current !== node.id) {
                AudioManager.playNodeHover();
              }
              hoverIdRef.current = node.id;
              updateInstances();
            }
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hoverIdRef.current = null;
          updateInstances();
        }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          roughness={0.2}
          metalness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.08}
        />
      </instancedMesh>

      {/* Collision Mesh: Large, invisible nodes for easy tapping on mobile */}
      <instancedMesh
        ref={hitMeshRef}
        args={[null as any, null as any, graph.nodes.length]}
        onClick={(e) => {
          e.stopPropagation();
          console.log("hitMeshRef onClick triggered, instanceId:", e.instanceId);
          if (e.instanceId !== undefined && graph) {
            const node = graph.nodes[e.instanceId];
            if (node) {
              selectNode(node.id);
            }
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && graph) {
            const node = graph.nodes[e.instanceId];
            if (node) {
              if (hoverIdRef.current !== node.id) {
                AudioManager.playNodeHover();
              }
              hoverIdRef.current = node.id;
              updateInstances();
            }
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hoverIdRef.current = null;
          updateInstances();
        }}
      >
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0.0}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
export default NodeMesh;
