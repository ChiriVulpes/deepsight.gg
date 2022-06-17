import Button, { ButtonClasses } from "ui/Button";
import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import type SortManager from "ui/inventory/SortManager";

export enum ItemSortClasses {
	Main = "item-sort",
	Button = "item-sort-button",
	ButtonIcon = "item-sort-button-icon",
	ButtonLabel = "item-sort-button-label",
	ButtonSortText = "item-sort-button-sort-text",
	Drawer = "item-sort-drawer",
}

export interface ItemSortEvents extends ComponentEvents<typeof Component> {
	sort: Event;
}

export default class ItemSort extends Component<HTMLElement, [SortManager]> {

	public override readonly event!: ComponentEventManager<this, ItemSortEvents>;

	public drawer!: Component;

	protected override onMake (sort: SortManager): void {
		this.classes.add(ItemSortClasses.Main);

		this.drawer = Component.create()
			.classes.add(ItemSortClasses.Drawer, Classes.Hidden)
			.appendTo(this);

		const sortButton = Button.create()
			.classes.remove(ButtonClasses.Main)
			.classes.add(ItemSortClasses.Button)
			.event.subscribe("click", () => this.drawer.classes.toggle(Classes.Hidden))
			.appendTo(this);

		Component.create()
			.classes.add(ItemSortClasses.ButtonIcon)
			.append(Component.create())
			.append(Component.create())
			.appendTo(sortButton);

		Component.create()
			.classes.add(ItemSortClasses.ButtonLabel)
			.text.set(`Sort ${sort.name}`)
			.appendTo(sortButton);

		const sortText = Component.create()
			.classes.add(ItemSortClasses.ButtonSortText)
			.text.set(sort.get().map(sort => sort.name).join(", "))
			.appendTo(sortButton);

		this.onClick = this.onClick.bind(this);
		document.body.addEventListener("click", this.onClick);
	}

	private onClick (event: Event): void {
		if (!this.exists())
			return document.body.removeEventListener("click", this.onClick);

		if ((event.target as HTMLElement).closest(`.${ItemSortClasses.Main}`))
			return;

		this.drawer.classes.add(Classes.Hidden);
	}
}
