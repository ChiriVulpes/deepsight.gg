import { BucketHashes, DestinyClass, ItemCategoryHashes, TierType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Collections from "model/models/Collections";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import Moments from "model/models/Moments";
import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Details from "ui/Details";
import Loadable from "ui/Loadable";
import View from "ui/View";
import Display from "ui/bungie/DisplayProperties";
import ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";

export enum CollectionsViewClasses {
	Bucket = "view-collections-bucket",
	BucketTitle = "view-collections-bucket-title",
	Moment = "view-collections-moment",
	MomentContent = "view-collections-moment-content",
}

export default View.create({
	models: [Manifest, Moments, Inventory.createTemporary()] as const,
	id: "collections",
	name: "Collections",
	initialise: (view, manifest, moments, inventory) => {
		view.setTitle(title => title.text.set("Collections"));

		let shownExpansion = false;
		let shownSeason = false;
		for (const moment of moments) {

			let defaultOpen = false;
			if (!shownExpansion && moment.expansion) {
				defaultOpen = true;
				shownExpansion = true;
			}

			if (!shownSeason && moment.season) {
				defaultOpen = true;
				shownSeason = true;
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			if ((+moment.eventCard?.endTime! ?? 0) * 1000 > Date.now())
				defaultOpen = true;

			const details = Details.create()
				.classes.add(CollectionsViewClasses.Moment)
				.toggle(defaultOpen)
				.tweak(details => details.summary.text.set(moment.displayProperties.name))
				.appendTo(view.content);

			Loadable.create(Model.createTemporary(async () => {
				if (!defaultOpen)
					await details.event.waitFor("toggle");

				return Collections.moment(moment).await();
			}))
				.onReady(items => {
					console.log(moment.displayProperties.name, items);
					const weapons: Item[] = [];
					const classItems: Partial<Record<DestinyClass, Item[]>> = {};

					for (const item of items) {
						if (item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon)) {
							weapons.push(item);
							continue;
						}

						(classItems[item.definition.classType] ??= [])
							.push(item);
					}

					const wrapper = Component.create()
						.classes.add(CollectionsViewClasses.MomentContent);

					if (weapons.length)
						Component.create()
							.classes.add(CollectionsViewClasses.Bucket)
							.append(Component.create()
								.classes.add(CollectionsViewClasses.BucketTitle)
								.text.set("Weapons"))
							.tweak(addItems, weapons, inventory)
							.appendTo(wrapper);

					const classes = [DestinyClass.Titan, DestinyClass.Hunter, DestinyClass.Warlock]
						.sort((a, b) => (inventory.sortedCharacters?.findIndex(character => character.classType === a) ?? 0)
							- (inventory.sortedCharacters?.findIndex(character => character.classType === b) ?? 0));

					for (const cls of classes) {
						const items = classItems[cls];
						if (!items?.length)
							continue;

						Component.create()
							.classes.add(CollectionsViewClasses.Bucket)
							.append(Component.create()
								.classes.add(CollectionsViewClasses.BucketTitle)
								.text.set(cls === DestinyClass.Titan ? "Titan" : cls === DestinyClass.Hunter ? "Hunter" : "Warlock")
								.text.add(" Armor"))
							.tweak(addItems, items, inventory)
							.appendTo(wrapper);
					}

					return wrapper;
				})
				.setSimple()
				.appendTo(details);
		}
	},
});

const bucketOrder = [
	BucketHashes.KineticWeapons,
	BucketHashes.EnergyWeapons,
	BucketHashes.PowerWeapons,
	BucketHashes.Helmet,
	BucketHashes.Gauntlets,
	BucketHashes.ChestArmor,
	BucketHashes.LegArmor,
	BucketHashes.ClassArmor,
];

function addItems (component: Component, items: Item[], inventory: Inventory) {
	component.append(...items
		.sort(
			item => item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ? 1 : 0,
			item => item.definition.inventory?.tierType ?? TierType.Unknown,
			item => item.deepsight?.pattern ? inventory.craftedItems.has(item.definition.hash) ? 0 : item.deepsight.pattern.progress.complete ? 3 : 2 : 1,
			item => item.definition.classType ?? DestinyClass.Unknown,
			(a, b) => (a.collectible?.sourceHash ?? -1) - (b.collectible?.sourceHash ?? -1),
			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			item => 999 - (bucketOrder.indexOf(item.definition.inventory?.bucketTypeHash!) + 1),
			(a, b) => (a.collectible?.index ?? 0) - (b.collectible?.index ?? 0),
			(a, b) => (Display.name(a.definition) ?? "").localeCompare(Display.name(b.definition) ?? ""))
		.map(item => Slot.create()
			.append(ItemComponent.create([item, inventory]))));
}
