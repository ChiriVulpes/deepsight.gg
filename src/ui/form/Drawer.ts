import { Classes } from "ui/Classes";
import type { AnyComponent, ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";

export enum DrawerClasses {
	Main = "drawer",
	Panel = "drawer-panel",
	PanelHasBack = "drawer-panel-has-back",
	Close = "drawer-close",
	Back = "drawer-back",
	Disabled = "drawer-disabled",
}

export interface IDrawerEvents extends ComponentEvents {
	openDrawer: { reason: string };
	closeDrawer: Event;
	showPanel: { panel: AnyComponent };
}

export default class Drawer extends Component {

	public override readonly event!: ComponentEventManager<this, IDrawerEvents>;

	private panels!: Set<AnyComponent>;
	private openReasons!: Set<string>;
	public closeButton!: Button;
	public backButton!: Button;
	public focusOnClick!: boolean;

	protected override onMake (): void {
		this.focusOnClick = true;
		this.panels = new Set();
		this.openReasons = new Set();

		this.classes.add(DrawerClasses.Main, Classes.Hidden)
			.attributes.add("inert")
			.attributes.set("tabindex", "0")
			.event.subscribe("mousedown", event => {
				if (!(event.target as HTMLElement).closest("button, input") && this.focusOnClick) {
					window.getSelection()?.removeAllRanges();
					// focus the drawer 
					this.element.focus();
					this.open("click");
					this.event.emit("focus", new FocusEvent("focus"));
				}
			});

		this.closeButton = Button.create()
			.classes.add(DrawerClasses.Close)
			.event.subscribe(["mousedown", "click"], () => this.close(true))
			.appendTo(this);

		this.backButton = Button.create()
			.classes.add(DrawerClasses.Back, Classes.Hidden)
			.appendTo(this);
	}

	/**
	 * Returns whether the drawer is set to the open state.  
	 * If the drawer is disabled, but it's set to the open state, this method will return true.
	 */
	public isOpen (): boolean;
	/**
	 * Returns whether the drawer is *visually* open.  
	 * This method will return true only if the drawer is set to open *and* it's not disabled.
	 */
	public isOpen (visually: true): boolean;
	public isOpen (visually?: true) {
		return !this.classes.has(Classes.Hidden)
			&& (visually || !this.classes.has(Classes.Disabled));
	}

	public isDisabled () {
		return this.classes.has(Classes.Disabled);
	}

	public disable () {
		this.classes.add(Classes.Disabled, DrawerClasses.Disabled);
		if (this.isOpen()) {
			this.classes.add(Classes.Hidden);
			this.attributes.add("inert");
		}

		return this;
	}

	public enable () {
		this.classes.remove(Classes.Disabled, DrawerClasses.Disabled);
		if (this.openReasons.size) {
			this.classes.remove(Classes.Hidden);
			this.attributes.remove("inert");
		}

		return this;
	}

	public createPanel () {
		const panel = Component.create()
			.classes.add(DrawerClasses.Panel)
			.appendTo(this);

		this.panels.add(panel);
		if (this.panels.size > 1)
			panel.classes.add(Classes.Hidden)
				.attributes.add("inert");

		return panel;
	}

	public showPanel (panel: AnyComponent, showBackButton = false) {
		let lastPanel: AnyComponent | undefined;
		for (const panel of this.panels) {
			if (!panel.classes.has(Classes.Hidden)) {
				lastPanel = panel;
				lastPanel.attributes.add("inert")
					.classes.add(Classes.Hidden);
			}
		}

		panel.attributes.remove("inert")
			.classes.remove(Classes.Hidden);

		this.event.emit("showPanel", { panel });

		if (showBackButton && lastPanel) {
			if (!this.backButton.classes.has(Classes.Hidden))
				throw new Error("Drawer panels don't support multi-level back arrows yet");

			panel.classes.add(DrawerClasses.PanelHasBack);
			this.backButton.classes.remove(Classes.Hidden)
				.event.until(this.event.waitFor(["closeDrawer", "showPanel"]), event => event
					.subscribeOnce(["click", "mousedown"], () => {
						this.showPanel(lastPanel!);
						this.backButton.classes.add(Classes.Hidden);
					}));
		}

		return this;
	}

	public toggle (reason = "generic") {
		const added = !this.openReasons.has(reason);
		if (added)
			this.openReasons.add(reason);
		else
			this.openReasons.delete(reason);

		if (this.openReasons.size === 0)
			this.close(reason);
		else if (this.openReasons.size === 1 && added)
			this.open(reason);

		return this.isOpen();
	}

	public open (reason = "generic") {
		this.openReasons.add(reason);
		if (this.isDisabled())
			return;

		if (!this.classes.has(Classes.Hidden))
			return;

		this.classes.remove(Classes.Hidden);
		this.attributes.remove("inert");
		this.event.emit("openDrawer", { reason });
	}

	public close (force: true): void;
	public close (reason?: string): void;
	public close (reason: string | true = "generic") {
		if (reason === true)
			this.openReasons.clear();
		else
			this.openReasons.delete(reason);

		if (!this.openReasons.size) {
			this.classes.add(Classes.Hidden);
			this.attributes.add("inert");
			this.event.emit("closeDrawer");
			this.backButton.classes.add(Classes.Hidden);
		}
	}

	public override removeContents (): this {
		while (this.element.lastChild && this.element.lastChild !== this.closeButton.element)
			this.element.lastChild?.remove();

		this.panels.clear();
		return this;
	}

	public removePanels () {
		for (const panel of this.panels)
			panel.remove();

		this.panels.clear();
		return this;
	}

	public removePanel (panel?: AnyComponent) {
		if (panel) {
			this.panels.delete(panel);
			panel.remove();
		}

		return this;
	}
}
