import React, { useState, useEffect } from 'react';
import { Lexer } from '../../lib/nlp/lexer';
import { Parser } from '../../lib/nlp/parser';
import { syncQueue } from '../../services/syncQueueService';

interface StrictWritingInputProps {
  nodeId: string;
  expectedPhrase: string;
  onSubmitSuccess: () => void;
}

export const StrictWritingInput: React.FC<StrictWritingInputProps> = ({ nodeId, expectedPhrase, onSubmitSuccess }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setError(null);
      setIsValid(false);
      return;
    }

    try {
      const lexer = new Lexer(text);
      const parser = new Parser(lexer);
      const result = parser.parse();

      if (result.type === 'ERROR') {
        setError(result.value || 'Syntax error detected');
        setIsValid(false);
      } else {
        // If AST passes, we also check if it contains the target collocation
        if (text.toLowerCase().includes(expectedPhrase.toLowerCase())) {
          setError(null);
          setIsValid(true);
        } else {
          setError(`Valid syntax, but must include: "${expectedPhrase}"`);
          setIsValid(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown parsing error');
      setIsValid(false);
    }
  }, [text, expectedPhrase]);

  const handleSubmit = () => {
    if (isValid) {
      // Offline CRDT Sync (Phase 3 Integration)
      syncQueue.pushChange('AST_PASS', {
        nodeId,
        input: text,
        timestamp: Date.now()
      });
      
      onSubmitSuccess();
      setText(''); // Reset
    }
  };

  return (
    <div className="w-full">
      <textarea
        className={`w-full p-4 border-2 rounded-lg text-lg focus:outline-none transition-colors ${
          error ? 'border-red-400 bg-red-50 focus:border-red-500' : 
          isValid ? 'border-green-400 bg-green-50 focus:border-green-500' : 
          'border-gray-200 focus:border-blue-500'
        }`}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Write a sentence using "${expectedPhrase}"...`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`mt-4 w-full py-3 rounded-lg font-bold text-white transition-all ${
          isValid 
            ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg' 
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isValid ? 'Submit Deterministic Answer' : 'Waiting for Valid AST...'}
      </button>
    </div>
  );
};
