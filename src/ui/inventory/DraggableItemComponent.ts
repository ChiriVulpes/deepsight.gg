import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import type { IDraggableEvents } from "ui/form/Draggable";
import Draggable from "ui/form/Draggable";
import ItemComponent from "ui/inventory/ItemComponent";
import ItemTooltip from "ui/inventory/ItemTooltip";
import type { IVector2 } from "utility/maths/Vector2";

export enum DraggableItemClasses {
	Moving = "item-moving",
	Placeholder = "item-moving-placeholder",
	PlaceholderWrapper = "item-moving-placeholder-wrapper",
}

export interface IInteractableItemEvents extends ComponentEvents<typeof ItemComponent>, IDraggableEvents {
	transfer: Event;
}

export interface IDraggableItemHandler {
	createItemPlaceholder (placeholder: ItemComponent, wrapper?: Component): any;
	disposeItemPlaceholder (placeholder: ItemComponent, wrapper?: Component): any;
	moveStart (event: Event & { mouse: IVector2 }): any;
	move (event: Event & { mouse: IVector2 }): any;
	moveEnd (event: Event & { mouse: IVector2 }): any;
}

export default class DraggableItem extends ItemComponent<[Item, Inventory, IDraggableItemHandler]> {

	public override readonly event!: ComponentEventManager<this, IInteractableItemEvents>;

	protected override async onMake (item: Item, inventory: Inventory, handler: IDraggableItemHandler) {
		await super.onMake(item, inventory, handler);
		new Draggable(this.element);

		let movingPlaceholderWrapper: Component | undefined;
		let movingPlaceholder: ItemComponent | undefined;
		this.event.subscribe("moveStart", event => {
			handler.moveStart(event);
			if (event.defaultPrevented)
				return;

			this.classes.add(DraggableItemClasses.Moving);

			movingPlaceholderWrapper = Component.create("span")
				.classes.add(DraggableItemClasses.PlaceholderWrapper)
				.setTooltip(ItemTooltip, {
					initialise: tooltip => item && tooltip.setPadding(20)
						.setItem(item, this.inventory),
					differs: tooltip => tooltip.item?.reference.itemInstanceId !== item?.reference.itemInstanceId,
				});

			movingPlaceholder = ItemComponent.create([item, inventory])
				.classes.add(DraggableItemClasses.Placeholder)
				.clearTooltip()
				.appendTo(movingPlaceholderWrapper);

			handler.createItemPlaceholder(movingPlaceholder, movingPlaceholderWrapper);
		});

		this.event.subscribe("move", event => {
			movingPlaceholderWrapper?.style.set("--transform", `translate(${event.mouse.x}px, ${event.mouse.y}px)`);
			handler.move(event);
		});

		this.event.subscribe("moveEnd", event => {
			if (movingPlaceholder) {
				movingPlaceholder.event.emit("mouseout", new MouseEvent("mouseout"));
				movingPlaceholder.remove();
				handler.disposeItemPlaceholder(movingPlaceholder, movingPlaceholderWrapper);
			}

			movingPlaceholderWrapper?.remove();
			this.classes.remove(DraggableItemClasses.Moving);
			handler.moveEnd(event);
		});
	}
}