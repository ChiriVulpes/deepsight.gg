import type Model from "model/Model";
import { Classes as BaseClasses } from "ui/Classes";
import type { AnyComponent } from "ui/Component";
import BaseComponent from "ui/Component";
import Async from "utility/Async";

namespace Loadable {

	export enum Classes {
		Main = "loadable",
		Loading = "loadable-loading",
		LoadingSpinny = "loadable-loading-spinny",
		LoadingInfo = "loadable-loading-info",
		LoadingBar = "loadable-loading-bar",
		LoadingMessage = "loadable-loading-message",
		LoadingHidden = "loadable-loading-hidden",
		Content = "loadable-content",
	}

	export type Initialiser<MODELS extends Model<any, any>[]> = (...values: Model.Resolve<MODELS>) => AnyComponent;
	export class Component<MODELS extends Model<any, any>[]> extends BaseComponent<HTMLElement, [MODELS, Initialiser<MODELS>]> {

		private initialiser!: Initialiser<MODELS>;
		private loading!: BaseComponent;
		private loadingBar!: BaseComponent;
		private loadingMessage!: BaseComponent;
		private models!: MODELS;

		protected override onMake (models: MODELS, initialiser: Initialiser<MODELS>): void {
			this.models = models;
			this.initialiser = initialiser;

			this.classes.add(Classes.Main);
			this.loading = BaseComponent.create()
				.classes.add(Classes.Loading)
				.append(BaseComponent.create()
					.classes.add(Classes.LoadingSpinny)
					.append(BaseComponent.create())
					.append(BaseComponent.create()))
				.append(BaseComponent.create()
					.classes.add(Classes.LoadingInfo)
					.append(this.loadingBar = BaseComponent.create()
						.classes.add(Classes.LoadingBar))
					.append(this.loadingMessage = BaseComponent.create()
						.classes.add(Classes.LoadingMessage)))
				.appendTo(this);

			for (const model of models) {
				model.event.subscribe("loading", _ => this.onLoading());
				model.event.subscribe("loaded", _ => this.onLoaded());
				model.event.subscribe("loadUpdate", _ => this.updateLoadingInfo());

				model.get();
			}

			if (models.every(model => !model.loading))
				this.onLoaded();
		}

		public setSimple () {
			this.loadingBar.classes.add(BaseClasses.Hidden);
			this.loadingMessage.classes.add(BaseClasses.Hidden);
			return this;
		}

		private onLoading () {
			if (this.loading.classes.some(BaseClasses.Hidden, Classes.LoadingHidden)) {
				// start loading
				this.updateLoadingInfo();
				this.loading.classes.remove(BaseClasses.Hidden, Classes.LoadingHidden);
				while (this.element.children.length > 1)
					this.element.lastElementChild!.remove();
			}
		}

		private onLoaded () {
			this.updateLoadingInfo();
			for (const model of this.models)
				if (model.loading)
					return; // not loaded yet

			if (this.loading.classes.has(Classes.LoadingHidden))
				return; // already loaded

			this.loading.classes.add(Classes.LoadingHidden);
			void Async.sleep(400).then(() => {
				for (const model of this.models)
					if (model.loading)
						return; // not loaded yet

				this.loading.classes.add(BaseClasses.Hidden);
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
			this.initialiser(...this.models.map(model => model.get()) as any)
				.appendTo(this);
		}

		private updateLoadingInfo () {
			let progress = 0;
			let message: string | undefined;
			for (const model of this.models) {
				if (!model.loading) {
					progress++;
					continue;
				}

				progress += model.loadingInfo?.progress ?? 0;
				message ??= model.loadingInfo?.message;
			}

			progress /= this.models.length;

			this.loadingBar.style.set("--progress", `${Math.min(1, progress)}`);

			if (message)
				this.loadingMessage.text.set(`${message}...`);
			else
				this.loadingMessage.text.remove();
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
