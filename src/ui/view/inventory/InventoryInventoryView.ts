import { BucketHashes } from "bungie-api-ts/destiny2";
import type Model from "model/Model";
import Inventory from "model/models/Inventory";
import View from "ui/View";
import ConsumablesBucket from "ui/inventory/bucket/ConsumablesBucket";
import InventoryBucket from "ui/inventory/bucket/InventoryBucket";
import ModificationsBucket from "ui/inventory/bucket/ModificationsBucket";
import Filter from "ui/inventory/filter/Filter";
import type { IFilterManagerConfiguration } from "ui/inventory/filter/FilterManager";
import FilterManager from "ui/inventory/filter/FilterManager";
import Sort from "ui/inventory/sort/Sort";
import type { ISortManagerConfiguration } from "ui/inventory/sort/SortManager";
import SortManager from "ui/inventory/sort/SortManager";
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
	Sort.AmmoType,
	Sort.DamageType,
	Sort.WeaponType,
	"stat-.*",
] as const;
export const FILTERS_INAPPLICABLE_INVENTORY = [
	Filter.Ammo,
	Filter.WeaponType,
	Filter.Element,
	Filter.Perk,
	Filter.Shaped,
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

class InventoryConsumablesViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<any[]> & IInventoryViewDefinition> { }

export class InventoryInventoryView extends InventoryView {

	public override super!: InventoryConsumablesViewWrapper;

	protected override async onMake (inventory: Inventory): Promise<void> {
		this.super.content.classes.add(InventoryInventoryViewClasses.Content);
		this.modificationsBucket = ModificationsBucket.create()
			.classes.add(InventoryInventoryViewClasses.ModificationsBucket)
			.prependTo(this.super.content);
		this.consumablesBucket = ConsumablesBucket.create()
			.classes.add(InventoryInventoryViewClasses.ConsumablesBucket)
			.prependTo(this.super.content);

		await super.onMake(inventory);

		this.postmasterBucketsContainer.classes.add(InventoryInventoryViewClasses.PostmasterBuckets);
		this.vaultBucketsContainer.classes.add(InventoryInventoryViewClasses.VaultBuckets);

		// this.onMouseMove = this.onMouseMove.bind(this);
		// document.body.addEventListener("mousemove", this.onMouseMove);
	}

	protected override preUpdateInit (): void {
		this.characterBucketsContainer.remove();
	}

	protected override updateCharacters () {
		super.updateCharacters();

		const buckets = 0;

		this.super.content.style.set("--buckets", `${buckets}`);
	}

	protected override sort (): void {
		super.sort();
		this.consumablesBucket?.as(InventoryBucket)?.update();
		this.modificationsBucket?.as(InventoryBucket)?.update();
	}

}

export default new View.Factory()
	.using(Inventory.createTemporary())
	.define<IInventoryViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryInventoryView, model))
	.wrapper<InventoryInventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventoryViewDefinition & View.IViewBase<[]>>>()
	.create({
		id: VIEW_ID_INVENTORY,
		name: VIEW_NAME_INVENTORY,
		slot: [BucketHashes.Consumables, BucketHashes.Modifications],
		sort: new SortManager(SORT_MANAGER_INVENTORY_DEFINITION),
		filter: new FilterManager(FILTER_MANAGER_INVENTORY_DEFINITION),
	});
