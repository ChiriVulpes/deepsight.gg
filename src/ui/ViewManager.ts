import { APP_NAME } from "Constants";
import AppNav from "ui/AppNav";
import View, { ClassesView, ViewClass } from "ui/View";
import AuthView from "ui/view/AuthView";
import InventoryKineticView from "ui/view/InventoryKineticView";
import InventoryOverviewView from "ui/view/InventoryOverviewView";
import Async from "utility/Async";
import { EventManager } from "utility/EventManager";
import URL from "utility/URL";

const registry = Object.fromEntries([
	AuthView,
	InventoryOverviewView,
	InventoryKineticView,
].map((cls: ViewClass) => [cls.id, cls] as const));

View.event.subscribe("show", ({ view }) => ViewManager.show(view));
URL.event.subscribe("navigate", () => {
	ViewManager.showById(URL.hash);
});

export interface IViewManagerEvents {
	hide: { view: View };
	show: { view: View };
}

export default class ViewManager {

	public static readonly event = EventManager.make<IViewManagerEvents>();

	public static readonly nav = AppNav.create([this])
		.appendTo(document.body);

	public static get registry () {
		return registry;
	}

	private static view?: View;

	public static hasView () {
		return !!this.view;
	}

	public static showById (id: string) {
		const view = registry[id];
		if (!view) {
			console.warn(`Tried to navigate to an unknown view '${id}'`);
			return;
		}

		this.show(view.create());
	}

	public static show (view: View) {
		const oldView = this.view;
		if (oldView) {
			this.event.emit("hide", { view: oldView });
			oldView.classes.add(ClassesView.Hidden);
			void Async.sleep(1000).then(() => oldView.remove());
		}

		URL.hash = view.id;
		this.view = view;
		view.appendTo(document.body);
		this.event.emit("show", { view });
		this.nav.showing(view);
		document.title = `${view.getName()} | ${APP_NAME}`;
	}
}
