import { describe, it, expect } from 'vitest';
import { Lexer, TokenType } from '../../../src/lib/nlp/lexer';
import { Parser } from '../../../src/lib/nlp/parser';

describe('AST Syntax Engine - Pure Algorithm (No AI)', () => {
  describe('Lexer', () => {
    it('should tokenize a simple sentence correctly', () => {
      const lexer = new Lexer('I make a decision.');
      const tokens = lexer.tokenize();
      
      expect(tokens[0]).toEqual({ type: TokenType.PRONOUN, value: 'I', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.VERB, value: 'make', position: 2 });
      expect(tokens[2]).toEqual({ type: TokenType.ARTICLE, value: 'a', position: 7 });
      expect(tokens[3]).toEqual({ type: TokenType.NOUN, value: 'decision', position: 9 });
      expect(tokens[4]).toEqual({ type: TokenType.PUNCTUATION, value: '.', position: 17 });
      expect(tokens[5]).toMatchObject({ type: TokenType.EOF });
    });
  });

  describe('Parser (CFG AST)', () => {
    it('should build AST for a valid S-V-O sentence', () => {
      const lexer = new Lexer('I make a decision.');
      const parser = new Parser(lexer);
      const ast = parser.parse();

      expect(ast.type).toBe('S');
      expect(ast.children?.length).toBe(2);
      expect(ast.children?.[0].type).toBe('NP');
      expect(ast.children?.[1].type).toBe('VP');
    });

    it('should build AST with prepositional phrases', () => {
      const lexer = new Lexer('The government must take action immediately in the night.');
      const parser = new Parser(lexer);
      const ast = parser.parse();
      console.log('AST DEBUG:', JSON.stringify(ast, null, 2));

      expect(ast.type).toBe('S');
      expect(ast.children?.[1].children?.some(c => c.type === 'PP')).toBe(true);
    });

    it('should reject structurally invalid sentences deterministically', () => {
      const lexer = new Lexer('Make I decision a.'); // Invalid structure
      const parser = new Parser(lexer);
      const ast = parser.parse();

      expect(ast.type).toBe('ERROR');
      // Should fail during parsing because NP starts with PRONOUN but PRONOUN is expected at subject, etc.
    });
  });
});
