import { useEffect, useState } from 'react';
import { FiniteStateMachine, type FSMConfig } from '../lib/fsm';

export function useFSM<State extends string, Event extends { type: string }, Context>(
  config: FSMConfig<State, Event, Context>
) {
  const [fsm] = useState(() => new FiniteStateMachine<State, Event, Context>(config));
  const [state, setState] = useState<State>(fsm.state);
  const [context, setContext] = useState<Context>(fsm.context);

  useEffect(() => {
    const unsubscribe = fsm.subscribe((newState, newContext) => {
      setState(newState);
      setContext(newContext);
    });
    return unsubscribe;
  }, [fsm]);

  return {
    state,
    context,
    send: (event: Event) => fsm.send(event),
  };
}
