import type { BucketHashes } from "bungie-api-ts/destiny2";
import Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { BucketClasses } from "ui/inventory/bucket/Bucket";
import type PostmasterBucket from "ui/inventory/bucket/PostmasterBucket";
import { PostmasterBucketClasses } from "ui/inventory/bucket/PostmasterBucket";
import FilterManager from "ui/inventory/filter/FilterManager";
import SortManager from "ui/inventory/sort/SortManager";
import type { IKeyEvent } from "ui/UiEventBus";
import View from "ui/View";
import { FILTER_MANAGER_ARMOUR_DEFINITION, SORT_MANAGER_ARMOUR_DEFINITION } from "ui/view/inventory/InventoryArmourView";
import InventoryArmsView from "ui/view/inventory/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/InventoryClassItemView";
import InventoryEnergyView from "ui/view/inventory/InventoryEnergyView";
import InventoryHelmetView from "ui/view/inventory/InventoryHelmetView";
import InventoryKineticView from "ui/view/inventory/InventoryKineticView";
import InventoryLegsView from "ui/view/inventory/InventoryLegsView";
import InventoryPowerView from "ui/view/inventory/InventoryPowerView";
import type { IInventorySlotViewDefinition } from "ui/view/inventory/InventorySlotView";
import { InventorySlotView } from "ui/view/inventory/InventorySlotView";
import { FILTER_MANAGER_WEAPONS_DEFINITION, SORT_MANAGER_WEAPONS_DEFINITION } from "ui/view/inventory/InventoryWeaponView";
import Async from "utility/Async";
import type { IVector2 } from "utility/maths/Vector2";
import Store from "utility/Store";

enum InventoryEquipmentViewClasses {
	Section = "view-equipment-section",
	SectionCollapsed = "view-equipment-section-collapsed",
	SectionTitle = "view-equipment-section-title",
	SectionContent = "view-equipment-section-content",
	SectionWeapons = "view-equipment-section-weapons",
	SectionArmour = "view-equipment-section-armour",
	SlotColumn = "view-equipment-slot-column",
	PostmasterColumn = "view-equipment-slot-column-postmaster",
	SlotColumnTitle = "view-equipment-slot-column-title",
}

interface IEquipmentSlotColumn {
	slot?: BucketHashes;
	name: string;
	component: Component;
	section: InventoryEquipmentViewClasses;
}

class InventoryEquipmentView extends InventorySlotView {

	public weaponsSection!: Component;
	public armourSection!: Component;
	public columns!: IEquipmentSlotColumn[];

	protected override async onMake (inventory: Inventory): Promise<void> {
		await super.onMake(inventory);

		this.onMouseMove = this.onMouseMove.bind(this);
		document.body.addEventListener("mousemove", this.onMouseMove);
	}

	protected override preUpdateInit (): void {
		this.columns = [];

		this.postmasterBucketsContainer.remove();
		this.characterBucketsContainer.remove();
		this.vaultBucketsContainer.remove();

		const sections = [
			{
				name: "Weapons" as const,
				class: InventoryEquipmentViewClasses.SectionWeapons,
				collapsed: false,
				views: [
					InventoryKineticView,
					InventoryEnergyView,
					InventoryPowerView,
				],
			},
			{
				name: "Armour" as const,
				class: InventoryEquipmentViewClasses.SectionArmour,
				collapsed: true,
				views: [
					InventoryHelmetView,
					InventoryArmsView,
					InventoryChestView,
					InventoryLegsView,
					InventoryClassItemView,
				],
			},
		];

		for (const section of sections) {
			const sectionComponent = Component.create()
				.classes.add(InventoryEquipmentViewClasses.Section, section.class)
				.classes.toggle(section.collapsed, InventoryEquipmentViewClasses.SectionCollapsed)
				.append(Component.create()
					.classes.add(InventoryEquipmentViewClasses.SectionTitle)
					.text.set(section.name))
				.appendTo(this.super.content);

			this[`${section.name.toLowerCase() as Lowercase<(typeof section)["name"]>}Section`] = sectionComponent;

			const sectionContent = Component.create()
				.classes.add(InventoryEquipmentViewClasses.SectionContent)
				.appendTo(sectionComponent);

			for (const view of section.views) {
				let name = view.definition.name ?? "Unknown View";
				if (typeof name === "function")
					name = name();

				const component = Component.create()
					.classes.add(InventoryEquipmentViewClasses.SlotColumn)
					.classes.toggle(section.collapsed, Classes.Hidden)
					.append(Component.create()
						.classes.add(InventoryEquipmentViewClasses.SlotColumnTitle)
						.text.set(name))
					.appendTo(sectionContent);

				this.columns.push({
					slot: view.definition.slot!,
					name,
					component,
					section: section.class,
				});
			}

			if (section.class === InventoryEquipmentViewClasses.SectionWeapons) {
				const component = Component.create()
					.classes.add(InventoryEquipmentViewClasses.SlotColumn, InventoryEquipmentViewClasses.PostmasterColumn)
					.classes.toggle(section.collapsed, Classes.Hidden)
					.append(Component.create()
						.classes.add(InventoryEquipmentViewClasses.SlotColumnTitle)
						.text.set("\xa0"))
					.appendTo(sectionContent);

				this.columns.push({
					name: "Postmaster",
					component,
					section: section.class,
				});
			}
		}
	}

	protected override updateCharacters () {
		super.updateCharacters();

		let weaponsBuckets = 0;
		let armourBuckets = 0;

		for (const column of this.columns) {
			if (!column.slot) {
				const result = this.generateSortedPostmasters();
				column.component.append(...result.postmasters);
			} else {
				const armourSection = column.section === InventoryEquipmentViewClasses.SectionArmour;
				const result = this.generateSortedBuckets(column.slot, armourSection);

				weaponsBuckets = Math.max(weaponsBuckets, result.buckets.length + 1);
				armourBuckets = Math.max(armourBuckets, result.buckets.length * 2);

				if (result.changed) {
					if (armourSection) {
						column.component.append(...result.buckets.flatMap(({ character, vault }) => [character, vault]));

					} else {
						column.component.append(...result.buckets.map(({ character }) => character));
						column.component.append(...result.buckets.map(({ vault }) => vault));
					}
				}
			}
		}

		this.weaponsSection.style.set("--buckets", `${weaponsBuckets}`);
		this.armourSection.style.set("--buckets", `${armourBuckets}`);
	}

	protected override sort (): void {
		const postmasters: PostmasterBucket[] = [];

		for (const column of this.columns) {
			if (column.slot)
				this.sortSlot(column.slot);

			else
				for (const bucket of column.component.children<PostmasterBucket>())
					if (bucket.classes.has(PostmasterBucketClasses.Main))
						postmasters.push(bucket);
		}

		for (const postmaster of postmasters)
			postmaster.update();
	}

	private onMouseMove (event: MouseEvent): void {
		if (!document.contains(this.element))
			return document.body.removeEventListener("mousemove", this.onMouseMove);

		const target = event.target as HTMLElement | undefined;
		if (!target?.closest(`.${View.Classes.Content}`))
			return;

		if (event.clientX > window.innerWidth - 100 && this.armourSection.classes.has(InventoryEquipmentViewClasses.SectionCollapsed)) {
			this.showArmour();
		}

		if (event.clientX < 100 && this.weaponsSection.classes.has(InventoryEquipmentViewClasses.SectionCollapsed)) {
			this.showWeapons();
		}
	}

	private loadingNewView = false;

	private showWeapons () {
		if (this.loadingNewView)
			return;

		this.weaponsSection.classes.remove(InventoryEquipmentViewClasses.SectionCollapsed);
		this.armourSection.classes.add(InventoryEquipmentViewClasses.SectionCollapsed);
		this.super.definition.sort = new SortManager(SORT_MANAGER_WEAPONS_DEFINITION);
		this.super.definition.filter = new FilterManager(FILTER_MANAGER_WEAPONS_DEFINITION);
		void this.updateView();
	}

	private showArmour () {
		if (this.loadingNewView)
			return;

		this.weaponsSection.classes.add(InventoryEquipmentViewClasses.SectionCollapsed);
		this.armourSection.classes.remove(InventoryEquipmentViewClasses.SectionCollapsed);
		this.super.definition.sort = new SortManager(SORT_MANAGER_ARMOUR_DEFINITION);
		this.super.definition.filter = new FilterManager(FILTER_MANAGER_ARMOUR_DEFINITION);
		void this.updateView();
	}

	private async updateView () {
		this.loadingNewView = true;
		this.sorter.remove();
		this.filterer.remove();
		this.initSortAndFilter();
		this.hints.appendTo(this.super.footer);
		await Async.sleep(400);
		const showingWeapons = this.weaponsSection.classes.has(InventoryEquipmentViewClasses.SectionCollapsed);
		for (const column of this.columns)
			column.component.classes.toggle(showingWeapons === (column.section === InventoryEquipmentViewClasses.SectionWeapons), Classes.Hidden);

		this.loadingNewView = false;
		for (const bucket of document.getElementsByClassName(`.${BucketClasses.Main}`))
			bucket.component?.deref()?.uncacheRect();

		this.sort();
	}

	protected override onGlobalKeydown (event: IKeyEvent): void {
		super.onGlobalKeydown(event);

		if (event.use("ArrowLeft"))
			this.showWeapons();

		if (event.use("ArrowRight"))
			this.showArmour();
	}

	protected override onItemMoveStart (item: Item, event: Event & { mouse: IVector2; }): void {
		this.weaponsSection.element.lastElementChild?.scrollTo({ top: 0, behavior: "smooth" });
		// this.armourSection.element.lastElementChild?.scrollTo({ top: 0, behavior: "smooth" });
	}
}

export default new View.Factory()
	.using(Inventory.createTemporary())
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryEquipmentView, model))
	.create({
		id: "equipment",
		name: "Equipment",
		sort: new SortManager(SORT_MANAGER_WEAPONS_DEFINITION),
		filter: new FilterManager(FILTER_MANAGER_WEAPONS_DEFINITION),
		displayDestinationButton: () => !!Store.items.settingsEquipmentView,
	});
