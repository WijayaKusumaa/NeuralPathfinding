import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useGameStore((state) => state.graph);
  const selectedPath = useGameStore((state) => state.selectedPath);
  const showHint = useGameStore((state) => state.showHint);
  const colorblindMode = useGameStore((state) => state.colorblindMode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // Map 3D coordinate (X: -10 to 10, Y: -6 to 6) to Canvas space
    const project = (x: number, y: number): [number, number] => {
      // pad slightly so edges are not cut off
      const padding = 10;
      const px = padding + ((x + 10) / 20) * (width - 2 * padding);
      const py = padding + (1 - (y + 6) / 12) * (height - 2 * padding);
      return [px, py];
    };

    // Color definitions
    const cDefaultEdge = '#334155';
    const cPlayerEdge = colorblindMode ? '#0072B2' : '#00f0ff';
    const cHintEdge = '#d946ef';

    // Draw Edges
    graph.edges.forEach((edge) => {
      const nodeFrom = graph.nodes.find((n) => n.id === edge.from);
      const nodeTo = graph.nodes.find((n) => n.id === edge.to);
      if (!nodeFrom || !nodeTo) return;

      const [x1, y1] = project(nodeFrom.position[0], nodeFrom.position[1]);
      const [x2, y2] = project(nodeTo.position[0], nodeTo.position[1]);

      // Check edge status
      const isPlayer =
        selectedPath.indexOf(edge.from) !== -1 &&
        selectedPath.indexOf(edge.to) !== -1 &&
        Math.abs(selectedPath.indexOf(edge.from) - selectedPath.indexOf(edge.to)) === 1;

      const isHint =
        showHint &&
        graph.shortestPath.indexOf(edge.from) !== -1 &&
        graph.shortestPath.indexOf(edge.to) !== -1 &&
        Math.abs(graph.shortestPath.indexOf(edge.from) - graph.shortestPath.indexOf(edge.to)) === 1;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = isPlayer ? 2 : isHint ? 1.5 : 0.8;
      ctx.strokeStyle = isPlayer ? cPlayerEdge : isHint ? cHintEdge : cDefaultEdge;
      ctx.stroke();
    });

    // Draw Nodes
    graph.nodes.forEach((node) => {
      const [x, y] = project(node.position[0], node.position[1]);

      const isStart = node.id === graph.startNodeId;
      const isEnd = node.id === graph.endNodeId;
      const isSelected = selectedPath.includes(node.id);

      ctx.beginPath();
      ctx.arc(x, y, isStart || isEnd ? 4 : isSelected ? 3 : 2, 0, 2 * Math.PI);
      
      if (isStart) {
        ctx.fillStyle = colorblindMode ? '#009E73' : '#10b981';
      } else if (isEnd) {
        ctx.fillStyle = colorblindMode ? '#D55E00' : '#f43f5e';
      } else if (isSelected) {
        ctx.fillStyle = cPlayerEdge;
      } else {
        ctx.fillStyle = '#64748b';
      }
      
      ctx.fill();

      // Simple highlight border for start/end
      if (isStart || isEnd) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  }, [graph, selectedPath, showHint, colorblindMode]);

  if (!graph) return null;

  return (
    <div className="absolute bottom-4 right-4 p-1.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md overflow-hidden hidden md:block">
      <div className="text-[10px] text-cyan-400/70 font-mono tracking-wider mb-1 uppercase text-center">
        Topology Map
      </div>
      <canvas
        ref={canvasRef}
        width={150}
        height={90}
        className="rounded-lg border border-white/5 opacity-80"
      />
    </div>
  );
}
export default Minimap;
