import PlayerOverview from "ui/PlayerOverview";
import Button from "ui/component/Button";
import Component from "ui/component/Component";
import { Classes } from "ui/utility/Classes";
import type { IKeyEvent } from "ui/utility/UiEventBus";
import UiEventBus from "ui/utility/UiEventBus";
import type ViewManager from "ui/utility/ViewManager";
import type View from "ui/view/View";
import AppInfo from "ui/view/appnav/AppInfo";
import Store from "utility/Store";
import URL from "utility/URL";
import Bound from "utility/decorator/Bound";
import Bungie from "utility/endpoint/bungie/Bungie";

export enum ClassesAppNav {
	Main = "app-nav",
	IdentityContainer = "app-nav-identity-container",
	Destinations = "app-nav-destinations",
	Compress = "app-nav-compress",
	DestinationsToggle = "app-nav-destinations-toggle",
	DestinationsClose = "app-nav-destinations-close",
	Destination = "app-nav-destination",
	DestinationAuthRequired = "app-nav-destination-auth-required",
	DestinationAuthSpy = "app-nav-destination-auth-spy",
	DestinationNoAuthRequired = "app-nav-destination-no-auth-required",
	DestinationChildActive = "app-nav-destination-child-active",
	DestinationChildren = "app-nav-destination-children",
	DocumentHasAppNav = "has-app-nav",
}

export default class AppNav extends Component<HTMLElement, [typeof ViewManager]> {
	protected static override defaultType = "nav";

	private destinationButtons!: Record<string, Button>;
	private destinationDropdownWrappers!: Component[];
	private destinationsWrapper!: Component;
	private appInfo!: AppInfo;
	private viewGrid!: View.Handler[][];
	private viewPos!: { x: number, y: number };

	protected override onMake (viewManager: typeof ViewManager): void {
		this.destinationButtons = {};
		this.destinationDropdownWrappers = [];
		this.viewGrid = [];
		this.viewPos = { x: 0, y: 0 };

		this.classes.add(ClassesAppNav.Main);

		this.appInfo = AppInfo.create()
			.appendTo(this);

		viewManager.registerHashAction("overview", () => {
			viewManager.event.subscribeOnce("show", () => {
				if (Bungie.authenticated)
					URL.hash = "overview";
			});
		});

		PlayerOverview.create()
			.classes.add(ClassesAppNav.IdentityContainer)
			.insertToAfter(this, this.appInfo);

		this.destinationsWrapper = Component.create()
			.classes.add(ClassesAppNav.Destinations)
			.appendTo(this);

		Component.create()
			.classes.add(ClassesAppNav.DestinationsClose)
			.event.subscribe("click", () => this.destinationsWrapper.classes.remove(Classes.Active))
			.appendTo(this);

		Button.create()
			.classes.add(ClassesAppNav.DestinationsToggle)
			.event.subscribe("click", () => this.destinationsWrapper.classes.toggle(Classes.Active))
			.appendTo(this.destinationsWrapper);

		interface ViewTreeBranch {
			buttons: Button[];
			column: number;
		}

		const viewTree: Record<string, ViewTreeBranch> = {};

		for (const destinationViewHandler of Object.values(viewManager.registry)) {
			if (destinationViewHandler.noDestinationButton)
				continue;

			let name = destinationViewHandler.definition.name;
			if (typeof name === "function")
				name = name();

			const authVisibility = destinationViewHandler.definition.auth ?? "spy";
			const destinationButton = this.destinationButtons[destinationViewHandler.id] = Button.create()
				.classes.add(ClassesAppNav.Destination, `app-nav-destination-${destinationViewHandler.id}`)
				.classes.toggle(authVisibility === "required", ClassesAppNav.DestinationAuthRequired)
				.classes.toggle(authVisibility === "spy", ClassesAppNav.DestinationAuthSpy)
				.classes.toggle(authVisibility === "none", ClassesAppNav.DestinationNoAuthRequired)
				.text.set(name ?? "Unknown View")
				.tweak(destinationViewHandler.initialiseDestinationButton)
				.event.subscribe("click", () => destinationViewHandler.show());

			if (!destinationViewHandler.navGroupViewId) {
				destinationButton.appendTo(this.destinationsWrapper);

				const column = this.viewGrid.length;
				this.viewGrid.push([destinationViewHandler]);
				viewTree[destinationViewHandler.id] ??= { buttons: [], column };
				continue;
			}

			const branch = viewTree[destinationViewHandler.navGroupViewId];
			branch.buttons.push(destinationButton);
			this.viewGrid[branch.column].push(destinationViewHandler);
		}

		for (const [navGroupViewId, branch] of Object.entries(viewTree)) {
			if (!branch.buttons.length)
				continue;

			const navGroupViewDestinationButton = this.destinationButtons[navGroupViewId];
			if (!navGroupViewDestinationButton) {
				console.warn("Tried to child destination button(s) to a nonexistent parent:", navGroupViewId);
				continue;
			}

			this.destinationDropdownWrappers.push(Component.create()
				.classes.add(ClassesAppNav.DestinationChildren, `app-nav-destination-${navGroupViewId}-parent`)
				.append(...branch.buttons)
				.insertToAfter(this.destinationsWrapper, navGroupViewDestinationButton)
				.prepend(navGroupViewDestinationButton));
		}

		viewManager.event.subscribe("show", ({ view }) => this.showing(view));

		Store.event.subscribe("setSettingsEquipmentView", this.refreshDestinationButtons);
		this.refreshDestinationButtons();

		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	@Bound
	private refreshDestinationButtons () {
		let showing = 0;
		for (const [id, destinationButton] of Object.entries(this.destinationButtons)) {
			const destinationViewHandler = viewManager.registry[id];
			const hidden = destinationViewHandler.displayDestinationButton?.() === false;
			destinationButton.classes.toggle(hidden, Classes.Hidden);
			if (!hidden && !destinationViewHandler.navGroupViewId)
				showing++;
		}

		this.classes.toggle(showing > 7, ClassesAppNav.Compress);
	}

	public showing (view: View.WrapperComponent) {
		for (const button of Object.values(this.destinationButtons))
			button.classes.remove(Classes.Active);

		for (const wrapper of this.destinationDropdownWrappers)
			wrapper.classes.remove(ClassesAppNav.DestinationChildActive);

		this.destinationButtons[view.definition.id]?.classes.add(Classes.Active);
		if (view.definition.navGroupViewId)
			this.destinationButtons[view.definition.id]?.parent()?.classes.add(ClassesAppNav.DestinationChildActive);

		document.documentElement.classList.add(ClassesAppNav.DocumentHasAppNav);

		this.destinationsWrapper.classes.remove(Classes.Active);
		const x = this.viewGrid.findIndex(column => column.some(handler => handler.id === view.definition.id));
		const y = this.viewGrid[x]?.findIndex(handler => handler.id === view.definition.id);
		this.viewPos = { x, y };
	}

	private isDestinationVisible (id: string) {
		return !!this.destinationButtons[id].element.offsetWidth;
	}

	private getActualViewY () {
		return Math.max(0, this.viewGrid[this.viewPos.x]
			.filter(view => this.isDestinationVisible(view.id))
			.indexOf(this.viewGrid[this.viewPos.x][this.viewPos.y]));
	}

	private changeViewX (amount: 1 | -1) {
		for (let x = this.viewPos.x + amount; x >= 0 && x < this.viewGrid.length; x += amount) {
			const column = this.viewGrid[x].filter(view => this.isDestinationVisible(view.id));
			if (!column.length)
				continue;

			const view = column[Math.min(this.getActualViewY(), column.length - 1)];
			view.show();
			return;
		}
	}

	private changeViewY (amount: 1 | -1) {
		const column = this.viewGrid[this.viewPos.x].filter(view => this.isDestinationVisible(view.id));
		if (!column.length)
			return;

		const y = this.getActualViewY();
		const newY = Math.max(0, Math.min(y + amount, column.length - 1));
		if (y === newY)
			return;

		column[newY].show();
	}

	@Bound
	private onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (this.viewPos.x === -1 || this.viewPos.y === -1)
			return;

		switch (event.key) {
			case "ArrowDown":
				return this.changeViewY(1);
			case "ArrowUp":
				return this.changeViewY(-1);
			case "ArrowRight":
				return this.changeViewX(1);
			case "ArrowLeft":
				return this.changeViewX(-1);
		}
	}
}