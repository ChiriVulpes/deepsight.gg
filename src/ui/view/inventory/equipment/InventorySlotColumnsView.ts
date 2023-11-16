import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type CharacterBucket from "ui/inventory/bucket/CharacterBucket";
import { CharacterBucketClasses } from "ui/inventory/bucket/CharacterBucket";
import type PostmasterBucket from "ui/inventory/bucket/PostmasterBucket";
import { PostmasterBucketClasses } from "ui/inventory/bucket/PostmasterBucket";
import type VaultBucket from "ui/inventory/bucket/VaultBucket";
import { VaultBucketClasses } from "ui/inventory/bucket/VaultBucket";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";
import Arrays from "utility/Arrays";
import type { IVector2 } from "utility/maths/Vector2";

export enum InventorySlotColumnsViewClasses {
	Content = "view-slot-columns-content",
	SectionTitle = "view-slot-columns-section-title",
	SectionContent = "view-slot-columns-section-content",
	SectionWeapons = "view-slot-columns-section-weapons",
	SectionArmour = "view-slot-columns-section-armour",
	SlotColumn = "view-slot-columns-slot-column",
	PostmasterColumn = "view-slot-columns-slot-column-postmaster",
	SlotColumnTitle = "view-slot-columns-slot-column-title",
}

interface ISlotColumn {
	slot?: Arrays.Or<Arrays.Or<InventoryBucketHashes>>;
	name: string;
	component: Component;
}

export interface IInventorySlotColumnsViewDefinition extends IInventoryViewDefinition {
	childViews: View.Handler<readonly [Model<Inventory>], [], IInventoryViewDefinition & View.IViewBase<[]>>[];
	preUpdateInit?(view: InventorySlotColumnsView, wrapper: InventorySlotColumnsViewWrapper): any;
	onItemMoveStart?(view: InventorySlotColumnsView, wrapper: InventorySlotColumnsViewWrapper, item: Item, event: Event & { mouse: IVector2 }): any;
}

class InventorySlotColumnsViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<any[]> & IInventorySlotColumnsViewDefinition> { }

export class InventorySlotColumnsView extends InventoryView {

	public override super!: InventorySlotColumnsViewWrapper;

	public columns!: ISlotColumn[];

	protected override async onMake (inventory: Inventory): Promise<void> {
		this.super.content.classes.add(InventorySlotColumnsViewClasses.Content);

		await super.onMake(inventory);
	}

	protected override preUpdateInit (): void {
		this.columns = [];

		this.postmasterBucketsContainer.remove();
		this.characterBucketsContainer.remove();
		this.vaultBucketsContainer.remove();

		for (const view of this.super.definition.childViews) {
			let name = view.definition.name ?? "Unknown View";
			if (typeof name === "function")
				name = name();

			const component = Component.create()
				.classes.add(InventorySlotColumnsViewClasses.SlotColumn)
				.append(Component.create()
					.classes.add(InventorySlotColumnsViewClasses.SlotColumnTitle)
					.text.set(name))
				.appendTo(this.super.content);

			this.columns.push({
				slot: view.definition.slot!,
				name,
				component,
			});
		}

		this.super.definition.preUpdateInit?.(this, this.super);
	}

	protected override updateCharacters () {
		super.updateCharacters();

		let buckets = 0;

		for (const column of this.columns) {
			if (!column.slot) {
				const result = this.generateSortedPostmasters();
				if (result.changed)
					column.component.append(...result.postmasters);
			} else {
				for (const slot of Arrays.resolve(column.slot)) {
					const result = this.generateSortedBuckets(slot, undefined, true);

					if (this.super.definition.separateVaults) {
						buckets = Math.max(buckets, result.buckets.length * 2);
						if (result.changed) {
							column.component.append(...result.buckets.flatMap(({ character, vault }) => [character, vault]));
						}

					} else {
						buckets = Math.max(buckets, result.buckets.length + 1);
						if (result.changed) {
							column.component.append(...result.buckets.map(({ character }) => character));
							column.component.append(...result.buckets.map(({ vault }) => vault));
						}
					}
				}
			}
		}

		this.super.content.style.set("--buckets", `${buckets}`);
	}

	protected override sort (): void {
		const characters: CharacterBucket[] = [];
		const postmasters: PostmasterBucket[] = [];
		const vaults: VaultBucket[] = [];

		let postmasterColumn: ISlotColumn | undefined;
		for (const column of this.columns) {
			if (column.slot) {
				for (const slot of Arrays.resolve(column.slot)) {
					this.sortSlot(slot);
					for (const bucket of column.component.children<CharacterBucket | VaultBucket>())
						if (bucket.classes.has(CharacterBucketClasses.Main))
							characters.push(bucket as CharacterBucket);
						else if (bucket.classes.has(VaultBucketClasses.Main))
							vaults.push(bucket as VaultBucket);
				}

			} else {
				postmasterColumn = column;
				for (const bucket of column.component.children<PostmasterBucket>())
					if (bucket.classes.has(PostmasterBucketClasses.Main))
						postmasters.push(bucket);
			}
		}

		let postmasterVisible = false;
		for (const postmaster of postmasters) {
			postmaster.update();
			if (!postmaster.classes.has(Classes.Hidden))
				postmasterVisible = true;
		}

		postmasterColumn?.component.classes.toggle(!postmasterVisible, Classes.Hidden);

		for (const character of characters)
			character.update();

		for (const vault of vaults)
			vault.update(this.inventory);
	}

	protected override onItemMoveStart (item: Item, event: Event & { mouse: IVector2; }): void {
		this.super.definition.onItemMoveStart?.(this, this.super, item, event);
	}
}

export default new View.Factory()
	.using(Inventory.createModel())
	.define<IInventorySlotColumnsViewDefinition>()
	.initialise((view, model) =>
		view.make(InventorySlotColumnsView, model))
	.wrapper<InventorySlotColumnsView & View.WrapperComponent<[Model<Inventory>], [], IInventorySlotColumnsViewDefinition & View.IViewBase<[]>>>();
