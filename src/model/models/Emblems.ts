import type { DeepsightEmblemDefinition } from "@deepsight.gg/interfaces";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";

export interface IEmblem {
	deepsight: DeepsightEmblemDefinition;
	definition: DestinyInventoryItemDefinition;
	item?: Item;
}

export default Model.createDynamic("Weekly", async api => {
	api.emitProgress(0 / 2, "Loading manifest");
	const manifest = await api.subscribeProgressAndWait(Manifest, 1 / 2);
	const { DeepsightEmblemDefinition, DestinyInventoryItemDefinition } = manifest;

	api.emitProgress(1 / 2, "Loading emblems");

	const colours = await DeepsightEmblemDefinition.all();
	const deepsight: Record<number, DeepsightEmblemDefinition> = colours.map(colour => [colour.hash, colour]).toObject();
	const emblems = (await DestinyInventoryItemDefinition.all())
		.filter(emblem => deepsight[emblem.hash]);

	return emblems.map(definition => ({
		deepsight: deepsight[definition.hash],
		definition,
	}));
});
