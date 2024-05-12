import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import { DestinyClass } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Characters from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import Item from "model/models/items/Item";
import Component from "ui/Component";
import Details from "ui/Details";
import Loadable from "ui/Loadable";
import ICollectionsView from "ui/view/collections/ICollectionsView";

export enum CollectionsMomentClasses {
	Moment = "view-collections-moment",
	MomentContent = "view-collections-moment-content",
	Bucket = "view-collections-bucket",
	BucketTitle = "view-collections-bucket-title",
}

export default class CollectionsMoment extends Details<[moment: DeepsightMomentDefinition, inventory?: Inventory, defaultOpen?: boolean]> {
	protected override onMake (moment: DeepsightMomentDefinition, inventory?: Inventory, defaultOpen = false): void {
		super.onMake(moment, inventory);

		this.classes.add(CollectionsMomentClasses.Moment)
			.toggle(defaultOpen)
			.tweak(details => details.summary.text.set(moment.displayProperties.name));

		Loadable.create(Model.createTemporary(async () => {
			if (!defaultOpen)
				await this.event.waitFor("toggle");

			const manifest = await Manifest.await();
			const { DeepsightCollectionsDefinition, DestinyInventoryItemDefinition } = manifest;

			const collection = await DeepsightCollectionsDefinition.get(moment.hash);
			const items = [];
			const profile = await ProfileBatch.await();
			for (const itemHash of Object.values(collection?.buckets ?? {}).flat()) {
				const definition = await DestinyInventoryItemDefinition.get(itemHash);
				if (!definition)
					continue;

				items.push(await Item.createFake(manifest, profile, definition));
			}

			return items;
		}))
			.onReady(items => {
				console.log(moment.displayProperties.name, items);
				const weapons: Item[] = [];
				const classItems: Partial<Record<DestinyClass, Item[]>> = {};

				for (const item of items) {
					if (item.isWeapon()) {
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

				for (const cls of Characters.getSortedClasses()) {
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
