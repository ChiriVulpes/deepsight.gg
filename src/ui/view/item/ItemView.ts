import InventoryModel from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { BucketId } from "model/models/items/Item";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";

export default View.create({
	models: [InventoryModel.createTemporary()],
	id: "item",
	hash: (item: Item | string) => typeof item === "string" ? `item/${item}` : `item/${item.bucket}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Inspect Item" : item.definition.displayProperties.name,
	noDestinationButton: true,
	initialise: (view, inventory) => {
		LoadingManager.end(view.definition.id);

		let [, itemArg] = view._args as [any, Item | string | undefined];
		if (typeof itemArg === "string") {
			const [bucketId, itemId] = itemArg.split("/") as [BucketId, string];
			itemArg = inventory.buckets[bucketId].items.find(item => item.id === itemId);
		}

		if (!itemArg)
			return;

		const item = itemArg;
		view._args[1] = item;

		view.setTitle(title => title.text.set(item.definition.displayProperties.name))
			.tweak(view => view.content);
	},
});
