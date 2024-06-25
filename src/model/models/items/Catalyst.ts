import type { DestinyCharacterRecordsComponent, DestinyProfileRecordsComponent, DestinyRecordComponent, DestinyRecordDefinition, DictionaryComponentResponse, SingleComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyRecordState } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { IItemInit } from "model/models/items/Item";
import Maths from "utility/maths/Maths";

export interface ICatalyst {
	record: DestinyRecordDefinition;
	state: DestinyRecordComponent;
	progress: number;
	completionValue: number;
	complete: boolean;
	progressDescription: string;
}

namespace Catalyst {

	export interface ICatalystProfile {
		profileRecords?: SingleComponentResponse<DestinyProfileRecordsComponent>;
		characterRecords?: DictionaryComponentResponse<DestinyCharacterRecordsComponent>;
	}

	export async function apply (manifest: Manifest, profile: ICatalystProfile | undefined, item: Item | IItemInit) {
		item.catalyst = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: ICatalystProfile | undefined, item: IItemInit): Promise<ICatalyst | undefined> {
		const { DeepsightCatalystDefinition, DestinyRecordDefinition } = manifest;

		const catalyst = await DeepsightCatalystDefinition.get(item.definition.hash);

		const record = item.catalyst?.record
			?? await DestinyRecordDefinition.get(catalyst?.record);
		if (!record || !catalyst)
			return undefined;

		const state = profile?.profileRecords?.data?.records?.[record.hash]
			?? Object.values(profile?.characterRecords?.data ?? {})
				?.find(records => records?.records?.[record.hash])
				?.records?.[record.hash]
			?? ({
				state: DestinyRecordState.Invisible | DestinyRecordState.Obscured | DestinyRecordState.ObjectiveNotCompleted,
				objectives: [],
				rewardVisibilty: [],
				intervalObjectives: [],
				intervalsRedeemedCount: 0,
			});

		const primaryObjectives = state.objectives.filter(objective => catalyst.primaryObjectiveHashes.includes(objective.objectiveHash));

		return {
			record,
			state,
			progress: primaryObjectives.map(objective => Math.min(objective.progress ?? 0, objective.completionValue)).splat(Maths.sum),
			completionValue: primaryObjectives.map(objective => objective.completionValue).splat(Maths.sum),
			complete: primaryObjectives.every(objective => objective.complete),
			progressDescription: catalyst.progressDescription,
		};
	}

}

export default Catalyst;
