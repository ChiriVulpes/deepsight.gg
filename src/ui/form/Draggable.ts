import Async from "utility/Async";

enum DragStage {
	None,
	Starting,
	Dragging,
}

export interface IVector2 {
	x: number;
	y: number;
}

export namespace IVector2 {
	export function ZERO (): IVector2 {
		return { x: 0, y: 0 };
	}
}

export default class Draggable {

	private lastMousePosition?: IVector2;
	private dragStage = DragStage.None;

	public constructor (protected readonly host: HTMLElement) {
		this.drag = this.drag.bind(this);
		this.dragStart = this.dragStart.bind(this);
		this.dragEnd = this.dragEnd.bind(this);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		host.addEventListener("mousedown", this.dragStart, { passive: true });
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		host.addEventListener("touchstart", this.dragStart, { passive: true });
	}

	private delay = 0;
	public setDelay (delay: number) {
		this.delay = delay;
		return this;
	}

	private async dragStart (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		const position = this.getMousePosition(event);
		if (!position) {
			return;
		}

		this.lastMousePosition = { x: position.clientX!, y: position.clientY! };
		this.dragStage = DragStage.Starting;

		if (event.type === "mousedown") {
			window.addEventListener("mousemove", this.drag, { passive: true });
			window.addEventListener("mouseup", this.dragEnd, { passive: true });

		} else {
			window.addEventListener("touchmove", this.drag, { passive: true });
			window.addEventListener("touchend", this.dragEnd, { passive: true });
		}

		await Async.sleep(this.delay);

		if (this.dragStage !== DragStage.Starting) {
			return;
		}

		// disable tooltips while dragging handles
		this.host.dispatchEvent(new CustomEvent("moveStart", { detail: this.lastMousePosition }));
		this.dragStage = DragStage.Dragging;
	}

	private drag (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		if (this.dragStage !== DragStage.Dragging) {
			return;
		}

		const position = this.getMousePosition(event);
		if (!position) {
			return;
		}

		this.host.dispatchEvent(new CustomEvent("move", { detail: { x: position.clientX! - this.lastMousePosition!.x, y: position.clientY! - this.lastMousePosition!.y } }));
	}

	private dragEnd (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		window.removeEventListener("mousemove", this.drag);
		window.removeEventListener("mouseup", this.dragEnd);
		window.removeEventListener("touchmove", this.drag);
		window.removeEventListener("touchend", this.dragEnd);

		if (this.dragStage === DragStage.Dragging) {
			const position = this.getMousePosition(event);
			if (position) {
				this.drag(event);
			}

			this.host.dispatchEvent(new CustomEvent("moveEnd"));
		}

		this.dragStage = DragStage.None;
		this.lastMousePosition = undefined;
	}

	private getMousePosition (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		const touch = event.touches?.[0];
		if (event.button !== 0 && !touch)
			return undefined;

		const element = event.target as HTMLElement;
		if (element.closest("button"))
			return undefined;

		return touch ?? event;
	}
}
