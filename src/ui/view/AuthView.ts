import Button, { ClassesButton } from "ui/Button";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Label from "ui/Label";
import View from "ui/View";
import Bungie from "utility/endpoint/bungie/Bungie";

export enum AuthViewClasses {
	Content = "view-auth-content",
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
	State = "view-auth-state",
	AuthButton = "view-auth-button-auth",
}

export default View.create({
	id: "auth",
	name: "Authentication",
	noNav: true,
	initialise: view => view
		.classes.add(AuthViewClasses.Content)

		.append(Component.create()
			.classes.add(AuthViewClasses.Header)
			.append(Component.create()
				.classes.add(AuthViewClasses.Logo, Classes.Logo))
			.append(Component.create()
				.classes.add(AuthViewClasses.Title)
				.text.set("Fluffiest Vault\nManager")))

		.append(Label.create()
			.classes.add(AuthViewClasses.State)
			.tweak(_ => _.label.text.set("Account"))
			.tweak(_ => _.content.text.set("Not Authenticated")))

		.append(Button.create()
			.classes.add(AuthViewClasses.AuthButton, ClassesButton.Attention)
			.text.set("Authenticate with Bungie")
			.event.subscribe("click", () =>
				void Bungie.authenticate("start").catch(err => console.error(err)))),
});
