import { EventManager } from "utility/EventManager";

export interface IKeyEvent {
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	used: boolean;
	input: HTMLElement | null;
	use (key: string, ...modifiers: ("ctrl" | "shift" | "alt")[]): boolean;
	useOverInput (key: string, ...modifiers: ("ctrl" | "shift" | "alt")[]): boolean;
	matches (key: string, ...modifiers: ("ctrl" | "shift" | "alt")[]): boolean;
	cancelInput (): void;
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

let lastUp = 0;
const state: Record<string, number | undefined> = {};

function emitKeyEvent (e: RawEvent) {
	const input = (e.target as HTMLElement).closest<HTMLElement>("input[type=text], textarea, [contenteditable]");
	let usedByInput = !!input;

	const eventKey = e.key ?? `Mouse${e.button === 0 ? "Left" : e.button === 1 ? "Middle" : e.button === 2 ? "Right" : (e.button ?? "?")}`;
	const eventType = e.type === "mousedown" ? "keydown" : e.type === "mouseup" ? "keyup" : e.type as "keydown" | "keyup";
	if (eventType === "keydown")
		state[eventKey] = Date.now();
	else
		delete state[eventKey];

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
	};

	if (eventType === "keyup") {
		event.usedAnotherKeyDuring = lastUp > (state[eventKey] ?? 0);
		delete state[eventKey];
	}

	UiEventBus.emit(eventType, event);

	if ((event.used && !usedByInput) || (usedByInput && cancelInput)) {
		e.preventDefault();
		if (eventType === "keyup")
			lastUp = Date.now();
	}
}

document.addEventListener("keydown", emitKeyEvent);
document.addEventListener("keyup", emitKeyEvent);

document.addEventListener("mousedown", emitKeyEvent);
document.addEventListener("mouseup", emitKeyEvent);

export default UiEventBus;
