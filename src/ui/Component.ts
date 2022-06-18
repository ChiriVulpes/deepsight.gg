import type { Tooltip } from "ui/TooltipManager";
import { EventManager } from "utility/EventManager";

declare global {
	interface Element {
		component?: WeakRef<Component<this, readonly any[]>>;
	}
}

export type ComponentClass<COMPONENT extends Component<Element, readonly any[]> = Component<Element, readonly any[]>> = {
	prototype: COMPONENT,
	create: (typeof Component)["create"];
	get: (typeof Component)["get"];
};

export type ComponentElement<COMPONENT extends Component<Element, readonly any[]>> = COMPONENT["element"];
export type ComponentArgs<COMPONENT extends Component<Element, readonly any[]>> = COMPONENT["_args"];

export interface IComponentsEvents {
	setTooltip: { component: AnyComponent; tooltip: Tooltip; initialiser (tooltip: Tooltip): any };
}

export type AnyComponent = Component<Element, any[]>;

export type ComponentEventManager<HOST extends Component<Element, any[]>, EVENTS> =
	EventManager<HOST, EVENTS, ComponentElement<HOST>>;

export type ComponentEvents<CLASS extends { prototype: Component<Element, any[]> }> =
	CLASS["prototype"]["event"] extends EventManager<any, infer SUPER_EVENTS, any> ? SUPER_EVENTS : never;

export default class Component<ELEMENT extends Element = HTMLElement, ARGS extends readonly any[] = []> {

	public static readonly event = EventManager.make<IComponentsEvents>();

	public readonly _args!: ARGS;

	protected static defaultType = "div";

	public static create<TYPE_NAME extends keyof HTMLElementTagNameMap> (this: typeof Component, type: TYPE_NAME): Component<HTMLElementTagNameMap[TYPE_NAME], []>;
	public static create (this: typeof Component): Component<HTMLElement, []>;
	public static create<THIS extends { prototype: Component<Element, []> }> (this: THIS): THIS["prototype"];
	public static create<THIS extends { prototype: Component<Element, readonly any[]> }> (this: THIS, args: ComponentArgs<THIS["prototype"]>): THIS["prototype"];
	public static create<TYPE_NAME extends keyof HTMLElementTagNameMap, THIS extends { prototype: Component<HTMLElementTagNameMap[TYPE_NAME], readonly any[]> }> (this: THIS, type: TYPE_NAME, args?: ComponentArgs<THIS["prototype"]>): THIS["prototype"];
	public static create (type?: keyof HTMLElementTagNameMap | any[], args?: any[]) {
		if (typeof type === "object") {
			args = type;
			type = undefined;
		}

		const component = new Component(document.createElement(type ?? this.defaultType));

		if (this !== Component)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			component.make(this as any, ...args ?? []);

		return component;
	}

	public static get<ELEMENT extends Element> (element: ELEMENT): Component<ELEMENT>;
	public static get<COMPONENT extends AnyComponent> (element: COMPONENT["element"]): COMPONENT;
	public static get<ELEMENT extends Element> (element?: ELEMENT): Component<ELEMENT> | undefined;
	public static get<COMPONENT extends AnyComponent> (element?: COMPONENT["element"]): COMPONENT | undefined;
	public static get<ELEMENT extends Element> (element?: ELEMENT) {
		if (!element)
			return undefined;

		let component = element.component?.deref();
		if (component)
			return component;

		component = new Component(element);

		if (this !== Component)
			component.make(this as any);

		return component;
	}

	public get classes (): ClassManager<this & Component<HTMLElement>> {
		const classes = new ClassManager(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "classes", {
			value: classes,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return classes as any;
	}

	public get attributes (): AttributeManager<this & Component<HTMLElement>> {
		const attributes = new AttributeManager(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "attributes", {
			value: attributes,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return attributes as any;
	}

	public get style (): StyleManager<this & Component<HTMLElement>> {
		const style = new StyleManager(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "style", {
			value: style,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return style as any;
	}

	public get text (): TextManager<this & Component<HTMLElement>> {
		const text = new TextManager(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "text", {
			value: text,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return text as any;
	}

	public readonly event!: EventManager<this & Component<HTMLElement, ARGS>, HTMLElementEventMap, ELEMENT>;

	protected constructor (public readonly element: ELEMENT) {
		if (this.constructor !== Component)
			throw new Error("Custom components may not provide a constructor. Use onMake");
		element.component = new WeakRef(this);
		Object.defineProperty(this, "event", {
			configurable: true,
			get: () => {
				const event = new EventManager(this as any as Component<HTMLElement>, new WeakRef(this.element));
				Object.defineProperty(this, "event", {
					value: event,
				});
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return event as any;
			},
		});
	}

	public as<COMPONENT_CLASS extends ComponentClass> (cls: COMPONENT_CLASS): COMPONENT_CLASS["prototype"] | undefined {
		return this instanceof (cls as any) ? this as COMPONENT_CLASS["prototype"] : undefined;
	}

	public make<COMPONENT_CLASS extends ComponentClass> (cls: COMPONENT_CLASS, ...args: ComponentArgs<COMPONENT_CLASS["prototype"]>): COMPONENT_CLASS["prototype"] {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Object.setPrototypeOf(this, cls.prototype);
		(this as COMPONENT_CLASS["prototype"]).onMake(...args);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	public tweak<ARGS extends readonly any[]> (tweaker?: (self: this, ...args: ARGS) => any, ...args: ARGS) {
		tweaker?.(this, ...args);
		return this;
	}

	protected onMake (...args: ARGS) { }

	public parent (): AnyComponent | undefined {
		return Component.get(this.element.parentElement ?? undefined);
	}

	public hasContents () {
		return this.element.childNodes.length > 0;
	}

	public *children<CHILD extends AnyComponent> () {
		for (const child of this.element.children)
			yield Component.get<CHILD>(child);
	}

	public append (...elements: (AnyComponent | Node | undefined)[]) {
		this.element.append(...elements.map(element =>
			element instanceof Component ? element.element : element)
			.filter((element): element is Element | Node => element !== undefined));
		return this;
	}

	public appendTo (componentOrParentNode: ParentNode | AnyComponent) {
		if (componentOrParentNode instanceof Component<Element>)
			componentOrParentNode = componentOrParentNode.element;

		componentOrParentNode.appendChild(this.element);
		return this;
	}

	public prependTo (componentOrParentNode: ParentNode | AnyComponent) {
		if (componentOrParentNode instanceof Component<Element>)
			componentOrParentNode = componentOrParentNode.element;

		componentOrParentNode.insertBefore(this.element, componentOrParentNode.firstChild);
		return this;
	}

	public remove () {
		this.element.remove();
	}

	public removeContents () {
		while (this.element.lastChild)
			this.element.lastChild.remove();
		return this;
	}

	public setTooltip<TOOLTIP extends Tooltip> (tooltip: TOOLTIP, initialiser: (tooltip: TOOLTIP) => any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		Component.event.emit("setTooltip", { component: this as any, tooltip, initialiser: initialiser as (tooltip: Tooltip) => any });
	}

	public exists () {
		return document.contains(this.element);
	}

	public index () {
		const siblings = this.parent()?.element.children ?? [];
		for (let i = 0; i < siblings.length; i++)
			if (siblings[i] === this.element)
				return i;

		return -1;
	}
}

export interface IBasicClassManager<HOST extends Component<HTMLElement>> {
	add (...classes: string[]): HOST;
	remove (...classes: string[]): HOST;
}

export class ClassManager<HOST extends Component<HTMLElement>> implements IBasicClassManager<HOST> {

	private readonly host: WeakRef<HOST>;

	public constructor (host: HOST) {
		this.host = new WeakRef(host);
	}

	public all () {
		const host = this.host.deref();
		return [...host?.element.classList ?? []];
	}

	public add (...classes: string[]) {
		const host = this.host.deref();
		host?.element.classList.add(...classes);
		return host as HOST;
	}

	public remove (...classes: string[]) {
		const host = this.host.deref();
		host?.element.classList.remove(...classes);
		return host as HOST;
	}

	public removeWhere (filter: (cls: string) => any) {
		const host = this.host.deref();
		host?.element.classList.remove(...[...host.element.classList].filter(filter));
		return host as HOST;
	}

	public toggle (...classes: string[]): HOST;
	public toggle (present: boolean, ...classes: string[]): HOST;
	public toggle (present: boolean | string, ...classes: string[]) {
		const host = this.host.deref();

		const element = host?.element;
		if (element) {
			if (typeof present === "string") {
				classes.unshift(present);
				for (const cls of classes)
					element.classList.toggle(cls);

			} else if (present)
				element.classList.add(...classes);
			else
				element.classList.remove(...classes);
		}

		return host as HOST;
	}

	public has (...classes: string[]) {
		const host = this.host.deref();
		return classes.every(cls => host?.element.classList.contains(cls));
	}

	public some (...classes: string[]) {
		const host = this.host.deref();
		return classes.some(cls => host?.element.classList.contains(cls));
	}

	public until (promise: Promise<any>): IBasicClassManager<HOST>;
	public until (promise: Promise<any>, consumer: (manipulator: IBasicClassManager<HOST>) => any): HOST;
	public until (promise: Promise<any>, consumer?: (manipulator: IBasicClassManager<HOST>) => any) {
		const addedClasses = new Set<string>();
		const removedClasses = new Set<string>();

		void promise.then(() => {
			const element = this.host.deref()?.element;
			element?.classList.add(...removedClasses);
			element?.classList.remove(...addedClasses);
		});

		const manipulator: IBasicClassManager<HOST> = {
			add: (...classes: string[]) => {
				const host = this.host.deref();
				host?.element?.classList.add(...classes);

				for (const cls of classes)
					addedClasses.add(cls);

				return host as HOST;
			},
			remove: (...classes: string[]) => {
				const host = this.host.deref();
				host?.element?.classList.remove(...classes);

				for (const cls of classes)
					removedClasses.add(cls);

				return host as HOST;
			},
		};

		consumer?.(manipulator);

		return consumer ? this.host.deref() as HOST : manipulator;
	}
}

export class AttributeManager<HOST extends Component<HTMLElement>> {

	private readonly host: WeakRef<HOST>;

	public constructor (host: HOST) {
		this.host = new WeakRef(host);
	}

	public get (name: string) {
		return this.host.deref()?.element.getAttribute(name);
	}

	public add (name: string) {
		const host = this.host.deref();
		host?.element.setAttribute(name, "");
		return host as HOST;
	}

	public toggle (present: boolean, name: string) {
		const host = this.host.deref();
		if (present)
			host?.element.setAttribute(name, "");
		else
			host?.element.removeAttribute(name);
		return host as HOST;
	}

	public set (name: string, value: string) {
		const host = this.host.deref();
		host?.element.setAttribute(name, value);
		return host as HOST;
	}

	public remove (name: string) {
		const host = this.host.deref();
		host?.element.removeAttribute(name);
		return host as HOST;
	}
}

export class StyleManager<HOST extends Component<HTMLElement>> {

	private readonly host: WeakRef<HOST>;

	public constructor (host: HOST) {
		this.host = new WeakRef(host);
	}

	// public get (name: string) {
	// 	return this.host.deref()?.element.style.getPropertyValue(name);
	// }

	public set (name: string, value: string) {
		const host = this.host.deref();
		host?.element.style.setProperty(name, value);
		return host as HOST;
	}

	public remove (name: string) {
		const host = this.host.deref();
		host?.element.style.removeProperty(name);
		return host as HOST;
	}
}

export class TextManager<HOST extends Component<HTMLElement>> {

	private readonly host: WeakRef<HOST>;

	public constructor (host: HOST) {
		this.host = new WeakRef(host);
	}

	public get () {
		return this.host.deref()?.element.textContent;
	}

	public set (text?: string) {
		const host = this.host.deref();
		if (host) {
			if (text === undefined)
				this.remove();
			else
				host.element.textContent = text;
		}
		return host as HOST;
	}

	public add (text: string) {
		const host = this.host.deref();
		if (host)
			host.element.appendChild(document.createTextNode(text));
		return host as HOST;
	}

	public remove () {
		const host = this.host.deref();
		if (host)
			for (const child of [...host.element.childNodes])
				if (child.nodeType === Node.TEXT_NODE)
					child.remove();
		return host as HOST;
	}
}

export { Component as ComponentDeclaration };

