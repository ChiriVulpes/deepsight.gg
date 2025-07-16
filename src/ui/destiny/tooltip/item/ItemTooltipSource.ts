import { ActivityModeHashes, InventoryItemHashes, ItemCategoryHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDropDefinition } from "@deepsight.gg/interfaces";
import { DestinyClass, TierType, type DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { ISource } from "model/models/items/Source";
import Component from "ui/component/Component";
import Display from "ui/utility/DisplayProperties";
import Bound from "utility/decorator/Bound";

const _ = undefined

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
	ActivityPhaseChance = "item-tooltip-source-activity-phase-chance",
	ActivityPhaseChance_Wishlisted = "item-tooltip-source-activity-phase-chance--wishlisted",
	ActivityPhaseDescription = "item-tooltip-source-activity-phase-description",
	ActivityChallenge = "item-tooltip-source-activity-challenge",
	ActivityChallengePhaseIndex = "item-tooltip-source-activity-challenge-phase-index",
	ActivityRequiredItem = "item-tooltip-source-activity-required-item",
	ActivityRequiredItemLabel = "item-tooltip-source-activity-required-item-label",
	ActivityRequiredItemDescription = "item-tooltip-source-activity-required-item-description",
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

		if (!item.bucket.isCollections())
			return false;

		if (!item.sources?.length) {
			if (!item.hasWishlist())
				return false;

			Component.create()
				// .classes.add(ItemTooltipSourceClasses.Activity)
				.tweak(this.renderDropChance, item)
				.appendTo(this.activityWrapper);
			return true;
		}

		const hashes = new Set<number>();
		for (const source of item.sources) {
			if (hashes.has(source.activityDefinition.hash))
				continue;

			hashes.add(source.activityDefinition.hash);

			let activity = source.activityDefinition;

			if (source.isActiveMasterDrop) {
				if (!source.masterActivityDefinition)
					// missing master activity, can't display source
					continue;

				activity = source.masterActivityDefinition;
			}

			const activityComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.Activity)
				.style.set("--icon", _
					?? Display.icon(source.dropTable.displayProperties)
					?? Display.icon(activity))
				.appendTo(this.activityWrapper);

			const lostSectorDisplay = !source.activityDefinition.activityModeHashes?.includes(ActivityModeHashes.LostSector) ? undefined
				: source.isActiveDrop ? undefined
					: { name: "Lost Sector", description: "This item is not currently available." };

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityName)
				.text.set(_
					?? Display.name(lostSectorDisplay)
					?? Display.name(source.dropTable.displayProperties)
					?? Display.name(activity))
				.appendTo(activityComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityDescription)
				.tweak(Display.applyDescription,
					(Display.description(lostSectorDisplay)
						?? Display.description(source.dropTable.displayProperties)
						?? Display.description(activity)),
					{
						character: item.owner?.characterId,
						singleLine: true,
					})
				.appendTo(activityComponent);

			const phasesWrapper = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseWrapper)
				.appendTo(activityComponent);

			if (source.requiresQuest !== undefined)
				this.renderRequiredItems(phasesWrapper, item, source, [source.requiresQuest], "quest");

			if (source.requiresItems?.length)
				this.renderRequiredItems(phasesWrapper, item, source, source.requiresItems);

			if (!source.isActiveMasterDrop && source.dropTable.encounters?.length)
				this.renderPhases(phasesWrapper, item, source);

			else if (source.activeChallenges.length && item.isFomo())
				this.renderChallenge(phasesWrapper, item, source);

			else if (source.purchaseOnly)
				Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityChallenge)
					.style.set("--icon", Display.icon("./image/png/activity/cache.png"))
					.append(Component.create()
						.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
						.text.set("Purchase Only"))
					.append(Component.create()
						.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
						.text.set("This item is available in the end-of-activity cache."))
					.appendTo(phasesWrapper);

			else
				Component.create()
					.style.set("display", "contents")
					.tweak(this.renderDropChance, item)
					.appendTo(activityComponent);
		}

		return true;
	}

	private renderRequiredItems (wrapper: Component, forItem: Item, source: ISource, items: (DestinyInventoryItemDefinition | null)[], type: "item" | "quest" = "item") {
		for (const item of items) {
			const challengeComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityChallenge)
				.style.set("--icon", item ? Display.icon(item) : undefined)
				.appendTo(wrapper);

			const typeText = type === "item" ? "Item" : "Quest";

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
				.text.set(item ? Display.name(item) : "Unknown Item")
				.append(Component.create("span")
					.classes.add(ItemTooltipSourceClasses.ActivityRequiredItemLabel)
					.text.set(` \xa0//\xa0 Required ${typeText}`))
				.appendTo(challengeComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityRequiredItemDescription)
				.text.set(item ? Display.description(item) : `This ${type} is required to obtain ${Display.name(forItem.definition)}`)
				.appendTo(challengeComponent);
		}
	}

	private renderChallenge (wrapper: Component, item: Item, source: ISource) {
		for (const challenge of source.activeChallenges) {
			const challengeHashes = source.dropTable.rotations?.challenges;
			const challengeIndex = challengeHashes?.indexOf(challenge.hash) ?? -1;
			const encounters = source.dropTable.encounters?.filter(encounter => !encounter.traversal);
			const phase = challengeHashes?.length === encounters?.length ? encounters?.[challengeIndex] : undefined;

			const challengeComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityChallenge)
				.style.set("--icon", Display.icon(challenge))
				.appendTo(wrapper);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
				.append(Component.create("span")
					.text.set(Display.name(challenge))
				)
				.tweak(this.renderDropChance, item, source.dropTable.master?.dropTable ?? {})
				.appendTo(challengeComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
				.append(challengeIndex < 0 ? undefined : Component.create()
					.classes.add(ItemTooltipSourceClasses.ActivityChallengePhaseIndex)
					.text.set(`${challengeIndex + 1}`))
				.text.set(Display.name(phase))
				.appendTo(challengeComponent);
		}
	}

	private renderPhases (wrapper: Component, item: Item, source: ISource) {
		if (!source.dropTable.encounters?.length)
			return;

		let realEncounterIndex = 0;
		for (let i = 0; i < source.dropTable.encounters.length; i++) {
			const encounter = source.dropTable.encounters[i];
			if (encounter.traversal)
				continue;

			realEncounterIndex++;
			const dropTable = encounter.dropTableMergeStrategy === "replace" ? encounter.dropTable
				: { ...source.dropTable.dropTable, ...encounter.dropTable };
			if (!dropTable?.[item.definition.hash as InventoryItemHashes])
				continue;

			const phaseComponent = Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhase)
				.appendTo(wrapper);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseIndex)
				.text.set(`${realEncounterIndex}`)
				.appendTo(phaseComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
				.append(Component.create("span")
					.text.set(Display.name(encounter))
				)
				.tweak(this.renderDropChance, item, dropTable)
				.appendTo(phaseComponent);

			Component.create()
				.classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
				.text.set(Display.description(encounter) || `Clear ${Display.name(encounter)}`)
				.appendTo(phaseComponent);
		}
	}

	@Bound
	private renderDropChance (wrapper: Component, item: Item, dropTable?: Partial<Record<InventoryItemHashes, DeepsightDropTableDropDefinition>>) {
		if (!dropTable && !item.hasWishlist())
			return;

		const drop = !dropTable ? {} : dropTable?.[item.definition.hash as InventoryItemHashes];
		if (!drop)
			return;

		if (item.isExotic())
			return;

		if (drop.requiresQuest || drop.requiresItems)
			return;

		Component.create("span")
			.classes.add(ItemTooltipSourceClasses.ActivityPhaseChance)
			.tweak(async span => {
				const { DestinyInventoryItemDefinition } = await Manifest.await();
				const items = !dropTable ? [item.definition] : await Promise.all(Object.keys(dropTable)
					.map(hash => DestinyInventoryItemDefinition.get(hash))
				);

				const totalDrops = items
					.filter(item => true
						// && !/\([\w -]+\)\s*$/.test(item?.displayProperties.name ?? "")
						&& item?.classType !== DestinyClass.Hunter
						&& item?.classType !== DestinyClass.Titan
						&& !item?.sockets?.socketEntries.some(socket => socket.singleInitialItemHash === InventoryItemHashes.ArtificeArmorIntrinsicPlug)
						&& item?.inventory?.tierType !== TierType.Exotic
						&& !item?.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies)
						&& !item?.itemCategoryHashes?.includes(ItemCategoryHashes.Materials)
					)
					.length;

				const wishlistChance = item.getWishlistChance();
				span.classes.toggle(wishlistChance !== 1, ItemTooltipSourceClasses.ActivityPhaseChance_Wishlisted);
				span.text.set(`${((1 / totalDrops) * wishlistChance * 100).toFixed(1)}% \xa0- \xa01 in ${Math.round(totalDrops / wishlistChance)}`);
			})
			.appendTo(wrapper);
	}
}
