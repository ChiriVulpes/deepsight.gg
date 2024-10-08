import Model from "model/Model";
import type { AnyComponent } from "ui/component/Component";
import BaseComponent from "ui/component/Component";
import { Classes as BaseClasses } from "ui/utility/Classes";
import Async from "utility/Async";
import Bound from "utility/decorator/Bound";

namespace Loadable {

	export enum Classes {
		Main = "loadable",
		Loading = "loadable-loading",
		LoadingSpinny = "loadable-loading-spinny",
		LoadingSpinny1 = "loadable-loading-spinny1",
		LoadingSpinny2 = "loadable-loading-spinny2",
		LoadingInfo = "loadable-loading-info",
		LoadingBar = "loadable-loading-bar",
		LoadingMessage = "loadable-loading-message",
		LoadingHidden = "loadable-loading-hidden",
		Content = "loadable-content",
	}

	export type Initialiser<MODELS extends Model<any, any>[]> = (...values: Model.ResolveList<MODELS>) => AnyComponent;
	export namespace Component {
		export type Arguments<MODELS extends Model<any, any>[]> = [MODELS, Initialiser<MODELS>];
	}
	export class Component<MODELS extends Model<any, any>[] = Model<any, any>[]> extends BaseComponent<HTMLElement, Component.Arguments<MODELS>> {

		private initialiser!: Initialiser<MODELS>;
		private loading!: BaseComponent;
		private loadingBar!: BaseComponent;
		private loadingMessage!: BaseComponent;
		private models!: MODELS;

		protected override onMake (models: MODELS, initialiser: Initialiser<MODELS>): void {
			this.models = models;
			this.initialiser = initialiser;

			this.classes.add(Classes.Main);
			this.loading = BaseComponent.create("span")
				.classes.add(Classes.Loading)
				.append(BaseComponent.create("span")
					.classes.add(Classes.LoadingSpinny)
					.append(BaseComponent.create("span").classes.add(Classes.LoadingSpinny1))
					.append(BaseComponent.create("span").classes.add(Classes.LoadingSpinny2)))
				.append(BaseComponent.create("span")
					.classes.add(Classes.LoadingInfo)
					.append(this.loadingBar = BaseComponent.create("span")
						.classes.add(Classes.LoadingBar))
					.append(this.loadingMessage = BaseComponent.create("span")
						.classes.add(Classes.LoadingMessage)))
				.appendTo(this);

			for (const model of models) {
				model.event.subscribe("loading", this.onLoading);

				model.get();
				if (model["value"] instanceof Promise)
					this.onLoading();
			}

			if (models.every(model => !model.loading))
				this.onLoaded();
		}

		public setSimple () {
			this.loadingBar.classes.add(BaseClasses.Hidden);
			this.loadingMessage.classes.add(BaseClasses.Hidden);
			return this;
		}

		public setLoading (loading: boolean) {
			this.loading.classes.toggle(!loading, BaseClasses.Hidden, Classes.LoadingHidden);
			return this;
		}

		@Bound
		private onLoading () {
			for (const model of this.models) {
				model.event.subscribe("loaded", this.onLoaded);
				model.event.subscribe("loadUpdate", this.updateLoadingInfo);
			}

			if (this.loading.classes.some(BaseClasses.Hidden, Classes.LoadingHidden)) {
				// start loading
				this.updateLoadingInfo();
				this.loading.classes.remove(BaseClasses.Hidden, Classes.LoadingHidden);
				while (this.element.children.length > 1)
					this.element.lastElementChild!.remove();
			}
		}

		private persistent = false;
		public setPersistent () {
			this.persistent = true;
			return this;
		}

		@Bound
		private onLoaded () {
			this.updateLoadingInfo();
			for (const model of this.models)
				if (model.loading)
					return; // not loaded yet

			for (const model of this.models) {
				if (!this.persistent)
					model.event.unsubscribe("loading", this.onLoading);
				model.event.unsubscribe("loaded", this.onLoaded);
				model.event.unsubscribe("loadUpdate", this.updateLoadingInfo);
			}

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
			this.initialiser(...this.models.map(model => model["value"] ?? undefined) as any)
				.appendTo(this);
		}

		@Bound
		private updateLoadingInfo () {
			let progress = 0;
			let message: string | undefined;
			for (const model of this.models) {
				if (!model.loading) {
					progress++;
					continue;
				}

				progress += model.loadingInfo?.progress ?? 0;
				message ??= model.loadingInfo?.messages[0];
			}

			progress /= this.models.length;

			this.loadingBar.style.set("--progress", `${Math.min(1, progress)}`);

			if (message)
				this.loadingMessage.text.set(`${message}...`);
			else
				this.loadingMessage.text.remove();
		}
	}

	export interface ILoadableFactory<MODELS extends Model<any, any>[]> {
		onReady (initialiser: Initialiser<MODELS>): Component<MODELS>;
	}

	type ResolveModels<MODELS extends (Model<any, any> | Promise<any>)[]> = { [INDEX in keyof MODELS]: MODELS[INDEX] extends Model<any, any> ? MODELS[INDEX] : Model<any, Awaited<MODELS[INDEX]>> };

	export function create<MODELS extends (Model<any, any> | Promise<any>)[]> (...models: MODELS): ILoadableFactory<ResolveModels<MODELS>> {
		return {
			onReady (initialiser: Initialiser<ResolveModels<MODELS>>) {
				return Component.create([
					models.map(model => model instanceof Promise ? Model.createTemporary(() => model) : model),
					initialiser,
				]);
			},
		};
	}
}

export default Loadable;
