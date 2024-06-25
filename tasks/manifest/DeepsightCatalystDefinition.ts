import type { ObjectiveHashes } from "@deepsight.gg/enums";
import { InventoryItemHashes, ItemTierTypeHashes, RecordHashes } from "@deepsight.gg/enums";
import fs from "fs-extra";
import type { DeepsightCatalystDefinition } from "../../static/manifest/Interfaces";
import Task from "../utility/Task";
import { getDeepsightCollectionsDefinition } from "./DeepsightCollectionsDefinition";
import manifest from "./utility/endpoint/DestinyManifest";

const overrides: Record<number, RecordHashes> = {
	[InventoryItemHashes.TheJadeRabbitScoutRifle]: RecordHashes.JadeRabbitCatalyst,
	[InventoryItemHashes.LorentzDriverLinearFusionRifle]: RecordHashes.LorentzDriver,
};

export default Task("DeepsightCatalystDefinition", async () => {
	const { DestinyInventoryItemDefinition, DestinyObjectiveDefinition } = manifest;
	const collections = await getDeepsightCollectionsDefinition();
	const DestinyRecordDefinition = await manifest.DestinyRecordDefinition.all();
	const records = Object.values(DestinyRecordDefinition);

	const DeepsightCatalystDefinition: Record<number, DeepsightCatalystDefinition> = {};

	// const exoticsMissingRecords: DestinyInventoryItemDefinition[] = [];

	for (const moment of Object.values(collections)) {
		for (const bucket of Object.values(moment.buckets)) {
			for (const hash of bucket) {
				const itemDef = await DestinyInventoryItemDefinition.get(hash);
				if (!itemDef)
					continue;

				if (itemDef.inventory?.tierTypeHash !== ItemTierTypeHashes.Exotic)
					continue;

				const name = itemDef.displayProperties.name;
				const expectedRecordName = `${name} Catalyst`;
				const record = DestinyRecordDefinition[overrides[hash]] ?? records.find(record => record.displayProperties.name === expectedRecordName);
				if (!record) {
					// exoticsMissingRecords.push(itemDef);
					continue;
				}

				const defaultDescription = "Catalyst Progress";
				let progressDescription: string | undefined;
				const primaryObjectiveHashes: ObjectiveHashes[] = [];
				for (const hash of record.objectiveHashes) {
					const objective = await DestinyObjectiveDefinition.get(hash);
					if (objective?.progressDescription === "Insert the Catalyst")
						continue;

					primaryObjectiveHashes.push(hash);
					progressDescription = progressDescription ? defaultDescription : objective?.progressDescription;
				}

				DeepsightCatalystDefinition[hash] = {
					hash,
					record: record.hash,
					primaryObjectiveHashes,
					progressDescription: progressDescription ?? defaultDescription,
				};
			}
		}
	}

	// if (exoticsMissingRecords.length)
	// 	throw new Error(`Exotics missing catalyst records:${exoticsMissingRecords.map(item => `\n  - ${item.displayProperties.name}`).join("")}`);

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightCatalystDefinition.json", DeepsightCatalystDefinition, { spaces: "\t" });
});
