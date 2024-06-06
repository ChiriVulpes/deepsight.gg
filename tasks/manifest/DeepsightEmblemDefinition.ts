import type { DeepsightEmblemDefinition } from "@deepsight.gg/interfaces";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemType } from "bungie-api-ts/destiny2";
import thief from "color-thief-node";
import fs from "fs-extra";
import Log from "../utility/Log";
import Task from "../utility/Task";
import manifest from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightEmblemDefinition", async () => {
	const { DestinyInventoryItemDefinition } = manifest;
	const invItems = Object.entries(await DestinyInventoryItemDefinition.all());

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const DeepsightEmblemDefinition: Record<number, DeepsightEmblemDefinition>
		= await fs.readJson("static/manifest/DeepsightEmblemDefinition.json").catch(() => ({}));

	let i = 0;
	function logCurrent (item: DestinyInventoryItemDefinition) {
		const count = 20;
		const fraction = Math.floor((i / invItems.length) * count);
		Log.info("Getting median emblem colour", `[${"#".repeat(fraction)}${" ".repeat(count - fraction)}]`, item.displayProperties.name);
	}

	for (; i < invItems.length; i++) {
		const [itemHash, item] = invItems[i];
		if (item.itemType !== DestinyItemType.Emblem || (!item.displayProperties.name && +itemHash !== 4133455811))
			continue;

		const emblemIconURL = item.displayProperties.icon;
		if (!emblemIconURL)
			continue;

		if (DeepsightEmblemDefinition[+itemHash]) // already calculated
			continue;

		if (i % 100)
			logCurrent(item);

		let red = -1, green = -1, blue = -1;
		while (true) {
			const url = `https://www.bungie.net${emblemIconURL}`;
			[red, green, blue] = await thief.getColorFromURL(url)
				.catch(() => [-1, -1, -1]);

			if (red === -1) {
				logCurrent(item);
				Log.warn("Failed to get emblem colour. Retrying...");
				continue;
			}

			break;
		}

		DeepsightEmblemDefinition[+itemHash] = {
			hash: +itemHash,
			displayProperties: item.displayProperties,
			collectibleHash: item.collectibleHash,
			secondaryIcon: item.secondaryIcon,
			secondaryOverlay: item.secondaryOverlay,
			secondarySpecial: item.secondarySpecial,
			backgroundColor: { red, green, blue, alpha: 255 },
		};
	}

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("static/manifest/DeepsightEmblemDefinition.json", DeepsightEmblemDefinition, { spaces: "\t" });
	await fs.copyFile("static/manifest/DeepsightEmblemDefinition.json", "docs/manifest/DeepsightEmblemDefinition.json");
});