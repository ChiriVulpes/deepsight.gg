import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import { DestinyClass } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Characters from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import { Bucket } from "model/models/items/Bucket";
import type Item from "model/models/items/Item";
import Component from "ui/component/Component";
import Details from "ui/component/Details";
import Loadable from "ui/component/Loadable";
import type ItemComponent from "ui/destiny/component/ItemComponent";
import Slot, { SlotClasses } from "ui/destiny/component/Slot";
import ICollectionsView, { FILTER_MANAGER_COLLECTIONS, SORT_MANAGER_COLLECTIONS } from "ui/view/collections/ICollectionsView";

export enum CollectionsMomentClasses {
	Moment = "view-collections-moment",
	MomentContent = "view-collections-moment-content",
	Bucket = "view-collections-bucket",
	BucketTitle = "view-collections-bucket-title",
	FilteredOut = "view-collections-filtered-out",
}

export default class CollectionsMoment extends Details<[moment: DeepsightMomentDefinition, inventory?: Inventory, defaultOpen?: boolean]> {

	public weaponsBucket?: Component;
	public weaponComponents?: ItemComponent[];
	public armourBuckets!: Partial<Record<DestinyClass, Component>>;
	public armourComponents!: Partial<Record<DestinyClass, ItemComponent[]>>;
	public inventory?: Inventory;

	protected override onMake (moment: DeepsightMomentDefinition, inventory?: Inventory, defaultOpen = false): void {
		super.onMake(moment, inventory);
		this.inventory = inventory;

		this.event.subscribe("toggle", () => this.forcedOpen = false);

		this.classes.add(CollectionsMomentClasses.Moment)
			.toggle(defaultOpen)
			.tweak(details => details.summary.text.set(moment.displayProperties.name));

		Loadable.create(Model.createTemporary(async () => {
			// if (!defaultOpen)
			// 	await this.event.waitFor("toggle");

			const { DeepsightCollectionsDefinition } = await Manifest.await();
			const collection = await DeepsightCollectionsDefinition.get(moment.hash);

			return Bucket.COLLECTIONS.items
				.filter(item => Object.values(collection?.buckets ?? {})
					.some(hashes => hashes.includes(item.definition.hash)));
		}))
			.onReady(items => {
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

				if (weapons.length) {
					this.weaponsBucket = Component.create()
						.classes.add(CollectionsMomentClasses.Bucket)
						.append(Component.create()
							.classes.add(CollectionsMomentClasses.BucketTitle)
							.text.set("Weapons"))
						.tweak(ICollectionsView.addItems, weapons, inventory, SORT_MANAGER_COLLECTIONS, this.weaponComponents ??= [])
						.appendTo(wrapper);
				}

				const classes = Characters.getSortedClasses()
					.concat(DestinyClass.Titan, DestinyClass.Hunter, DestinyClass.Warlock)
					.distinct();

				for (const cls of classes) {
					const items = classItems[cls];
					if (!items?.length)
						continue;

					(this.armourBuckets ??= {})[cls] = Component.create()
						.classes.add(CollectionsMomentClasses.Bucket)
						.append(Component.create()
							.classes.add(CollectionsMomentClasses.BucketTitle)
							.text.set(cls === DestinyClass.Titan ? "Titan" : cls === DestinyClass.Hunter ? "Hunter" : "Warlock")
							.text.add(" Armor"))
						.tweak(ICollectionsView.addItems, items, inventory, SORT_MANAGER_COLLECTIONS, (this.armourComponents ??= {})[cls] ??= [])
						.appendTo(wrapper);
				}

				this.filter();

				return wrapper;
			})
			.setSimple()
			.appendTo(this);

		inventory?.event.subscribe("update", () => {
			this.sort();
			this.filter();
		});
	}

	public sort () {
		// mark old slots for removal
		const buckets = [this.weaponsBucket, ...Object.values(this.armourBuckets ??= {})];
		for (const bucket of buckets)
			for (const slot of bucket?.element.getElementsByClassName(SlotClasses.Main) ?? [])
				slot.classList.add("pending-removal");

		// sort
		const components = [this.weaponComponents, ...Object.values(this.armourComponents ??= {})];
		for (const componentList of components) {
			if (!componentList)
				continue;

			const sortedItems = ICollectionsView.sortItems(componentList.map(component => component.item!), this.inventory, SORT_MANAGER_COLLECTIONS);
			componentList.sort((a, b) => sortedItems.indexOf(a.item!) - sortedItems.indexOf(b.item!));
		}

		// append
		for (const weaponComponent of this.weaponComponents ?? [])
			weaponComponent.appendTo(Slot.create().appendTo(this.weaponsBucket));

		for (const cls of Object.keys(this.armourBuckets).map(k => +k as DestinyClass))
			for (const armourComponent of this.armourComponents[cls] ?? [])
				armourComponent.appendTo(Slot.create().appendTo(this.armourBuckets[cls]));

		// remove old slots
		for (const bucket of buckets)
			for (const slot of [...bucket?.element.getElementsByClassName("pending-removal") ?? []])
				slot.remove();

		this.filter();
	}

	private forcedOpen = false;
	public filter () {
		const components = [this.weaponComponents, ...Object.values(this.armourComponents ??= {})];
		for (const componentList of components) {
			for (const component of componentList ?? []) {
				const filteredOut = !FILTER_MANAGER_COLLECTIONS.apply(component.item!);
				component.element.parentElement?.classList.toggle(CollectionsMomentClasses.FilteredOut, filteredOut);
			}
		}

		const buckets = [this.weaponsBucket, ...Object.values(this.armourBuckets ??= {})];
		for (const bucket of buckets)
			bucket?.classes.toggle(!bucket?.element.querySelector(`.${SlotClasses.Main}:not(.${CollectionsMomentClasses.FilteredOut})`),
				CollectionsMomentClasses.FilteredOut);

		const hidden = buckets.every(bucket => bucket?.classes.has(CollectionsMomentClasses.FilteredOut));
		this.classes.toggle(hidden, CollectionsMomentClasses.FilteredOut);
		if (this.forcedOpen && (hidden || !FILTER_MANAGER_COLLECTIONS.isFiltered())) {
			this.close();
			this.forcedOpen = false;

		} else if (FILTER_MANAGER_COLLECTIONS.isFiltered() && !hidden && !this.isOpen()) {
			this.open();
			this.forcedOpen = true;
		}
	}
}
