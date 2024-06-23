import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import Filter, { IFilter } from "ui/destiny/filter/Filter";
import Display from "ui/utility/DisplayProperties";

export default IFilter.create({
	id: Filter.Ammo,
	prefix: "ammo:",
	colour: 0x444444,
	suggestedValues: ["primary", "special"],
	or: true,
	matches: value => "primary".startsWith(value) || "special".startsWith(value) || "heavy".startsWith(value),
	apply: (value, item) => value === ""
		|| item.definition.equippingBlock?.ammoType === (
			"primary".startsWith(value) ? DestinyAmmunitionType.Primary
				: "special".startsWith(value) ? DestinyAmmunitionType.Special
					: DestinyAmmunitionType.Heavy),
	icon: value => value === "" ? undefined
		: Display.icon(`/img/destiny_content/ammo_types/${"primary".startsWith(value) ? "primary" : "special".startsWith(value) ? "special" : "heavy"}.png`),
});
