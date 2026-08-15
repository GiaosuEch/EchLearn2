// src/lib/nlp/lexer.ts

export const TokenType = {
  NOUN: 'NOUN',
  VERB: 'VERB',
  ADJECTIVE: 'ADJECTIVE',
  ADVERB: 'ADVERB',
  ARTICLE: 'ARTICLE',
  PREPOSITION: 'PREPOSITION',
  PRONOUN: 'PRONOUN',
  PUNCTUATION: 'PUNCTUATION',
  UNKNOWN: 'UNKNOWN',
  EOF: 'EOF',
} as const;
export type TokenType = keyof typeof TokenType;

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

// Mini in-memory dictionary for ultra-fast offline deterministic tagging.
// In production, this would be populated from a compressed Trie structure or the CollocationGraph.
const DICTIONARY: Record<string, TokenType> = {
  'i': TokenType.PRONOUN,
  'you': TokenType.PRONOUN,
  'he': TokenType.PRONOUN,
  'she': TokenType.PRONOUN,
  'it': TokenType.PRONOUN,
  'we': TokenType.PRONOUN,
  'they': TokenType.PRONOUN,
  
  'a': TokenType.ARTICLE,
  'an': TokenType.ARTICLE,
  'the': TokenType.ARTICLE,

  'in': TokenType.PREPOSITION,
  'on': TokenType.PREPOSITION,
  'at': TokenType.PREPOSITION,
  'to': TokenType.PREPOSITION,
  'for': TokenType.PREPOSITION,
  'with': TokenType.PREPOSITION,

  'make': TokenType.VERB,
  'take': TokenType.VERB,
  'is': TokenType.VERB,
  'am': TokenType.VERB,
  'are': TokenType.VERB,
  'recommend': TokenType.VERB,
  'advise': TokenType.VERB,
  'bear': TokenType.VERB,
  'need': TokenType.VERB,
  'must': TokenType.VERB,

  'decision': TokenType.NOUN,
  'action': TokenType.NOUN,
  'book': TokenType.NOUN,
  'exam': TokenType.NOUN,
  'mind': TokenType.NOUN,
  'government': TokenType.NOUN,
  'night': TokenType.NOUN,
  'everyone': TokenType.NOUN,
  'tomorrow': TokenType.NOUN, // functioning as adverb/noun

  'highly': TokenType.ADVERB,
  'strongly': TokenType.ADVERB,
  'immediately': TokenType.ADVERB,
  
  'beautiful': TokenType.ADJECTIVE,
  'good': TokenType.ADJECTIVE,
  'bad': TokenType.ADJECTIVE,
};

export class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();
    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }
    tokens.push(token); // Push EOF
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();

    if (this.position >= this.input.length) {
      return { type: TokenType.EOF, value: '', position: this.position };
    }

    const char = this.input[this.position];

    // Punctuation
    if (/[.,!?;:]/.test(char)) {
      const token: Token = { type: TokenType.PUNCTUATION, value: char, position: this.position };
      this.position++;
      return token;
    }

    // Word boundary
    if (/[a-zA-Z]/.test(char)) {
      const start = this.position;
      while (this.position < this.input.length && /[a-zA-Z']/.test(this.input[this.position])) {
        this.position++;
      }
      const value = this.input.substring(start, this.position);
      const lower = value.toLowerCase();
      
      const type = DICTIONARY[lower] || TokenType.UNKNOWN;
      
      return { type, value, position: start };
    }

    // Fallback unknown character
    const token: Token = { type: TokenType.UNKNOWN, value: char, position: this.position };
    this.position++;
    return token;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }
}
