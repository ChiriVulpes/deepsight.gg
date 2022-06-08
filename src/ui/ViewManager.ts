import { APP_NAME } from "Constants";
import Model from "model/Model";
import View from "ui/View";
import AuthView from "ui/view/AuthView";
import InventoryKineticView from "ui/view/InventoryKineticView";
import SettingsView from "ui/view/SettingsView";
import Async from "utility/Async";
import { EventManager } from "utility/EventManager";
import URL from "utility/URL";

const registry = Object.fromEntries([
	AuthView,
	// InventoryOverviewView,
	InventoryKineticView,
	SettingsView,
].map((view: View.Handler<Model<any, any>[]>) => [view.id, view] as const));

View.event.subscribe("show", ({ view }) => ViewManager.show(view));
URL.event.subscribe("navigate", () => {
	ViewManager.showById(URL.hash);
});

export interface IViewManagerEvents {
	hide: { view: View.Component };
	show: { view: View.Component };
}

export default class ViewManager {

	public static readonly event = EventManager.make<IViewManagerEvents>();

	public static get registry () {
		return registry;
	}

	private static view?: View.Component;

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

	public static show (view: View.Component) {
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
