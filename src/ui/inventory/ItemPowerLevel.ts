import Component from "ui/Component";

export enum ItemPowerLevelClasses {
	Main = "item-power-level",
	Icon = "item-power-level-icon",
	Eighths = "item-power-level-eighths",
	Difference = "item-power-level-difference",
	DifferenceBetter = "item-power-level-difference-better",
	DifferenceWorse = "item-power-level-difference-worse",
}

export default class ItemPowerLevel extends Component<HTMLElement, [number, number?]> {
	protected override onMake (power: number, difference?: number): void {
		this.classes.add(ItemPowerLevelClasses.Main)
			.append(Component.create().classes.add(ItemPowerLevelClasses.Icon))
			.text.add(`${Math.floor(power)}`);

		if (!Number.isInteger(power))
			Component.create()
				.classes.add(ItemPowerLevelClasses.Eighths)
				.text.set(`${Math.round(power % 1 * 8)}`)
				.appendTo(this);

		if (difference)
			Component.create()
				.classes.add(ItemPowerLevelClasses.Difference, difference > 0 ? ItemPowerLevelClasses.DifferenceBetter : ItemPowerLevelClasses.DifferenceWorse)
				.text.set(difference > 0 ? `+${difference}` : `${difference}`)
				.appendTo(this);
	}
}