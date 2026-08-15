import React from 'react';
import { useMicrophoneDSP } from '../../hooks/useMicrophoneDSP';

export const PronunciationArena: React.FC = () => {
  const { isRecording, startRecording, stopRecordingAndEvaluate, result } = useMicrophoneDSP();

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto mt-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pronunciation Arena</h2>
      <p className="text-sm text-gray-500 mb-8">
        Pure Mathematical DSP DTW Algorithm. No AI. No API limits.
      </p>

      <div className="mb-8">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecordingAndEvaluate}
          onMouseLeave={isRecording ? stopRecordingAndEvaluate : undefined}
          onTouchStart={startRecording}
          onTouchEnd={stopRecordingAndEvaluate}
          className={`
            w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-200 shadow-lg
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200' 
              : 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:scale-105'}
          `}
        >
          <svg className={`w-12 h-12 text-white ${isRecording ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <p className="mt-4 text-sm text-gray-500 font-medium">
          {isRecording ? 'Release to evaluate...' : 'Hold to speak'}
        </p>
      </div>

      {result?.isProcessing && (
        <div className="flex flex-col items-center justify-center text-green-600 animate-pulse">
          <svg className="w-8 h-8 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold">Calculating DTW Matrix...</p>
        </div>
      )}

      {result && !result.isProcessing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-4xl font-black mb-2" style={{ color: result.score > 80 ? '#16a34a' : result.score > 50 ? '#ca8a04' : '#dc2626' }}>
            {result.score}%
          </div>
          <div className="text-sm font-mono text-gray-500">
            Warping Distance: {result.warpingDistance}
          </div>
          <p className="text-xs text-gray-400 mt-2">Calculated in real-time on device.</p>
        </div>
      )}
    </div>
  );
};
