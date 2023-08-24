import Component from "ui/Component";

export enum SlotClasses {
	Main = "slot",
	Empty = "slot-empty",
	EmptyBorders2 = "slot-empty-borders2",
	Simple = "slot-empty-simple",
}

export default class Slot extends Component {
	protected override onMake (): void {
		this.classes.add(SlotClasses.Main);
		Component.create()
			.classes.add(SlotClasses.EmptyBorders2)
			.appendTo(this);
	}

	public setEmpty (empty = true) {
		this.classes.toggle(empty, SlotClasses.Empty);
		return this;
	}

	public setSimple (simple = true) {
		this.classes.toggle(simple, SlotClasses.Simple);
		return this;
	}
}
