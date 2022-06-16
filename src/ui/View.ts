import type Model from "model/Model";
import type Button from "ui/Button";
import { Classes as BaseClasses } from "ui/Classes";
import Component from "ui/Component";
import Loadable from "ui/Loadable";
import { EventManager } from "utility/EventManager";

namespace View {

	export type Initialiser<MODELS extends readonly Model<any, any>[], DEFINITION extends IViewBase> = (component: ContentComponent<MODELS, DEFINITION>, ...requirements: Model.Resolve<MODELS>) => any;

	export interface IViewBase {
		id: string;
		name: string;
		initialiseButton?: (button: Button) => any;
		noNav?: true;
	}

	export type IView<MODELS extends readonly Model<any, any>[] = [], OTHER_MODELS extends readonly Model<any, any>[] = [], DEFINITION extends IViewBase = IViewBase> = DEFINITION & {
		models?: MODELS;
		initialise?: Initialiser<readonly [...OTHER_MODELS, ...MODELS], DEFINITION>;
	};

	export class Factory<OTHER_MODELS extends readonly Model<any, any>[] = [], DEFINITION extends IViewBase = IViewBase, HELPER = {}> {
		private readonly otherModels = [] as any as OTHER_MODELS;
		public using<ADDITIONAL_MODELS extends readonly Model<any, any>[]> (...models: ADDITIONAL_MODELS) {
			(this.otherModels as any as Model<any, any>[]).push(...models);
			return this as any as Factory<[...OTHER_MODELS, ...ADDITIONAL_MODELS], DEFINITION, HELPER>;
		}

		private readonly initialisers: Initialiser<OTHER_MODELS, DEFINITION>[] = [];
		public initialise (initialiser: Initialiser<OTHER_MODELS, DEFINITION>) {
			this.initialisers.push(initialiser);
			return this;
		}

		protected readonly definition!: DEFINITION;
		public define<EXTENDED_DEFINITION> () {
			return this as any as Factory<OTHER_MODELS, EXTENDED_DEFINITION & DEFINITION, HELPER>;
		}

		public helper<NEW_HELPER> (helper: NEW_HELPER) {
			Object.assign(this, helper);
			return this as any as Factory<OTHER_MODELS, DEFINITION, HELPER & NEW_HELPER> & HELPER & NEW_HELPER;
		}

		public create<MODELS extends readonly Model<any, any>[]> (definition: IView<MODELS, OTHER_MODELS, DEFINITION>) {
			return new Handler<[...OTHER_MODELS, ...MODELS], DEFINITION>({
				...definition,
				models: [...this.otherModels, ...(definition.models ?? []) as MODELS],
				initialise: async (component, ...requirements) => {
					for (const initialiser of [...this.initialisers, definition.initialise]) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						await initialiser?.(component as any, ...requirements);
					}
				},
			});
		}
	}

	export function create<MODELS extends readonly Model<any, any>[]> (definition: IView<MODELS>) {
		return new Handler(definition);
	}

	export interface Handler<MODELS extends readonly Model<any, any>[], DEFINITION extends IViewBase = IViewBase> extends IView<MODELS> { }
	export class Handler<MODELS extends readonly Model<any, any>[], DEFINITION extends IViewBase = IViewBase> {

		public constructor (definition: IView<MODELS, [], DEFINITION>) {
			Object.assign(this, definition);
		}

		public get definition () {
			return this as this & IView<MODELS, [], DEFINITION>;
		}

		public show () {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const view = WrapperComponent.create([this as any]);
			View.event.emit("show", { view });
			return view as WrapperComponent<MODELS, DEFINITION>;
		}
	}

	export interface IEvents {
		show: { view: WrapperComponent };
	}

	export const event = EventManager.make<IEvents>();

	export enum Classes {
		Main = "view",
		Content = "view-content",
		Hidden = "view-hidden",
		Loadable = "view-loadable",
		Title = "view-title",
		Subtitle = "view-subtitle",
	}

	export class ContentComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], DEFINITION extends IViewBase = IViewBase> extends Component<HTMLElement, [IView<MODELS, [], DEFINITION>]> {

		public definition!: IView<MODELS, [], DEFINITION>;
		public title!: Component;
		public subtitle!: Component;

		protected override onMake (definition: IView<MODELS, [], DEFINITION>): void {
			this.definition = definition;
			this.classes.add(Classes.Content, `view-${this.definition.id}-content`);

			this.title = Component.create()
				.classes.add(Classes.Title, BaseClasses.Hidden)
				.appendTo(this);

			this.subtitle = Component.create()
				.classes.add(Classes.Subtitle, BaseClasses.Hidden)
				.appendTo(this);
		}

		public setTitle (tweak?: (component: Component) => any) {
			this.title.classes.remove(BaseClasses.Hidden).tweak(tweak);
			return this;
		}

		public setSubtitle (tweak?: (component: Component) => any) {
			this.subtitle.classes.remove(BaseClasses.Hidden).tweak(tweak);
			return this;
		}
	}

	export class WrapperComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], DEFINITION extends IViewBase = IViewBase> extends Component<HTMLElement, [IView<MODELS, [], DEFINITION>]> {

		private static index = 0;

		public content!: ContentComponent<MODELS, DEFINITION>;
		public definition!: IView<MODELS, [], DEFINITION>;

		protected override onMake (definition: IView<MODELS, [], DEFINITION>): void {
			this.definition = definition;
			this.classes.add(Classes.Main, `view-${this.definition.id}`);

			this.style.set("--index", `${WrapperComponent.index++}`);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
			this.content = ContentComponent.create([definition as any])
				.appendTo(this);

			if (this.definition.models)
				Loadable.create(...this.definition.models)
					.onReady((...results) => this.content.tweak(this.definition.initialise, ...results))
					.classes.add(Classes.Loadable)
					.appendTo(this);

			else
				(this.definition.initialise as any as (component: ContentComponent<MODELS, DEFINITION>) => any)?.(this.content);
		}
	}


}

export default View;
