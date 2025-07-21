import type { DeepsightEmblemDefinition } from "@deepsight.gg/Interfaces";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemType } from "bungie-api-ts/destiny2";
import convert from "color-convert";
import fs from "fs-extra";
import jimp from "jimp";
import { Task } from "task";
import Log from "../utility/Log";
import manifest from "./utility/endpoint/DestinyManifest";

async function getMedianColour (url: string) {
	const image = await jimp.read(url);
	const width = image.getWidth();
	const height = image.getHeight();
	const colours: number[] = [];
	const usedPadding = 0.2;
	for (let x = 0; x < width; x = x > width * usedPadding && x < width * (1 - usedPadding) ? Math.floor(x + width * (1 - usedPadding * 2)) : x + 1) {
		for (let y = 0; y < height; y = y > height * usedPadding && y < height * (1 - usedPadding) ? Math.floor(y + height * (1 - usedPadding * 2)) : y + 1) {
			const colour = jimp.intToRGBA(image.getPixelColour(x, y));
			const [h, s, l] = convert.rgb.hsl(colour.r, colour.g, colour.b);
			colours.push(l * 1e6 + h * 1e3 + s);
		}
	}

	colours.sort((a, b) => a - b);
	const median = colours[Math.floor(colours.length / 2)];

	const hslToRgb = convert.hsl.rgb as any as (h: number, s: number, l: number) => [number, number, number];
	return hslToRgb(Math.floor((median % 1e6) / 1e3), median % 1e3, Math.floor(median / 1e6));
}

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

			[red, green, blue] = await getMedianColour(url)
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
