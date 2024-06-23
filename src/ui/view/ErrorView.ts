import Button from "ui/component/Button";
import View from "ui/view/View";
import Bungie from "utility/endpoint/bungie/Bungie";

enum ErrorViewClasses {
	Button = "view-error-button",
}

export interface ErrorViewDefinition {
	title: string;
	subtitle: string;
	buttonText: string;
	buttonClick (): any;
}

export default View.create<[], [code?: number, definition?: ErrorViewDefinition]>({
	id: "error",
	name: "Error",
	redirectOnLoad: true,
	noDestinationButton: true,
	noHashChange: true,
	initialise: view => {
		let [_, code, definition] = view._args;

		if (!definition) {
			if (Bungie.apiDown)
				definition = {
					title: "Error: Weasel",
					subtitle: "Could not connect to Destiny 2 servers...",
					buttonText: "Bungie Help Twitter",
					buttonClick: () => window.open("https://twitter.com/BungieHelp", "_blank")?.focus(),
				};

			else if (code === 404)
				definition = {
					title: "Error: Not Found",
					subtitle: "You are forever lost in the dark corners of time...",
					buttonText: "Return to Orbit",
					buttonClick: () => viewManager.showDefaultView(),
				};

			else
				definition = {
					title: "Your Light Fades Away...",
					subtitle: "Restarting From Last Checkpoint...",
					buttonText: "Reload App",
					buttonClick: () => location.reload(),
				};
		}

		view.setTitle(title => title.text.set(definition!.title));
		view.setSubtitle("small", subtitle => subtitle.text.set(definition!.subtitle));

		Button.create()
			.classes.add(ErrorViewClasses.Button)
			.setPrimary()
			.setAttention()
			.text.set(definition.buttonText)
			.event.subscribe("click", definition.buttonClick)
			.appendTo(view.content);
	},
});
