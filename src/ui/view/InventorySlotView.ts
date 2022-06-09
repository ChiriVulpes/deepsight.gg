import type { DestinyGeneratedEnums, ItemCategoryHashes } from "bungie-api-ts/generated-enums";
import type { DestinyEnumHelper } from "model/models/DestinyEnums";
import DestinyEnums from "model/models/DestinyEnums";
import Items from "model/models/Items";
import View from "ui/View";

export default new View.Factory()
	.using(Items)
	.define<{ slot: (hashes: DestinyEnumHelper<DestinyGeneratedEnums["ItemCategoryHashes"]>) => ItemCategoryHashes }>()
	.initialise(async (component, items) => {
		const { ItemCategoryHashes } = await DestinyEnums.await();
		const slot = component.definition.slot(ItemCategoryHashes);
		console.log(slot, ItemCategoryHashes.byHash(slot));
		// const filteredItems = items
		// for (const bucketId of Object.keys(items) as BucketId[]) {
		// if (bucketId === "")
		// }
	});
