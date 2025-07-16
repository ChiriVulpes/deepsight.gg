import { ItemCategoryHashes, SocketTypeHashes } from "@deepsight.gg/enums";
import type { PromiseOr } from "@deepsight.gg/utility/Type";
import fs from "fs-extra";
import { Task } from "task";
import type { DeepsightSocketCategorisationDefinition } from "./IDeepsightPlugCategorisation";
import { DeepsightPlugCategory, DeepsightPlugTypeMap, type DeepsightPlugFullName, type DeepsightSocketCategorisation } from "./IDeepsightPlugCategorisation";
import DeepsightPlugCategorisation from "./plugtype/DeepsightPlugCategorisation";
import manifest from "./utility/endpoint/DestinyManifest";

let DeepsightSocketCategorisation: PromiseOr<Record<number, DeepsightSocketCategorisationDefinition>> | undefined;

export default Task("DeepsightSocketCategorisation", async () => {
	DeepsightSocketCategorisation = undefined;
	const result = await getDeepsightSocketCategorisation();

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightSocketCategorisation.json", result, { spaces: "\t" });
});

export async function getDeepsightSocketCategorisation () {
	DeepsightSocketCategorisation ??= computeDeepsightSocketCategorisation();
	return DeepsightSocketCategorisation = await DeepsightSocketCategorisation;
}

async function computeDeepsightSocketCategorisation () {
	const { DestinyInventoryItemDefinition, DestinyPlugSetDefinition } = manifest;

	const DeepsightSocketCategorisation: Record<number, DeepsightSocketCategorisationDefinition> = {};

	const PlugCategorisation = await DeepsightPlugCategorisation.resolve();
	const InventoryItem = await DestinyInventoryItemDefinition.all();

	for (const item of Object.values(InventoryItem)) {
		if (item.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies))
			continue;

		const socketCategorisations: Partial<DeepsightSocketCategorisation>[] = [];
		const sockets = item.sockets?.socketEntries ?? [];
		for (let i = 0; i < sockets.length; i++) {
			const socket = sockets[i];
			const randomizedPlugSet = (await DestinyPlugSetDefinition.get(socket.randomizedPlugSetHash))?.reusablePlugItems ?? [];
			const reusablePlugSet = (await DestinyPlugSetDefinition.get(socket.reusablePlugSetHash))?.reusablePlugItems ?? [];
			const reusablePlugItems = socket.reusablePlugItems;
			const singleInitialItemHash = socket.singleInitialItemHash;
			const plugHashes = [
				singleInitialItemHash,
				...randomizedPlugSet.map(item => item.plugItemHash),
				...reusablePlugSet.map(item => item.plugItemHash),
				...reusablePlugItems.map(item => item.plugItemHash),
			];
			// const items = plugHashes.map(hash => InventoryItem[hash]);
			const types = new Set(plugHashes.map(hash => PlugCategorisation[hash]?.fullName));
			types.delete(undefined!);
			types.delete("None");
			if (types.size > 1)
				types.delete("Classified");

			socketCategorisations[i] = {
				fullName: "None",
			};

			if (types.size <= 1) {
				const [type] = types;
				socketCategorisations[i].fullName = type ?? socketCategorisations[i].fullName;
			} else {
				const smallestFirst = Array.from(types)
					.sort((a, b) => a.length - b.length);

				const smallest = smallestFirst[0];
				if (smallestFirst.every(type => type.startsWith(smallest)))
					socketCategorisations[i].fullName = smallest;

				if (socketCategorisations[i].fullName === "None") {
					// we still don't have a type, so now we grab the smallest type and see how much we can shorten it to make all match
					let type = smallestFirst[0];
					while (type.length) {
						type = type.slice(0, -1) as DeepsightPlugFullName;
						if (!type.includes("/"))
							break;

						if (smallestFirst.every(t => t.startsWith(type))) {
							socketCategorisations[i].fullName = type;
							break;
						}
					}
				}
			}

			if (socketCategorisations[i].fullName === "Cosmetic/ShaderDefault")
				socketCategorisations[i].fullName = "Cosmetic/Shader";

			if (socketCategorisations[i].fullName === "None" && sockets[i].socketTypeHash === SocketTypeHashes.CraftingPlugsFrameIdentifiers)
				socketCategorisations[i].fullName = "Intrinsic/Shaped";
		}

		for (const socketCategorisation of socketCategorisations) {
			const [category, type] = socketCategorisation.fullName?.split("/") ?? [];
			socketCategorisation.categoryName = category || "None";
			socketCategorisation.typeName = type || "None";
			socketCategorisation.category = DeepsightPlugCategory[socketCategorisation.categoryName as keyof typeof DeepsightPlugCategory];
			socketCategorisation.type = DeepsightPlugTypeMap[socketCategorisation.category]?.[socketCategorisation.typeName as never] as number | undefined;
		}

		DeepsightSocketCategorisation[item.hash] = {
			hash: item.hash,
			categorisation: socketCategorisations as DeepsightSocketCategorisation[],
		};

	}

	return DeepsightSocketCategorisation;
}
