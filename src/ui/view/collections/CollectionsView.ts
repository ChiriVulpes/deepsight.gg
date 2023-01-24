import { DestinyClass, ItemCategoryHashes, TierType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Collections from "model/models/Collections";
import Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Sources from "model/models/Sources";
import Display from "ui/bungie/DisplayProperties";
import { InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
import Details from "ui/Details";
import ItemComponent from "ui/inventory/ItemComponent";
import Loadable from "ui/Loadable";
import View from "ui/View";

export enum CollectionsViewClasses {
	Bucket = "view-collections-bucket",
	BucketTitle = "view-collections-bucket-title",
	Source = "view-collections-source",
	SourceContent = "view-collections-source-content",
}

export default View.create({
	models: [Manifest, Sources, Inventory.createTemporary()] as const,
	id: "collections",
	name: "Collections",
	initialise: (view, manifest, sources, inventory) => {
		view.setTitle(title => title.text.set("Collections"));

		let shownExpansion = false;
		let shownSeason = false;
		for (const source of sources) {

			let defaultOpen = false;
			if (!shownExpansion && source.expansion) {
				defaultOpen = true;
				shownExpansion = true;
			}

			if (!shownSeason && source.season) {
				defaultOpen = true;
				shownSeason = true;
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			if ((+source.eventCard?.endTime! ?? 0) * 1000 > Date.now())
				defaultOpen = true;

			const details = Details.create()
				.classes.add(CollectionsViewClasses.Source)
				.toggle(defaultOpen)
				.tweak(details => details.summary.text.set(source.displayProperties.name))
				.appendTo(view.content);

			Loadable.create(Model.createTemporary(async () => {
				if (!defaultOpen)
					await details.event.waitFor("toggle");

				return Collections.source(source).await();
			}))
				.onReady(items => {
					console.log(source.displayProperties.name, items);
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
						.classes.add(CollectionsViewClasses.SourceContent);

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

function addItems (component: Component, items: Item[], inventory: Inventory) {
	component.append(...items
		.sort((a, b) => getSortIndex(b, inventory) - getSortIndex(a, inventory)
			|| (Display.name(a.definition) ?? "").localeCompare(Display.name(b.definition) ?? ""))
		.map(item => Component.create()
			.classes.add(InventoryClasses.Slot)
			.append(ItemComponent.create([item, inventory]))));
}

function getSortIndex (item: Item, inventory: Inventory) {
	return (item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ? 100000 : 0)
		+ (item.definition.inventory?.tierType ?? TierType.Unknown) * 10000
		+ (item.deepsight?.pattern ? inventory.craftedItems.has(item.definition.hash) ? 0 : item.deepsight.pattern.progress.complete ? 6000 : 3000 : 1000)
		+ (item.definition.classType ?? DestinyClass.Unknown);
}
