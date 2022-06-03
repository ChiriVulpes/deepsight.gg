import View from "ui/View";

export default class InventoryKineticView extends View {

	public static readonly id = "kinetic";
	public static readonly destinationName = "Kinetic";

	public getName () {
		return InventoryKineticView.destinationName;
	}

	protected onMakeView (): void {
	}
}
