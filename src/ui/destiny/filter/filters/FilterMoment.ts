import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import Manifest from "model/models/Manifest";
import Filter, { IFilter } from "ui/destiny/filter/Filter";
import Display from "ui/utility/DisplayProperties";

export default IFilter.async(async () => {
	const { DeepsightMomentDefinition: DeepsightSourceDefinition } = await Manifest.await();
	const sources = (await DeepsightSourceDefinition.all())
		.sort((a, b) => b.hash - a.hash);

	function momentMatches (moment: DeepsightMomentDefinition, value: string) {
		moment.displayProperties.nameLowerCase ??= moment.displayProperties.name?.toLowerCase();

		return moment.displayProperties.nameLowerCase?.startsWith(value)
			|| moment.id.startsWith(value);
	}

	function getAllMatches (value: string) {
		return sources.filter(source => momentMatches(source, value));
	}

	return {
		id: Filter.Moment,
		prefix: "moment:",
		colour: 0x3B3287,
		suggestedValueHint: "expansion, season, or event",
		suggestedValues: sources.map(source => Display.name(source) ?? source.id),
		or: true,
		apply: (value, item) => !item.moment ? false : momentMatches(item.moment, value),
		maskIcon: value => {
			if (!value)
				return undefined;

			const matches = getAllMatches(value.toLowerCase());
			if (matches.length !== 1)
				return undefined;

			const icon = matches[0].displayProperties.icon;
			return `url("${icon?.startsWith("/") ? `https://www.bungie.net${icon}` : icon}")`;
		},
	};
});
