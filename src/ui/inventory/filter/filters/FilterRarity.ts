import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import Rarities from "ui/inventory/Rarities";
import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.async(async () => {
	const { DeepsightTierTypeDefinition } = await Manifest.await();
	const tiers = (await DeepsightTierTypeDefinition.all())
		.sort((a, b) => b.tierType - a.tierType);

	function definition (value: string, item?: Item) {
		if (value === "")
			return null;

		const resultDamages = tiers.filter(element => element.displayProperties.name?.toLowerCase().startsWith(value)
			&& (!item || element.hash === item.definition.inventory?.tierTypeHash));

		if (resultDamages.length === 1)
			return resultDamages[0];
		if (resultDamages.length > 1)
			return null;

		return undefined;
	}

	return {
		id: Filter.Rarity,
		prefix: "rarity:",
		suggestedValues: Array.from(new Set(tiers.map(element => element.displayProperties.name?.toLowerCase()).filter(v => v))) as string[],
		or: true,
		matches: value => tiers.some(element => element.displayProperties.name?.toLowerCase().startsWith(value)),
		apply: (value, item) => definition(value, item) !== undefined,
		colour: value => Rarities.getColour(definition(value)?.hash) ?? 0xdddddd,
		maskIcon: value => value === "" ? undefined
			: "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/engram.svg\")",
	};
});
