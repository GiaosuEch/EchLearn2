import { describe, it, expect, vi } from 'vitest';
import { FiniteStateMachine } from './fsm';

type LightState = 'GREEN' | 'YELLOW' | 'RED';
type LightEvent = { type: 'TIMER' } | { type: 'EMERGENCY' };
type LightContext = { elapsed: number };

describe('FiniteStateMachine', () => {
  it('should initialize with initial state and context', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent, LightContext>({
      initial: 'GREEN',
      context: { elapsed: 0 },
      states: {
        GREEN: {},
        YELLOW: {},
        RED: {}
      }
    });

    expect(fsm.state).toBe('GREEN');
    expect(fsm.context.elapsed).toBe(0);
  });

  it('should transition to new state on event', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent, LightContext>({
      initial: 'GREEN',
      context: { elapsed: 0 },
      states: {
        GREEN: { on: { TIMER: 'YELLOW' } },
        YELLOW: { on: { TIMER: 'RED' } },
        RED: { on: { TIMER: 'GREEN' } }
      }
    });

    expect(fsm.send({ type: 'TIMER' })).toBe(true);
    expect(fsm.state).toBe('YELLOW');
    expect(fsm.send({ type: 'TIMER' })).toBe(true);
    expect(fsm.state).toBe('RED');
  });

  it('should ignore invalid events', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent, LightContext>({
      initial: 'GREEN',
      context: { elapsed: 0 },
      states: {
        GREEN: { on: { EMERGENCY: 'RED' } }, // no TIMER transition
        YELLOW: {},
        RED: {}
      }
    });

    expect(fsm.send({ type: 'TIMER' })).toBe(false);
    expect(fsm.state).toBe('GREEN');
  });

  it('should support transition guards and context updates', () => {
    const fsm = new FiniteStateMachine<LightState, LightEvent, LightContext>({
      initial: 'GREEN',
      context: { elapsed: 0 },
      states: {
        GREEN: {
          on: {
            TIMER: (ctx) => {
              if (ctx.elapsed < 10) return { target: 'GREEN', context: { elapsed: ctx.elapsed + 5 } };
              return { target: 'YELLOW', context: { elapsed: 0 } };
            }
          }
        },
        YELLOW: {},
        RED: {}
      }
    });

    // elapsed becomes 5, state stays GREEN
    fsm.send({ type: 'TIMER' });
    expect(fsm.state).toBe('GREEN');
    expect(fsm.context.elapsed).toBe(5);

    // elapsed becomes 10, state stays GREEN
    fsm.send({ type: 'TIMER' });
    expect(fsm.state).toBe('GREEN');
    expect(fsm.context.elapsed).toBe(10);

    // elapsed >= 10, transitions to YELLOW, resets elapsed
    fsm.send({ type: 'TIMER' });
    expect(fsm.state).toBe('YELLOW');
    expect(fsm.context.elapsed).toBe(0);
  });

  it('should trigger entry and exit actions', () => {
    const entrySpy = vi.fn();
    const exitSpy = vi.fn();

    const fsm = new FiniteStateMachine<LightState, LightEvent, LightContext>({
      initial: 'GREEN',
      context: { elapsed: 0 },
      states: {
        GREEN: {
          exit: exitSpy,
          on: { TIMER: 'YELLOW' }
        },
        YELLOW: {
          entry: entrySpy,
        },
        RED: {}
      }
    });

    fsm.send({ type: 'TIMER' });
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(entrySpy).toHaveBeenCalledTimes(1);
  });
});
