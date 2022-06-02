
export class EventManipulator<HOST extends object, EVENTS = {}, TARGET extends EventTarget = EventTarget> {

	public static make<EVENTS> () {
		return new EventManipulator<{}, EVENTS>({});
	}

	private readonly host: WeakRef<HOST>;
	private readonly _target: TARGET | WeakRef<TARGET>;

	private get target () {
		return this._target instanceof WeakRef ? this._target.deref() : this._target;
	}

	public constructor (host: HOST, target: TARGET | WeakRef<TARGET> = new EventTarget() as TARGET) {
		this.host = new WeakRef(host);
		this._target = target;
	}

	public subscribe<TYPE extends keyof EVENTS> (type: TYPE, listener: (this: TARGET, event: EVENTS[TYPE]) => any): HOST;
	public subscribe (type: string, listener: (this: TARGET, event: Event) => any): HOST;
	public subscribe (type: never, listener: (this: TARGET, event: any) => any) {
		this.target?.addEventListener(type, listener);
		return this.host.deref() as HOST;
	}

	public subscribeFirst<TYPE extends keyof EVENTS> (type: TYPE, listener: (this: TARGET, event: EVENTS[TYPE]) => any): HOST;
	public subscribeFirst (type: string, listener: (this: TARGET, event: Event) => any): HOST;
	public subscribeFirst (type: string, listener: (this: TARGET, event: any) => any) {
		this.target?.addEventListener(type, listener, { once: true });
		return this.host.deref() as HOST;
	}

	public unsubscribe<TYPE extends keyof EVENTS> (type: TYPE, listener: (this: TARGET, event: EVENTS[TYPE]) => any): HOST;
	public unsubscribe (type: string, listener: (this: TARGET, event: Event) => any): HOST;
	public unsubscribe (type: string, listener: (this: TARGET, event: any) => any) {
		this.target?.removeEventListener(type, listener);
		return this.host.deref() as HOST;
	}

	public async waitFor<TYPE extends keyof HTMLElementEventMap> (type: string): Promise<HTMLElementEventMap[TYPE]>;
	public async waitFor (type: string): Promise<Event>;
	public async waitFor (type: string) {
		return new Promise<Event>(resolve =>
			this.target?.addEventListener(type, resolve, { once: true }));
	}

	private pipeTargets = new Map<string, WeakRef<EventTarget>[]>();

	public emit<TYPE extends keyof { [TYPE in keyof EVENTS as Event extends EVENTS[TYPE] ? TYPE : never]: true }> (type: TYPE): void;
	public emit<TYPE extends keyof EVENTS> (type: TYPE, init: Pick<EVENTS[TYPE], Exclude<keyof EVENTS[TYPE], Event>>): void;
	public emit<TYPE extends keyof EVENTS> (type: TYPE, initializer: (event: Event) => EVENTS[TYPE]): void;
	public emit<EVENT extends Event> (event: EVENT, init: Omit<EVENTS[keyof EVENTS], keyof EVENT>): void;
	public emit<EVENT extends EVENTS[keyof EVENTS]> (event: EVENT, initializer?: (event: EVENT) => any): void;
	public emit<EVENT extends Event> (event: EVENT, initializer: (event: EVENT) => EVENTS[keyof EVENTS]): void;
	public emit (event: Event | string, init?: ((event: any) => any) | object) {
		if (typeof event === "string")
			event = new Event(event);

		if (typeof init === "function")
			init?.(event);
		else if (init)
			Object.assign(event, init);

		const pipeTargets = this.pipeTargets.get(event.type);
		if (pipeTargets) {
			for (let i = 0; i < pipeTargets.length; i++) {
				const pipeTarget = pipeTargets[i].deref();
				if (pipeTarget)
					pipeTarget.dispatchEvent(event);
				else
					pipeTargets.splice(i--, 1);
			}

			if (!pipeTargets.length)
				this.pipeTargets.delete(event.type);
		}

		this.target?.dispatchEvent(event);

		return this.host.deref() as HOST;
	}

	private pipes = new Map<string, WeakRef<EventManipulator<any, any>>[]>();

	public pipe<TYPE extends keyof EVENTS> (type: TYPE, on: EventManipulator<any, { [key in TYPE]: EVENTS[TYPE] }, any>) {
		const typeName = type as string;

		on.insertPipe(typeName, this._target instanceof WeakRef ? this._target : new WeakRef(this._target));

		let pipes = this.pipes.get(typeName);
		if (!pipes) {
			pipes = [];
			this.pipes.set(typeName, pipes);
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		pipes.push(new WeakRef(on));
		return this;
	}

	private insertPipe (type: string, target: WeakRef<EventTarget>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		let pipeTargets = this.pipeTargets.get(type);
		if (!pipeTargets) {
			pipeTargets = [];
			this.pipeTargets.set(type, pipeTargets);
		}

		pipeTargets.push();

		const pipes = this.pipes.get(type);
		if (pipes) {
			for (let i = 0; i < pipes.length; i++) {
				const pipe = pipes[i].deref();
				if (pipe)
					pipe.insertPipe(type, target);
				else
					pipes.splice(i--, 1);
			}

			if (!pipes.length)
				this.pipes.delete(type);
		}
	}
}
