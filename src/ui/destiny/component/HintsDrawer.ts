import Button from "ui/component/Button";
import Component from "ui/component/Component";
import Drawer from "ui/component/Drawer";
import { Hint, IInput } from "ui/component/Hints";
import View from "ui/view/View";

export enum HintsDrawerClasses {
	Main = "hints-drawer-wrapper",
	Button = "hints-drawer-button",
	ButtonLabel = "hints-drawer-button-label",
	ButtonText = "hints-drawer-button-text",
	Drawer = "hints-drawer",
	Hint = "hints-drawer-hint",
	HintIcon = "hints-drawer-hint-icon",
}

export default class HintsDrawer extends Component {

	public button!: Button;
	public drawer!: Drawer;
	public buttonLabel!: Component;
	public buttonText!: Component;

	protected override onMake (): void {
		this.classes.add(HintsDrawerClasses.Main);

		this.button = Button.create()
			.classes.add(HintsDrawerClasses.Button)
			.addIcon(icon => icon.classes.add(HintsDrawerClasses.HintIcon))
			.tweak(button => button.innerIcon?.classes.add(View.Classes.FooterButtonIcon))
			.append(this.buttonLabel = Component.create()
				.classes.add(HintsDrawerClasses.ButtonLabel)
				.text.set("Help"))
			.append(this.buttonText = Component.create()
				.classes.add(HintsDrawerClasses.ButtonText)
				.text.set("Keybinds & more"))
			.event.subscribe("click", () => this.drawer.toggle("click"))
			.appendTo(this);

		this.drawer = Drawer.create()
			.classes.add(HintsDrawerClasses.Drawer)
			.appendTo(this);

		this.drawer.createPanel()
			.append(Component.create("p")
				.classes.add(HintsDrawerClasses.Hint)
				.append(Hint.create([IInput.get("KeyF1")]))
				.text.add("\xa0 Player overview"))
			.append(Component.create("p")
				.classes.add(HintsDrawerClasses.Hint)
				.append(Hint.create([IInput.get("KeyE")]))
				.text.add("\xa0 More information"))
			.append(Component.create("p")
				.classes.add(HintsDrawerClasses.Hint)
				.append(Hint.create([IInput.get("KeyS", "Ctrl")]))
				.text.add("\xa0 Configure sort"))
			.append(Component.create("p")
				.classes.add(HintsDrawerClasses.Hint)
				.append(Hint.create([IInput.get("KeyF", "Ctrl")]))
				.text.add("\xa0 Configure filter"));

		this.event.subscribe("mouseenter", () => this.drawer.open("mouse"));
		this.event.subscribe("mouseleave", () => this.drawer.close("mouse"));
	}
}