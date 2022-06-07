import Items from "model/models/Items";
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
		Loadable.create(Items)
			.onReady((items) => {
				console.log(items);
				return Component.create();
			})
			.appendTo(this.content);
	}
}
