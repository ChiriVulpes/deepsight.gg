import TextLogo from "ui/TextLogo";
import Button from "ui/component/Button";
import Component from "ui/component/Component";
import Label from "ui/component/Label";
import { Classes } from "ui/utility/Classes";
import AboutView from "ui/view/AboutView";
import View from "ui/view/View";
import Async from "utility/Async";
import Env from "utility/Env";
import Bungie from "utility/endpoint/bungie/Bungie";

export enum AuthViewClasses {
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
	State = "view-auth-state",
	AuthButton = "view-auth-button-auth",
	Nav = "view-auth-nav",
	Splash = "view-auth-splash",
	About = "view-auth-about",
	ScrollDownHint = "view-auth-scroll-down-hint",
}

export default View.create({
	id: "auth",
	hash: null,
	name: "Authenticate",
	auth: "none",
	noDestinationButton: true,
	noProfileInURL: true,
	initialise: view => {
		if (Bungie.authenticated && Env.DEEPSIGHT_ENVIRONMENT !== "dev")
			return Async.sleep(1).then(() => viewManager.showDefaultView());

		view.content
			.append(Component.create()
				.classes.add(AuthViewClasses.Splash)
				.append(Component.create()
					.classes.add(AuthViewClasses.Header)
					.append(Component.create()
						.classes.add(AuthViewClasses.Logo, Classes.Logo))
					.append(TextLogo.create()
						.classes.add(AuthViewClasses.Title)))

				.append(Label.create()
					.classes.add(AuthViewClasses.State)
					.tweak(_ => _.label.text.set("Account"))
					.tweak(_ => _.content.text.set("Not Authenticated")))

				.append(Button.create()
					.classes.add(AuthViewClasses.AuthButton)
					.setPrimary()
					.setAttention()
					.setLaserFocus()
					.text.set("Authenticate")
					.event.subscribe("click", () =>
						void Bungie.authenticate("start").catch(err => console.error(err)))));

		const scrollDownHint = Component.create()
			.classes.add(AuthViewClasses.ScrollDownHint)
			.text.set("Not convinced? Scroll down!")
			.appendTo(view.content);

		view.content.append(Component.create()
			.classes.add(AuthViewClasses.About)
			.append(View.WrapperComponent.create([AboutView])
				.classes.add(View.Classes.Subview)));

		view.content.event.subscribe("scroll", () => {
			scrollDownHint.classes.toggle(view.content.element.scrollTop > 0, Classes.Hidden);
		});
	},
});
