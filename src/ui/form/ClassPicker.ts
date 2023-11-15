import type Item from "model/models/items/Item";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";

export enum ClassPickerClasses {
	Main = "class-picker",
	Button = "class-picker-button",
	ButtonPreview = "class-picker-button-preview",
	ButtonCurrent = "class-picker-button-current",
	OptionsWrapper = "class-picker-button-wrapper",
	OptionsWrapper2 = "class-picker-button-wrapper-2",
	OptionsWrapper3 = "class-picker-button-wrapper-3",
	OptionsWrapper4 = "class-picker-button-wrapper-4",
	OptionsWrapper9 = "class-picker-button-wrapper-9",
	OptionsWrapperBorders1 = "class-picker-button-wrapper-borders1",
	OptionsWrapperBorders2 = "class-picker-button-wrapper-borders2",
}

export interface IClassPickerOption<ID extends string | number = string | number> {
	button?: ClassPickerButton;
	id: ID;
	background?: string;
	icon?: string;
	item?: Item;
}

export interface IClassPickerEvents<ID extends string | number = string | number> extends ComponentEvents {
	selectClass: { option: ID, button: ClassPickerButton, item?: Item, setPromise: (promise: Promise<any>) => void };
}

export type ClassPickerOptionSwitchHandler<ID extends string | number = string | number> = (optionId: ID) => any;

export default class ClassPicker<ID extends string | number = string | number> extends Component<HTMLElement, [ClassPickerOptionSwitchHandler<ID>?]> {

	public override readonly event!: ComponentEventManager<this, IClassPickerEvents<ID>>;

	public currentButton!: ClassPickerButton;
	public currentOption?: ID;
	public options!: IClassPickerOption<ID>[];
	public optionsWrapper!: Component;
	public optionsWrapperBorders1!: Component;
	public optionsWrapperBorders2!: Component;
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
		this.optionsWrapperBorders1 = Component.create()
			.classes.add(ClassPickerClasses.OptionsWrapperBorders1)
			.appendTo(this.optionsWrapper);
		this.optionsWrapperBorders2 = Component.create()
			.classes.add(ClassPickerClasses.OptionsWrapperBorders2)
			.appendTo(this.optionsWrapper);
	}

	public addOption (option: Omit<IClassPickerOption<ID>, "button">) {
		const existingOption = this.options.find(existing => existing.id === option.id);
		if (existingOption) {
			// already has this option
			existingOption.background = option.background;
			existingOption.icon = option.icon;
			existingOption.button?.setAppearance(option);
			existingOption.item = option.item;
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

		this.updateOptionsWrapper();
		return this;
	}

	public removeOption (id: ID) {
		const index = this.options.findIndex(existing => existing.id === id);
		if (index === -1)
			return;

		const option = this.options[index];
		option.button?.remove();

		this.options.splice(index, 1);

		this.updateOptionsWrapper();
		return this;
	}

	private updateOptionsWrapper () {
		this.optionsWrapper.classes.remove(ClassPickerClasses.OptionsWrapper2, ClassPickerClasses.OptionsWrapper3, ClassPickerClasses.OptionsWrapper4, ClassPickerClasses.OptionsWrapper9);
		const count = this.optionsWrapper.element.childElementCount - 2;
		if (count > 1)
			this.optionsWrapper.classes.add(ClassPickerClasses[`OptionsWrapper${count > 4 ? 9 : count as 2 | 3 | 4}`]);
		this.optionsWrapperBorders1.appendTo(this.optionsWrapper);
		this.optionsWrapperBorders2.appendTo(this.optionsWrapper);
	}

	private settingCurrent?: Promise<any>;
	public async setCurrent (id: ID, initial = false) {
		while (this.settingCurrent)
			await this.settingCurrent;

		if (id === this.currentOption)
			return;

		const chosenOption = this.options.find(option => option.id === id);
		if (!chosenOption?.button) {
			console.error(`Tried to change to option '${id}' that doesn't exist`);
			return;
		}

		const currentOption = this.options.find(option => option.id === this.currentOption);
		if (!currentOption || initial) {
			this.currentOption = id;

			this.currentButton.setAppearance(chosenOption);
			if (!currentOption) {
				chosenOption.button.remove();
				delete chosenOption.button;
				this.updateOptionsWrapper();
			} else {
				chosenOption.button.setAppearance(currentOption);
				currentOption.button = chosenOption.button;
				delete chosenOption.button;
			}
		} else {
			await (this.settingCurrent = Button.animateWipeMultiple([this.currentButton, chosenOption.button], async () => {
				this.currentOption = id;

				const button = chosenOption.button;

				this.currentButton.setAppearance(chosenOption);
				chosenOption.button!.setAppearance(currentOption);
				currentOption.button = chosenOption.button;
				delete chosenOption.button;

				let promise: Promise<any> | undefined;
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				this.event.emit("selectClass", { option: id, button: button!, item: chosenOption.item, setPromise: set => promise = set });

				await promise;
			}));
		}

		delete this.settingCurrent;
	}
}

export class ClassPickerButton extends Button {

	protected override onMake (): void {
		super.onMake();
		this.classes.add(ClassPickerClasses.Button);
		Component.create()
			.classes.add(ClassPickerClasses.ButtonPreview)
			.appendTo(this);
	}

	public setAppearance (option?: IClassPickerOption<string | number>) {
		if (!option) {
			this.style.remove("--background");
			this.innerIcon?.remove();
		} else {
			if (option.background)
				this.style.set("--background", `url("${option.background}")`);

			if (option.icon)
				this.addIcon(icon => icon.style.set("--icon", `url("${option.icon!}")`));
			else
				this.innerIcon?.remove();
		}

		return this;
	}
}
