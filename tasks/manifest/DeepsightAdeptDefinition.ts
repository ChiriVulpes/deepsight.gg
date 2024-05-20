import fs from "fs-extra";
import Task from "../utility/Task";
import { getDeepsightCollectionsDefinition } from "./DeepsightCollectionsDefinition";
import ItemPreferred from "./utility/ItemPreferred";
import manifest from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightAdeptDefinition", async () => {
	const { DestinyInventoryItemDefinition } = manifest;
	const invItems = await DestinyInventoryItemDefinition.all();
	const collections = Object.values(await getDeepsightCollectionsDefinition())
		.flatMap(collection => Object.values(collection.buckets))
		.flat();

	const DeepsightAdeptDefinition: Record<number, { hash: number, base: number }> = {};

	for (const itemHash of collections) {
		const item = invItems[itemHash];
		if (!item.displayProperties.name)
			continue;

		if (ItemPreferred.isEquippableDummy(item))
			continue;

		const [, adeptName] = item.displayProperties.name.match(/^(.*?) \(.*?\)\s*$/) ?? [];
		if (!adeptName)
			continue;

		const normalHash = collections
			?.find((itemHash, _1, _2, item = invItems[itemHash]) => true
				&& item.displayProperties.name === adeptName
				&& !ItemPreferred.isEquippableDummy(item));

		if (!normalHash)
			continue;

		DeepsightAdeptDefinition[itemHash] = { hash: itemHash, base: normalHash };
	}

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightAdeptDefinition.json", DeepsightAdeptDefinition, { spaces: "\t" });
});
