import Model from "model/Model";
import { Classes as BaseClasses } from "ui/Classes";
import BaseComponent from "ui/Component";

namespace Loadable {

	export enum Classes {
		Main = "loadable",
		Loading = "loadable-loading",
		Content = "loadable-content",
	}

	export type Initialiser<T> = (value: T) => BaseComponent<Element, any[]>;
	export class Component<T> extends BaseComponent<HTMLElement, [Model<T>, Initialiser<T>]> {

		// private model!: Model<T>;
		private initialiser!: Initialiser<T>;
		private loading!: BaseComponent;

		protected override onMake (model: Model<T>, initialiser: Initialiser<T>): void {
			// this.model = model;
			this.initialiser = initialiser;

			this.classes.add(Classes.Main);
			this.loading = BaseComponent.create()
				.classes.add(Classes.Loading)
				.append(BaseComponent.create())
				.append(BaseComponent.create())
				.appendTo(this);

			model.event.subscribe("loading", () => this.onLoading());
			model.event.subscribe("loaded", event => this.onLoaded(event.value));

			model.get();
		}

		private onLoading () {
			this.loading.classes.remove(BaseClasses.Hidden);
			while (this.element.children.length > 1) {
				this.element.lastElementChild!.remove();
			}
		}

		private onLoaded (value: T) {
			this.loading.classes.add(BaseClasses.Hidden);
			this.initialiser(value)
				.appendTo(this);
		}
	}

	export function create<T> (model: Model<T>) {
		return {
			onReady (initialiser: Initialiser<T>) {
				return Component.create([model, initialiser]);
			},
		};
	}
}

export default Loadable;
