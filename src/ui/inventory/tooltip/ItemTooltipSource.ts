import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";

export enum ItemTooltipSourceClasses {
	Main = "item-tooltip-source",
	Heading = "item-tooltip-source-heading",
	ActivityWrapper = "item-tooltip-source-activity-wrapper",
	Activity = "item-tooltip-source-activity",
	ActivityName = "item-tooltip-source-activity-name",
	ActivityDescription = "item-tooltip-source-activity-description",
	ActivityPhaseWrapper = "item-tooltip-source-activity-phase-wrapper",
	ActivityPhase = "item-tooltip-source-activity-phase",
	ActivityPhaseIndex = "item-tooltip-source-activity-phase-index",
	ActivityPhaseName = "item-tooltip-source-activity-phase-name",
	ActivityPhaseDescription = "item-tooltip-source-activity-phase-description",
	Note = "item-tooltip-note",
	NoteHeading = "item-tooltip-note-heading",
}

export default class ItemTooltipSource extends Component {

	public heading!: Component;
	public activityWrapper!: Component;

	protected override onMake (): void {
		this.classes.add(ItemTooltipSourceClasses.Main);

		this.heading = Component.create()
			.classes.add(ItemTooltipSourceClasses.Heading, ItemTooltipSourceClasses.Note, ItemTooltipSourceClasses.NoteHeading)
			.text.set("This item can drop from the following activities:")
			.appendTo(this);

		this.activityWrapper = Component.create()
			.classes.add(ItemTooltipSourceClasses.ActivityWrapper)
			.appendTo(this);
	}

	public setItem (item: Item) {
		this.activityWrapper.removeContents();

		if (item.bucket !== "collections")
			return false;

		if (!item.sources?.length)
			return false;

		for (const source of item.sources) {
			let activity = source.activity;

			const isNormalDrop = source.dropTable.phases.some(phase => phase.dropTable[item.definition.hash]);
			if (!isNormalDrop) {
				if (!source.masterActivity)
					continue;

				activity = source.masterActivity;
			}

			const activityComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.Activity)
				.style.set("--icon", Display.icon(source.record) ?? Display.icon(activity))
				.appendTo(this.activityWrapper);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityName)
				.text.set(Display.name(activity))
				.appendTo(activityComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityDescription)
				.text.set(Display.description(activity))
				.appendTo(activityComponent);

			if (!isNormalDrop)
				continue;

			const phasesWrapper = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseWrapper)
				.appendTo(activityComponent);

			for (let i = 0; i < source.dropTable.phases.length; i++) {
				const phase = source.dropTable.phases[i];
				if (!phase.dropTable[item.definition.hash])
					continue;

				const phaseComponent = Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityPhase)
					.appendTo(phasesWrapper);

				Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityPhaseIndex)
					.text.set(`${i + 1}`)
					.appendTo(phaseComponent);

				Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
					.text.set(Display.name(phase))
					.appendTo(phaseComponent);

				Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
					.text.set(Display.description(phase))
					.appendTo(phaseComponent);
			}
		}

		return true;
	}
}
