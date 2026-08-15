import React, { useState, useEffect } from 'react';
import PageShell from '../PageShell';
import { InfiniteRouter, type RouteSession } from '../../domain/curriculum/infiniteRouter';
import { CollocationGraph, initializeCoreCollocations } from '../../domain/curriculum/collocationGraph';
import { usePronunciationChallenge } from '../../hooks/usePronunciationChallenge';
import { StrictWritingInput } from '../../components/immersion/StrictWritingInput';
import { MemoryDecayChart } from '../../components/curriculum/MemoryDecayChart';
import { GitMerge } from 'lucide-react';

export const InfinityIntegrationPage: React.FC = () => {
  const [graph] = useState(() => {
    const g = new CollocationGraph();
    initializeCoreCollocations(g);
    // Artificially lower R for one node to simulate decay
    const node = g.getNode('make_decision');
    if (node) {
      node.srsData = {
        stability: 1.5,
        retrievability: 0.8, // Needs review
        lastReview: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
        reviewCount: 2
      };
    }
    return g;
  });

  const [router] = useState(() => new InfiniteRouter(graph));
  const [session, setSession] = useState<RouteSession | null>(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  useEffect(() => {
    // Generate an infinite route session on mount
    const newSession = router.generateSession(5); // 5 items
    setSession(newSession);
  }, [router]);

  const activeNode = session?.nodesToReview[currentNodeIndex] || session?.newNodes[currentNodeIndex - (session?.nodesToReview.length || 0)];
  
  const handleScoreEvaluated = (score: number) => {
    if (activeNode) {
      router.processReview(activeNode.id, score);
    }
  };

  const { isRecording, startRecording, stopRecordingAndEvaluate, result } = usePronunciationChallenge(
    activeNode?.id || '',
    activeNode?.phrase || '',
    handleScoreEvaluated
  );

  const handleNext = () => {
    if (session && currentNodeIndex < session.nodesToReview.length + session.newNodes.length - 1) {
      setCurrentNodeIndex(prev => prev + 1);
    } else {
      // Re-generate session
      setSession(router.generateSession(5));
      setCurrentNodeIndex(0);
    }
  };

  if (!session || !activeNode) return <PageShell title="Loading Route..." />;

  // Get current graph state for the Memory Chart to show live updates
  const srsDataList = Array.from((graph as any).nodes.values())
    .filter((n: any) => n.srsData)
    .map((n: any) => ({
      id: n.id,
      phrase: n.phrase,
      data: n.srsData!
    }));

  return (
    <PageShell 
      title="Giai đoạn 3: Hợp nhất Bản thể" 
      description="Bài kiểm tra (Quiz) sinh động từ thuật toán Infinite Routing, kết hợp AST & DSP."
      icon={<GitMerge />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Active Challenge */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-400">Node: {activeNode.id}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                Difficulty: {activeNode.difficulty}/10
              </span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2">{activeNode.phrase}</h2>
            <p className="text-gray-500 mb-8 italic">"{activeNode.translations.vi}"</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Audio DSP Challenge */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <h3 className="font-semibold text-slate-700 mb-4">1. Đọc Chuẩn (DTW)</h3>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecordingAndEvaluate}
                  onMouseLeave={isRecording ? stopRecordingAndEvaluate : undefined}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecordingAndEvaluate}
                  className={`
                    w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-200 shadow-md
                    ${isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-green-600 hover:bg-green-700'}
                  `}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                {result && !result.isProcessing && (
                  <p className="mt-4 font-mono font-bold" style={{ color: result.score > 80 ? 'green' : 'red' }}>
                    Score: {result.score}%
                  </p>
                )}
              </div>

              {/* AST Grammar Challenge */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4 text-center">2. Viết Chuẩn (AST)</h3>
                <StrictWritingInput 
                  nodeId={activeNode.id} 
                  expectedPhrase={activeNode.phrase}
                  onSubmitSuccess={handleNext}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Live SRS Graph updates */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <MemoryDecayChart srsDataList={srsDataList} />
          </div>
        </div>

      </div>
    </PageShell>
  );
};

export default InfinityIntegrationPage;
