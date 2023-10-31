import type { AllDestinyManifestComponents } from "../../src/node_modules/bungie-api-ts/destiny2";
import type { DestinyManifestComponentValue } from "./DestinyManifest";
import manifest from "./DestinyManifest";

type DestinyManifestReference = { [KEY in keyof AllDestinyManifestComponents]?: number };
namespace DestinyManifestReference {
	export async function resolve (ref: string | DestinyManifestReference | undefined, type: "name" | "description" | "icon" | "iconWatermark") {
		if (typeof ref === "string" || ref === undefined)
			return ref;

		for (const [key, hash] of Object.entries(ref) as [keyof AllDestinyManifestComponents, number][]) {
			const definition = await manifest[key].get(hash) as DestinyManifestComponentValue;
			if (!definition)
				continue;

			if (type === "iconWatermark") {
				if ("iconWatermark" in definition)
					return definition.iconWatermark;
				continue;
			}

			const displayProperties = "displayProperties" in definition ? definition.displayProperties : undefined;
			if (!displayProperties)
				continue;

			return displayProperties[type];
		}

		return undefined;
	}
}

export default DestinyManifestReference;
