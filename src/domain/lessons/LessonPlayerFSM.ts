import type { FSMConfig } from '../../lib/fsm';

export type LessonPlayerState = 'IDLE' | 'LOADING' | 'PLAYING' | 'EVALUATING' | 'RESULT' | 'FINISHED' | 'ERROR';

export type LessonPlayerEvent =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; exercises: any[] }
  | { type: 'FETCH_ERROR'; error: Error }
  | { type: 'INPUT_CHANGED'; value: string }
  | { type: 'OPTION_SELECTED'; value: string }
  | { type: 'MATCH_SELECTED'; side: 'left' | 'right'; id: string; exercise: any }
  | { type: 'CHECK_ANSWER' }
  | { type: 'EVALUATION_COMPLETE'; isCorrect: boolean; feedback: string; isClose?: boolean }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'RETRY_EXERCISE' }
  | { type: 'RESET' };

export interface LessonPlayerContext {
  exercises: any[];
  currentIndex: number;
  score: number;
  hearts: number;
  userInput: string;
  selected: string;
  isCorrect: boolean;
  cheerText: string;
  matchLeft: string | null;
  matchRight: string | null;
  matchedPairs: string[];
}

const initialContext: LessonPlayerContext = {
  exercises: [],
  currentIndex: 0,
  score: 0,
  hearts: 5,
  userInput: '',
  selected: '',
  isCorrect: false,
  cheerText: '',
  matchLeft: null,
  matchRight: null,
  matchedPairs: [],
};

export const lessonPlayerFSMConfig: FSMConfig<LessonPlayerState, LessonPlayerEvent, LessonPlayerContext> = {
  initial: 'IDLE',
  context: { ...initialContext },
  states: {
    IDLE: {
      on: {
        FETCH_START: 'LOADING',
      }
    },
    LOADING: {
      on: {
        FETCH_SUCCESS: (_context, event) => {
          return {
            target: 'PLAYING',
            context: {
              exercises: event.exercises,
              currentIndex: 0,
              score: 0,
              hearts: 5,
            }
          };
        },
        FETCH_ERROR: 'ERROR'
      }
    },
    PLAYING: {
      on: {
        INPUT_CHANGED: (_context, event) => ({
          target: 'PLAYING',
          context: { userInput: event.value }
        }),
        OPTION_SELECTED: (_context, event) => ({
          target: 'PLAYING',
          context: { selected: event.value }
        }),
        MATCH_SELECTED: (context, event) => {
          const side = event.side;
          const id = event.id;
          let matchLeft = context.matchLeft;
          let matchRight = context.matchRight;
          let matchedPairs = [...context.matchedPairs];
          
          if (side === 'left') {
            if (matchRight) {
              if (matchRight === id) {
                matchedPairs.push(id);
              }
              matchLeft = null;
              matchRight = null;
            } else {
              matchLeft = id;
            }
          } else {
            if (matchLeft) {
              if (matchLeft === id) {
                matchedPairs.push(id);
              }
              matchLeft = null;
              matchRight = null;
            } else {
              matchRight = id;
            }
          }
          return {
            target: 'PLAYING',
            context: { matchLeft, matchRight, matchedPairs }
          };
        },
        CHECK_ANSWER: 'EVALUATING'
      }
    },
    EVALUATING: {
      on: {
        EVALUATION_COMPLETE: (context, event) => ({
          target: 'RESULT',
          context: {
            isCorrect: event.isCorrect,
            cheerText: event.feedback,
            score: event.isCorrect ? context.score + 1 : context.score,
            hearts: event.isCorrect ? context.hearts : Math.max(0, context.hearts - 1)
          }
        })
      }
    },
    RESULT: {
      on: {
        NEXT_EXERCISE: (context) => {
          if (context.currentIndex + 1 >= context.exercises.length) {
            return { target: 'FINISHED' };
          }
          return {
            target: 'PLAYING',
            context: {
              currentIndex: context.currentIndex + 1,
              userInput: '',
              selected: '',
              isCorrect: false,
              matchLeft: null,
              matchRight: null,
              matchedPairs: []
            }
          };
        },
        RETRY_EXERCISE: (_context) => ({
          target: 'PLAYING',
          context: {
            userInput: '',
            selected: '',
            isCorrect: false
          }
        })
      }
    },
    FINISHED: {
      on: {
        RESET: () => ({
          target: 'IDLE',
          context: { ...initialContext }
        })
      }
    },
    ERROR: {
      on: {
        RESET: 'IDLE'
      }
    }
  }
};
