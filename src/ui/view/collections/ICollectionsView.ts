import { InventoryBucketHashes, ItemCategoryHashes } from "@deepsight.gg/enums";
import { DestinyClass, TierType } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";
import ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";

namespace ICollectionsView {
	const bucketOrder = [
		InventoryBucketHashes.KineticWeapons,
		InventoryBucketHashes.EnergyWeapons,
		InventoryBucketHashes.PowerWeapons,
		InventoryBucketHashes.Helmet,
		InventoryBucketHashes.Gauntlets,
		InventoryBucketHashes.ChestArmor,
		InventoryBucketHashes.LegArmor,
		InventoryBucketHashes.ClassArmor,
	];

	export function addItems (component: Component, items: Item[], inventory?: Inventory) {
		component.append(...items
			.sort(
				item => item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ? 1 : 0,
				item => item.definition.inventory?.tierType ?? TierType.Unknown,
				item => item.deepsight?.pattern ? inventory?.craftedItems.has(item.definition.hash) ? 0 : item.deepsight.pattern.progress?.complete ? 3 : 2 : 1,
				item => item.definition.classType ?? DestinyClass.Unknown,
				(a, b) => (a.collectible?.sourceHash ?? -1) - (b.collectible?.sourceHash ?? -1),
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				item => 999 - (bucketOrder.indexOf(item.definition.inventory?.bucketTypeHash!) + 1),
				(a, b) => (a.collectible?.index ?? 0) - (b.collectible?.index ?? 0),
				(a, b) => (Display.name(a.definition) ?? "").localeCompare(Display.name(b.definition) ?? ""))
			.map(item => Slot.create()
				.append(ItemComponent.create([item, inventory]))));
	}

}

export default ICollectionsView;