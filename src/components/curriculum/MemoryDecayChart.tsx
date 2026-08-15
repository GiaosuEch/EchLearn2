import React, { useEffect, useState } from 'react';
import { type SRSData, SRSAlgorithm } from '../../domain/curriculum/srsAlgorithm';

interface MemoryChartProps {
  srsDataList: { id: string; phrase: string; data: SRSData }[];
}

export const MemoryDecayChart: React.FC<MemoryChartProps> = ({ srsDataList }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Force chart to re-evaluate retrievability every minute for accuracy
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (srsDataList.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">No memory data available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">SRS Matrix Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">
        Real-time Ebbinghaus Forgetting Curve evaluation. Equation: <code className="bg-gray-100 px-1 rounded">R = e^(-t/S)</code>
      </p>

      <div className="space-y-4">
        {srsDataList.map(({ id, phrase, data }) => {
          const R = SRSAlgorithm.calculateRetrievability(data.stability, data.lastReview, currentTime);
          const rPercentage = Math.round(R * 100);
          const needsReview = R < 0.85;

          return (
            <div key={id} className={`p-4 rounded-lg border ${needsReview ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">{phrase}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${needsReview ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {needsReview ? 'Needs Review' : 'Stable'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                <div className="flex justify-between">
                  <span>Retrievability (R):</span>
                  <span className="font-mono">{rPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stability (S):</span>
                  <span className="font-mono">{data.stability.toFixed(2)} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Reviews:</span>
                  <span className="font-mono">{data.reviewCount}</span>
                </div>
              </div>

              {/* Visualization Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${R > 0.85 ? 'bg-green-500' : R > 0.5 ? 'bg-yellow-400' : 'bg-red-500'}`}
                  style={{ width: `${rPercentage}%`, transition: 'width 0.5s ease' }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
