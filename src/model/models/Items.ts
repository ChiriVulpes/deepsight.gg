import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Time from "utility/Time";

export class Items {

}

export default Model.createDynamic(Time.seconds(30), async () => {
	const { DestinyInventoryItemDefinition } = await Manifest.await();
	const inventories = await Profile(DestinyComponentType.CharacterInventories, DestinyComponentType.ProfileInventories).await();
	for (const [, character] of Object.entries(inventories.characterInventories.data ?? {})) {
		for (const item of character.items) {
			const itemDef = await DestinyInventoryItemDefinition.get(item.itemHash);
			if (itemDef)
				console.log(itemDef.displayProperties.name, itemDef);
		}
	}
});
