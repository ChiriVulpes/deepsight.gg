import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import Sortable from "ui/form/Sortable";
import ItemComponent from "ui/inventory/ItemComponent";
import type { ISort } from "ui/inventory/sort/Sort";
import Sort from "ui/inventory/sort/Sort";
import type SortManager from "ui/inventory/sort/SortManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Bound from "utility/decorator/Bound";

export enum ItemSortClasses {
	Main = "item-sort",
	Button = "item-sort-button",
	ButtonIcon = "item-sort-button-icon",
	ButtonLabel = "item-sort-button-label",
	ButtonSortText = "item-sort-button-sort-text",
	Drawer = "item-sort-drawer",
	DrawerPanel = "item-sort-drawer-panel",
	Sorts = "item-sort-drawer-sorts",
	Sort = "item-sort-drawer-sort",
	SortTitle = "item-sort-drawer-sort-title",
	SortIcon = "item-sort-drawer-sort-icon",
	SortIconMask = "item-sort-drawer-sort-icon-mask",
	SortOptions = "item-sort-drawer-sort-options",
	SortsHeading = "item-sort-drawer-sorts-heading",
	SortReverse = "item-sort-drawer-sort-reverse",
	Sort_Reversed = "item-sort-drawer-sort--reversed",
	SortButton = "item-sort-drawer-sort-button",
}

export interface ItemSortEvents extends ComponentEvents {
	sort: Event;
}

export interface SortableSortEvents extends ComponentEvents {
	configure: { sort: ISort };
	reverse: { sort: ISort };
}

export class SortableSort extends Component<HTMLElement, [ISort]> {

	public override event!: ComponentEventManager<this, SortableSortEvents>;

	public sort!: ISort;

	public title!: Component;

	public get reversed () {
		return this.classes.has(ItemSortClasses.Sort_Reversed);
	}

	public get icon () {
		return Component.create("span")
			.classes.add(ItemSortClasses.SortIcon, `item-sort-drawer-sort-${this.sort.className ?? (typeof this.sort.id === "number" ? Sort[this.sort.id] : this.sort.id).toLowerCase()}-icon`)
			.prependTo(this.title);
	}

	public get maskIcon () {
		return Component.create("span")
			.classes.add(ItemSortClasses.SortIconMask, `item-sort-drawer-sort-${this.sort.className ?? (typeof this.sort.id === "number" ? Sort[this.sort.id] : this.sort.id).toLowerCase()}-icon`)
			.prependTo(this.title);
	}

	protected override onMake (sort: ISort): void {
		this.sort = sort;
		this.classes.add(ItemSortClasses.Sort, `item-sort-drawer-sort-${sort.className ?? (typeof sort.id === "number" ? Sort[sort.id] : sort.id).toLowerCase()}`);

		this.title = Component.create("span")
			.classes.add(ItemSortClasses.SortTitle)
			.text.set(sort.name)
			.appendTo(this);

		sort.renderSortable?.(this);

		if (sort.renderSortableOptions)
			Button.create()
				.classes.add(ButtonClasses.Icon, ItemSortClasses.SortButton, ItemSortClasses.SortOptions)
				.event.subscribe("click", this.onOptions)
				.appendTo(this);

		Button.create()
			.classes.add(ButtonClasses.Icon, ItemSortClasses.SortButton, ItemSortClasses.SortReverse)
			.event.subscribe("click", this.onReverse)
			.appendTo(this);
	}

	public setReversed (reversed = true) {
		this.classes.toggle(reversed, ItemSortClasses.Sort_Reversed);
		return this;
	}

	@Bound
	private onOptions () {
		this.event.emit("configure", { sort: this.sort });
	}

	@Bound
	private onReverse () {
		this.setReversed(!this.reversed);
		this.event.emit("reverse", { sort: this.sort });
	}
}

export default class ItemSort extends Component<HTMLElement, [SortManager]> {

	public override readonly event!: ComponentEventManager<this, ItemSortEvents>;

	public sorter!: SortManager;
	public button!: Button;
	public label!: Component;
	public sortText!: Component;
	public drawer!: Drawer;
	public mainPanel!: Component;
	public sortsDisabledHeading!: Component;
	public sorts!: SortableSort[];
	public sortsList!: Component;
	public configurePanel!: Component;
	public configureTitle!: Component;
	public configureWrapper!: Component;

	protected override onMake (sorter: SortManager): void {
		this.sorter = sorter;
		this.classes.add(ItemSortClasses.Main);

		////////////////////////////////////
		// Button
		this.button = Button.create()
			.classes.add(ItemSortClasses.Button)
			.event.subscribe("click", this.toggleDrawer)
			.addIcon(icon => icon.classes.add(ItemSortClasses.ButtonIcon))
			.appendTo(this);

		this.label = Component.create()
			.classes.add(ItemSortClasses.ButtonLabel)
			.text.set(`Sort ${sorter.name}`)
			.appendTo(this.button);

		this.sortText = Component.create()
			.classes.add(ItemSortClasses.ButtonSortText)
			.appendTo(this.button);

		////////////////////////////////////
		// Drawer
		this.drawer = Drawer.create()
			.classes.add(ItemSortClasses.Drawer)
			.event.subscribe("focus", this.focusDrawer)
			.appendTo(this);

		this.mainPanel = this.drawer.createPanel();

		Component.create()
			.classes.add(ItemSortClasses.SortsHeading)
			.text.set("Sort By")
			.appendTo(this.mainPanel);

		this.sortsList = Component.create()
			.classes.add(ItemSortClasses.Sorts)
			.appendTo(this.mainPanel);

		this.configurePanel = this.drawer.createPanel();

		this.configureTitle = Component.create()
			.classes.add(ItemSortClasses.SortsHeading)
			.text.set("Configure Sort")
			.appendTo(this.configurePanel);

		this.configureWrapper = Component.create()
			.appendTo(this.configurePanel);

		this.sorts = [];
		for (const sort of sorter.get())
			this.createSortableSort(sort, sorter.isReversed(sort));

		this.sortsDisabledHeading = Component.create()
			.classes.add(ItemSortClasses.SortsHeading)
			.text.set("Don't Sort By")
			.appendTo(this.sortsList);

		for (const sort of sorter.getDisabled())
			this.createSortableSort(sort, sorter.isReversed(sort));

		new Sortable(this.sortsList.element)
			.setInputFilter(event => !(event.target as HTMLElement).closest("button"))
			.event.subscribe("commit", this.onCommitSort);

		this.sortsDisabledHeading.attributes.remove("tabindex");

		////////////////////////////////////
		// Setup
		this.updateSortDisplay();

		document.body.addEventListener("click", this.onClick);

		UiEventBus.subscribe("keydown", this.onKeydown);
		UiEventBus.subscribe("keyup", this.onKeyup);
	}

	private createSortableSort (sort: ISort, reversed: boolean) {
		this.sorts.push(SortableSort.create([sort])
			.setReversed(reversed)
			.event.subscribe("configure", this.configureSort)
			.event.subscribe("reverse", this.reverseSort)
			.appendTo(this.sortsList));
	}

	@Bound
	private configureSort ({ sort }: { sort: ISort }) {
		this.configureTitle.text.set(`Configure ${sort.name}`);
		this.configureWrapper.removeContents().tweak(sort.renderSortableOptions, this.onCommitSort);
		this.drawer.showPanel(this.configurePanel, true);
	}

	@Bound
	private reverseSort ({ sort }: { sort: ISort }) {
		this.onCommitSort();
	}

	@Bound
	private onClick (event: Event): void {
		if (!this.exists())
			return document.body.removeEventListener("click", this.onClick);

		if ((event.target as HTMLElement).closest(`.${ItemSortClasses.Main}`))
			return;

		this.closeDrawer();
	}

	@Bound
	private onCommitSort () {
		const enabledSorts = [...this.sortsList.children<SortableSort>()]
			.slice(0, this.sortsDisabledHeading.index());

		this.sorter.set(enabledSorts.map(child => child.sort), false);
		this.sorter.setReversed(enabledSorts.filter(sort => sort.reversed).map(child => child.sort));

		this.updateSortDisplay();
		this.event.emit("sort");
	}

	private updateSortDisplay () {
		this.sortText.text.set(this.sorter.get()
			.map(sort => sort.shortName ?? sort.name)
			.join(", "));
	}

	@Bound
	private onKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onKeydown);
			return;
		}

		if (event.useOverInput("s", "ctrl"))
			this.openDrawer();

		if (this.drawer.isOpen() && event.useOverInput("Escape"))
			this.closeDrawer();
	}

	@Bound
	private onKeyup () {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keyup", this.onKeyup);
			return;
		}

		if (!this.element.contains(document.activeElement))
			this.closeDrawer();
	}

	@Bound
	private toggleDrawer () {
		if (!this.drawer.isOpen())
			this.openDrawer();
		else
			this.closeDrawer();
	}

	private openDrawer () {
		if (this.drawer.isOpen())
			return;

		this.drawer.open();
		this.drawer.showPanel(this.mainPanel);
		ItemComponent.showExtra(ItemSortClasses.Main);
		this.focusDrawer();
	}

	private closeDrawer () {
		this.drawer.close(true);
		ItemComponent.hideExtra(ItemSortClasses.Main);
	}

	@Bound
	private focusDrawer () {
		const [firstSort] = this.sortsList.children<SortableSort>();
		firstSort.element.focus();
	}
}
