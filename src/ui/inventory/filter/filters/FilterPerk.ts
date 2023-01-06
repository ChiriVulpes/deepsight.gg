import Inventory from "model/models/Inventory";
import { PlugType } from "model/models/items/Plugs";
import Display from "ui/bungie/DisplayProperties";
import type { IFilterSuggestedValue } from "ui/inventory/filter/Filter";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import Arrays from "utility/Arrays";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		nameLowerCase?: string;
		nameLowerCaseCompressed?: string;
	}
}

export default IFilter.async(async () => {
	const inventory = await Inventory.createTemporary().await();
	const perks = [...new Map(Object.values(inventory.items ?? {})
		.flatMap(item => item.getSockets(PlugType.Perk, PlugType.Intrinsic))
		.flatMap(socket => socket.plugs)
		.map((plug): IFilterSuggestedValue | undefined => !Display.name(plug.definition) ? undefined : {
			name: Display.name(plug.definition)!.toLowerCase().replace(/\W+/g, ""),
			icon: Display.icon(plug.definition)!,
		})
		.filter(Arrays.filterFalsy)
		.map(plug => [plug.name, plug])).values()];

	return ({
		id: Filter.Perk,
		prefix: "perk:",
		colour: 0x4887ba,
		suggestedValueHint: "perk name",
		suggestedValues: perks,
		icon (filterValue) {
			let match: IFilterSuggestedValue | undefined;
			for (const perk of perks) {
				if (perk.name.startsWith(filterValue)) {
					if (match)
						return undefined;

					match = perk;
				}
			}

			return match?.icon;
		},
		apply: (value, item) => {
			return item.sockets.some(socket => socket?.plugs.some(plug => {
				if (!plug.definition)
					return false;

				plug.definition.displayProperties.nameLowerCase ??= plug.definition.displayProperties.name.toLowerCase();
				plug.definition.displayProperties.nameLowerCaseCompressed ??= plug.definition.displayProperties.nameLowerCase
					.replace(/\s+/g, "");

				return plug.definition.displayProperties.nameLowerCase.startsWith(value)
					|| plug.definition.displayProperties.nameLowerCaseCompressed.startsWith(value);
			})) ?? false;
		},
	});
});
