import { DamageType } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.DamageType,
	name: "Damage Type",
	sort: (a, b) => (b.instance?.damageType ?? DamageType.None) - (a.instance?.damageType ?? DamageType.None),
	render: async item => {
		const { DestinyDamageTypeDefinition } = await Manifest.await();
		const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash);
		if (damageType !== undefined)
			return Component.create("img")
				.attributes.set("src", `https://www.bungie.net${damageType.displayProperties.icon}`)
				.classes.add("item-sort-damage-type", `item-sort-damage-type-${damageType.displayProperties.name.toLowerCase() ?? "unknown"}`);

		return undefined;
	},
});
