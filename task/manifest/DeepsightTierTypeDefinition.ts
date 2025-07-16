import fs from "fs-extra";
import { Task } from "task";
import type { DeepsightTierTypeDefinition } from "../../static/manifest/Interfaces";
import manifest from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightTierTypeDefinition", async () => {
	const { DestinyItemTierTypeDefinition, DestinyInventoryItemDefinition } = manifest;
	const definedTiers = await DestinyItemTierTypeDefinition.all();

	const hashedTypes: Record<string, DeepsightTierTypeDefinition> = {};

	for (const definition of Object.values(await DestinyInventoryItemDefinition.all())) {
		if (!definition.inventory?.tierTypeHash)
			continue;

		const type = definition.inventory.tierType;
		const hash = definition.inventory.tierTypeHash;
		const name = definition.inventory.tierTypeName;
		const hashed = `${type}.${hash}.${name}`;
		hashedTypes[hashed] ??= {
			...await DestinyItemTierTypeDefinition.get(hash),
			hash,
			tierType: type,
			displayProperties: { name },
		};
	}

	const defs = Object.values(hashedTypes);
	if (defs.length !== Object.values(definedTiers).length)
		throw new Error(`More tiers were present in item definitions than were defined:\n${JSON.stringify(defs, null, "\t")}`);

	const DeepsightTierTypeDefinition = Object.fromEntries(defs.map(def => [def.hash, def]));

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightTierTypeDefinition.json", DeepsightTierTypeDefinition, { spaces: "\t" });
});
