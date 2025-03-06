import EventEmitter from "node:events";

// https://stackoverflow.com/a/67244127
export abstract class TypedEventEmitter<T extends Record<string, unknown[]>> extends EventEmitter {
	protected constructor() {
		super();
	}

	on<K extends Extract<keyof T, string> | symbol>(eventName: K, listener: (...args: T[Extract<K, string>]) => void): this {
		return super.on(eventName, listener);
	}

	once<K extends Extract<keyof T, string> | symbol>(eventName: K, listener: (...args: T[Extract<K, string>]) => void): this {
		return super.once(eventName, listener);
	}

	off<K extends Extract<keyof T, string> | symbol>(eventName: K, listener: (...args: T[Extract<K, string>]) => void): this {
		return super.off(eventName, listener);
	}

	emit<K extends Extract<keyof T, string> | symbol>(eventName: K, ...args: T[Extract<K, string>]): boolean {
		return super.emit(eventName, ...args);
	}
}

/**
 * Wait for a specific amount of time (timeout)
 * @param ms Time to wait in milliseconds
 * @returns A promise that resolves in x seconds
 */
export function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}