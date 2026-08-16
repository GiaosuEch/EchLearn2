type EventCallback = (data?: any) => void;

export class EventBusService {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

export const SystemEvents = {
  AUTH_USER_LOGGED_IN: 'AUTH_USER_LOGGED_IN',
  AUTH_USER_LOGGED_OUT: 'AUTH_USER_LOGGED_OUT',
  USER_ANSWERED_QUESTION: 'USER_ANSWERED_QUESTION',
  INTERVENTION_REQUIRED: 'INTERVENTION_REQUIRED',
} as const;

export const globalEventBus = new EventBusService();
