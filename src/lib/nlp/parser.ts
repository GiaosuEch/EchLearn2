// src/lib/nlp/parser.ts
import { type Token, TokenType, Lexer } from './lexer';

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
}

/**
 * Deterministic Context-Free Grammar (CFG) Parser
 * Grammars:
 * S -> NP VP
 * NP -> (PRONOUN | (ARTICLE) (ADJECTIVE)* NOUN)
 * VP -> VERB (ADVERB)* (NP) (PP)*
 * PP -> PREPOSITION NP
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(lexer: Lexer) {
    this.tokens = lexer.tokenize();
  }

  public parse(): ASTNode {
    try {
      const ast = this.parseSentence();
      if (!this.isAtEnd()) {
        throw new Error(`Unexpected token at end of sentence: ${this.peek().value}`);
      }
      return ast;
    } catch (e: any) {
      return { type: 'ERROR', value: e.message };
    }
  }

  private parseSentence(): ASTNode {
    const np = this.parseNP();
    const vp = this.parseVP();
    return { type: 'S', children: [np, vp] };
  }

  private parseNP(): ASTNode {
    // PRONOUN
    if (this.match(TokenType.PRONOUN)) {
      return { type: 'NP', children: [{ type: 'PRONOUN', value: this.previous().value }] };
    }

    const children: ASTNode[] = [];
    
    // (ARTICLE)
    if (this.match(TokenType.ARTICLE)) {
      children.push({ type: 'ARTICLE', value: this.previous().value });
    }

    // (ADJECTIVE)*
    while (this.match(TokenType.ADJECTIVE)) {
      children.push({ type: 'ADJECTIVE', value: this.previous().value });
    }

    // NOUN
    if (this.match(TokenType.NOUN)) {
      children.push({ type: 'NOUN', value: this.previous().value });
    } else {
      throw new Error(`Expected NOUN in Noun Phrase, found ${this.peek().type}`);
    }

    return { type: 'NP', children };
  }

  private parseVP(): ASTNode {
    const children: ASTNode[] = [];

    // VERB (allow auxiliary verbs like 'must take')
    if (this.match(TokenType.VERB)) {
      children.push({ type: 'VERB', value: this.previous().value });
      while (this.match(TokenType.VERB)) {
        children.push({ type: 'VERB', value: this.previous().value });
      }
    } else {
      throw new Error(`Expected VERB in Verb Phrase, found ${this.peek().type}`);
    }

    // (ADVERB)*
    while (this.match(TokenType.ADVERB)) {
      children.push({ type: 'ADVERB', value: this.previous().value });
    }

    // (NP) optional object
    if (this.check(TokenType.PRONOUN) || this.check(TokenType.ARTICLE) || this.check(TokenType.ADJECTIVE) || this.check(TokenType.NOUN)) {
      children.push(this.parseNP());
    }

    // (ADVERB)* post-object
    while (this.match(TokenType.ADVERB)) {
      children.push({ type: 'ADVERB', value: this.previous().value });
    }

    // (PP)* optional prepositional phrases
    while (this.check(TokenType.PREPOSITION)) {
      children.push(this.parsePP());
    }

    return { type: 'VP', children };
  }

  private parsePP(): ASTNode {
    if (this.match(TokenType.PREPOSITION)) {
      const prepNode = { type: 'PREPOSITION', value: this.previous().value };
      const npNode = this.parseNP();
      return { type: 'PP', children: [prepNode, npNode] };
    }
    throw new Error(`Expected PREPOSITION, found ${this.peek().type}`);
  }

  // --- Helper Methods ---

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    // Ignore punctuation for simple S-V-O structural checking
    while (this.tokens[this.current]?.type === TokenType.PUNCTUATION) {
      this.current++;
    }
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
