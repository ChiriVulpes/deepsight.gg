import { Classes } from "ui/Classes";
import type { AnyComponent } from "ui/Component";
import Component from "ui/Component";
import Async from "utility/Async";

export enum TooltipClasses {
	Storage = "tooltip-storage",
	Surface = "tooltip-surface",
	Reversed = "tooltip-reversed",

	Main = "tooltip",
	Header = "tooltip-header",
	Title = "tooltip-title",
	Subtitle = "tooltip-subtitle",
	Extra = "tooltip-extra",
	Content = "tooltip-content",
	Footer = "tooltip-footer",
}

export class Tooltip extends Component {
	public owner?: WeakRef<AnyComponent>;
	public header!: Component;
	public title!: Component<HTMLHeadingElement>;
	public subtitle!: Component;
	public extra!: Component;
	public content!: Component;
	public footer!: Component;

	protected override onMake (): void {
		this.classes.add(TooltipClasses.Main);

		this.header = Component.create("header")
			.classes.add(TooltipClasses.Header)
			.appendTo(this);

		this.title = Component.create("h2")
			.classes.add(TooltipClasses.Title)
			.appendTo(this.header);

		this.subtitle = Component.create()
			.classes.add(TooltipClasses.Subtitle)
			.appendTo(this.header);

		this.extra = Component.create()
			.classes.add(TooltipClasses.Extra)
			.appendTo(this.header);

		this.content = Component.create()
			.classes.add(TooltipClasses.Content)
			.appendTo(this);

		this.footer = Component.create("footer")
			.classes.add(TooltipClasses.Footer)
			.appendTo(this);
	}
}

namespace TooltipManager {

	const tooltipStorage = Component.create()
		.classes.add(TooltipClasses.Storage)
		.appendTo(document.body);

	const tooltipSurface = Component.create()
		.classes.add(TooltipClasses.Surface)
		.appendTo(document.body);

	export function create<TOOLTIP extends Tooltip> (initialiser: (tooltip: Tooltip) => TOOLTIP) {
		return initialiser(Tooltip.create()
			.appendTo(tooltipStorage));
	}

	export function show<TOOLTIP extends Tooltip> (tooltip: TOOLTIP, initialiser: (tooltip: TOOLTIP) => any) {
		for (const child of tooltipSurface.element.children) {
			const childComponent = child.component?.deref();
			if (!childComponent) {
				console.warn("Not a valid tooltip", child);
				child.remove();
				continue;
			}

			hide(childComponent as Tooltip);
		}

		initialiser(tooltip);
		tooltip.classes.remove(Classes.Hidden)
			.appendTo(tooltipSurface);
	}

	export function hide (tooltip: Tooltip) {
		if (tooltip.classes.has(Classes.Hidden))
			// already hiding
			return;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const hideLock = (tooltip as any).TOOLTIP_HIDE_LOCK = Math.random();
		const persistTooltips = document.documentElement.classList.contains("persist-tooltips");
		if (!persistTooltips)
			tooltip.classes.add(Classes.Hidden);
		void Async.sleep(500).then(() => {
			if (!tooltip.classes.has(Classes.Hidden))
				// tooltip has been shown again, don't touch
				return;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if ((tooltip as any).TOOLTIP_HIDE_LOCK !== hideLock)
				// a different call of this method is responsible for hiding the tooltip now
				return;

			if (!persistTooltips)
				tooltip.appendTo(tooltipStorage);
		});
	}

	Component.event.subscribe("setTooltip", ({ component, tooltip, initialiser }) => {
		component.event.subscribe("mouseover", () => {
			if (tooltip.owner?.deref() === component)
				return; // this tooltip is already shown

			tooltip.owner = new WeakRef(component);
			TooltipManager.show(tooltip, initialiser);
		});
		component.event.subscribe("mouseout", event => {
			if (component.element.contains(document.elementFromPoint(event.clientX, event.clientY)))
				return;

			if (tooltip.owner?.deref() === component) {
				delete tooltip.owner;
				TooltipManager.hide(tooltip);
			}
		});
	});

	document.body.addEventListener("mousemove", event => {
		tooltipSurface.classes.toggle(window.innerWidth - event.clientX < 500, TooltipClasses.Reversed);
		tooltipSurface.element.scrollLeft = tooltipSurface.element.scrollWidth - window.innerWidth - event.clientX;
		tooltipSurface.element.scrollTop = tooltipSurface.element.scrollHeight - window.innerHeight - window.innerHeight / 2 - event.clientY;
	});
}

export default TooltipManager;
