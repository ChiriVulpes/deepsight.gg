import Component from "ui/Component";
import Env from "utility/Env";

enum TextLogoClasses {
	Main = "text-logo",
	Deep = "text-logo-deep",
	Sight = "text-logo-sight",
	Dot = "text-logo-dot",
	Gg = "text-logo-gg",
	NonProd = "text-logo-nonprod"
}

export default class TextLogo extends Component {
	protected override onMake (): void {
		this.classes.add(TextLogoClasses.Main)
			.append(Component.create("span")
				.classes.add(TextLogoClasses.Deep)
				.text.set("deep")
				.append(Env.DEEPSIGHT_ENVIRONMENT === "prod" ? undefined : Component.create("span")
					.classes.add(TextLogoClasses.NonProd)
					.text.set(Env.DEEPSIGHT_ENVIRONMENT === "dev" ? "est" : "er")))
			.append(Component.create("span")
				.classes.add(TextLogoClasses.Sight)
				.text.set("sight"))
			.append(Component.create("span")
				.classes.add(TextLogoClasses.Dot)
				.text.set("."))
			.append(Component.create("span")
				.classes.add(TextLogoClasses.Gg)
				.text.set("gg"));
	}
}
