import Manifest from "model/models/Manifest";
import ElementTypes from "ui/inventory/ElementTypes";
import Filter, { IFilter } from "ui/inventory/filter/Filter";

const DAMAGE_TYPE_RAID = 1067729826;
const ENERGY_TYPE_ANY = 1198124803;
const ENERGY_TYPE_GHOST = 3340383460;
const ENERGY_TYPE_SUBCLASS = 3440230265;

export default IFilter.async(async () => {
	const { DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = await Manifest.await();
	const damages = (await DestinyDamageTypeDefinition.all())
		.filter(type => type.hash !== DAMAGE_TYPE_RAID)
		.sort((a, b) => a.enumValue - b.enumValue);
	const energies = (await DestinyEnergyTypeDefinition.all())
		.filter(type => type.hash !== ENERGY_TYPE_ANY && type.hash !== ENERGY_TYPE_GHOST && type.hash !== ENERGY_TYPE_SUBCLASS)
		.sort((a, b) => a.enumValue - b.enumValue);

	return {
		id: Filter.Element,
		prefix: "element:",
		colour: value => ElementTypes.getColour(value) ?? 0xaaaaaa,
		suggestedValues: damages.map(element => element.displayProperties.name.toLowerCase()),
		matches: value => damages.some(element => element.displayProperties.name.toLowerCase().startsWith(value)),
		apply: (value, item) => value === ""
			|| damages.some(element => element.displayProperties.name.toLowerCase().startsWith(value)
				&& (element.hash === item.instance?.damageTypeHash))
			|| energies.some(element => element.displayProperties.name.toLowerCase().startsWith(value)
				&& (element.hash === item.instance?.energy?.energyTypeHash)),
	};
});
