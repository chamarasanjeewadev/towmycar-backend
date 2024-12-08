import { EventEmitter } from "stream";

export class NotificationEmitter extends EventEmitter {
    constructor() {
        super();
    }

    on<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        console.log("eventName", eventName);
        return super.on(eventName, listener);
    }
}