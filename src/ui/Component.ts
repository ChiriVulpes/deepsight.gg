import { EventManager } from "utility/EventManager";

declare global {
	interface Element {
		component?: WeakRef<Component<this, any[]>>;
	}
}

export type ComponentClass<COMPONENT extends Component<Element, any[]> = Component<Element, any[]>> = {
	prototype: COMPONENT,
	create: (typeof Component)["create"];
	get: (typeof Component)["get"];
};

export type ComponentArgs<COMPONENT extends Component<Element, any[]>> = COMPONENT["_args"];

export default class Component<ELEMENT extends Element = HTMLElement, ARGS extends any[] = []> {

	public readonly _args!: ARGS;

	protected static defaultType = "div";

	public static create<TYPE_NAME extends keyof HTMLElementTagNameMap> (this: typeof Component, type: TYPE_NAME): Component<HTMLElementTagNameMap[TYPE_NAME], []>;
	public static create (this: typeof Component): Component<HTMLElement, []>;
	public static create<THIS extends { prototype: Component<Element, []> }> (this: THIS): THIS["prototype"];
	public static create<THIS extends { prototype: Component<Element, any[]> }> (this: THIS, args: ComponentArgs<THIS["prototype"]>): THIS["prototype"];
	public static create<TYPE_NAME extends keyof HTMLElementTagNameMap, THIS extends { prototype: Component<HTMLElementTagNameMap[TYPE_NAME], any[]> }> (this: THIS, type: TYPE_NAME, args?: ComponentArgs<THIS["prototype"]>): THIS["prototype"];
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
	public static get<ELEMENT extends Element> (element?: ELEMENT): Component<ELEMENT> | undefined;
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

	public get event (): EventManager<this & Component<HTMLElement>, HTMLElementEventMap, ELEMENT> {
		const event = new EventManager(this as any as Component<HTMLElement>, new WeakRef(this.element));
		Object.defineProperty(this, "event", {
			value: event,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return event as any;
	}

	protected constructor (public readonly element: ELEMENT) {
		if (this.constructor !== Component)
			throw new Error("Custom components may not provide a constructor. Use onMake");
		element.component = new WeakRef(this);
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

	public tweak (tweaker?: (self: this) => any) {
		tweaker?.(this);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected onMake (...args: ARGS) { }

	public append (...elements: (Component<Element, any[]> | Node)[]) {
		this.element.append(...elements.map(element =>
			element instanceof Component<Element, any[]> ? element.element : element));
		return this;
	}

	public appendTo (componentOrParentNode: ParentNode | Component<Element, any[]>) {
		if (componentOrParentNode instanceof Component<Element>)
			componentOrParentNode = componentOrParentNode.element;

		componentOrParentNode.appendChild(this.element);
		return this;
	}

	public remove () {
		this.element.remove();
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

	public toggle (present: boolean, ...classes: string[]) {
		const host = this.host.deref();
		if (present)
			host?.element.classList.add(...classes);
		else
			host?.element.classList.remove(...classes);
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
}

export class TextManager<HOST extends Component<HTMLElement>> {

	private readonly host: WeakRef<HOST>;

	public constructor (host: HOST) {
		this.host = new WeakRef(host);
	}

	public get () {
		return this.host.deref()?.element.textContent;
	}

	public set (text: string) {
		const host = this.host.deref();
		if (host)
			host.element.textContent = text;
		return host as HOST;
	}

	public add (text: string) {
		const host = this.host.deref();
		if (host)
			host.element.appendChild(document.createTextNode(text));
		return host as HOST;
	}
}
