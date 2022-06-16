import { APP_ACRONYM, APP_ACRONYM_FAKE_MEANINGS } from "Constants";
import Memberships from "model/models/Memberships";
import Button from "ui/Button";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Loadable from "ui/Loadable";
import type View from "ui/View";
import type ViewManager from "ui/ViewManager";

export enum ClassesAppNav {
	Main = "app-nav",
	Logo = "app-nav-logo",
	Title = "app-nav-title",
	IdentityContainer = "app-nav-identity-container",
	Identity = "app-nav-identity",
	IdentityUsername = "app-nav-identity-username",
	IdentityCode = "app-nav-identity-code",
	Destinations = "app-nav-destinations",
	DestinationsToggle = "app-nav-destinations-toggle",
	Destination = "app-nav-destination",
	DocumentHasAppNav = "has-app-nav",
}

export default class AppNav extends Component<HTMLElement, [typeof ViewManager]> {
	protected static override defaultType = "nav";

	private destinationButtons!: Record<string, Button>;

	protected override onMake (viewManager: typeof ViewManager): void {
		this.destinationButtons = {};

		this.classes.add(ClassesAppNav.Main, Classes.Hidden);

		Component.create()
			.classes.add(ClassesAppNav.Logo, Classes.Logo)
			.appendTo(this);

		Component.create()
			.classes.add(ClassesAppNav.Title)
			.text.set(APP_ACRONYM)
			.attributes.set("title", APP_ACRONYM_FAKE_MEANINGS[Math.floor(Math.random() * APP_ACRONYM_FAKE_MEANINGS.length)])
			.appendTo(this);

		Loadable.create(Memberships)
			.onReady(memberships => Component.create()
				.classes.add(ClassesAppNav.Identity)
				.append(Component.create()
					.classes.add(ClassesAppNav.IdentityUsername)
					.text.set(memberships.bungieNetUser.cachedBungieGlobalDisplayName))
				.append(Component.create()
					.classes.add(ClassesAppNav.IdentityCode)
					.text.set(`#${memberships.bungieNetUser.cachedBungieGlobalDisplayNameCode ?? "????"}`)))
			.setSimple()
			.classes.add(ClassesAppNav.IdentityContainer)
			.appendTo(this);

		const destinationsWrapper = Component.create()
			.classes.add(ClassesAppNav.Destinations)
			.appendTo(this);

		Button.create()
			.classes.add(ClassesAppNav.DestinationsToggle)
			.event.subscribe("click", () => destinationsWrapper.classes.toggle(Classes.Active))
			.appendTo(destinationsWrapper);

		for (const destinationViewHandler of Object.values(viewManager.registry)) {
			if (destinationViewHandler.noNav)
				continue;

			this.destinationButtons[destinationViewHandler.id] = Button.create()
				.classes.add(ClassesAppNav.Destination, `app-nav-destination-${destinationViewHandler.id}`)
				.text.set(destinationViewHandler.name)
				.tweak(destinationViewHandler.initialiseDestinationButton)
				.event.subscribe("click", () => destinationViewHandler.show())
				.appendTo(destinationsWrapper);
		}

		viewManager.event.subscribe("show", ({ view }) => this.showing(view));
	}

	public showing (view: View.WrapperComponent) {
		for (const button of Object.values(this.destinationButtons))
			button.classes.remove(Classes.Active);

		this.destinationButtons[view.definition.id]?.classes.add(Classes.Active);
		document.documentElement.classList.toggle(ClassesAppNav.DocumentHasAppNav, !view.definition.noNav);
		this.classes.toggle(!!view.definition.noNav, Classes.Hidden);
		this.attributes.toggle(!!view.definition.noNav, "inert");
	}
}