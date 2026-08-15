import React from 'react';
import PageShell from '../PageShell';
import { SyntaxPlayground } from '../../components/immersion/SyntaxPlayground';
import { PronunciationArena } from '../../components/immersion/PronunciationArena';
import { MemoryDecayChart } from '../../components/curriculum/MemoryDecayChart';
import type { SRSData } from '../../domain/curriculum/srsAlgorithm';
import { Network } from 'lucide-react';

const InfinityDemoPage: React.FC = () => {
  // Mock SRS data for demonstration of the decay charts
  const mockSrsDataList: { id: string; phrase: string; data: SRSData }[] = [
    {
      id: 'make_decision',
      phrase: 'make a decision',
      data: {
        stability: 3.5, // 3.5 days stability
        retrievability: 1.0,
        lastReview: Date.now() - 1000 * 60 * 60 * 24 * 0.5, // 12 hours ago
        reviewCount: 3,
      }
    },
    {
      id: 'take_action',
      phrase: 'take action',
      data: {
        stability: 1.2, // 1.2 days stability
        retrievability: 1.0,
        lastReview: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
        reviewCount: 1,
      }
    },
    {
      id: 'highly_recommend',
      phrase: 'highly recommend',
      data: {
        stability: 10.0, // 10 days stability
        retrievability: 1.0,
        lastReview: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        reviewCount: 5,
      }
    }
  ];

  return (
    <PageShell 
      title="Dự Án Vô Cực - Project Infinity" 
      description="Hệ thống học ngôn ngữ Deterministic siêu tốc. 0% AI, 100% Thuật Toán."
      icon={<Network />}
    >
      <div className="space-y-12">
        {/* Pillar 1 */}
        <section>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Trụ Cột 1: AST Syntax Engine</h3>
            <p className="text-sm text-slate-500">Phân tích ngữ pháp Real-time bằng đệ quy CFG.</p>
          </div>
          <SyntaxPlayground />
        </section>

        {/* Pillar 4 */}
        <section>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Trụ Cột 4: Đấu Trường DSP/DTW</h3>
            <p className="text-sm text-slate-500">Chấm điểm phát âm bằng thuật toán Toán học, không dùng API.</p>
          </div>
          <PronunciationArena />
        </section>

        {/* Pillar 2 */}
        <section>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Trụ Cột 2: Ma Trận Ký Ức Vi Phân</h3>
            <p className="text-sm text-slate-500">Phương trình Ebbinghaus tính điểm rơi trí nhớ chính xác từng Mili-giây.</p>
          </div>
          <MemoryDecayChart srsDataList={mockSrsDataList} />
        </section>
      </div>
    </PageShell>
  );
};

export default InfinityDemoPage;
