import Button from "ui/Button";
import View from "ui/View";
import Bungie from "utility/endpoint/bungie/Bungie";

export default View.create({
	id: "settings",
	name: "Settings",
	initialise: view => view
		.append(Button.create()
			.text.set("Sign Out")
			.event.subscribe("click", () => Bungie.resetAuthentication())),
});
