import type { DestinyObjectiveDefinition, DestinyObjectiveProgress, DestinyProfileRecordsComponent, DestinyRecordDefinition, SingleComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyObjectiveUiStyle, ItemState } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import type { Manifest } from "model/models/Manifest";

export interface IWeaponShaped {
	level?: IObjective;
	progress?: IObjective;
}

export interface IDeepsightPattern {
	record: DestinyRecordDefinition;
	progress: DestinyObjectiveProgress;
}

export interface IObjective {
	objective: DestinyObjectiveProgress;
	definition: DestinyObjectiveDefinition;
}

export interface IDeepsight {
	attunement?: IObjective;
	pattern?: IDeepsightPattern;
}

namespace Deepsight {

	export interface IDeepsightProfile {
		profileRecords: SingleComponentResponse<DestinyProfileRecordsComponent>;
	}

	export async function resolve (manifest: Manifest, profile: IDeepsightProfile, item: Item): Promise<IDeepsight> {
		return { attunement: await resolveAttunement(manifest, item), pattern: await resolvePattern(manifest, profile, item) };
	}

	export async function resolveShaped (manifest: Manifest, item: Item) {
		if (!(item.reference.state & ItemState.Crafted))
			return undefined;

		return {
			level: await findObjective(manifest, item, (objective, definition) =>
				definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevel),
			progress: await findObjective(manifest, item, (objective, definition) =>
				definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevelProgress),
		};
	}

	async function resolveAttunement (manifest: Manifest, item: Item) {
		if (!(item.reference.state & ItemState.HighlightedObjective))
			return undefined;

		return findObjective(manifest, item, (objective, definition) =>
			definition?.uiStyle === DestinyObjectiveUiStyle.Highlighted);
	}

	async function resolvePattern (manifest: Manifest, profile: IDeepsightProfile, item: Item): Promise<IDeepsightPattern | undefined> {
		const { DestinyCollectibleDefinition, DestinyRecordDefinition } = manifest;

		const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash);
		const record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null)
			: await DestinyRecordDefinition.get("name", item.definition.displayProperties.name);

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const progress = profile.profileRecords.data?.records[record?.hash!];
		if (!progress)
			return undefined;

		if (progress.objectives.length !== 1) {
			console.warn(`Incomprehensible pattern record for '${item.definition.displayProperties.name}'`, progress);
			return undefined;
		}

		return {
			record: record!,
			progress: progress.objectives[0],
		};
	}

	async function findObjective ({ DestinyObjectiveDefinition }: Manifest, item: Item, predicate: (objective: DestinyObjectiveProgress, definition: DestinyObjectiveDefinition) => any): Promise<IObjective | undefined> {
		for (const objective of item.objectives) {
			const definition = await DestinyObjectiveDefinition.get(objective.objectiveHash);
			if (!definition)
				continue;

			if (predicate(objective, definition))
				return { objective: objective, definition };
		}

		return undefined;
	}
}

export default Deepsight;
