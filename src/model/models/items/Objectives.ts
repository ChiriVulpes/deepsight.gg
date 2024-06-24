import type { DestinyItemComponentSetOfint64, DestinyObjectiveDefinition, DestinyObjectiveProgress } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";

namespace Objectives {

	export interface IObjectivesProfile {
		itemComponents?: DestinyItemComponentSetOfint64,
	}

	export interface IObjective {
		hash: number;
		progress: DestinyObjectiveProgress;
		definition: DestinyObjectiveDefinition;
		plug?: Plug;
	}

	export async function resolve (manifest: Manifest, objectives: DestinyObjectiveProgress[], plug?: Plug, item?: IItemInit): Promise<IObjective[]> {
		const result: IObjective[] = [];

		for (const objective of objectives) {
			result.push({
				hash: objective.objectiveHash,
				progress: objective,
				plug,
				definition: plug?.objectives?.find(e => e.hash === objective.objectiveHash)?.definition
					?? await manifest.DestinyObjectiveDefinition.get(objective.objectiveHash)!,
			});
		}

		return result;
	}
}

export default Objectives;
