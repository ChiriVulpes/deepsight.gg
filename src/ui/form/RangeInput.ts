import Component from "ui/Component";
import Bound from "utility/decorator/Bound";

export enum RangeInputClasses {
	Main = "range-input",
}

export interface IRangeConfig {
	/**
	 * Defaults to 0
	 */
	min?: number;
	max: number;
	/**
	 * Defaults to 1
	 */
	step?: number;
	/**
	 * Defaults to 0
	 */
	default?: number;
}

export default class RangeInput extends Component<HTMLInputElement, [IRangeConfig?]> {

	protected static override defaultType = "input";

	public get value () {
		return this.element.valueAsNumber;
	}

	public set value (value: number) {
		this.element.valueAsNumber = value;
		this.update();
	}

	protected override onMake (config?: IRangeConfig): void {
		this.classes.add(RangeInputClasses.Main)
			.attributes.set("type", "range");

		config ??= { min: 0, max: 1, step: 0.01, default: 0 };
		this.attributes.set("min", `${config.min ?? 0}`)
			.attributes.set("max", `${config.max}`)
			.attributes.set("step", `${config.step ?? 1}`)
			.attributes.set("value", `${config.default ?? 0}`);

		this.event.subscribe("input", this.update);
	}

	@Bound
	private update () {
		this.style.set("--value", `${(this.element.valueAsNumber - +this.element.min) / (+this.element.max - +this.element.min)}`);
	}
}
