import { Classes } from "ui/Classes";
import type { AnyComponent } from "ui/Component";
import Component from "ui/Component";
import DimensionalCache from "ui/DimensionalCache";
import Async from "utility/Async";

export enum TooltipClasses {
	Storage = "tooltip-storage",
	Surface = "tooltip-surface",
	Reversed = "tooltip-reversed",
	_ScrollableEnabled = "tooltip--scrollable-enabled",

	Main = "tooltip",
	Wrapper = "tooltip-wrapper",
	Extra = "tooltip-extra",
	Header = "tooltip-header",
	Title = "tooltip-title",
	Subtitle = "tooltip-subtitle",
	Tier = "tooltip-tier",
	Content = "tooltip-content",
	Footer = "tooltip-footer",
	Hints = "tooltip-hints",
	Forced1pxBigger = "tooltip-forced-1px-bigger",
	Scrollable = "tooltip-scrollable",
	Scrollable_Enabled = "tooltip-scrollable--enabled",
}

export class TooltipWrapper extends Component<HTMLElement, [Tooltip]> {
	public tooltip!: Tooltip;

	protected override onMake (tooltip: Tooltip): void {
		this.classes.add(TooltipClasses.Wrapper);
		this.tooltip = tooltip.appendTo(this);
	}
}

export class Tooltip extends Component {
	public owner?: WeakRef<AnyComponent>;
	public header!: Component;
	public title!: Component<HTMLHeadingElement>;
	public subtitle!: Component;
	public tier!: Component;
	public content!: Component;
	public footer!: Component;
	public wrapper!: TooltipWrapper;
	private _hints?: Component;
	private _extra?: Tooltip;
	private scrollableComponent?: Component;
	private scrollTop?: number;

	public get extra (): Tooltip {
		return this._extra ??= Tooltip.create()
			.classes.add(TooltipClasses.Extra)
			.appendTo(this.wrapper);
	}

	public get hints (): Component {
		return this._hints ??= Component.create()
			.classes.add(TooltipClasses.Hints)
			.appendTo(this.footer);
	}

	protected override onMake (): void {
		this.classes.add(TooltipClasses.Main);

		this.wrapper = TooltipWrapper.create([this]);

		this.header = Component.create("header")
			.classes.add(TooltipClasses.Header)
			.appendTo(this);

		this.title = Component.create("h2")
			.classes.add(TooltipClasses.Title)
			.appendTo(this.header);

		this.subtitle = Component.create()
			.classes.add(TooltipClasses.Subtitle)
			.appendTo(this.header);

		this.tier = Component.create()
			.classes.add(TooltipClasses.Tier)
			.appendTo(this.header);

		this.content = Component.create()
			.classes.add(TooltipClasses.Content)
			.appendTo(this);

		this.footer = Component.create("footer")
			.classes.add(TooltipClasses.Footer)
			.appendTo(this);
	}

	public setPadding (padding: number) {
		this.style.set("--mouse-offset", `${padding}px`);
		return this;
	}

	public setScrollableComponent (component?: Component) {
		this.scrollableComponent = component;
		return this;
	}
}

namespace TooltipManager {

	const tooltipStorage = Component.create()
		.classes.add(TooltipClasses.Storage)
		.appendTo(document.body);

	const tooltipSurface = Component.create()
		.classes.add(TooltipClasses.Surface)
		.appendTo(document.body);

	const surfaceCache = DimensionalCache.get(tooltipSurface.element);

	let tooltipsEnabled = window.innerWidth > 800;

	export interface ITooltipClass<TOOLTIP> {
		get (): TOOLTIP;
		createRaw (): TOOLTIP;
	}

	export function create<TOOLTIP extends Tooltip> (initialiser: (tooltip: Tooltip) => TOOLTIP): ITooltipClass<TOOLTIP> {
		let tooltip: TOOLTIP | undefined;
		return {
			get () {
				if (tooltip) return tooltip;
				tooltip = initialiser(Tooltip.create());
				tooltip.wrapper.appendTo(tooltipStorage);
				return tooltip;
			},
			createRaw: () => initialiser(Tooltip.create()),
		};
	}

	export function show<TOOLTIP extends Tooltip> (tooltipClass: ITooltipClass<TOOLTIP>, initialiser: (tooltip: TOOLTIP) => any, hidePreviousIfSame = true) {
		const tooltip = tooltipClass.get();
		hideTooltips(hidePreviousIfSame ? undefined : tooltip);

		if (!tooltipsEnabled)
			return;

		tooltip.classes.remove(TooltipClasses.Forced1pxBigger);
		void Promise.resolve(initialiser(tooltip))
			.then(async () => {
				await Async.sleep(1);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if ((window as any).chrome) {
					if (tooltip.element.clientHeight % 2 !== Component.window.height % 2)
						tooltip.classes.add(TooltipClasses.Forced1pxBigger);
				}

				const scrollable = tooltip?.["scrollableComponent"]?.element;
				if (!scrollable)
					return;

				scrollable.classList.add(TooltipClasses.Scrollable);
				scrollable.classList.toggle(TooltipClasses.Scrollable_Enabled, scrollable.scrollHeight > scrollable.clientHeight);
				tooltip.classes.toggle(scrollable.scrollHeight > scrollable.clientHeight, TooltipClasses._ScrollableEnabled);

				await Async.sleep(1);
				const cache = DimensionalCache.get(scrollable);
				cache.reset();
			});

		tooltip.wrapper
			.classes.remove(Classes.Hidden)
			.appendTo(tooltipSurface);
	}

	function hideTooltips (current?: Component) {
		for (const child of tooltipSurface.element.children) {
			const childComponent = child.component?.deref();
			if (!childComponent) {
				console.warn("Not a valid tooltip", child);
				child.remove();
				continue;
			}

			if (childComponent !== current)
				hide((childComponent as TooltipWrapper).tooltip);
		}
	}

	export function hide (tooltip: Tooltip) {
		if (tooltip.wrapper.classes.has(Classes.Hidden))
			// already hiding
			return;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const hideLock = (tooltip as any).TOOLTIP_HIDE_LOCK = Math.random();
		const persistTooltips = document.documentElement.classList.contains("persist-tooltips");
		if (!persistTooltips)
			tooltip.wrapper.classes.add(Classes.Hidden);
		void Async.sleep(500).then(() => {
			if (!tooltip.wrapper.classes.has(Classes.Hidden))
				// tooltip has been shown again, don't touch
				return;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if ((tooltip as any).TOOLTIP_HIDE_LOCK !== hideLock)
				// a different call of this method is responsible for hiding the tooltip now
				return;

			if (!persistTooltips)
				tooltip.wrapper.appendTo(tooltipStorage);
		});
	}

	Component.event.subscribe("setTooltip", ({ component, tooltip: tooltipClass, handler }) => {
		const tooltip = tooltipClass.get();
		component.event.until("clearTooltip", event => event
			.subscribe("mouseover", () => {
				if (tooltip.owner?.deref() === component)
					return; // this tooltip is already shown

				tooltip.owner = new WeakRef(component);
				TooltipManager.show(tooltipClass, handler.initialise, handler.differs?.(tooltip));
			})
			.subscribe("mouseout", event => {
				if (component.element.contains(document.elementFromPoint(event.clientX, event.clientY)))
					return;

				hideTooltip();
			}));

		void component.event.waitFor("clearTooltip")
			.then(hideTooltip);

		function hideTooltip () {
			if (tooltip.owner?.deref() === component) {
				delete tooltip.owner;
				TooltipManager.hide(tooltip);
			}
		}
	});

	let reversed: boolean | undefined;
	document.body.addEventListener("mousemove", event => {
		const switchTooltipAt = (800 / 1920) * Component.window.width;
		const switchTooltipDirection = reversed && event.clientX < switchTooltipAt
			|| !reversed && event.clientX > Component.window.width - switchTooltipAt;

		if (switchTooltipDirection && [...tooltipSurface.element.children].some(tooltip => !tooltip.classList.contains(Classes.Hidden))) {
			tooltipSurface.classes.toggle(TooltipClasses.Reversed);
			reversed = !reversed;
		}

		tooltipSurface.element.scrollLeft = surfaceCache.scrollWidth - Component.window.width - event.clientX;
		tooltipSurface.element.scrollTop = surfaceCache.scrollHeight - Component.window.height - Component.window.height / 2 - event.clientY;
	});

	document.body.addEventListener("wheel", event => {
		const [child] = tooltipSurface.element.children;
		if (!child)
			return;

		const childComponent = child.component?.deref();
		if (!childComponent) {
			console.warn("Not a valid tooltip", child);
			child.remove();
			return;
		}

		const tooltip = (childComponent as TooltipWrapper).tooltip;
		const scrollable = tooltip?.["scrollableComponent"]?.element;
		if (!scrollable)
			return;

		const cache = DimensionalCache.get(scrollable);

		if (cache.scrollHeight < cache.height)
			return;

		if (event.deltaY > 0 && cache.height + scrollable.scrollTop >= cache.scrollHeight)
			return;

		if (event.deltaY < 0 && scrollable.scrollTop <= 0)
			return;

		event.preventDefault();

		if (tooltip["scrollTop"] === undefined || Math.sign(event.deltaY) !== Math.sign(tooltip["scrollTop"] - scrollable.scrollTop))
			tooltip["scrollTop"] = scrollable.scrollTop;

		tooltip["scrollTop"] += event.deltaY;
		if (tooltip["scrollTop"] + cache.height > cache.scrollHeight)
			tooltip["scrollTop"] = cache.scrollHeight - cache.height;
		if (tooltip["scrollTop"] < 0)
			tooltip["scrollTop"] = 0;

		scrollable.scrollTop = tooltip["scrollTop"];
	});

	window.addEventListener("resize", () => {
		tooltipsEnabled = Component.window.width > 800;
		hideTooltips();
	});
}

export default TooltipManager;
