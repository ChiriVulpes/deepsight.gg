import type { BucketHashes } from "bungie-api-ts/destiny2";
import Inventory from "model/models/Inventory";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { BucketClasses } from "ui/inventory/bucket/Bucket";
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
import Store from "utility/Store";

enum InventoryEquipmentViewClasses {
	Section = "view-equipment-section",
	SectionCollapsed = "view-equipment-section-collapsed",
	SectionTitle = "view-equipment-section-title",
	SectionContent = "view-equipment-section-content",
	SectionWeapons = "view-equipment-section-weapons",
	SectionArmour = "view-equipment-section-armour",
	SlotColumn = "view-equipment-slot-column",
	SlotColumnTitle = "view-equipment-slot-column-title",
}

interface IEquipmentSlotColumn {
	slot: BucketHashes;
	name: string;
	component: Component;
	section: InventoryEquipmentViewClasses;
}

class InventoryEquipmentView extends InventorySlotView {

	public weaponsSection!: Component;
	public armourSection!: Component;
	public columns!: IEquipmentSlotColumn[];

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
		}

		this.onMouseMove = this.onMouseMove.bind(this);
		document.body.addEventListener("mousemove", this.onMouseMove);
	}

	protected override updateCharacters () {
		super.updateCharacters();

		for (const column of this.columns) {
			const result = this.generateSortedBuckets(column.slot);
			if (result.changed) {
				column.component.append(...result.buckets.map(({ character }) => character));
				column.component.append(...result.buckets.map(({ vault }) => vault));
				// this.postmasterBucketsContainer.append(...characterBucketsSorted.map(({ postmaster }) => postmaster));
			}
		}
	}

	protected override sort (): void {
		for (const column of this.columns)
			this.sortSlot(column.slot);
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
		await Async.sleep(300);
		const showingWeapons = this.weaponsSection.classes.has(InventoryEquipmentViewClasses.SectionCollapsed);
		for (const column of this.columns)
			column.component.classes.toggle(showingWeapons === (column.section === InventoryEquipmentViewClasses.SectionWeapons), Classes.Hidden);

		this.loadingNewView = false;
		for (const bucket of document.getElementsByClassName(`.${BucketClasses.Main}`))
			bucket.component?.deref()?.uncacheRect();
	}

	protected override onGlobalKeydown (event: IKeyEvent): void {
		super.onGlobalKeydown(event);

		if (event.use("ArrowLeft"))
			this.showWeapons();

		if (event.use("ArrowRight"))
			this.showArmour();
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
