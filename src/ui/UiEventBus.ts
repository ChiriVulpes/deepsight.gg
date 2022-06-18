import { EventManager } from "utility/EventManager";

export interface IKeyEvent {
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	used: boolean;
	use (key: string, ...modifiers: ("ctrl" | "shift" | "alt")[]): boolean;
}

export interface IUiEventBusEvents {
	keydown: IKeyEvent;
	keyup: IKeyEvent;
}

const UiEventBus = EventManager.make<IUiEventBusEvents>();

function emitKeyEvent (e: KeyboardEvent) {
	const event: IKeyEvent = {
		key: e.key,
		ctrl: e.ctrlKey,
		shift: e.shiftKey,
		alt: e.altKey,
		used: false,
		use: (key, ...modifiers) => {
			if (event.used)
				return false;

			if (e.key !== key)
				return false;

			if (!modifiers.every(modifier => event[modifier]))
				return false;

			event.used = true;
			return true;
		},
	}

	UiEventBus.emit(e.type as "keydown" | "keyup", event);

	if (event.used)
		e.preventDefault();
}

document.addEventListener("keydown", emitKeyEvent);
document.addEventListener("keyup", emitKeyEvent);

export default UiEventBus;
