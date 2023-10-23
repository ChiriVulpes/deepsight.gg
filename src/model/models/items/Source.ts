import type { DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import type { DestinyRecordDefinition } from "bungie-api-ts/destiny2/interfaces";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import type { DeepsightDropTableDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";

export interface ISource {
	dropTable: DeepsightDropTableDefinition;
	activity: DestinyActivityDefinition;
	masterActivity?: DestinyActivityDefinition;
	record?: DestinyRecordDefinition;
}

namespace Source {

	export async function apply (manifest: Manifest, item: IItemInit) {
		if (item.bucket !== "collections")
			return;

		item.sources = await resolve(manifest, item);
	}

	async function resolve ({ DeepsightDropTableDefinition, DestinyActivityDefinition, DestinyRecordDefinition }: Manifest, item: IItemInit): Promise<ISource[] | undefined> {
		let dropTables = await DeepsightDropTableDefinition.all();
		dropTables = dropTables.filter(table => false
			|| table.phases.some(phase => phase.dropTable[item.definition.hash])
			|| table.master?.challengeDropTable[item.definition.hash]);

		if (!dropTables.length)
			return undefined;

		return Promise.all(dropTables.map(async table => ({
			dropTable: table,
			activity: await DestinyActivityDefinition.get(table.hash)!,
			masterActivity: await DestinyActivityDefinition.get(table.master?.activityHash),
			record: await DestinyRecordDefinition.get(table.recordHash),
		})));
	}
}

export default Source;
