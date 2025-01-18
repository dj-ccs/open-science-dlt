type EventCallback = (...args: any[]) => void;

export class EventEmitter {
    private events: Map<string, EventCallback[]>;

    constructor() {
        this.events = new Map();
    }

    on(eventName: string, callback: EventCallback): void {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName)!.push(callback);
    }

    off(eventName: string, callback: EventCallback): void {
        if (!this.events.has(eventName)) return;

        const callbacks = this.events.get(eventName)!;
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }

        if (callbacks.length === 0) {
            this.events.delete(eventName);
        }
    }

    emit(eventName: string, ...args: any[]): void {
        if (!this.events.has(eventName)) return;

        this.events.get(eventName)!.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event ${eventName} callback:`, error);
            }
        });
    }

    once(eventName: string, callback: EventCallback): void {
        const onceCallback = (...args: any[]) => {
            this.off(eventName, onceCallback);
            callback(...args);
        };
        this.on(eventName, onceCallback);
    }

    removeAllListeners(eventName?: string): void {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }

    listenerCount(eventName: string): number {
        return this.events.has(eventName) ? this.events.get(eventName)!.length : 0;
    }

    eventNames(): string[] {
        return Array.from(this.events.keys());
    }
}
