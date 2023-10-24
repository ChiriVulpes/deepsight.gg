import type Item from "model/models/items/Item";
import type { ISource } from "model/models/items/Source";
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
	ActivityChallenge = "item-tooltip-source-activity-challenge",
	ActivityChallengePhaseIndex = "item-tooltip-source-activity-challenge-phase-index",
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
			let activity = source.activityDefinition;

			if (source.isActiveMasterDrop) {
				if (!source.masterActivityDefinition)
					// missing master activity, can't display source
					continue;

				activity = source.masterActivityDefinition;
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

			const phasesWrapper = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseWrapper)
				.appendTo(activityComponent);

			if (!source.isActiveMasterDrop)
				this.renderPhases(phasesWrapper, item, source);

			if (source.activeChallenge && item.isFomo())
				this.renderChallenge(phasesWrapper, item, source);
		}

		return true;
	}

	private renderChallenge (wrapper: Component, item: Item, source: ISource) {
		const challenge = source.activeChallenge!;
		const challengeHashes = source.dropTable.rotations?.challenges;
		const challengeIndex = challengeHashes?.indexOf(challenge.hash) ?? -1;
		const phase = challengeHashes?.length === source.dropTable.encounters?.length ? source.dropTable.encounters?.[challengeIndex] : undefined;

		const challengeComponent = Component.create()
			.classes.add(ItemTooltipSourceClasses.ActivityChallenge)
			.style.set("--icon", Display.icon(challenge))
			.appendTo(wrapper);

		Component.create()
			.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
			.text.set(Display.name(challenge))
			.appendTo(challengeComponent);

		Component.create()
			.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
			.append(challengeIndex < 0 ? undefined : Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityChallengePhaseIndex)
				.text.set(`${challengeIndex + 1}`))
			.text.set(Display.name(phase))
			.appendTo(challengeComponent);
	}

	private renderPhases (wrapper: Component, item: Item, source: ISource) {
		if (!source.dropTable.encounters?.length)
			return;

		for (let i = 0; i < source.dropTable.encounters.length; i++) {
			const encounter = source.dropTable.encounters[i];
			const dropTable = encounter.dropTableMergeStrategy === "replace" ? encounter.dropTable
				: { ...source.dropTable.dropTable, ...encounter.dropTable };
			if (!dropTable?.[item.definition.hash])
				continue;

			const phaseComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhase)
				.appendTo(wrapper);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseIndex)
				.text.set(`${i + 1}`)
				.appendTo(phaseComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
				.text.set(Display.name(encounter))
				.appendTo(phaseComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
				.text.set(Display.description(encounter))
				.appendTo(phaseComponent);
		}
	}
}
