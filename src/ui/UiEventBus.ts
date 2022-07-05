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

export interface IUiEventBusEvents {
	keydown: IKeyEvent;
	keyup: IKeyEvent;
}

const UiEventBus = EventManager.make<IUiEventBusEvents>();

function emitKeyEvent (e: KeyboardEvent) {
	const input = (e.target as HTMLElement).closest<HTMLElement>("input[type=text], textarea, [contenteditable]");
	let usedByInput = !!input;

	let cancelInput = false;
	const event: IKeyEvent = {
		key: e.key,
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
			if (e.key !== key)
				return false;

			if (!modifiers.every(modifier => event[modifier]))
				return false;

			return true;
		},
		cancelInput: () => cancelInput = true,
	}

	UiEventBus.emit(e.type as "keydown" | "keyup", event);

	if ((event.used && !usedByInput) || (usedByInput && cancelInput))
		e.preventDefault();
}

document.addEventListener("keydown", emitKeyEvent);
document.addEventListener("keyup", emitKeyEvent);

export default UiEventBus;
