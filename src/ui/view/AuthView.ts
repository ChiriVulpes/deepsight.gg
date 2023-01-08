import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Label from "ui/Label";
import TextLogo from "ui/TextLogo";
import View from "ui/View";
import Bungie from "utility/endpoint/bungie/Bungie";

export enum AuthViewClasses {
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
	State = "view-auth-state",
	AuthButton = "view-auth-button-auth",
	Nav = "view-auth-nav",
}

export default View.create({
	id: "auth",
	hash: null,
	name: null,
	noNav: true,
	noDestinationButton: true,
	initialise: view => view
		.tweak(view => view.content

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
				.classes.add(AuthViewClasses.AuthButton, ButtonClasses.Attention)
				.text.set("Authenticate with Bungie")
				.event.subscribe("click", () =>
					void Bungie.authenticate("start").catch(err => console.error(err)))))
		.tweak(view => view.footer
			.append(Component.create("nav")
				.classes.add(AuthViewClasses.Nav)
				.append(Component.create("span")
					.text.set("Made with 🤍 by ")
					.append(Component.create("a")
						.attributes.set("href", "https://chiri.works")
						.text.set("Chiri")))
				.append(Component.create("span")
					.text.set("Open source on ")
					.append(Component.create("a")
						.attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg")
						.text.set("GitHub"))))
			.appendTo(view)),
});
