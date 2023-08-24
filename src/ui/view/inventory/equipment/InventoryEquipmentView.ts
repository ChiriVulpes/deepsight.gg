import type { BucketHashes } from "bungie-api-ts/destiny2";
import type Model from "model/Model";
import Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type CharacterBucket from "ui/inventory/bucket/CharacterBucket";
import { CharacterBucketClasses } from "ui/inventory/bucket/CharacterBucket";
import type PostmasterBucket from "ui/inventory/bucket/PostmasterBucket";
import { PostmasterBucketClasses } from "ui/inventory/bucket/PostmasterBucket";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";
import Arrays from "utility/Arrays";
import type { IVector2 } from "utility/maths/Vector2";

export enum InventoryEquipmentViewClasses {
	Content = "view-equipment-content",
	SectionTitle = "view-equipment-section-title",
	SectionContent = "view-equipment-section-content",
	SectionWeapons = "view-equipment-section-weapons",
	SectionArmour = "view-equipment-section-armour",
	SlotColumn = "view-equipment-slot-column",
	PostmasterColumn = "view-equipment-slot-column-postmaster",
	SlotColumnTitle = "view-equipment-slot-column-title",
}

interface IEquipmentSlotColumn {
	slot?: Arrays.Or<Arrays.Or<BucketHashes>>;
	name: string;
	component: Component;
}

export interface IInventoryEquipmentViewDefinition extends IInventoryViewDefinition {
	childViews: View.Handler<readonly [Model<Inventory>], [], IInventoryViewDefinition & View.IViewBase<[]>>[];
	preUpdateInit?(view: InventoryEquipmentView, wrapper: InventoryEquipmentViewWrapper): any;
	onItemMoveStart?(view: InventoryEquipmentView, wrapper: InventoryEquipmentViewWrapper, item: Item, event: Event & { mouse: IVector2 }): any;
}

class InventoryEquipmentViewWrapper extends View.WrapperComponent<[], [], View.IViewBase<any[]> & IInventoryEquipmentViewDefinition> { }

export class InventoryEquipmentView extends InventoryView {

	public override super!: InventoryEquipmentViewWrapper;

	public columns!: IEquipmentSlotColumn[];

	protected override async onMake (inventory: Inventory): Promise<void> {
		await super.onMake(inventory);

		this.super.content.classes.add(InventoryEquipmentViewClasses.Content);

		// this.onMouseMove = this.onMouseMove.bind(this);
		// document.body.addEventListener("mousemove", this.onMouseMove);
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
				.classes.add(InventoryEquipmentViewClasses.SlotColumn)
				.append(Component.create()
					.classes.add(InventoryEquipmentViewClasses.SlotColumnTitle)
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
				column.component.append(...result.postmasters);
			} else {
				for (const slot of Arrays.resolve(column.slot)) {
					const result = this.generateSortedBuckets(slot);

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

		let postmasterColumn: IEquipmentSlotColumn | undefined;
		for (const column of this.columns) {
			if (column.slot) {
				for (const slot of Arrays.resolve(column.slot)) {
					this.sortSlot(slot);
					for (const bucket of column.component.children<CharacterBucket>())
						if (bucket.classes.has(CharacterBucketClasses.Main))
							characters.push(bucket);
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
	}

	protected override onItemMoveStart (item: Item, event: Event & { mouse: IVector2; }): void {
		this.super.definition.onItemMoveStart?.(this, this.super, item, event);
	}
}

export default new View.Factory()
	.using(Inventory.createTemporary())
	.define<IInventoryEquipmentViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryEquipmentView, model))
	.wrapper<InventoryEquipmentView & View.WrapperComponent<[Model<Inventory>], [], IInventoryEquipmentViewDefinition & View.IViewBase<[]>>>();
