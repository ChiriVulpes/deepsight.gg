import type { DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import type { DestinyActivity, DestinyActivityModifierDefinition, DestinyCharacterActivitiesComponent, DestinyRecordDefinition, DictionaryComponentResponse } from "bungie-api-ts/destiny2/interfaces";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import Objects from "utility/Objects";
import Time from "utility/Time";
import type { DeepsightDropTableDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";

export interface ISource {
	dropTable: DeepsightDropTableDefinition;
	activityDefinition: DestinyActivityDefinition;
	masterActivityDefinition?: DestinyActivityDefinition;
	masterActivity?: DestinyActivity;
	activeChallenge?: DestinyActivityModifierDefinition;
	isActiveMasterDrop: boolean;
	record?: DestinyRecordDefinition;
}

namespace Source {

	export interface ISourceProfile {
		characterActivities?: DictionaryComponentResponse<DestinyCharacterActivitiesComponent>;
	}

	export async function apply (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		if (item.bucket !== "collections")
			return;

		item.sources = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: ISourceProfile, item: IItemInit): Promise<ISource[] | undefined> {
		const { DeepsightDropTableDefinition } = manifest;
		let dropTables = await DeepsightDropTableDefinition.all();
		dropTables = dropTables.filter(table => false
			|| table.phases.some(phase => phase.dropTable[item.definition.hash])
			|| table.master?.challengeDropTable?.[item.definition.hash]
			|| table.master?.challengeRotations.drops?.includes(item.definition.hash));

		if (!dropTables.length)
			return undefined;

		return Promise.all(dropTables.map(table => resolveDropTable(manifest, profile, table, item)));
	}

	async function resolveDropTable ({ DestinyActivityDefinition, DestinyRecordDefinition, DestinyActivityModifierDefinition }: Manifest, profile: ISourceProfile, table: DeepsightDropTableDefinition, item: IItemInit) {
		const weeks = Math.floor((Date.now() - (table.master?.challengeRotations.anchor ?? 0)) / Time.weeks(1));

		return {
			dropTable: table,
			activityDefinition: await DestinyActivityDefinition.get(table.hash)!,
			masterActivityDefinition: await DestinyActivityDefinition.get(table.master?.activityHash),
			masterActivity: !table.master?.activityHash ? undefined : Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
				.flatMap(activities => activities.availableActivities)
				.find(activity => activity.activityHash === table.master!.activityHash),
			activeChallenge: await DestinyActivityModifierDefinition.get(resolveRotation(table.master?.challengeRotations?.challenges, weeks)),
			isActiveMasterDrop: !!table.master?.challengeDropTable?.[item.definition.hash]
				|| resolveRotation(table.master?.challengeRotations.drops, weeks) === item.definition.hash,
			record: await DestinyRecordDefinition.get(table.recordHash),
		};
	}

	function resolveRotation<T> (rotation: T[] | undefined, weeks: number) {
		return !rotation?.length ? undefined : rotation?.[weeks % rotation.length];
	}
}

export default Source;
