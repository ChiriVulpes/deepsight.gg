import Model from "model/Model";
import BaseComponent from "ui/Component";
import Loadable from "ui/Loadable";
import { EventManager } from "utility/EventManager";

namespace View {

	export interface IView<MODELS extends readonly Model<any, any>[] = []> {
		id: string;
		name: string;
		noNav?: true;
		models?: MODELS;
		initialise: (view: BaseComponent, ...requirements: Model.Resolve<MODELS>) => any;
	}

	export class Factory<OTHER_MODELS extends readonly Model<any, any>[] = []> {
		private readonly otherModels = [] as any as OTHER_MODELS;
		public using<ADDITIONAL_MODELS extends readonly Model<any, any>[]> (...models: ADDITIONAL_MODELS) {
			(this.otherModels as any as Model<any, any>[]).push(...models);
			return this as any as Factory<[...OTHER_MODELS, ...ADDITIONAL_MODELS]>;
		}

		public create<MODELS extends readonly Model<any, any>[]> (definition: { models?: MODELS } & Omit<IView<[...OTHER_MODELS, ...MODELS]>, "models">): Handler<[...OTHER_MODELS, ...MODELS]> {
			return create({
				...definition,
				models: [...this.otherModels, ...(definition.models ?? []) as MODELS],
			});
		}
	}

	export function create<MODELS extends Model<any, any>[]> (definition: IView<MODELS>) {
		return new Handler(definition);
	}

	export interface Handler<MODELS extends Model<any, any>[]> extends IView<MODELS> { }
	export class Handler<MODELS extends Model<any, any>[]> {

		public constructor (definition: IView<MODELS>) {
			Object.assign(this, definition);
		}

		public show () {
			const view = Component.create([this as IView<MODELS>]);
			View.event.emit("show", { view });
			return view as Component<MODELS>;
		}
	}

	export interface IEvents {
		show: { view: Component };
	}

	export const event = EventManager.make<IEvents>();

	export enum Classes {
		Main = "view",
		Content = "view-content",
		Hidden = "view-hidden",
	}

	export class Component<MODELS extends Model<any, any>[] = Model<any, any>[]> extends BaseComponent<HTMLElement, [IView<MODELS>]> {

		private static index = 0;

		public content!: BaseComponent;
		public definition!: IView<MODELS>;

		protected override onMake (definition: IView<MODELS>): void {
			this.definition = definition;
			this.classes.add(Classes.Main, `view-${this.definition.id}`);

			this.style.set("--index", `${Component.index++}`);

			this.content = BaseComponent.create()
				.classes.add(Classes.Content)
				.appendTo(this);

			if (this.definition.models)
				Loadable.create(...this.definition.models)
					.onReady((...results) => this.content.tweak(this.definition.initialise, ...results))
					.appendTo(this);

			else
				(this.definition.initialise as any as (component: BaseComponent) => any)?.(this.content);
		}
	}


}

export default View;
