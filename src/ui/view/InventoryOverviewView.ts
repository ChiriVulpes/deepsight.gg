import Profile from "model/Profile";
import Component from "ui/Component";
import Loadable from "ui/Loadable";
import View from "ui/View";

export default class InventoryOverviewView extends View {

	public static readonly id = "overview";
	public static readonly destinationName = "Overview";

	public getName () {
		return InventoryOverviewView.destinationName;
	}

	protected onMakeView (): void {

		Loadable.create(Profile)
			.onReady(() => Component.create())
			.appendTo(this.content);
	}
}
