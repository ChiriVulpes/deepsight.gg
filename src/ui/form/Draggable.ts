import { EventManager } from "utility/EventManager";
import { IVector2 } from "utility/maths/Vector2";

enum DragStage {
	None,
	Starting,
	Dragging,
}

export interface IDraggableEvents {
	moveStart: { mouse: IVector2 };
	move: { mouse: IVector2; offset: IVector2 };
	moveEnd: { mouse: IVector2; offset: IVector2 };
}

export interface MouseTouchEvent extends Partial<MouseEvent>, Partial<TouchEvent> { }

export default class Draggable {

	private mouseStartPosition?: IVector2;
	private dragStage = DragStage.None;

	public constructor (protected readonly host: HTMLElement) {
		this.drag = this.drag.bind(this);
		this.dragStart = this.dragStart.bind(this);
		this.dragEnd = this.dragEnd.bind(this);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		host.addEventListener("mousedown", this.dragStart);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		host.addEventListener("touchstart", this.dragStart);
	}

	private stickyDistance = 20;
	public setStickyDistance (stickyDistance: number) {
		this.stickyDistance = stickyDistance;
		return this;
	}

	private filter?: (input: MouseTouchEvent) => any;
	public setInputFilter (filter?: (input: MouseTouchEvent) => any) {
		this.filter = filter;
		return this;
	}

	private dragStart (event: MouseTouchEvent) {
		const position = this.getMousePosition(event);
		if (!position)
			return;

		this.mouseStartPosition = { x: position.clientX!, y: position.clientY! };
		this.dragStage = DragStage.Starting;

		if (event.type === "mousedown") {
			window.addEventListener("mousemove", this.drag, { passive: true });
			window.addEventListener("mouseup", this.dragEnd);

		} else {
			window.addEventListener("touchmove", this.drag, { passive: true });
			window.addEventListener("touchend", this.dragEnd);
		}
	}

	private drag (event: MouseTouchEvent) {
		const position = this.getMousePosition(event);
		if (!position)
			return undefined;

		const offset: IVector2 = {
			x: position.clientX! - this.mouseStartPosition!.x,
			y: position.clientY! - this.mouseStartPosition!.y,
		};

		if (this.dragStage === DragStage.Starting && !IVector2.distanceWithin(IVector2.ZERO(), offset, this.stickyDistance)) {
			const event = EventManager.emit(this.host, "moveStart", { offset: this.mouseStartPosition });
			if (event.defaultPrevented)
				// cancelled
				return undefined;

			this.dragStage = DragStage.Dragging;
		}

		if (this.dragStage !== DragStage.Dragging)
			return undefined;

		const eventResult = { offset, mouse: { x: position.clientX!, y: position.clientY! } };
		EventManager.emit(this.host, "move", eventResult);
		return eventResult;
	}

	private dragEnd (event: MouseTouchEvent) {
		window.removeEventListener("mousemove", this.drag);
		window.removeEventListener("mouseup", this.dragEnd);
		window.removeEventListener("touchmove", this.drag);
		window.removeEventListener("touchend", this.dragEnd);

		if (this.dragStage === DragStage.Dragging) {
			const position = this.getMousePosition(event);
			let eventResult: IDraggableEvents["move"] | undefined;
			if (position)
				eventResult = this.drag(event);

			EventManager.emit(this.host, "moveEnd", eventResult ?? { offset: { x: 0, y: 0 }, mouse: { x: event.clientX, y: event.clientY } });
		}

		this.dragStage = DragStage.None;
		this.mouseStartPosition = undefined;
	}

	private getMousePosition (event: MouseTouchEvent) {
		const touch = event.touches?.[0];
		if (event.button !== 0 && !touch)
			return undefined;

		if (this.filter && !this.filter(event))
			return undefined;

		return touch ?? event;
	}
}
