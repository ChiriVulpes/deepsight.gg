import Component from "ui/Component";
import Button from "ui/form/Button";
import View from "ui/View";
import Bungie from "utility/endpoint/bungie/Bungie";

enum ErrorViewClasses {
	Paragraph = "view-error-p",
	Button = "view-error-button",
}

export default View.create({
	id: "error",
	name: "Error",
	noDestinationButton: true,
	initialise: view => {
		if (Bungie.apiDown) {
			view.setTitle(title => title.text.set("Bungie API Error"));

			Component.create("p")
				.classes.add(ErrorViewClasses.Paragraph)
				.text.set("I might not be responsible for this one! Maybe the API is down?")
				.appendTo(view.content);

			Button.create()
				.classes.add(ErrorViewClasses.Button)
				.text.set("Bungie Help Twitter")
				.event.subscribe("click", () => window.open("https://twitter.com/BungieHelp", "_blank")?.focus())
				.appendTo(view.content);

			return;
		}

		view.setTitle(title => title.text.set("Unknown Error"));

		Component.create("p")
			.classes.add(ErrorViewClasses.Paragraph)
			.text.set("Something went wrong.")
			.appendTo(view.content);

		Button.create()
			.classes.add(ErrorViewClasses.Button)
			.text.set("Reload App")
			.event.subscribe("click", () => location.reload())
			.appendTo(view.content);
	},
});
