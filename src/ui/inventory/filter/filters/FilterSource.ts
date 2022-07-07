import Manifest from "model/models/Manifest";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";

export default IFilter.async(async () => {
	const { DestinySourceDefinition } = await Manifest.await();
	const sources = (await DestinySourceDefinition.all())
		.sort((a, b) => b.hash - a.hash);

	function sourceMatches (source: DestinySourceDefinition, value: string) {
		source.displayProperties.nameLowerCase ??= source.displayProperties.name.toLowerCase();
		source.displayProperties.nameLowerCaseCompressed ??= source.displayProperties.nameLowerCase
			.replace(/\s+/g, "");

		return source.displayProperties.nameLowerCase.startsWith(value)
			|| source.displayProperties.nameLowerCaseCompressed.startsWith(value)
			|| source.id.startsWith(value);
	}

	return {
		id: Filter.Source,
		prefix: "source:",
		colour: 0x3B3287,
		suggestedValues: sources.map(source => source.id),
		apply: (value, item) => !item.source ? false : sourceMatches(item.source, value),
		maskIcon: value => `url("${sources.find(source => sourceMatches(source, value))?.displayProperties.icon ?? ""}")`,
	};
});
