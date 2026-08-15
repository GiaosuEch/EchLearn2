import React, { useState, useEffect } from 'react';
import { Lexer } from '../../lib/nlp/lexer';
import { Parser, type ASTNode } from '../../lib/nlp/parser';

export const SyntaxPlayground: React.FC = () => {
  const [text, setText] = useState('');
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setAst(null);
      setError(null);
      return;
    }

    try {
      const lexer = new Lexer(text);
      const parser = new Parser(lexer);
      const result = parser.parse();

      if (result.type === 'ERROR') {
        setError(result.value || 'Syntax error detected');
        setAst(null);
      } else {
        setAst(result);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown parsing error');
      setAst(null);
    }
  }, [text]);

  // Recursively render AST
  const renderAST = (node: ASTNode, depth: number = 0): React.ReactNode => {
    return (
      <div key={Math.random()} style={{ marginLeft: depth * 20, padding: '4px 0' }}>
        <span className="font-bold text-green-700">[{node.type}]</span>
        {node.value && <span className="ml-2 text-gray-800">"{node.value}"</span>}
        {node.children && node.children.map(child => renderAST(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">AST Syntax Engine Playground</h2>
      <p className="text-sm text-gray-500 mb-4">
        Type a sentence (e.g., "The government must take action immediately in the night.").
        The Deterministic CFG Parser will instantly break it down. 0% AI.
      </p>

      <textarea
        className={`w-full p-4 border-2 rounded-lg text-lg focus:outline-none transition-colors ${
          error ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
        }`}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type an English sentence..."
      />

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Syntax Error:</span>
          <span className="ml-2">{error}</span>
        </div>
      )}

      {ast && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Abstract Syntax Tree (AST)</h3>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-100">
            {renderAST(ast)}
          </div>
        </div>
      )}
    </div>
  );
};
