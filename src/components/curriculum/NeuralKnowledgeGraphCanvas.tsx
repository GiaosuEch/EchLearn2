import { useEffect, useRef, useState } from 'react';
import { globalKnowledgeGraph, type SemanticNode } from '../../curriculum/knowledgeGraph';
import { adaptiveEngine } from '../../services/adaptiveLearningEngine';
import { calculateRetrievability } from '../../curriculum/cognitiveModel';
import { Brain, ArrowRight, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface GraphNode extends SemanticNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  probabilityKnown: number;
  retrievability: number;
  status: 'mastered' | 'decaying' | 'frontier' | 'locked';
}

interface GraphEdge {
  from: string;
  to: string;
}

export function NeuralKnowledgeGraphCanvas({
  onSelectNode,
  className = ''
}: {
  onSelectNode?: (node: SemanticNode) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize nodes from globalKnowledgeGraph
  useEffect(() => {
    const rawNodes = globalKnowledgeGraph.getAllNodes();
    const masteryStore = adaptiveEngine.getFullMasteryStore();
    const now = Date.now();

    // Default positions in radial layout if empty
    const graphNodes: GraphNode[] = rawNodes.map((n: SemanticNode, idx: number) => {
      const angle = (idx / Math.max(rawNodes.length, 1)) * 2 * Math.PI;
      const radius = 180 + (idx % 3) * 70;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;

      const mastery = masteryStore.get(n.id);
      const p = mastery ? mastery.probabilityKnown : 0.15;
      const stability = (mastery as any)?.stability || 2.0;
      const lastReviewedAt = (mastery as any)?.lastReviewedAt || now;
      const elapsedDays = (now - lastReviewedAt) / (1000 * 60 * 60 * 24);
      const r = calculateRetrievability(stability, elapsedDays);

      let status: GraphNode['status'] = 'locked';
      if (p >= 0.8) {
        status = r < 0.75 ? 'decaying' : 'mastered';
      } else if (p > 0.3) {
        status = 'frontier';
      } else {
        status = 'locked';
      }

      return {
        ...n,
        x,
        y,
        vx: 0,
        vy: 0,
        probabilityKnown: p,
        retrievability: r,
        status
      };
    });

    // Collect edges
    const graphEdges: GraphEdge[] = [];
    rawNodes.forEach((n: SemanticNode) => {
      const prereqs = globalKnowledgeGraph.getPrerequisites(n.id);
      prereqs.forEach((pId: string) => {
        graphEdges.push({ from: pId, to: n.id });
      });
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
    if (graphNodes.length > 0) setSelectedNode(graphNodes[0]);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Dark futuristic neural background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Apply Pan & Zoom
      ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-400, -300);

      // Draw Edges (Neural Synapse Lines)
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return;

        ctx.strokeStyle = fromNode.status === 'mastered' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(51, 65, 85, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Pulsing particle along edge
        const particleTime = (Date.now() % 2000) / 2000;
        const px = fromNode.x + (toNode.x - fromNode.x) * particleTime;
        const py = fromNode.y + (toNode.y - fromNode.y) * particleTime;

        ctx.fillStyle = fromNode.status === 'mastered' ? '#34d399' : '#64748b';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;

        // Node Glow
        ctx.shadowBlur = isSelected ? 20 : 8;
        if (node.status === 'mastered') {
          ctx.fillStyle = '#10b981'; // Emerald
          ctx.shadowColor = '#10b981';
        } else if (node.status === 'decaying') {
          ctx.fillStyle = '#f59e0b'; // Amber (memory decaying)
          ctx.shadowColor = '#f59e0b';
        } else if (node.status === 'frontier') {
          ctx.fillStyle = '#06b6d4'; // Cyan
          ctx.shadowColor = '#06b6d4';
        } else {
          ctx.fillStyle = '#334155'; // Slate
          ctx.shadowColor = '#334155';
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 22 : 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Border Ring
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = isSelected ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.titleVi.slice(0, 16), node.x, node.y + 32);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [nodes, edges, selectedNode, zoom, pan]);

  // Click on Canvas to Select Node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coord to graph world coord
    const worldX = (clickX - (canvas.width / 2 + pan.x)) / zoom + 400;
    const worldY = (clickY - (canvas.height / 2 + pan.y)) / zoom + 300;

    for (const node of nodes) {
      const dist = Math.hypot(node.x - worldX, node.y - worldY);
      if (dist <= 25) {
        setSelectedNode(node);
        if (onSelectNode) onSelectNode(node);
        return;
      }
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Top HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 pointer-events-auto">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Neural Cognitive DAG
            </h3>
            <p className="text-[10px] text-slate-400">
              {nodes.length} Synaptic Nodes • Bayesian Traced
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 pointer-events-auto">
          <button 
            onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
            aria-label="Zoom in graph"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
            aria-label="Zoom out graph"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
            aria-label="Reset graph view"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onClick={handleCanvasClick}
        onMouseDown={e => {
          isDraggingRef.current = true;
          dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        }}
        onMouseMove={e => {
          if (!isDraggingRef.current) return;
          setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
        }}
        onMouseUp={() => { isDraggingRef.current = false; }}
        onMouseLeave={() => { isDraggingRef.current = false; }}
        className="w-full h-[500px] cursor-grab active:cursor-grabbing block"
      />

      {/* Node Inspection Card (Bottom Overlay) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-10 p-5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedNode.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedNode.status === 'decaying' ? 'bg-amber-500/20 text-amber-400' :
                selectedNode.status === 'frontier' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {selectedNode.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-medium">Type: {selectedNode.type}</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-100">{selectedNode.titleVi}</h4>
            <p className="text-xs text-slate-400 line-clamp-1">{selectedNode.coreMeaning}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">BKT Mastery</span>
              <span className="text-sm font-black text-emerald-400">
                {Math.round(selectedNode.probabilityKnown * 100)}%
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Retrievability</span>
              <span className={`text-sm font-black ${selectedNode.retrievability < 0.8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {Math.round(selectedNode.retrievability * 100)}%
              </span>
            </div>
            <a
              href={`/app/practice`}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Luyện nút này <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
