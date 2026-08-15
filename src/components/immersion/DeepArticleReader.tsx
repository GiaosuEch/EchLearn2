import React, { useState } from 'react';
import type { DeepArticle } from '../../curriculum/contentTypes';
import { LexicalResonanceEngine } from '../../domain/immersion/LexicalResonanceEngine';
import { CheckCircle, BookOpen, Sparkles } from 'lucide-react';

export const DeepArticleReader: React.FC<{ article: DeepArticle }> = ({ article }) => {
  const [showTranslations, setShowTranslations] = useState(false);
  const [showGrammar, setShowGrammar] = useState(true);
  const [densities, setDensities] = useState<Record<string, number>>({});

  React.useEffect(() => {
    let isMounted = true;
    const calculateAll = async () => {
      const newDensities: Record<string, number> = {};
      for (const paragraph of article.content) {
        newDensities[paragraph.paragraphId] = await LexicalResonanceEngine.calculateLexicalDensity(
          paragraph.text, 
          article.language
        );
      }
      if (isMounted) {
        setDensities(newDensities);
      }
    };
    calculateAll();
    return () => { isMounted = false; };
  }, [article.content, article.language]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-4 h-4" />
          <span>Academic Insight • CEFR {article.cefrMapping}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
          {article.title}
        </h1>
        {showTranslations && (
          <h2 className="text-xl md:text-2xl font-medium text-slate-500 mb-6">
            {article.titleTranslation}
          </h2>
        )}
        <div className="text-slate-500 font-medium">
          By <span className="text-slate-800">{article.author}</span> • {article.publication}
        </div>
        <div className="text-sm text-slate-400 mt-2">
          {article.wordCount} words • ~{Math.ceil(article.wordCount / 200)} min read
        </div>
      </header>

      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 border-b border-slate-100 flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-primary focus:ring-primary"
              checked={showTranslations}
              onChange={(e) => setShowTranslations(e.target.checked)}
            />
            <span>Parallel Translation</span>
          </label>
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-amber-500 focus:ring-amber-500"
              checked={showGrammar}
              onChange={(e) => setShowGrammar(e.target.checked)}
            />
            <span>Cognitive Highlights</span>
          </label>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Lexical Engine Active
        </div>
      </div>

      <article className="prose prose-lg prose-slate max-w-none">
        {article.content.map((paragraph) => {
          const density = densities[paragraph.paragraphId] || 0;
          const isHighDensity = density > 6.0;

          return (
            <div key={paragraph.paragraphId} className="mb-8 group relative">
              {isHighDensity && (
                <div className="absolute -left-12 top-2 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" title="High Lexical Density">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              
              <p className="text-slate-800 leading-relaxed font-serif text-xl">
                {renderTextWithHighlights(paragraph.text, showGrammar ? paragraph.grammaticalHighlights : [])}
              </p>
              
              {showTranslations && (
                <p className="text-slate-500 leading-relaxed italic text-lg mt-2 border-l-4 border-slate-200 pl-4">
                  {paragraph.translation}
                </p>
              )}
            </div>
          );
        })}
      </article>

      <div className="mt-16 bg-slate-50 rounded-3xl p-8 border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          Target Collocations Extracted
        </h3>
        <ul className="space-y-4">
          {article.targetCollocations.map(col => (
            <li key={col.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-lg text-slate-800">{col.phrase}</div>
                <div className="text-slate-500">{col.translation}</div>
              </div>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold uppercase">{col.cefr}</span>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold uppercase">{col.type}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function renderTextWithHighlights(text: string, highlights: any[]) {
  if (!highlights || highlights.length === 0) return <>{text}</>;

  let result: React.ReactNode[] = [];
  let currentIndex = 0;

  // Extremely simplified highlighter for demonstration
  // In production, we'd use robust index-based slicing
  highlights.forEach((h, i) => {
    const index = text.indexOf(h.text, currentIndex);
    if (index !== -1) {
      result.push(<span key={`text-${i}`}>{text.substring(currentIndex, index)}</span>);
      result.push(
        <span 
          key={`highlight-${i}`} 
          className="bg-amber-100 text-amber-900 border-b-2 border-amber-300 cursor-help relative group"
        >
          {h.text}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
            {h.explanation}
          </span>
        </span>
      );
      currentIndex = index + h.text.length;
    }
  });

  result.push(<span key="end">{text.substring(currentIndex)}</span>);
  return <>{result}</>;
}
