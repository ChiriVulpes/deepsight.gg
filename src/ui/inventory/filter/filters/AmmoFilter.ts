import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import Filter, { IFilter } from "ui/inventory/filter/Filter";

export default IFilter.create({
	id: Filter.Ammo,
	prefix: "ammo:",
	colour: 0x444444,
	suggestedValues: ["primary", "special", "heavy"],
	matches (value) { return this.suggestedValues!.includes(value) },
	filter: (value, item) => item.definition.equippingBlock?.ammoType === (
		value === "primary" ? DestinyAmmunitionType.Primary
			: value === "special" ? DestinyAmmunitionType.Special
				: DestinyAmmunitionType.Heavy),
})