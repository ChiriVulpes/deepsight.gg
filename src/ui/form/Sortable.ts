import Draggable from "ui/form/Draggable";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import { EventManager } from "utility/EventManager";
import { IVector2 } from "utility/maths/Vector2";

export enum SortableClasses {
	Item = "sortable-item",
	Slot = "sortable-slot",
	Moving = "sortable-moving",
}

export interface ISortableEvents {
	commit: Event;
}

export default class Sortable {

	public readonly event = EventManager.make<ISortableEvents>();

	private readonly draggables = new WeakMap<HTMLElement, Draggable>();

	public constructor (public readonly host: HTMLElement) {
		this.onItemMoveStart = this.onItemMoveStart.bind(this);
		this.onItemMove = this.onItemMove.bind(this);
		this.onItemMoveEnd = this.onItemMoveEnd.bind(this);
		this.onKeydown = this.onKeydown.bind(this);

		for (const child of host.children as Iterable<HTMLElement>) {
			child.classList.add(SortableClasses.Item);
			child.setAttribute("tabindex", "0");
			this.draggables.set(child, new Draggable(child).setStickyDistance(this.sortStickyDistance));

			child.addEventListener("moveStart", this.onItemMoveStart);
			child.addEventListener("move", this.onItemMove);
			child.addEventListener("moveEnd", this.onItemMoveEnd);
		}

		UiEventBus.subscribe("keydown", this.onKeydown);
	}

	public dispose () {
		for (const child of this.host.children) {
			child.removeEventListener("moveStart", this.onItemMoveStart);
			child.removeEventListener("move", this.onItemMove);
			child.removeEventListener("moveEnd", this.onItemMoveEnd);
		}

		UiEventBus.unsubscribe("keydown", this.onKeydown);
	}

	private sortStickyDistance = 0;
	public setSortStickyDistance (stickyDistance: number) {
		this.sortStickyDistance = stickyDistance;
		for (const item of this.host.children as Iterable<HTMLElement>)
			this.draggables.get(item)?.setStickyDistance(stickyDistance);

		return this;
	}

	public sortUp (item: HTMLElement) {
		if (item === this.host.children[0])
			return false;

		this.host.insertBefore(item, item.previousElementSibling);
		this.commit();
		return true;
	}

	public sortDown (item: HTMLElement) {
		if (item === this.host.children[this.host.children.length - 1])
			return false;

		this.host.insertBefore(item, item.nextElementSibling?.nextElementSibling ?? null);
		this.commit();
		return true;
	}

	public commit () {
		this.event.emit("commit");
	}

	private savedPosition?: IVector2;
	private onItemMoveStart (e: Event) {
		const event = e as any as { offset: IVector2, target: HTMLElement };
		const item = event.target;
		const itemBox = item.getBoundingClientRect();
		const hostBox = this.host.getBoundingClientRect();
		this.savedPosition = { x: itemBox.left - hostBox.left, y: itemBox.top - hostBox.top };
		item.classList.add(SortableClasses.Moving);
		this.slot ??= document.createElement("div");
		this.slot.classList.add(SortableClasses.Slot);
		this.host.insertBefore(this.slot, item);
		this.onItemMove({ target: item, offset: IVector2.ZERO() });
	}

	private slot?: HTMLElement;
	private onItemMove (e: Event | { offset: IVector2, target: HTMLElement }) {
		const event = e as any as { offset: IVector2, target: HTMLElement };
		const item = event.target;
		const change = event.offset;
		const position = { x: (this.savedPosition?.x ?? 0) + change.x, y: (this.savedPosition?.y ?? 0) + change.y };
		item.style.left = `${position.x}px`;
		item.style.top = `${position.y}px`;

		const before = this.findItemBefore(item, position, [...this.host.children] as HTMLElement[]);
		this.host.insertBefore(this.slot!, !before ? this.host.firstElementChild : before.nextElementSibling);
	}

	private findItemBefore (item: HTMLElement, position: IVector2, children: HTMLElement[]): HTMLElement | undefined {
		const box = this.host.getBoundingClientRect();
		const thisTop = box.top;
		const thisLeft = box.left;
		let lastTop: number | undefined;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child === item) {
				continue;
			}

			let { left, top, width, height } = child.getBoundingClientRect();
			// adjust child position by the position of the host in the document
			left -= thisLeft;
			top -= thisTop;

			// if this is the first item
			if (i === (children[0] === item ? 1 : 0)) {
				if (position.y < top) {
					// if we're higher than the first item, sort to the start
					return undefined;
				}

				if (position.x < left && position.y < top + height) {
					// if we're left of the first item, and we're not below the first item, sort to the start
					return undefined;
				}
			}

			// if we're on a different row
			if (lastTop !== undefined && lastTop !== top) {
				// if the new row's top is past the hovered position's y, sort to the end of the previous row
				if (position.y < top) {
					return children[i - 1];
				}

				// if the position is within this row vertically, but before any item, sort at the start of this row
				if (position.y >= top && position.y < top + height && position.x < left) {
					return children[i - 1];
				}
			}

			lastTop = top;

			// if we're hovering inside an item's box
			if (position.x >= left && position.x < left + width && position.y >= top && position.y < top + height) {
				return child;
			}
		}

		// we weren't inside anything, and we didn't get put at the start, so we must be after everything instead
		return children[children.length - 1];
	}

	private onItemMoveEnd (e: Event) {
		const event = e as any as { detail: IVector2, target: HTMLElement };
		event.target.classList.remove(SortableClasses.Moving);
		event.target.style.removeProperty("left");
		event.target.style.removeProperty("top");
		this.host.insertBefore(event.target, this.slot?.nextElementSibling ?? null);
		this.slot?.remove();
		this.commit();
	}

	private onKeydown (event: IKeyEvent) {
		if (!document.contains(this.host)) {
			this.dispose();
			return;
		}

		const item = document.activeElement as HTMLElement;
		if (item.parentElement !== this.host)
			return;

		switch (event.key) {
			case "ArrowUp":
			case "ArrowLeft":
				if (!this.sortUp(item)) return;
				break;

			case "ArrowDown":
			case "ArrowRight":
				if (!this.sortDown(item)) return;
				break;

			default:
				return;
		}

		event.use(event.key);
		item.focus();
	}

}
