import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import { Bucket } from "model/models/items/Bucket";
import Component from "ui/component/Component";
import Filter from "ui/destiny/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/destiny/filter/FilterManager";
import FilterManager from "ui/destiny/filter/FilterManager";
import Sort from "ui/destiny/sort/Sort";
import type { ISortManagerConfiguration } from "ui/destiny/sort/SortManager";
import SortManager from "ui/destiny/sort/SortManager";
import View from "ui/view/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";

export const SORTS_DEFAULT_INVENTORY = [Sort.Rarity, Sort.Name, Sort.Quantity] as const;
export const SORTS_INAPPLICABLE_INVENTORY = [
	Sort.Power,
	Sort.Energy,
	Sort.Pattern,
	Sort.Shaped,
	Sort.Masterwork,
	Sort.StatTotal,
	Sort.StatDistribution,
	Sort.StatLegacyDistribution,
	Sort.AmmoType,
	Sort.DamageType,
	Sort.WeaponType,
	Sort.Harmonizable,
	Sort.CanShape,
	Sort.BreakerType,
	Sort.Acquired,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_INVENTORY = [
	Filter.Ammo,
	Filter.WeaponType,
	Filter.Element,
	Filter.Enhancement,
	Filter.Unlevelled,
	Filter.Perk,
	Filter.Shaped,
	Filter.Adept,
	Filter.Artifice,
	Filter.Catalyst,
	Filter.Pattern,
	Filter.BreakerType,
	Filter.Acquired,
] as const;

export const VIEW_ID_INVENTORY = "inventory";
export const VIEW_NAME_INVENTORY = "Inventory";

export const SORT_MANAGER_INVENTORY_DEFINITION: ISortManagerConfiguration = {
	id: VIEW_ID_INVENTORY,
	name: VIEW_NAME_INVENTORY,
	default: SORTS_DEFAULT_INVENTORY,
	inapplicable: SORTS_INAPPLICABLE_INVENTORY,
};

export const FILTER_MANAGER_INVENTORY_DEFINITION: IFilterManagerConfiguration = {
	id: VIEW_ID_INVENTORY,
	name: VIEW_NAME_INVENTORY,
	inapplicable: FILTERS_INAPPLICABLE_INVENTORY,
};

export enum InventoryInventoryViewClasses {
	Content = "view-inventory-inventory-content",
	PostmasterBuckets = "view-inventory-inventory-postmaster-buckets",
	VaultBuckets = "view-inventory-inventory-vault-buckets",
	ConsumablesBucket = "view-inventory-inventory-consumables-bucket",
	ModificationsBucket = "view-inventory-inventory-modifications-bucket",
}

export default new View.Factory()
	.using(Inventory.createModel())
	.define<IInventoryViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryView, model))
	.wrapper<InventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventoryViewDefinition & View.IViewBase<[]>>>()
	.create({
		id: VIEW_ID_INVENTORY,
		name: VIEW_NAME_INVENTORY,
		layout: view => {
			view.super.content.classes.add(InventoryInventoryViewClasses.Content);

			view.addBuckets([
				Bucket.id(InventoryBucketHashes.Consumables),
				Bucket.id(InventoryBucketHashes.General, undefined, InventoryBucketHashes.Consumables),
			]);
			view.addBuckets([
				Bucket.id(InventoryBucketHashes.Modifications),
				Bucket.id(InventoryBucketHashes.General, undefined, InventoryBucketHashes.Modifications),
			]);


			const postmasters = Component.create()
				.classes.add(InventoryInventoryViewClasses.PostmasterBuckets)
				.appendTo(view.super.content);

			Characters.getSorted()
				.map(character => Bucket.id(InventoryBucketHashes.LostItems, character.characterId))
				.collect(bucketIds => view.addBucketsTo(postmasters, bucketIds));
		},
		sort: new SortManager(SORT_MANAGER_INVENTORY_DEFINITION),
		filter: new FilterManager(FILTER_MANAGER_INVENTORY_DEFINITION),
	});
