import type { DestinyObjectiveDefinition, DestinyObjectiveProgress, DestinyProfileRecordsComponent, DestinyRecordDefinition, SingleComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyObjectiveUiStyle, ItemState } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type Manifest from "model/models/Manifest";

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
		profileRecords?: SingleComponentResponse<DestinyProfileRecordsComponent>;
	}

	export async function apply (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit) {
		item.deepsight = await resolve(manifest, profile, item);
		item.shaped = await resolveShaped(manifest, item);
	}

	async function resolve (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit): Promise<IDeepsight> {
		return { attunement: await resolveAttunement(manifest, item), pattern: await resolvePattern(manifest, profile, item) };
	}

	async function resolveShaped (manifest: Manifest, item: IItemInit) {
		if (!(item.reference.state & ItemState.Crafted))
			return undefined;

		return {
			level: await findObjective(manifest, item, (objective, definition) =>
				definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevel),
			progress: await findObjective(manifest, item, (objective, definition) =>
				definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevelProgress),
		};
	}

	async function resolveAttunement (manifest: Manifest, item: IItemInit) {
		if (!(item.reference.state & ItemState.HighlightedObjective))
			return undefined;

		return findObjective(manifest, item, (objective, definition) =>
			definition?.uiStyle === DestinyObjectiveUiStyle.Highlighted);
	}

	async function resolvePattern (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit): Promise<IDeepsightPattern | undefined> {
		const { DestinyCollectibleDefinition, DestinyRecordDefinition } = manifest;

		if (item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png")
			return undefined;

		const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash, item.bucket !== "collections");
		const record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null, item.bucket !== "collections")
			: await DestinyRecordDefinition.get("name", item.definition.displayProperties.name, item.bucket !== "collections");

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const progress = profile.profileRecords?.data?.records[record?.hash!];
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

	async function findObjective ({ DestinyObjectiveDefinition }: Manifest, item: IItemInit, predicate: (objective: DestinyObjectiveProgress, definition: DestinyObjectiveDefinition) => any): Promise<IObjective | undefined> {
		for (const objective of item.objectives) {
			const definition = await DestinyObjectiveDefinition.get(objective.objectiveHash, item.bucket !== "collections");
			if (!definition)
				continue;

			if (predicate(objective, definition))
				return { objective: objective, definition };
		}

		return undefined;
	}
}

export default Deepsight;
