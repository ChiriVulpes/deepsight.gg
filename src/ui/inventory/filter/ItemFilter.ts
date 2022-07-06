import { Classes } from "ui/Classes";
import type { ComponentEventManager } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import type FilterManager from "ui/inventory/filter/FilterManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Async from "utility/Async";

export enum ItemFilterClasses {
	Main = "item-filter",
	Button = "item-filter-button",
	ButtonIcon = "item-filter-button-icon",
	ButtonLabel = "item-filter-button-label",
	Input = "item-filter-input",
	Drawer = "item-filter-drawer",
	DrawerPanel = "item-filter-drawer-panel",
	FiltersHeading = "item-filter-heading",
}

export interface IItemFilterEvents {
	filter: Event;
}

export default class ItemFilter extends Component<HTMLElement, [FilterManager]> {

	public override readonly event!: ComponentEventManager<this, IItemFilterEvents>;

	public filterer!: FilterManager;
	public button!: Button;
	public label!: Component;
	public input!: Component;
	public drawer!: Drawer;
	public mainPanel!: Component;

	protected override onMake (filterer: FilterManager): void {
		this.filterer = filterer;
		this.classes.add(ItemFilterClasses.Main);

		////////////////////////////////////
		// Button
		this.button = Button.create()
			.classes.add(ItemFilterClasses.Button)
			.event.subscribe("click", this.openDrawer.bind(this))
			.addIcon(icon => icon.classes.add(ItemFilterClasses.ButtonIcon))
			.appendTo(this);

		this.label = Component.create()
			.classes.add(ItemFilterClasses.ButtonLabel)
			.text.set(`Filter ${filterer.name}`)
			.appendTo(this.button);

		this.onPaste = this.onPaste.bind(this);
		this.input = Component.create()
			.classes.add(ItemFilterClasses.Input)
			.attributes.add("contenteditable")
			.attributes.set("placeholder", "No filter enabled")
			.event.subscribe("paste", this.onPaste)
			.appendTo(this.button);

		////////////////////////////////////
		// Drawer
		this.drawer = Drawer.create()
			.classes.add(ItemFilterClasses.Drawer)
			.event.subscribe("focus", () => this.input.element.focus())
			.appendTo(this);

		this.mainPanel = this.drawer.createPanel();

		Component.create()
			.classes.add(ItemFilterClasses.FiltersHeading)
			.text.set("Suggested Filters")
			.appendTo(this.mainPanel);

		this.onFocusOut = this.onFocusOut.bind(this);
		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	private openDrawer () {
		this.input.element.focus();
		if (!this.drawer.classes.has(Classes.Hidden))
			return;

		this.drawer.open();
		const selection = window.getSelection();
		selection?.selectAllChildren(this.input.element);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.addEventListener("focusout", this.onFocusOut);
	}

	private closeDrawer () {
		this.drawer.classes.add(Classes.Hidden);
		this.drawer.attributes.add("inert");
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.removeEventListener("focusout", this.onFocusOut);
	}

	private async onFocusOut () {
		await Async.sleep(0); // next tick

		if (this.element.contains(document.activeElement))
			return;

		this.closeDrawer();
	}

	private onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (event.useOverInput("f", "ctrl"))
			this.openDrawer();

		if (this.drawer.isOpen() && event.useOverInput("Escape"))
			this.closeDrawer();
	}

	private onPaste (event: ClipboardEvent) {
		event.preventDefault();

		const data = event.clipboardData?.getData("text/plain");
		if (!data)
			return;

		const selection = window.getSelection();
		for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
			const range = selection?.getRangeAt(i);
			if (!range)
				continue;

			if (!this.input.element.contains(range.startContainer) || !this.input.element.contains(range.endContainer))
				continue;

			range.deleteContents();
			range.insertNode(document.createTextNode(data));
			range.collapse();
		}
	}
}
