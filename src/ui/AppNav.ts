import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import type Loadable from "ui/Loadable";
import PlayerOverview from "ui/PlayerOverview";
import type View from "ui/View";
import AppInfo from "ui/view/appnav/AppInfo";
import type ViewManager from "ui/ViewManager";
import Bungie from "utility/endpoint/bungie/Bungie";
import Store from "utility/Store";

export enum ClassesAppNav {
	Main = "app-nav",
	IdentityContainer = "app-nav-identity-container",
	Destinations = "app-nav-destinations",
	Compress = "app-nav-compress",
	DestinationsToggle = "app-nav-destinations-toggle",
	DestinationsClose = "app-nav-destinations-close",
	Destination = "app-nav-destination",
	DestinationAuthRequired = "app-nav-destination-auth-required",
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
	private playerOverview?: Loadable.Component;

	protected override onMake (viewManager: typeof ViewManager): void {
		this.destinationButtons = {};
		this.destinationDropdownWrappers = [];

		this.classes.add(ClassesAppNav.Main);

		this.appInfo = AppInfo.create()
			.appendTo(this);

		this.tryInsertPlayerOverview();
		Bungie.event.subscribe("authenticated", this.tryInsertPlayerOverview);
		Bungie.event.subscribe("resetAuthentication", () => {
			this.playerOverview?.remove();
			delete this.playerOverview;
		});

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

		const childViewDestinationButtons: Record<string, Button[]> = {};

		for (const destinationViewHandler of Object.values(viewManager.registry)) {
			if (destinationViewHandler.noDestinationButton)
				continue;

			let name = destinationViewHandler.definition.name;
			if (typeof name === "function")
				name = name();

			const destinationButton = this.destinationButtons[destinationViewHandler.id] = Button.create()
				.classes.add(ClassesAppNav.Destination, `app-nav-destination-${destinationViewHandler.id}`)
				.classes.toggle((destinationViewHandler.definition.auth ?? "required") === "required", ClassesAppNav.DestinationAuthRequired)
				.classes.toggle((destinationViewHandler.definition.auth) === "none", ClassesAppNav.DestinationNoAuthRequired)
				.text.set(name ?? "Unknown View")
				.tweak(destinationViewHandler.initialiseDestinationButton)
				.event.subscribe("click", () => destinationViewHandler.show());

			if (destinationViewHandler.parentViewId)
				(childViewDestinationButtons[destinationViewHandler.parentViewId] ??= [])
					.push(destinationButton);

			else
				destinationButton.appendTo(this.destinationsWrapper);
		}

		for (const [parentViewId, destinationButtons] of Object.entries(childViewDestinationButtons)) {
			const parentViewDestinationButton = this.destinationButtons[parentViewId];
			if (!parentViewDestinationButton) {
				console.warn("Tried to child destination button(s) to a nonexistent parent:", parentViewId);
				continue;
			}

			this.destinationDropdownWrappers.push(Component.create()
				.classes.add(ClassesAppNav.DestinationChildren, `app-nav-destination-${parentViewId}-parent`)
				.append(...destinationButtons)
				.insertToAfter(this.destinationsWrapper, parentViewDestinationButton)
				.prepend(parentViewDestinationButton));
		}

		viewManager.event.subscribe("show", ({ view }) => this.showing(view));

		this.refreshDestinationButtons = this.refreshDestinationButtons.bind(this);
		Store.event.subscribe("setSettingsEquipmentView", this.refreshDestinationButtons);
		this.refreshDestinationButtons();
	}

	private refreshDestinationButtons () {
		let showing = 0;
		for (const [id, destinationButton] of Object.entries(this.destinationButtons)) {
			const destinationViewHandler = viewManager.registry[id];
			const hidden = destinationViewHandler.displayDestinationButton?.() === false;
			destinationButton.classes.toggle(hidden, Classes.Hidden);
			if (!hidden && !destinationViewHandler.parentViewId)
				showing++;
		}

		this.classes.toggle(showing > 6, ClassesAppNav.Compress);
	}

	public showing (view: View.WrapperComponent) {
		for (const button of Object.values(this.destinationButtons))
			button.classes.remove(Classes.Active);

		for (const wrapper of this.destinationDropdownWrappers)
			wrapper.classes.remove(ClassesAppNav.DestinationChildActive);

		this.destinationButtons[view.definition.id]?.classes.add(Classes.Active);
		if (view.definition.parentViewId)
			this.destinationButtons[view.definition.id]?.parent()?.classes.add(ClassesAppNav.DestinationChildActive);

		document.documentElement.classList.add(ClassesAppNav.DocumentHasAppNav);
		// this.classes.toggle(!!view.definition.noNav, Classes.Hidden);
		// this.attributes.toggle(!!view.definition.noNav, "inert");

		this.destinationsWrapper.classes.remove(Classes.Active);
	}

	private tryInsertPlayerOverview () {
		if (!Bungie.authenticated)
			return;

		this.playerOverview = PlayerOverview.create()
			.classes.add(ClassesAppNav.IdentityContainer)
			.insertToAfter(this, this.appInfo);
	}
}