import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyClass, ItemCategoryHashes, TierType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Collections from "model/models/Collections";
import Manifest from "model/models/Manifest";
import Sources from "model/models/Sources";
import Display from "ui/bungie/DisplayProperties";
import { InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
import Details from "ui/Details";
import ItemComponent from "ui/inventory/Item";
import Loadable from "ui/Loadable";
import View from "ui/View";

export enum CollectionsViewClasses {
	Bucket = "view-collections-bucket",
	BucketDetails = "view-collections-bucket-details",
}

export default View.create({
	models: [Manifest, Sources] as const,
	id: "collections",
	name: "Collections",
	initialise: (view, manifest, sources) => {
		view.setTitle(title => title.text.set("Collections"));

		let shownExpansion = false;
		let shownSeason = false;
		for (const source of sources) {

			let defaultOpen = false;
			if (!shownExpansion && source.expansion) {
				defaultOpen = true;
				shownExpansion = true;
			}

			if (!shownSeason && source.season) {
				defaultOpen = true;
				shownSeason = true;
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			if ((+source.eventCard?.endTime! ?? 0) * 1000 > Date.now())
				defaultOpen = true;

			const details = Details.create()
				.classes.add(CollectionsViewClasses.BucketDetails)
				.toggle(defaultOpen)
				.tweak(details => details.summary.text.set(source.displayProperties.name))
				.appendTo(view.content);

			Loadable.create(Model.createTemporary(async () => {
				if (!defaultOpen)
					await details.event.waitFor("toggle");

				return Collections.source(source).await();
			}))
				.onReady(items => {
					console.log(source.displayProperties.name, items);
					return Component.create()
						.classes.add(CollectionsViewClasses.Bucket)
						.append(...items
							.sort((a, b) => getSortIndex(b.definition) - getSortIndex(a.definition)
								|| (Display.name(a.definition) ?? "").localeCompare(Display.name(b.definition) ?? ""))
							.map(item => Component.create()
								.classes.add(InventoryClasses.Slot)
								.append(ItemComponent.create([item]))));
				})
				.setSimple()
				.appendTo(details);
		}
	},
});

function getSortIndex (item: DestinyInventoryItemDefinition) {
	return (item.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ? 10000 : 0)
		+ (item.inventory?.tierType ?? TierType.Unknown) * 1000
		+ (item.classType ?? DestinyClass.Unknown);
}
