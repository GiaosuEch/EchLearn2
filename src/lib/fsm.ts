// src/lib/fsm.ts

/**
 * A lightweight, strongly-typed Finite State Machine (FSM) implementation.
 * Ensures zero Impossible States in the application logic.
 */

export type FSMTransition<State extends string, Event extends { type: string }, Context> = (
  context: Context,
  event: Event
) => { target: State; context?: Partial<Context> } | undefined;

export type FSMConfig<State extends string, Event extends { type: string }, Context> = {
  initial: State;
  context: Context;
  states: {
    [S in State]: {
      on?: {
        [E in Event['type']]?: 
          | State
          | FSMTransition<State, Extract<Event, { type: E }>, Context>;
      };
      entry?: (context: Context) => void;
      exit?: (context: Context) => void;
    };
  };
};

export class FiniteStateMachine<State extends string, Event extends { type: string }, Context> {
  private currentState: State;
  private currentContext: Context;
  private config: FSMConfig<State, Event, Context>;
  private listeners: Set<(state: State, context: Context) => void>;

  constructor(config: FSMConfig<State, Event, Context>) {
    this.config = config;
    this.currentState = config.initial;
    this.currentContext = config.context;
    this.listeners = new Set();
    
    // Call entry action for initial state
    const entryAction = this.config.states[this.currentState].entry;
    if (entryAction) entryAction(this.currentContext);
  }

  get state(): State {
    return this.currentState;
  }

  get context(): Context {
    return this.currentContext;
  }

  public subscribe(listener: (state: State, context: Context) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentState, this.currentContext));
  }

  public send(event: Event): boolean {
    const stateConfig = this.config.states[this.currentState];
    if (!stateConfig.on) return false;

    const transition = stateConfig.on[event.type as Event['type']];
    if (!transition) return false;

    let targetState: State;
    let nextContext = this.currentContext;

    if (typeof transition === 'string') {
      targetState = transition as State;
    } else if (typeof transition === 'function') {
      const result = (transition as FSMTransition<State, Event, Context>)(this.currentContext, event);
      if (!result) return false; // Guard prevented transition
      targetState = result.target;
      if (result.context) {
        nextContext = { ...this.currentContext, ...result.context };
      }
    } else {
      return false;
    }

    if (targetState === this.currentState && nextContext === this.currentContext) {
      return false; // No changes
    }

    // Call exit action of current state
    const exitAction = stateConfig.exit;
    if (exitAction) exitAction(this.currentContext);

    this.currentState = targetState;
    this.currentContext = nextContext;

    // Call entry action of new state
    const entryAction = this.config.states[this.currentState].entry;
    if (entryAction) entryAction(this.currentContext);

    this.notify();
    return true;
  }
}
