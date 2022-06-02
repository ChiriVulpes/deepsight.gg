import { EventManipulator } from "utility/EventManipulator";

declare global {
	interface Element {
		component?: WeakRef<Component<this>>;
	}
}

export default class Component<ELEMENT extends Element = HTMLElement> {

	protected static defaultType = "div";

	public static create (): Component<HTMLDivElement>;
	public static create<TYPE_NAME extends keyof HTMLElementTagNameMap> (type: TYPE_NAME): Component<HTMLElementTagNameMap[TYPE_NAME]>;
	public static create (type?: keyof HTMLElementTagNameMap) {
		const component = new Component(document.createElement(type ?? this.defaultType));

		if (this !== Component)
			component.make(this as any);

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

	public get classes (): ClassManipulator<this & Component<HTMLElement>> {
		const classes = new ClassManipulator(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "classes", {
			value: classes,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return classes as any;
	}

	public get attributes (): ClassManipulator<this & Component<HTMLElement>> {
		const attributes = new ClassManipulator(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "attributes", {
			value: attributes,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return attributes as any;
	}

	public get text (): TextManipulator<this & Component<HTMLElement>> {
		const text = new TextManipulator(this as any as Component<HTMLElement>);
		Object.defineProperty(this, "text", {
			value: text,
		});
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return text as any;
	}

	public get event (): EventManipulator<this & Component<HTMLElement>, HTMLElementEventMap, ELEMENT> {
		const event = new EventManipulator(this as any as Component<HTMLElement>, new WeakRef(this.element));
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

	public as<COMPONENT_CLASS extends new () => Component> (cls: COMPONENT_CLASS): InstanceType<COMPONENT_CLASS> | undefined {
		return this instanceof cls ? this as InstanceType<COMPONENT_CLASS> : undefined;
	}

	public make<COMPONENT_CLASS extends new () => Component> (cls: COMPONENT_CLASS): InstanceType<COMPONENT_CLASS> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		Object.setPrototypeOf(this, cls.prototype);
		this.onMake();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this as any;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected onMake () { }

	public appendTo (componentOrParentNode: ParentNode | Component) {
		if (componentOrParentNode instanceof Component)
			componentOrParentNode = componentOrParentNode.element;

		componentOrParentNode.appendChild(this.element);
		return this;
	}
}

export interface IBasicClassManipulator<HOST extends Component<HTMLElement>> {
	add (...classes: string[]): HOST;
	remove (...classes: string[]): HOST;
}

export class ClassManipulator<HOST extends Component<HTMLElement>> implements IBasicClassManipulator<HOST> {

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

	public set (present: boolean, ...classes: string[]) {
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

	public until (promise: Promise<any>): IBasicClassManipulator<HOST>;
	public until (promise: Promise<any>, consumer: (manipulator: IBasicClassManipulator<HOST>) => any): HOST;
	public until (promise: Promise<any>, consumer?: (manipulator: IBasicClassManipulator<HOST>) => any) {
		const addedClasses = new Set<string>();
		const removedClasses = new Set<string>();

		void promise.then(() => {
			const element = this.host.deref()?.element;
			element?.classList.add(...removedClasses);
			element?.classList.remove(...addedClasses);
		});

		const manipulator: IBasicClassManipulator<HOST> = {
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

export class TextManipulator<HOST extends Component<HTMLElement>> {

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

export class AttributeManipulator<HOST extends Component<HTMLElement>> {

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

	public set (name: string, value: string) {
		const host = this.host.deref();
		host?.element.setAttribute(name, value);
		return host as HOST;
	}
}
