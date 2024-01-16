import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import { Bucket } from "model/models/items/Bucket";
import Component from "ui/Component";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";

export enum InventorySlotViewClasses {
	Column = "view-inventory-slot-column",
	CharacterBuckets = "view-inventory-slot-character-buckets",
	CharacterBucket = "view-inventory-slot-character-bucket",
	VaultBucket = "view-inventory-slot-vault-bucket",
	VaultBuckets = "view-inventory-slot-vault-buckets",
	VaultBucketMerged = "view-inventory-slot-vault-bucket-merged",
	PostmasterBucket = "view-inventory-slot-postmaster-bucket",
	PostmasterBuckets = "view-inventory-slot-postmaster-buckets",
}

export interface IInventorySlotViewDefinition extends IInventoryViewDefinition {
	slot: InventoryBucketHashes;
	mergedVaults?: true;
}

export default new View.Factory()
	.using(Inventory.createModel())
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryView, model))
	.wrapper<InventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventorySlotViewDefinition & View.IViewBase<[]>>>()
	.configure(definition => ({
		layout: view => {
			const charactersColumn = Component.create()
				.classes.add(InventorySlotViewClasses.CharacterBuckets, InventorySlotViewClasses.Column)
				.appendTo(view.super.content);

			Characters.getSorted()
				.map(character => Bucket.id(definition.slot, character.characterId))
				.collect(bucketIds => view.addBucketsTo(charactersColumn, bucketIds, bucket => bucket
					.classes.add(InventorySlotViewClasses.CharacterBucket)));

			const vaultsColumn = Component.create()
				.classes.add(InventorySlotViewClasses.VaultBuckets, InventorySlotViewClasses.Column)
				.appendTo(view.super.content);

			if (definition.mergedVaults)
				view.addBucketsTo(vaultsColumn, Bucket.id(InventoryBucketHashes.General, undefined, definition.slot), bucket => bucket
					.classes.add(InventorySlotViewClasses.VaultBucket, InventorySlotViewClasses.VaultBucketMerged));
			else
				Characters.getSorted()
					.map(character => Bucket.id(InventoryBucketHashes.General, character.characterId, definition.slot))
					.collect(bucketIds => view.addBucketsTo(vaultsColumn, bucketIds, bucket => bucket
						.classes.add(InventorySlotViewClasses.VaultBucket)));

			Component.create()
				.classes.add(InventorySlotViewClasses.PostmasterBuckets, InventorySlotViewClasses.Column)
				.appendTo(view.super.content)
				.tweak(column => Characters.getSorted()
					.map(character => Bucket.id(InventoryBucketHashes.LostItems, character.characterId))
					.collect(bucketIds => view.addBucketsTo(column, bucketIds, bucket => bucket
						.classes.add(InventorySlotViewClasses.PostmasterBucket))));
		},
	}));
