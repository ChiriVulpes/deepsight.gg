import Button, { ClassesButton } from "ui/Button";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Label from "ui/Label";
import View from "ui/View";
import Bungie from "utility/bungie/Bungie";

export enum AuthViewClasses {
	Content = "view-auth-content",
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
	State = "view-auth-state",
	AuthButton = "view-auth-button-auth",
}

export default class AuthView extends View {

	public static readonly id = "auth";

	public getName () {
		return "Authentication";
	}

	public override shouldDisplayNav () {
		return false;
	}

	protected override onMakeView () {
		this.content.classes.add(AuthViewClasses.Content);

		Component.create()
			.classes.add(AuthViewClasses.Header)
			.append(Component.create()
				.classes.add(AuthViewClasses.Logo, Classes.Logo))
			.append(Component.create()
				.classes.add(AuthViewClasses.Title)
				.text.set("Fluffiest Vault\nManager"))
			.appendTo(this.content);

		Label.create()
			.classes.add(AuthViewClasses.State)
			.tweak(_ => _.label.text.set("Account"))
			.tweak(_ => _.content.text.set("Not Authenticated"))
			.appendTo(this.content);

		Button.create()
			.classes.add(AuthViewClasses.AuthButton, ClassesButton.Attention)
			.text.set("Authenticate with Bungie")
			.event.subscribe("click", () =>
				void Bungie.authenticate("start").catch(err => console.error(err)))
			.appendTo(this.content);
	}
}
