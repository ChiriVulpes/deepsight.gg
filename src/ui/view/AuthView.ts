import Button from "ui/Button";
import Component from "ui/Component";
import Label from "ui/Label";
import View from "ui/View";
import Bungie from "utility/Bungie";

export enum AuthViewClasses {
	Main = "view-auth",
	Content = "view-auth-content",
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
}

export default class AuthView extends View {

	protected getId () {
		return AuthViewClasses.Main;
	}

	protected override onMakeView () {
		this.content.classes.add(AuthViewClasses.Content);

		Component.create()
			.classes.add(AuthViewClasses.Header)
			.append(Component.create()
				.classes.add(AuthViewClasses.Logo))
			.append(Component.create()
				.classes.add(AuthViewClasses.Title)
				.text.set("Fluffiest Vault\nManager"))
			.appendTo(this.content);

		Label.create()
			.tweak(_ => _.label.text.set("Account"))
			.tweak(_ => _.content.text.set("Not Authenticated"))
			.appendTo(this.content);

		Button.create()
			.text.set("Authenticate with Bungie")
			.event.subscribe("click", () =>
				void Bungie.authenticate("start").catch(err => console.error(err)))
			.appendTo(this.content);
	}
}
