export type Listener<T> = (data: T) => void;

export interface Event<T> {
  name: string;
  data: T;
}

export class EventEmitter {
  private listeners: { [eventName: string]: Listener<any>[] } = {};

  public on<T>(eventName: string, listener: Listener<T>): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  public off<T>(eventName: string, listener: Listener<T>): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (l) => l !== listener
      );
    }
  }

  public emit<T>(eventName: string, data: T): void {
    const event: Event<T> = {
      name: eventName,
      data: data,
    };
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) =>
        listener(event as any)
      );
    }
  }
}