import { APP_NAME } from "Constants";
import type Model from "model/Model";
import View from "ui/View";
import AuthView from "ui/view/AuthView";
import InventoryArmsView from "ui/view/inventory/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/InventoryClassItemView";
import InventoryEnergyView from "ui/view/inventory/InventoryEnergyView";
import InventoryHelmetView from "ui/view/inventory/InventoryHelmetView";
import InventoryKineticView from "ui/view/inventory/InventoryKineticView";
import InventoryLegsView from "ui/view/inventory/InventoryLegsView";
import InventoryPowerView from "ui/view/inventory/InventoryPowerView";
import SettingsView from "ui/view/SettingsView";
import Async from "utility/Async";
import { EventManager } from "utility/EventManager";
import URL from "utility/URL";

const registry = Object.fromEntries([
	AuthView,
	// InventoryOverviewView,
	InventoryKineticView,
	InventoryEnergyView,
	InventoryPowerView,
	InventoryHelmetView,
	InventoryArmsView,
	InventoryChestView,
	InventoryLegsView,
	InventoryClassItemView,
	SettingsView,
].map((view) => [view.id, view as View.Handler<readonly Model<any, any>[]>] as const));

View.event.subscribe("show", ({ view }) => ViewManager.show(view));
URL.event.subscribe("navigate", () => {
	ViewManager.showById(URL.hash);
});

export interface IViewManagerEvents {
	hide: { view: View.WrapperComponent };
	show: { view: View.WrapperComponent };
}

export default class ViewManager {

	public static readonly event = EventManager.make<IViewManagerEvents>();

	public static get registry () {
		return registry;
	}

	private static view?: View.WrapperComponent;

	public static hasView () {
		return !!this.view;
	}

	public static showById (id: string) {
		if (id === this.view?.definition.id)
			return;

		const view = registry[id];
		if (!view) {
			console.warn(`Tried to navigate to an unknown view '${id}'`);
			return;
		}

		this.show(view.show());
	}

	public static show (view: View.WrapperComponent) {
		if (this.view === view)
			return;

		const oldView = this.view;
		if (oldView) {
			this.event.emit("hide", { view: oldView });
			oldView.classes.add(View.Classes.Hidden);
			void Async.sleep(1000).then(() => oldView.remove());
		}

		URL.hash = view.definition.id;
		this.view = view;
		view.appendTo(document.body);
		this.event.emit("show", { view });
		document.title = `${view.definition.name} | ${APP_NAME}`;
	}
}
