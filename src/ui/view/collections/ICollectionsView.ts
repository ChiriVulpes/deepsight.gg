import { InventoryBucketHashes } from "@deepsight.gg/enums";
import { DestinyClass, TierType } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type Component from "ui/component/Component";
import ItemComponent from "ui/destiny/component/ItemComponent";
import Slot from "ui/destiny/component/Slot";
import Filter from "ui/destiny/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/destiny/filter/FilterManager";
import FilterManager from "ui/destiny/filter/FilterManager";
import Sort from "ui/destiny/sort/Sort";
import type { ISortManagerConfiguration } from "ui/destiny/sort/SortManager";
import SortManager from "ui/destiny/sort/SortManager";
import Display from "ui/utility/DisplayProperties";
import ExoticArmourRewardComponent from "ui/view/collections/ExoticArmourRewardComponent";


export const SORTS_DEFAULT_COLLECTIONS = [
	Sort.Exotic,
	Sort.Rarity,
	{ reverse: Sort.Shaped },
	{ reverse: Sort.CanShape },
	Sort.Pattern,
] as const;
export const SORTS_INAPPLICABLE_COLLECTIONS = [
	Sort.Quantity,
	Sort.Harmonizable,
	Sort.Locked,
	Sort.Power,
	Sort.StatTotal,
	Sort.StatDistribution,
	Sort.StatLegacyDistribution,
	Sort.Masterwork,
	Sort.Energy,
] as const;
export const FILTERS_INAPPLICABLE_COLLECTIONS = [
	Filter.Locked,
	Filter.Masterwork,
	Filter.Unlevelled,
] as const;

export const VIEW_ID_COLLECTIONS = "collections";
export const VIEW_NAME_COLLECTIONS = "Collections";

export const SORT_MANAGER_COLLECTIONS_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_COLLECTIONS,
	name: VIEW_NAME_COLLECTIONS,
	default: SORTS_DEFAULT_COLLECTIONS,
	inapplicable: SORTS_INAPPLICABLE_COLLECTIONS,
};

export const FILTER_MANAGER_COLLECTIONS_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_COLLECTIONS,
	name: VIEW_NAME_COLLECTIONS,
	inapplicable: FILTERS_INAPPLICABLE_COLLECTIONS,
};

export const SORT_MANAGER_COLLECTIONS = new SortManager(SORT_MANAGER_COLLECTIONS_DEFINITION);
export const FILTER_MANAGER_COLLECTIONS = new FilterManager(FILTER_MANAGER_COLLECTIONS_DEFINITION);

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

	export function sortItems (items: Item[], inventory?: Inventory, sorter?: SortManager) {
		return items.sort(
			!sorter ? undefined : (a, b) => sorter.sort(a, b, false),
			item => item.definition.inventory?.tierType ?? TierType.Unknown,
			item => item.isWeapon() ? 1 : 0,
			item => item.deepsight?.pattern ? inventory?.isCrafted(item.definition.hash) ? 0 : item.deepsight.pattern.progress?.complete ? 1 : 3 : 2,
			item => item.isAdept() ? 1 : 0,
			item => item.definition.classType ?? DestinyClass.Unknown,
			(a, b) => (a.collectible?.sourceHash ?? -1) - (b.collectible?.sourceHash ?? -1),
			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			item => 999 - (bucketOrder.indexOf(item.definition.inventory?.bucketTypeHash!) + 1),
			(a, b) => (a.collectible?.index ?? 0) - (b.collectible?.index ?? 0),
			(a, b) => (Display.name(a.definition) ?? "").localeCompare(Display.name(b.definition) ?? ""));
	}

	export function addItems (component: Component, items: Item[], inventory?: Inventory, sorter?: SortManager, result?: (ExoticArmourRewardComponent | ItemComponent)[]) {
		component.append(...sortItems(items, inventory, sorter)
			.map(item => {
				const component = ExoticArmourRewardComponent.is(item) ? ExoticArmourRewardComponent.create([item, inventory])
					: ItemComponent.create([item, inventory])
						.setSortedBy(sorter);
				result?.push(component);
				return Slot.create().append(component);
			}));
	}

}

export default ICollectionsView;