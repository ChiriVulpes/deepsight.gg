import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";

export enum ClassPickerClasses {
	Main = "class-picker",
	Button = "class-picker-button",
	ButtonCurrent = "class-picker-button-current",
	OptionsWrapper = "class-picker-button-wrapper",
}

export interface IClassPickerOption<ID extends string = string> {
	button?: ClassPickerButton;
	id: ID;
	background: string;
	icon: string;
}

export interface IClassPickerEvents<ID extends string = string> extends ComponentEvents {
	selectClass: { option: ID, button: ClassPickerButton };
}

export type ClassPickerOptionSwitchHandler<ID extends string = string> = (optionId: ID) => any;

export default class ClassPicker<ID extends string = string> extends Component<HTMLElement, [ClassPickerOptionSwitchHandler<ID>?]> {

	public override readonly event!: ComponentEventManager<this, IClassPickerEvents<ID>>;

	public currentButton!: ClassPickerButton;
	public currentOption?: ID;
	public options!: IClassPickerOption<ID>[];
	public optionsWrapper!: Component;
	private switchHandler?: ClassPickerOptionSwitchHandler<ID>;

	protected override onMake (switchHandler?: ClassPickerOptionSwitchHandler<ID>): void {
		this.classes.add(ClassPickerClasses.Main);
		this.switchHandler = switchHandler;
		this.options = [];

		this.currentButton = ClassPickerButton.create()
			.classes.add(ClassPickerClasses.ButtonCurrent)
			.appendTo(this);
		this.optionsWrapper = Component.create()
			.classes.add(ClassPickerClasses.OptionsWrapper)
			.appendTo(this);
	}

	public addOption (option: Omit<IClassPickerOption<ID>, "button">) {
		const existingOption = this.options.find(existing => existing.id === option.id);
		if (existingOption) {
			// already has this option
			existingOption.background = option.background;
			existingOption.icon = option.icon;
			existingOption.button?.setAppearance(option);
			if (this.currentOption === option.id)
				this.currentButton.setAppearance(option);
			return this;
		}

		this.options.push(option);
		const button = (option as IClassPickerOption<ID>).button = ClassPickerButton.create()
			.setAppearance(option)
			.event.subscribe("click", async () => {
				const option = this.options.find(option => option.button === button);
				if (!option) {
					console.error("Button not assigned to valid option:", button);
					return;
				}

				await this.switchHandler?.(option.id);
				await this.setCurrent(option.id);
			})
			.appendTo(this.optionsWrapper);
		return this;
	}

	private settingCurrent?: Promise<any>;
	public async setCurrent (id: ID, skipAnimation = false) {
		while (this.settingCurrent)
			await this.settingCurrent;

		const chosenOption = this.options.find(option => option.id === id);
		if (!chosenOption?.button) {
			console.error(`Tried to change to option '${id}' that doesn't exist`);
			return;
		}


		const currentOption = this.options.find(option => option.id === this.currentOption);
		if (!currentOption || skipAnimation) {
			this.currentOption = id;
			this.event.emit("selectClass", { option: id, button: chosenOption.button });

			this.currentButton.setAppearance(chosenOption);
			if (!currentOption) {
				chosenOption.button.remove();
				delete chosenOption.button;
			} else {
				chosenOption.button.setAppearance(currentOption);
				currentOption.button = chosenOption.button;
				delete chosenOption.button;
			}
		} else {
			await (this.settingCurrent = Promise.all([
				this.currentButton.animateWipe(() => this.currentButton.setAppearance(chosenOption)),
				chosenOption.button.animateWipe(() => {
					this.currentOption = id;
					this.event.emit("selectClass", { option: id, button: chosenOption.button! });

					chosenOption.button!.setAppearance(currentOption);
					currentOption.button = chosenOption.button;
					delete chosenOption.button;
				}),
			]));
		}

		delete this.settingCurrent;
	}
}

export class ClassPickerButton extends Button {

	protected override onMake (): void {
		super.onMake();
		this.classes.add(ClassPickerClasses.Button);
		this.addIcon();
	}

	public setAppearance (option?: IClassPickerOption<string>) {
		if (!option) {
			this.style.remove("--background");
			this.style.remove("--icon");
		} else {
			this.style.set("--background", `url("${option.background}")`);
			this.style.set("--icon", `url("${option.icon}")`);
		}

		return this;
	}
}
