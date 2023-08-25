import type { DestinyItemComponentSetOfint64, DestinyObjectiveDefinition, DestinyObjectiveProgress } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import type Manifest from "model/models/Manifest";

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
		return Promise.all(objectives.map(async objective => ({
			hash: objective.objectiveHash,
			progress: objective,
			plug,
			definition: await manifest.DestinyObjectiveDefinition.get(objective.objectiveHash)!,
		})))
	}
}

export default Objectives;
