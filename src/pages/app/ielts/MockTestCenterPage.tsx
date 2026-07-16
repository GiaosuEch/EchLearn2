import { Target } from 'lucide-react';
import PageShell from '../../PageShell';
import { mockTests } from '../../../data/ieltsData';

export default function MockTestCenterPage() {
  return (
    <PageShell title="Mock Test Center" description="Full IELTS mock tests" icon={<Target size={20} />} backTo="/app/ielts">
      <div className="grid sm:grid-cols-2 gap-4">
        {mockTests.map((test) => (
          <div key={test.id} className="glass-card p-5 group hover:border-primary-500/30 transition-all cursor-pointer">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{test.title}</h3>
            <div className="flex gap-3 text-xs text-dark-400 mt-2">
              <span className="flex items-center gap-1">⏱ {test.duration} min</span>
              <span className="flex items-center gap-1">❓ {test.totalQuestions} questions</span>
              <span className="flex items-center gap-1 font-bold text-dark-300">🎯 {test.bandTarget}</span>
            </div>
            {test.isCompleted ? (
              <div className="mt-4 flex items-center justify-between p-2 bg-success/10 rounded-lg">
                <span className="text-sm font-bold text-success flex items-center gap-1">✅ Completed</span>
                {test.score && <span className="text-sm font-bold text-white bg-success/20 px-2 py-1 rounded-md">Score: {test.score}</span>}
              </div>
            ) : (
              <button className="mt-4 w-full py-2.5 bg-dark-800 group-hover:bg-primary-500 text-dark-300 group-hover:text-white rounded-xl text-sm font-bold transition-all group-hover:shadow-lg group-hover:shadow-primary-500/20 group-hover:-translate-y-0.5">
                Start Full Test
              </button>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
