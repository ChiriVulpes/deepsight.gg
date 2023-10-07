import { EventManager } from "utility/EventManager";

type Modifier = "ctrl" | "shift" | "alt";

export interface IKeyEvent {
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	used: boolean;
	input: HTMLElement | null;
	use (key: string, ...modifiers: Modifier[]): boolean;
	useOverInput (key: string, ...modifiers: Modifier[]): boolean;
	matches (key: string, ...modifiers: Modifier[]): boolean;
	cancelInput (): void;
	hovering (selector?: string): HTMLElement | undefined;
}

export interface IKeyUpEvent extends IKeyEvent {
	usedAnotherKeyDuring: boolean;
}

export interface IUiEventBusEvents {
	keydown: IKeyEvent;
	keyup: IKeyUpEvent;
}

const UiEventBus = EventManager.make<IUiEventBusEvents>();

type RawEvent = Partial<KeyboardEvent> & Partial<MouseEvent> & (KeyboardEvent | MouseEvent);

let lastUsed = 0;
const state: Record<string, number | undefined> = {};

const mouseKeyMap: Record<string, string> = {
	[0]: "MouseLeft",
	[1]: "MouseMiddle",
	[2]: "MouseRight",
	[3]: "Mouse3",
	[4]: "Mouse4",
	[5]: "Mouse5",
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	[`${undefined}`]: "Mouse?",
};

function emitKeyEvent (e: RawEvent) {
	const input = (e.target as HTMLElement).closest<HTMLElement>("input[type=text], textarea, [contenteditable]");
	let usedByInput = !!input;

	const eventKey = e.key ?? mouseKeyMap[e.button!];
	const eventType = e.type === "mousedown" ? "keydown" : e.type === "mouseup" ? "keyup" : e.type as "keydown" | "keyup";
	if (eventType === "keydown")
		state[eventKey] = Date.now();

	let cancelInput = false;
	const event: IKeyEvent & Partial<IKeyUpEvent> = {
		key: eventKey,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		alt: e.altKey,
		used: usedByInput,
		input,
		use: (key, ...modifiers) => {
			if (event.used)
				return false;

			const matches = event.matches(key, ...modifiers);
			if (matches)
				event.used = true;

			return matches;
		},
		useOverInput: (key, ...modifiers) => {
			if (event.used && !usedByInput)
				return false;

			const matches = event.matches(key, ...modifiers);
			if (matches) {
				event.used = true;
				usedByInput = false;
			}

			return matches;
		},
		matches: (key, ...modifiers) => {
			if (eventKey !== key)
				return false;

			if (!modifiers.every(modifier => event[modifier]))
				return false;

			return true;
		},
		cancelInput: () => cancelInput = true,
		hovering: (selector) => {
			const hovered = [...document.querySelectorAll<HTMLElement>(":hover")];
			return selector ? hovered[hovered.length - 1]?.closest<HTMLElement>(selector) ?? undefined : hovered[hovered.length - 1];
		},
	};

	if (eventType === "keyup") {
		event.usedAnotherKeyDuring = lastUsed > (state[eventKey] ?? 0);
		delete state[eventKey];
	}

	UiEventBus.emit(eventType, event);

	if ((event.used && !usedByInput) || (usedByInput && cancelInput)) {
		e.preventDefault();
		lastUsed = Date.now();
	}
}

document.addEventListener("keydown", emitKeyEvent);
document.addEventListener("keyup", emitKeyEvent);

document.addEventListener("mousedown", emitKeyEvent);
document.addEventListener("mouseup", emitKeyEvent);
document.addEventListener("click", emitKeyEvent);

declare global {
	interface MouseEvent {
		used: boolean;
		use (key: string, ...modifiers: Modifier[]): boolean;
		matches (key: string, ...modifiers: Modifier[]): boolean;
	}
	interface PointerEvent {
		used: boolean;
		use (key: string, ...modifiers: Modifier[]): boolean;
		matches (key: string, ...modifiers: Modifier[]): boolean;
	}
}

interface MouseEventInternal extends MouseEvent {
	_used?: boolean;
}

Object.defineProperty(MouseEvent.prototype, "used", {
	get (this: MouseEventInternal) {
		return this._used ?? false;
	},
});

Object.defineProperty(MouseEvent.prototype, "use", {
	value: function (this: MouseEventInternal, key: string, ...modifiers: Modifier[]) {
		if (this._used)
			return false;

		const matches = this.matches(key, ...modifiers);
		if (matches) {
			this._used = true;
			// allow click & contextmenu handlers to be considered "used" for IKeyUpEvents
			lastUsed = Date.now();
		}

		return matches;
	},
});

Object.defineProperty(MouseEvent.prototype, "matches", {
	value: function (this: MouseEventInternal, key: string, ...modifiers: Modifier[]) {
		if (mouseKeyMap[this.button] !== key)
			return false;

		if (!modifiers.every(modifier => this[`${modifier}Key`]))
			return false;

		return true;
	},
});

export default UiEventBus;
