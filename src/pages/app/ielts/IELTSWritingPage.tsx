import { useMemo, useState } from 'react';
import { PenTool } from 'lucide-react';

import PageShell from '../../PageShell';
import { ieltsWritingPrompts } from '../../../data/ieltsData';

export default function IELTSWritingPage() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState('');

  const prompt = ieltsWritingPrompts[promptIndex];
  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  const switchPrompt = (index: number) => {
    setPromptIndex(index);
    setText('');
  };

  return (
    <PageShell
      title="IELTS Writing"
      description="Practice IELTS Writing Task 1 & 2"
      icon={<PenTool size={20} />}
      backTo="/app/ielts"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-left text-sm text-orange-300">
          <p className="font-semibold">Automated assessment is unavailable.</p>
          <p className="mt-1 text-orange-200/80">
            You can draft and review your response, but no score, band, or AI feedback will be
            generated until an approved local model and benchmark are available.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ieltsWritingPrompts.map((item, index) => (
            <button
              key={item.id}
              onClick={() => switchPrompt(index)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                promptIndex === index
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'border border-dark-700 bg-dark-800 text-dark-300 hover:border-primary-500/50 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {item.taskType === 'task2'
                ? `Task 2 #${index + 1}`
                : item.taskType === 'task1-academic'
                  ? 'Task 1 (Academic)'
                  : 'Task 1 (General)'}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card flex flex-col p-6">
            <h3 className="mb-4 text-xl font-bold text-white">
              {prompt.taskType === 'task2'
                ? 'Writing Task 2'
                : prompt.taskType === 'task1-academic'
                  ? 'Task 1 (Academic)'
                  : 'Task 1 (General)'}
            </h3>
            <div className="mb-6 rounded-xl border border-dark-700/50 bg-dark-800/50 p-4">
              <p className="text-sm leading-relaxed text-white">{prompt.prompt}</p>
            </div>
            <div className="mb-6 flex w-max gap-4 rounded-xl bg-dark-800 p-3 text-xs font-bold text-dark-400">
              <span>Time: {prompt.timeLimit} min</span>
              <span>{prompt.wordLimit.min}+ words</span>
            </div>
            <div className="mt-auto space-y-2">
              <h4 className="mb-3 text-sm font-bold text-white">Practice tips from Ech Buri</h4>
              {prompt.tips.map((tip, index) => (
                <p
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-dark-800/30 p-2 text-sm text-dark-300"
                >
                  <span className="text-primary-400">-</span> {tip}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="glass-card flex flex-1 flex-col p-6">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-[300px] w-full flex-1 resize-none rounded-xl border border-dark-700 bg-dark-900 p-4 text-sm text-white outline-none transition-colors placeholder:text-dark-500 focus:border-primary-500"
                placeholder="Write your response here. Automated assessment is unavailable until an approved local model is enabled."
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <span
                  className={`rounded-lg px-3 py-1 text-sm font-bold ${
                    wordCount >= prompt.wordLimit.min
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {wordCount} / {prompt.wordLimit.min}+ words
                </span>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl bg-dark-700 px-6 py-2 text-sm font-bold text-dark-400"
                >
                  Assessment unavailable
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
