import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import ExtraInfoManager from "ui/ExtraInfoManager";
import Button, { ButtonClasses } from "ui/form/Button";
import Sortable from "ui/form/Sortable";
import type { ISort } from "ui/inventory/sort/Sort";
import type SortManager from "ui/inventory/SortManager";

export enum ItemSortClasses {
	Main = "item-sort",
	Button = "item-sort-button",
	ButtonIcon = "item-sort-button-icon",
	ButtonLabel = "item-sort-button-label",
	ButtonSortText = "item-sort-button-sort-text",
	Drawer = "item-sort-drawer",
	Sorts = "item-sort-drawer-sorts",
	Sort = "item-sort-drawer-sort",
	SortsHeading = "item-sort-drawer-sorts-heading",
}

export interface ItemSortEvents extends ComponentEvents<typeof Component> {
	sort: Event;
}

class SortableSort extends Component<HTMLElement, [ISort]> {
	public sort!: ISort;

	protected override onMake (sort: ISort): void {
		this.sort = sort;
		this.classes.add(ItemSortClasses.Sort)
			.text.set(sort.name);
	}
}

export default class ItemSort extends Component<HTMLElement, [SortManager]> {

	public override readonly event!: ComponentEventManager<this, ItemSortEvents>;

	public sorter!: SortManager;
	public drawer!: Component;
	public sorts!: SortableSort[];
	public sortsList!: Component;
	public sortsDisabledHeading!: Component;
	public sortText!: Component;

	protected override onMake (sorter: SortManager): void {
		this.sorter = sorter;
		this.classes.add(ItemSortClasses.Main);

		////////////////////////////////////
		// Button
		const sortButton = Button.create()
			.classes.remove(ButtonClasses.Main)
			.classes.add(ItemSortClasses.Button)
			.event.subscribe("click", () => {
				this.drawer.classes.toggle(Classes.Hidden);
				const hidden = this.drawer.classes.has(Classes.Hidden);
				ExtraInfoManager.toggle(ItemSortClasses.Main, !hidden);
				this.drawer.attributes.toggle(hidden, "inert");
			})
			.appendTo(this);

		Component.create()
			.classes.add(ItemSortClasses.ButtonIcon)
			.append(Component.create())
			.append(Component.create())
			.appendTo(sortButton);

		Component.create()
			.classes.add(ItemSortClasses.ButtonLabel)
			.text.set(`Sort ${sorter.name}`)
			.appendTo(sortButton);

		this.sortText = Component.create()
			.classes.add(ItemSortClasses.ButtonSortText)
			.appendTo(sortButton);

		////////////////////////////////////
		// Drawer
		this.drawer = Component.create()
			.classes.add(ItemSortClasses.Drawer, Classes.Hidden)
			.attributes.add("inert")
			.appendTo(this);

		Component.create()
			.classes.add(ItemSortClasses.SortsHeading)
			.text.set("Sort By")
			.appendTo(this.drawer);

		this.sortsList = Component.create()
			.classes.add(ItemSortClasses.Sorts)
			.appendTo(this.drawer);

		this.sorts = [];
		for (const sort of sorter.get())
			this.sorts.push(SortableSort.create([sort])
				.appendTo(this.sortsList));

		this.sortsDisabledHeading = Component.create()
			.classes.add(ItemSortClasses.SortsHeading)
			.text.set("Don't Sort By")
			.appendTo(this.sortsList);

		for (const sort of sorter.getDisabled())
			this.sorts.push(SortableSort.create([sort])
				.appendTo(this.sortsList));

		this.onCommitSort = this.onCommitSort.bind(this);
		new Sortable(this.sortsList.element)
			.event.subscribe("commit", this.onCommitSort);

		this.sortsDisabledHeading.attributes.remove("tabindex");

		////////////////////////////////////
		// Setup
		this.updateSortDisplay();

		this.onClick = this.onClick.bind(this);
		document.body.addEventListener("click", this.onClick);
	}

	private onClick (event: Event): void {
		if (!this.exists())
			return document.body.removeEventListener("click", this.onClick);

		if ((event.target as HTMLElement).closest(`.${ItemSortClasses.Main}`))
			return;

		this.drawer.classes.add(Classes.Hidden);
		ExtraInfoManager.hide(ItemSortClasses.Main);
		this.drawer.attributes.add("inert");
	}

	private onCommitSort () {
		this.sorter.set([...this.sortsList.children<SortableSort>()]
			.map(child => child.sort)
			.slice(0, this.sortsDisabledHeading.index()));

		this.updateSortDisplay();
		this.event.emit("sort");
	}

	private updateSortDisplay () {
		this.sortText.text.set(this.sorter.get()
			.map(sort => sort.name)
			.join(", "));
	}
}
