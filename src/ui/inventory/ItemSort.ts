import Button, { ButtonClasses } from "ui/Button";
import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";

export enum ItemSortClasses {
	Main = "item-sort",
	Button = "item-sort-button",
	ButtonIcon = "item-sort-button-icon",
	ButtonLabel = "item-sort-button-label",
	Drawer = "item-sort-drawer",
}

export interface ItemSortEvents extends ComponentEvents<typeof Component> {
	sort: Event;
}

export default class ItemSort extends Component {

	public override readonly event!: ComponentEventManager<this, ItemSortEvents>;

	protected override onMake (): void {
		this.classes.add(ItemSortClasses.Main);

		const drawer = Component.create()
			.classes.add(ItemSortClasses.Drawer, Classes.Hidden)
			.appendTo(this);

		const sortButton = Button.create()
			.classes.remove(ButtonClasses.Main)
			.classes.add(ItemSortClasses.Button)
			.event.subscribe("click", () => drawer.classes.toggle(Classes.Hidden))
			.appendTo(this);

		Component.create()
			.classes.add(ItemSortClasses.ButtonIcon)
			.append(Component.create())
			.append(Component.create())
			.appendTo(sortButton);

		sortButton.text.add("Sort:");

		const sortLabel = Component.create()
			.classes.add(ItemSortClasses.ButtonLabel)
			.appendTo(sortButton);

		document.body.addEventListener("click", event => {
			if ((event.target as HTMLElement).closest(`.${ItemSortClasses.Main}`))
				return;

			drawer.classes.add(Classes.Hidden);
		});
	}
}
