import Component from "ui/Component";

export enum ItemPowerLevelClasses {
	Main = "item-power-level",
	Icon = "item-power-level-icon",
	Difference = "item-power-level-difference",
	DifferenceBetter = "item-power-level-difference-better",
	DifferenceWorse = "item-power-level-difference-worse",
}

export default class ItemPowerLevel extends Component<HTMLElement, [number, number?]> {
	protected override onMake (power: number, difference?: number): void {
		this.classes.add(ItemPowerLevelClasses.Main)
			.append(Component.create().classes.add(ItemPowerLevelClasses.Icon))
			.text.add(`${power}`);

		if (difference)
			Component.create()
				.classes.add(ItemPowerLevelClasses.Difference, difference > 0 ? ItemPowerLevelClasses.DifferenceBetter : ItemPowerLevelClasses.DifferenceWorse)
				.text.set(difference > 0 ? `+${difference}` : `${difference}`)
				.appendTo(this);
	}
}