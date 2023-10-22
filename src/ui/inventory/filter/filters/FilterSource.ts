import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import type { DeepsightSourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightSourceDefinition";

export default IFilter.async(async () => {
	const { DeepsightSourceDefinition } = await Manifest.await();
	const sources = (await DeepsightSourceDefinition.all())
		.sort((a, b) => b.hash - a.hash);

	function sourceMatches (source: DeepsightSourceDefinition, value: string) {
		source.displayProperties.nameLowerCase ??= source.displayProperties.name.toLowerCase();

		return source.displayProperties.nameLowerCase.startsWith(value)
			|| source.id.startsWith(value);
	}

	function getAllMatches (value: string) {
		return sources.filter(source => sourceMatches(source, value));
	}

	return {
		id: Filter.Source,
		prefix: "source:",
		colour: 0x3B3287,
		suggestedValueHint: "expansion, season, or event",
		suggestedValues: sources.map(source => Display.name(source) ?? source.id),
		apply: (value, item) => !item.source ? false : sourceMatches(item.source, value),
		maskIcon: value => {
			if (!value)
				return undefined;

			const matches = getAllMatches(value.toLowerCase());
			if (matches.length !== 1)
				return undefined;

			return `url("${matches[0].displayProperties.icon}")`;
		},
	};
});
