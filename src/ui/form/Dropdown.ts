import Component from "ui/Component";
import Button from "ui/form/Button";

export enum DropdownClasses {
	Main = "dropdown",
	Label = "dropdown-label",
	Container = "dropdown-container",
	Option = "dropdown-option",
	OptionActive = "dropdown-option-active",
}

export default class Dropdown extends Component {

	public container!: Component;
	public options!: DropdownOption[];
	public activeOption!: DropdownOption;
	private activeReasons!: Set<string>;

	protected override onMake (): void {
		this.classes.add(DropdownClasses.Main);
		this.attributes.set("tabindex", "0");
		this.options = [];
		this.activeReasons = new Set();

		this.container = Component.create()
			.classes.add(DropdownClasses.Container)
			.appendTo(Component.create()
				.appendTo(this));

		this.onMouseMove = this.onMouseMove.bind(this);
		this.onKeypress = this.onKeypress.bind(this);
		this.onActiveElementChange = this.onActiveElementChange.bind(this);
		this.event.subscribe("mouseenter", this.onMouseEnter.bind(this));
		this.event.subscribe("focus", this.onFocus.bind(this));
		this.event.subscribe("blur", this.onBlur.bind(this));
	}

	public addLabel (initialiser: (label: Component<HTMLLabelElement>) => any) {
		Component.create("label")
			.classes.add(DropdownClasses.Label)
			.tweak(initialiser)
			.prependTo(this);

		return this;
	}

	public addOption (initialiser: (option: DropdownOption) => any) {
		const option = DropdownOption.create()
			.attributes.add("inert");
		this.activeOption ??= option.classes.add(DropdownClasses.OptionActive);
		this.options.push(option);

		option.tweak(initialiser)
			.appendTo(this.container);

		option.event.subscribe("click", event => this.onOptionClick(option, event));
		setTimeout(() => {
			this.style.set("--content-width", `${this.container.element.clientWidth}px`);
		}, 10);
		return this;
	}

	private setActive (reason: string) {
		if (!this.activeReasons.size) {
			for (const option of this.options) {
				option.attributes.remove("inert");
			}
		}

		this.activeReasons.add(reason);
	}

	private setInactive (reason: string) {
		this.activeReasons.delete(reason);
		if (!this.activeReasons.size) {
			for (const option of this.options) {
				option.attributes.add("inert");
			}
		}
	}

	private onOptionClick (option: DropdownOption, event: MouseEvent) {
		this.activeOption.classes.remove(DropdownClasses.OptionActive);
		this.activeOption = option.classes.add(DropdownClasses.OptionActive);
		this.event.emit("change");
	}

	private onMouseEnter (event: MouseEvent) {
		window.addEventListener("mousemove", this.onMouseMove);
		this.setActive("mouse");
	}

	private onMouseMove (event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (target?.closest(`.${DropdownClasses.Main}`) !== this.element) {
			window.removeEventListener("mousemove", this.onMouseMove);
			this.setInactive("mouse");
		}
	}

	private onFocus (event: FocusEvent) {
		window.addEventListener("keypress", this.onKeypress);
	}

	private onBlur (event: FocusEvent) {
		window.removeEventListener("keypress", this.onKeypress);
	}

	private onKeypress (event: KeyboardEvent) {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			this.setActive("keyboard");
			document.addEventListener("focusin", this.onActiveElementChange);
		}
	}

	private onActiveElementChange (event: FocusEvent) {
		if (document.activeElement?.closest(`.${DropdownClasses.Main}`) !== this.element) {
			this.setInactive("keyboard");
			document.removeEventListener("focusin", this.onActiveElementChange);
		}
	}
}

export class DropdownOption extends Button {
	protected override onMake (): void {
		this.classes.add(DropdownClasses.Option);
	}
}
