import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Power,
	name: "Energy",
	sort: (a, b) => (b.instance?.energy?.energyCapacity ?? 0) - (a.instance?.energy?.energyCapacity ?? 0),
	render: async item => {
		const { DestinyEnergyTypeDefinition } = await Manifest.await();
		const energyType = await DestinyEnergyTypeDefinition.get(item.instance?.energy.energyTypeHash);
		const result = Component.create()
			.text.set(`${item.instance?.energy.energyCapacity ?? 0}`);

		if (energyType !== undefined)
			result
				.classes.add("item-energy", `item-energy-${energyType.displayProperties.name.toLowerCase() ?? "unknown"}`)
				.style.set("--icon", `url("https://www.bungie.net${energyType.displayProperties.icon}")`);

		return result;
	},
});
