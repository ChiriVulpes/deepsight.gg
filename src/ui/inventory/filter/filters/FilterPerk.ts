import Inventory from "model/models/Inventory";
import type { Plug } from "model/models/items/Plugs";
import Display from "ui/bungie/DisplayProperties";
import ItemPlugTooltip from "ui/inventory/ItemPlugTooltip";
import type { IFilterSuggestedValue } from "ui/inventory/filter/Filter";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import Arrays from "utility/Arrays";

interface IFilterPerkSuggestedValue extends IFilterSuggestedValue {
	plug: Plug;
}

export default IFilter.async(async () => {
	const inventory = await Inventory.await();
	const perks = [...new Map(Object.values(inventory.items ?? {})
		.flatMap(item => item.getSockets("Perk", "Intrinsic"))
		.flatMap(socket => socket.plugs)
		.map((plug): IFilterPerkSuggestedValue | undefined => !Display.name(plug.definition) ? undefined : {
			plug,
			name: Display.name(plug.definition)!,
			icon: Display.icon(plug.definition)!,
		})
		.filter(Arrays.filterFalsy)
		.map(plug => [plug.name, plug])).values()];

	function getMatchingPerk (filterValue: string) {
		filterValue = filterValue.toLowerCase();

		let match: IFilterPerkSuggestedValue | undefined;
		for (const perk of perks) {
			if (perk.name.toLowerCase().startsWith(filterValue)) {
				if (match)
					return undefined;

				match = perk;
			}
		}

		return match;
	}

	return ({
		id: Filter.Perk,
		prefix: "perk:",
		colour: 0x4887ba,
		suggestedValueHint: "perk name",
		suggestedValues: perks,
		apply: (value, item) => {
			return item.sockets.some(socket => socket?.plugs.some(plug => {
				if (!plug.definition)
					return false;

				plug.definition.displayProperties.nameLowerCase ??= plug.definition.displayProperties.name.toLowerCase();

				return plug.definition.displayProperties.nameLowerCase.startsWith(value);
			})) ?? false;
		},
		icon: filterValue => getMatchingPerk(filterValue)?.icon,
		tweakChip: (chip, filterValue) => {
			const perk = getMatchingPerk(filterValue);
			if (!perk?.plug)
				return;

			chip.setTooltip(ItemPlugTooltip, {
				initialise: tooltip => perk?.plug && tooltip.set(perk.plug),
				differs: tooltip => tooltip.plug?.plugItemHash !== perk?.plug.plugItemHash,
			});
		},
	});
});
