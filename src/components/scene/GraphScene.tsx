import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import NodeMesh from './NodeMesh';
import EdgeLines from './EdgeLines';
import PostFX from './PostFX';
import { useGameStore } from '../../store/gameStore';

function CameraController() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1.0) {
      // Portrait / Mobile: move camera further back so the whole horizontal graph fits
      const targetZ = Math.max(14, Math.min(32, 14 / (aspect * 0.85)));
      camera.position.set(0, 0, targetZ);
    } else {
      // Landscape / Desktop: default camera position
      camera.position.set(0, 0, 14);
    }
    camera.updateProjectionMatrix();
  }, [size.width, size.height, camera]);

  return null;
}

function InteractiveControls() {
  const { size } = useThree();
  const aspect = size.width / size.height;

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={4}
      maxDistance={aspect < 1.0 ? 45 : 22}
      maxPolarAngle={Math.PI / 2 + 0.2}
      minPolarAngle={Math.PI / 6}
      makeDefault
    />
  );
}

export function GraphScene() {
  const isGenerating = useGameStore((state) => state.isGenerating);

  return (
    <div className="relative w-full h-full bg-[#0b0c10]">
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Spinning Loader */}
            <div className="absolute w-full h-full border-4 border-t-cyan-glow border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute w-12 h-12 border-4 border-b-magenta-glow border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin duration-700"></div>
          </div>
          <span className="mt-6 text-lg font-medium tracking-widest text-cyan-400 font-display animate-pulse-glow">
            CALCULATING SYNAPSE TOPOLOGY...
          </span>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 14], fov: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraController />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={1} castShadow />

        <NodeMesh />
        <EdgeLines />
        <PostFX />

        <InteractiveControls />
      </Canvas>
    </div>
  );
}
export default GraphScene;
