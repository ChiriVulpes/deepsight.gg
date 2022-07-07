import Filter, { IFilter } from "ui/inventory/filter/Filter";

declare module "bungie-api-ts/destiny2/interfaces" {
	interface DestinyDisplayPropertiesDefinition {
		nameLowerCase?: string;
		nameLowerCaseCompressed?: string;
	}
}

export default IFilter.create({
	id: Filter.Perk,
	prefix: "perk:",
	colour: 0x4887ba,
	suggestedValueHint: "perk name",
	apply: (value, item) => {
		return item.plugs?.some(socket => socket.some(plug => {
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
