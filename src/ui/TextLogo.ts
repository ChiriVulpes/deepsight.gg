import Component from "ui/Component";

enum TextLogoClasses {
	Main = "text-logo",
	Deep = "text-logo-deep",
	Sight = "text-logo-sight",
	Dot = "text-logo-dot",
	Gg = "text-logo-gg",
}

export default class TextLogo extends Component {
	protected override onMake (): void {
		this.classes.add(TextLogoClasses.Main)
			.append(Component.create("span")
				.classes.add(TextLogoClasses.Deep)
				.text.set("deep"))
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
