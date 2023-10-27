import { DestinyClass, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Collections from "model/models/Collections";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Details from "ui/Details";
import Loadable from "ui/Loadable";
import ICollectionsView from "ui/view/collections/ICollectionsView";
import type { DeepsightMomentDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition";

export enum CollectionsMomentClasses {
	Moment = "view-collections-moment",
	MomentContent = "view-collections-moment-content",
	Bucket = "view-collections-bucket",
	BucketTitle = "view-collections-bucket-title",
}

export default class CollectionsMoment extends Details<[moment: DeepsightMomentDefinition, inventory: Inventory, defaultOpen?: boolean]> {
	protected override onMake (moment: DeepsightMomentDefinition, inventory: Inventory, defaultOpen = false): void {
		super.onMake(moment, inventory);

		this.classes.add(CollectionsMomentClasses.Moment)
			.toggle(defaultOpen)
			.tweak(details => details.summary.text.set(moment.displayProperties.name));

		Loadable.create(Model.createTemporary(async () => {
			if (!defaultOpen)
				await this.event.waitFor("toggle");

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
					.classes.add(CollectionsMomentClasses.MomentContent);

				if (weapons.length)
					Component.create()
						.classes.add(CollectionsMomentClasses.Bucket)
						.append(Component.create()
							.classes.add(CollectionsMomentClasses.BucketTitle)
							.text.set("Weapons"))
						.tweak(ICollectionsView.addItems, weapons, inventory)
						.appendTo(wrapper);

				const classes = [DestinyClass.Titan, DestinyClass.Hunter, DestinyClass.Warlock]
					.sort((a, b) => (inventory.sortedCharacters?.findIndex(character => character.classType === a) ?? 0)
						- (inventory.sortedCharacters?.findIndex(character => character.classType === b) ?? 0));

				for (const cls of classes) {
					const items = classItems[cls];
					if (!items?.length)
						continue;

					Component.create()
						.classes.add(CollectionsMomentClasses.Bucket)
						.append(Component.create()
							.classes.add(CollectionsMomentClasses.BucketTitle)
							.text.set(cls === DestinyClass.Titan ? "Titan" : cls === DestinyClass.Hunter ? "Hunter" : "Warlock")
							.text.add(" Armor"))
						.tweak(ICollectionsView.addItems, items, inventory)
						.appendTo(wrapper);
				}

				return wrapper;
			})
			.setSimple()
			.appendTo(this);
	}
}
