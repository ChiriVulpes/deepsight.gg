import type Model from "model/Model";
import { Classes as BaseClasses } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import type Button from "ui/form/Button";
import Loadable from "ui/Loadable";
import { EventManager } from "utility/EventManager";

namespace View {

	export type Initialiser<MODELS extends readonly Model<any, any>[], ARGS extends any[], DEFINITION extends IViewBase<ARGS>> =
		(api: WrapperComponent<MODELS, ARGS, DEFINITION>, ...requirements: Model.Resolve<MODELS>) => any;

	export interface IViewBase<ARGS extends any[]> {
		id: string;
		hash?: (...args: ARGS) => string;
		name: string | ((...args: ARGS) => string);
		initialiseDestinationButton?: (button: Button) => any;
		noNav?: true;
		noDestinationButton?: true;
		redirectOnLoad?: true | string;
	}

	export type PartialProvided<FROM extends {}, PROVIDED extends {}> =
		Omit<FROM, keyof PROVIDED> & Partial<Pick<FROM, Extract<keyof PROVIDED, keyof FROM>>>;

	export type IView<MODELS extends readonly Model<any, any>[] = [], OTHER_MODELS extends readonly Model<any, any>[] = [], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>, PROVIDED_DEFINITION extends Partial<DEFINITION> = {}> = PartialProvided<DEFINITION, PROVIDED_DEFINITION> & {
		models?: MODELS;
		initialise?: Initialiser<readonly [...OTHER_MODELS, ...MODELS], ARGS, DEFINITION>;
	};

	export class Factory<OTHER_MODELS extends readonly Model<any, any>[] = [], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>, HELPER = {}, PROVIDED_DEFINITION extends Partial<DEFINITION> = {}> {
		private otherModels = [] as any as OTHER_MODELS;
		public using<ADDITIONAL_MODELS extends readonly Model<any, any>[]> (...models: ADDITIONAL_MODELS) {
			(this.otherModels as any as Model<any, any>[]).push(...models);
			return this as any as Factory<[...OTHER_MODELS, ...ADDITIONAL_MODELS], ARGS, DEFINITION, HELPER>;
		}

		private initialisers: Initialiser<OTHER_MODELS, ARGS, DEFINITION>[] = [];
		public initialise (initialiser: Initialiser<OTHER_MODELS, ARGS, DEFINITION>) {
			this.initialisers.push(initialiser);
			return this;
		}

		public define<EXTENDED_DEFINITION> () {
			return this as any as Factory<OTHER_MODELS, ARGS, EXTENDED_DEFINITION & DEFINITION, HELPER> & HELPER;
		}

		public helper<NEW_HELPER> (helper: NEW_HELPER) {
			Object.assign(this, helper);
			return this as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER & NEW_HELPER> & HELPER & NEW_HELPER;
		}

		protected definition = {} as DEFINITION;
		public configure<PROVIDED extends Partial<DEFINITION>> (definition: PROVIDED) {
			Object.assign(this.definition, definition);
			return this as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER, PROVIDED_DEFINITION & PROVIDED> & HELPER;
		}

		public clone () {
			const clone = Object.assign(new Factory(), this) as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER, PROVIDED_DEFINITION> & HELPER;
			this.definition = { ...this.definition };
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.otherModels = [...this.otherModels] as any;
			this.initialisers = [...this.initialisers];
			return clone;
		}

		public create<MODELS extends readonly Model<any, any>[]> (definition: IView<MODELS, OTHER_MODELS, ARGS, DEFINITION, PROVIDED_DEFINITION>) {
			return new Handler<[...OTHER_MODELS, ...MODELS], ARGS, DEFINITION>({
				...this.definition,
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

	export function create<MODELS extends readonly Model<any, any>[], ARGS extends any[] = []> (definition: IView<MODELS, [], ARGS>) {
		return new Handler(definition);
	}

	export interface Handler<MODELS extends readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends IView<MODELS> { }
	export class Handler<MODELS extends readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> {

		public constructor (definition: IView<MODELS, [], ARGS, DEFINITION>) {
			Object.assign(this, definition);
		}

		public get definition () {
			return this as this & IView<MODELS, [], ARGS, DEFINITION>;
		}

		public show (...args: ARGS) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const view = WrapperComponent.create([this as any, ...args]);
			View.event.emit("show", { view });
			return view as WrapperComponent<MODELS, ARGS, DEFINITION>;
		}

		public hide () {
			View.event.emit("hide");
		}
	}

	export interface IEvents {
		show: { view: WrapperComponent };
		hide: Event;
	}

	export const event = EventManager.make<IEvents>();

	export enum Classes {
		Main = "view",
		Content = "view-content",
		Header = "view-header",
		Footer = "view-footer",
		FooterButton = "view-footer-button",
		FooterButtonIcon = "view-footer-button-icon",
		FooterButtonLabel = "view-footer-button-label",
		FooterButtonText = "view-footer-button-text",
		Hidden = "view-hidden",
		Loadable = "view-loadable",
		Title = "view-title",
		Subtitle = "view-subtitle",
	}

	export class ContentComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends Component<HTMLElement, [IView<MODELS, [], ARGS, DEFINITION>]> {

		public definition!: IView<MODELS, [], ARGS, DEFINITION>;

		protected override onMake (definition: IView<MODELS, [], ARGS, DEFINITION>): void {
			this.definition = definition;
			this.classes.add(Classes.Content, `view-${this.definition.id}-content`);
		}
	}

	export interface IWrapperComponentEvents extends ComponentEvents<typeof Component> {
		hide: Event;
		updateTitle: Event;
		back: Event;
	}

	export class WrapperComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends Component<HTMLElement, [IView<MODELS, [], ARGS, DEFINITION>, ...ARGS]> {

		private static index = 0;

		public override event!: ComponentEventManager<this, IWrapperComponentEvents>;

		public header!: Component;
		public title!: Component;
		public subtitle!: Component;
		public content!: ContentComponent<MODELS, ARGS, DEFINITION>;
		private _footer!: Component;
		public get footer () {
			Object.defineProperty(this, "footer", { value: this._footer });
			return this._footer.classes.remove(BaseClasses.Hidden);
		}

		public get hash () {
			return this.definition.hash?.(...this._args.slice(1) as ARGS) ?? this.definition.id;
		}

		public definition!: IView<MODELS, [], ARGS, DEFINITION>;

		protected override onMake (definition: IView<MODELS, [], ARGS, DEFINITION>, ...args: ARGS): void {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(this as any)._args = [definition, ...args];

			this.definition = definition;
			this.classes.add(Classes.Main, `view-${this.definition.id}`);

			this.style.set("--index", `${WrapperComponent.index++}`);

			this.header = Component.create()
				.classes.add(Classes.Header, Classes.Header.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this);

			this._footer = Component.create()
				.classes.add(Classes.Footer, Classes.Footer.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this);

			this.title = Component.create()
				.classes.add(Classes.Title, Classes.Title.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this.header);

			this.subtitle = Component.create()
				.classes.add(Classes.Subtitle, Classes.Subtitle.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this.header);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
			this.content = ContentComponent.create([definition as any])
				.classes.add(Classes.Content.replace("-", `-${this.definition.id}-`))
				.appendTo(this);

			if (this.definition.models)
				Loadable.create(...this.definition.models)
					.onReady((...results) => this.initialise?.(...results))
					.classes.add(Classes.Loadable)
					.appendTo(this);

			else
				this.initialise(...[] as any as Model.Resolve<MODELS>);
		}

		public setTitle (tweak?: (component: Component) => any) {
			this.header.classes.remove(BaseClasses.Hidden);
			this.title.classes.remove(BaseClasses.Hidden).tweak(tweak);
			this.event.emit("updateTitle");
			return this;
		}

		public setSubtitle (tweak?: (component: Component) => any) {
			this.header.classes.remove(BaseClasses.Hidden);
			this.subtitle.classes.remove(BaseClasses.Hidden).tweak(tweak);
			return this;
		}

		private initialise (...args: Model.Resolve<MODELS>) {
			this.definition.initialise?.(this, ...args);
			return this.content;
		}

		public back () {
			this.event.emit("back");
		}
	}


}

export default View;
