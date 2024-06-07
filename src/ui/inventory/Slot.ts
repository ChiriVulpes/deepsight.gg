import Component from "ui/Component";

export enum SlotClasses {
	Main = "slot",
	Empty = "slot-empty",
	EmptyBorders2 = "slot-empty-borders2",
	Simple = "slot-empty-simple",
	Wide = "slot--wide",
}

export default class Slot extends Component {

	public static setEmpty (component?: Component, empty = true) {
		return component?.classes.toggle(empty, SlotClasses.Empty);
	}

	public static setSimple (component?: Component, simple = true) {
		return component?.classes.toggle(simple, SlotClasses.Simple);
	}

	public static setWide (component?: Component, wide = true) {
		return component?.classes.toggle(wide, SlotClasses.Wide);
	}

	protected static override defaultType = "span";

	protected override onMake (): void {
		this.classes.add(SlotClasses.Main);
		Component.create("span")
			.classes.add(SlotClasses.EmptyBorders2)
			.appendTo(this);
	}

	/**
	 * @returns Whether this slot is set as empty. **Warning:** Does not actually check if there's content inside it.
	 */
	public isEmpty () {
		return this.classes.has(SlotClasses.Empty);
	}

	public setEmpty (empty = true) {
		this.classes.toggle(empty, SlotClasses.Empty);
		return this;
	}

	public setSimple (simple = true) {
		this.classes.toggle(simple, SlotClasses.Simple);
		return this;
	}

	public setWide (wide = true) {
		this.classes.toggle(wide, SlotClasses.Wide);
		return this;
	}
}
