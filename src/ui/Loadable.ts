import Model from "model/Model";
import { Classes as BaseClasses } from "ui/Classes";
import BaseComponent from "ui/Component";

namespace Loadable {

	export enum Classes {
		Main = "loadable",
		Loading = "loadable-loading",
		Content = "loadable-content",
	}

	export type Initialiser<MODELS extends Model<any, any>[]> = (...values: { [KEY in keyof MODELS]: MODELS[KEY] extends Model<any, infer R> ? R : never }) => BaseComponent<Element, any[]>;
	export class Component<MODELS extends Model<any, any>[]> extends BaseComponent<HTMLElement, [MODELS, Initialiser<MODELS>]> {

		private initialiser!: Initialiser<MODELS>;
		private loading!: BaseComponent;
		private models!: MODELS;
		private currentlyLoading!: Set<Model<any, any>>;

		protected override onMake (models: MODELS, initialiser: Initialiser<MODELS>): void {
			this.models = models;
			this.initialiser = initialiser;
			this.currentlyLoading = new Set();

			this.classes.add(Classes.Main);
			this.loading = BaseComponent.create()
				.classes.add(Classes.Loading)
				.append(BaseComponent.create())
				.append(BaseComponent.create())
				.appendTo(this);

			for (const model of models)
				this.currentlyLoading.add(model);

			for (const model of models) {
				model.event.subscribe("loading", _ => this.onLoading(model));
				model.event.subscribe("loaded", _ => this.onLoaded(model));

				model.get();
			}
		}

		private onLoading (model: Model<any, any>) {
			if (this.currentlyLoading.has(model))
				return;

			if (!this.currentlyLoading.size) {
				this.loading.classes.remove(BaseClasses.Hidden);
				while (this.element.children.length > 1)
					this.element.lastElementChild!.remove();
			}

			this.currentlyLoading.add(model);
		}

		private onLoaded (model: Model<any, any>) {
			if (!this.currentlyLoading.delete(model))
				return;

			if (this.currentlyLoading.size)
				return; // still other models loading

			this.loading.classes.add(BaseClasses.Hidden);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
			this.initialiser(...this.models.map(model => model.get()) as any)
				.appendTo(this);
		}
	}

	export function create<MODELS extends Model<any, any>[]> (...model: MODELS) {
		return {
			onReady (initialiser: Initialiser<MODELS>) {
				return Component.create([model, initialiser]);
			},
		};
	}
}

export default Loadable;
