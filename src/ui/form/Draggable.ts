import { EventManager } from "utility/EventManager";
import { IVector2 } from "utility/maths/Vector2";

enum DragStage {
	None,
	Starting,
	Dragging,
}

export interface IDraggableEvents {
	moveStart: { offset: IVector2 };
	move: { offset: IVector2 };
	moveEnd: Event;
}

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

	private dragStart (event: Partial<MouseEvent> & Partial<TouchEvent>) {
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

	private drag (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		const position = this.getMousePosition(event);
		if (!position)
			return;

		const offset: IVector2 = {
			x: position.clientX! - this.mouseStartPosition!.x,
			y: position.clientY! - this.mouseStartPosition!.y,
		};

		if (this.dragStage === DragStage.Starting && !IVector2.distanceWithin(IVector2.ZERO(), offset, this.stickyDistance)) {
			EventManager.emit(this.host, "moveStart", { offset: this.mouseStartPosition });
			this.dragStage = DragStage.Dragging;
		}

		if (this.dragStage !== DragStage.Dragging)
			return;

		EventManager.emit(this.host, "move", { offset });
	}

	private dragEnd (event: Partial<MouseEvent> & Partial<TouchEvent>) {
		window.removeEventListener("mousemove", this.drag);
		window.removeEventListener("mouseup", this.dragEnd);
		window.removeEventListener("touchmove", this.drag);
		window.removeEventListener("touchend", this.dragEnd);

		if (this.dragStage === DragStage.Dragging) {
			const position = this.getMousePosition(event);
			if (position)
				this.drag(event);

			EventManager.emit(this.host, "moveEnd");
		}

		this.dragStage = DragStage.None;
		this.mouseStartPosition = undefined;
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
