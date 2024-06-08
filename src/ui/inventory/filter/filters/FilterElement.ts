import { DeepsightPlugCategory } from "@deepsight.gg/plugs";
import type Item from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import ElementTypes from "ui/inventory/ElementTypes";
import Filter, { IFilter } from "ui/inventory/filter/Filter";

const DAMAGE_TYPE_RAID = 1067729826;
const ENERGY_TYPE_ANY = 1198124803;
const ENERGY_TYPE_GHOST = 3340383460;
const ENERGY_TYPE_SUBCLASS = 3440230265;

export default IFilter.async<Item | Plug>(async () => {
	const { DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = await Manifest.await();
	const damages = (await DestinyDamageTypeDefinition.all())
		.filter(type => type.hash !== DAMAGE_TYPE_RAID)
		.sort((a, b) => a.enumValue - b.enumValue);
	const energies = (await DestinyEnergyTypeDefinition.all())
		.filter(type => type.hash !== ENERGY_TYPE_ANY && type.hash !== ENERGY_TYPE_GHOST && type.hash !== ENERGY_TYPE_SUBCLASS)
		.sort((a, b) => a.enumValue - b.enumValue);

	function definition (value: string, itemOrPlug?: Item | Plug) {
		if (!itemOrPlug || "id" in itemOrPlug)
			return itemDefinition(value, itemOrPlug);

		return plugDefinition(value, itemOrPlug);
	}

	function itemDefinition (value: string, item?: Item) {
		if (value === "")
			return null;

		const damageTypeHash = item?.instance?.damageTypeHash ?? item?.definition.defaultDamageTypeHash;

		const resultDamages = damages.filter(element => element.displayProperties.name.toLowerCase().startsWith(value)
			&& (!item || element.hash === damageTypeHash));

		if (resultDamages.length === 1)
			return resultDamages[0];
		if (resultDamages.length > 1)
			return null;

		const resultEnergies = energies.filter(element => element.displayProperties.name.toLowerCase().startsWith(value)
			&& (!item || element.hash === item.instance?.energy?.energyTypeHash));

		if (resultEnergies.length === 1)
			return resultEnergies[0];
		if (resultEnergies.length > 1)
			return null;

		return undefined;
	}

	function plugDefinition (value: string, plug: Plug) {
		if (plug.categorisation?.category === DeepsightPlugCategory.Subclass) {
			const damageType = plug.categorisation.damageType;
			if (!damageType)
				return null;

			const resultDamages = damages.filter(element => element.displayProperties.name.toLowerCase().startsWith(value)
				&& (element.hash === damageType));

			if (resultDamages.length === 1)
				return resultDamages[0];
			if (resultDamages.length > 1)
				return null;

			return undefined;
		}
	}

	return {
		id: Filter.Element,
		prefix: "element:",
		suggestedValues: damages.map(element => element.displayProperties.name.toLowerCase()),
		or: true,
		matches: value => damages.some(element => element.displayProperties.name.toLowerCase().startsWith(value)),
		apply: (value, item) => definition(value, item) !== undefined,
		colour: value => ElementTypes.getColour(definition(value)?.displayProperties.name.toLowerCase()) ?? 0xaaaaaa,
		maskIcon: value => Display.icon(definition(value) ?? undefined),
	};
});
