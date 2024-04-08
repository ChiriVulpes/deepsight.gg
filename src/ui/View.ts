import type Model from "model/Model";
import Characters from "model/models/Characters";
import DeepsightStats from "model/models/DeepsightStats";
import EnumModel from "model/models/enum/EnumModel";
import Manifest from "model/models/Manifest";
import Background from "ui/BackgroundManager";
import { Classes as BaseClasses } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import type Button from "ui/form/Button";
import SortManager from "ui/inventory/sort/SortManager";
import Loadable from "ui/Loadable";
import { EventManager } from "utility/EventManager";

namespace View {

	export type Initialiser<MODELS extends readonly Model<any, any>[], ARGS extends any[], DEFINITION extends IViewBase<ARGS>, WRAPPER extends WrapperComponent<MODELS, ARGS, DEFINITION> = WrapperComponent<MODELS, ARGS, DEFINITION>> =
		(api: WRAPPER, ...requirements: Model.ResolveList<MODELS>) => any;

	export interface IViewBase<ARGS extends any[]> {
		id: string;
		hash?: string | ((...args: ARGS) => string) | null;
		name: string | ((...args: ARGS) => string) | null;
		initialiseDestinationButton?: (button: Button) => any;
		/**
		 * - Set to `"required"`
		 * - Set to `"spy"` or `undefined` to require auth to view this tab (default)
		 * - Set to `"optional"` to always show this tab
		 * - Set to `"none"` to require *no* auth
		 */
		auth?: "required" | "spy" | "optional" | "none";
		noDestinationButton?: true;
		displayDestinationButton?(): boolean;
		redirectOnLoad?: true | string;
		parentViewId?: string;
		noHashChange?: true;
	}

	export type PartialProvided<FROM extends {}, PROVIDED extends {}> =
		Omit<FROM, keyof PROVIDED> & Partial<Pick<FROM, Extract<keyof PROVIDED, keyof FROM>>>;

	export type IView<MODELS extends readonly Model<any, any>[] = [], OTHER_MODELS extends readonly Model<any, any>[] = [], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>, PROVIDED_DEFINITION extends Partial<DEFINITION> = {}, WRAPPER extends WrapperComponent<readonly [...OTHER_MODELS, ...MODELS], ARGS, DEFINITION> = WrapperComponent<readonly [...OTHER_MODELS, ...MODELS], ARGS, DEFINITION>> = PartialProvided<DEFINITION, PROVIDED_DEFINITION> & {
		models?: MODELS | ((...args: ARGS) => MODELS);
		initialise?: Initialiser<readonly [...OTHER_MODELS, ...MODELS], ARGS, DEFINITION, WRAPPER>;
	};

	export class Factory<OTHER_MODELS extends readonly Model<any, any>[] = [], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>, HELPER = {}, PROVIDED_DEFINITION extends Partial<DEFINITION> = {}, WRAPPER extends WrapperComponent<OTHER_MODELS, ARGS, DEFINITION> = WrapperComponent<OTHER_MODELS, ARGS, DEFINITION>> {
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

		public wrapper<WRAPPER extends WrapperComponent<OTHER_MODELS, ARGS, DEFINITION>> (): Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER, PROVIDED_DEFINITION, WRAPPER> {
			return this as any;
		}

		public define<EXTENDED_DEFINITION> () {
			return this as any as Factory<OTHER_MODELS, ARGS, EXTENDED_DEFINITION & DEFINITION, HELPER> & HELPER;
		}

		public helper<NEW_HELPER> (helper: NEW_HELPER) {
			Object.assign(this, helper);
			return this as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER & NEW_HELPER> & HELPER & NEW_HELPER;
		}

		protected definition: (DEFINITION | ((definition: DEFINITION) => DEFINITION))[] = [];
		public configure<PROVIDED extends Partial<DEFINITION>> (definition: PROVIDED | ((definition: DEFINITION) => PROVIDED)) {
			this.definition.push(definition as any);
			return this as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER, PROVIDED_DEFINITION & PROVIDED> & HELPER;
		}

		public clone () {
			const clone = Object.assign(new Factory(), this) as any as Factory<OTHER_MODELS, ARGS, DEFINITION, HELPER, PROVIDED_DEFINITION, WRAPPER> & HELPER;
			this.definition = this.definition.slice();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.otherModels = [...this.otherModels] as any;
			this.initialisers = [...this.initialisers];
			return clone;
		}

		public create (definition: IView<[], OTHER_MODELS, ARGS, DEFINITION, PROVIDED_DEFINITION, WRAPPER>) {
			for (let i = this.definition.length - 1; i >= 0; i--) {
				const currentDef = this.definition[i];
				definition = typeof currentDef === "function" ? { ...currentDef(definition as DEFINITION), ...definition } : { ...currentDef, ...definition };
			}

			return new Handler<OTHER_MODELS, ARGS, DEFINITION>({
				...definition as DEFINITION,
				models: this.otherModels,
				initialise: async (component, ...requirements) => {
					await Promise.all([
						DeepsightStats.await(),
						Manifest.await(),
						EnumModel.awaitAll(),
						Characters.awaitReady(),
					]);
					await SortManager.init();
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

	export interface Handler<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends IView<MODELS> { }
	export class Handler<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> {

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
		Subview = "view-subview",
		Background = "view-background",
	}

	export class ContentComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends Component<HTMLElement, [IView<MODELS, [], ARGS, DEFINITION>]> {

		public header!: Component;
		public title!: Component;
		public subtitle!: Component;
		public definition!: IView<MODELS, [], ARGS, DEFINITION>;

		protected override onMake (definition: IView<MODELS, [], ARGS, DEFINITION>): void {
			this.definition = definition;

			this.header = Component.create()
				.classes.add(Classes.Header, Classes.Header.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this);

			this.title = Component.create()
				.classes.add(Classes.Title, Classes.Title.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this.header);

			this.subtitle = Component.create()
				.classes.add(Classes.Subtitle, Classes.Subtitle.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this.header);

			this.classes.add(Classes.Content, `view-${this.definition.id}-content`);
		}
	}

	export interface IWrapperComponentEvents extends ComponentEvents<typeof Component> {
		hide: Event;
		updateTitle: Event;
		updateHash: { args: any[] };
		back: Event;
		initialise: Event;
	}

	export class WrapperComponent<MODELS extends readonly Model<any, any>[] = readonly Model<any, any>[], ARGS extends any[] = [], DEFINITION extends IViewBase<ARGS> = IViewBase<ARGS>> extends Component<HTMLElement, [IView<MODELS, [], ARGS, DEFINITION>, ...ARGS]> {

		private static index = 0;

		public override event!: ComponentEventManager<this, IWrapperComponentEvents>;

		public content!: ContentComponent<MODELS, ARGS, DEFINITION>;
		private _footer!: Component;
		private background?: Background;

		public get header () { return this.content.header; }
		public get title () { return this.content.title; }
		public get subtitle () { return this.content.subtitle; }

		public get footer () {
			Object.defineProperty(this, "footer", { value: this._footer });
			return this._footer.classes.remove(BaseClasses.Hidden);
		}

		public setBackground (...src: string[]) {
			this.background?.remove();
			return this.background = Background.create([src])
				.prependTo(this);
		}

		public get hash (): string | null {
			let hash = this.definition.hash;
			if (typeof hash === "string" || hash === null)
				return hash;

			if (typeof hash === "function")
				hash = hash?.(...this._args.slice(1) as ARGS);

			return hash ?? this.definition.id;
		}

		public definition!: IView<MODELS, [], ARGS, DEFINITION>;

		protected override onMake (definition: IView<MODELS, [], ARGS, DEFINITION>, ...args: ARGS): void {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(this as any)._args = [definition, ...args];

			this.definition = definition;
			this.classes.add(Classes.Main, `view-${this.definition.id}`);

			this.style.set("--index", `${WrapperComponent.index++}`);

			this._footer = Component.create()
				.classes.add(Classes.Footer, Classes.Footer.replace("-", `-${this.definition.id}-`), BaseClasses.Hidden)
				.appendTo(this);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
			this.content = ContentComponent.create([definition as any])
				.classes.add(Classes.Content.replace("-", `-${this.definition.id}-`))
				.appendTo(this);

			if (!this.definition.models) {
				this.initialise(...[] as any as Model.ResolveList<MODELS>);
				return;
			}

			let models = this.definition.models;
			if (typeof models === "function")
				models = models(...args);

			Loadable.create(...models)
				.onReady((...results) => this.initialise?.(...results))
				.classes.add(Classes.Loadable)
				.appendTo(this);
		}

		public setTitle (tweak?: (component: Component) => any) {
			this.content.header.classes.remove(BaseClasses.Hidden);
			this.content.title.classes.remove(BaseClasses.Hidden).tweak(tweak);
			this.event.emit("updateTitle");
			return this;
		}

		public setSubtitle (type: "caps" | "small" | "lore", tweak?: (component: Component) => any) {
			this.content.header.classes.remove(BaseClasses.Hidden);
			this.content.subtitle.classes.add(`${Classes.Subtitle}-${type}`).classes.remove(BaseClasses.Hidden).tweak(tweak);
			return this;
		}

		public updateHash (...args: ARGS) {
			const realArgs = this._args;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(this as any)._args = [realArgs[0], ...args];
			this.event.emit("updateHash", { args });
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(this as any)._args = realArgs;
			return this;
		}

		private initialise (...args: Model.ResolveList<MODELS>) {
			this.definition.initialise?.(this, ...args);
			this.event.emit("initialise");
			return this.content;
		}

		public back () {
			this.event.emit("back");
		}
	}


}

export default View;
